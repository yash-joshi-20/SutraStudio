/**
 * SUTRA STUDIO — Authenticated User Database Persistence
 *
 * Provides idempotent, concurrency-safe persistence of client identity into the PostgreSQL User model.
 * Complies with the schema defined in src/prisma/contract.prisma.
 */

import { prisma } from "@/lib/prisma";

export interface ClientUserRecord {
  id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  photoURL?: string | null;
  emailVerified: boolean;
  company: string;
  tier: string;
  status: string;
  billingData?: string | null;
  driveFolderId: string;
  driveFolderLink?: string | null;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncUserData {
  uid?: string | null;
  email: string;
  name?: string | null;
  photoURL?: string | null;
  phone?: string | null;
  role?: string;
  emailVerified?: boolean;
}

/**
 * Idempotently syncs an authenticated user into the PostgreSQL User table.
 *
 * Rules:
 * 1. Matches existing user by UID or Email.
 * 2. Reuses existing user record and stable UID if already present.
 * 3. Never creates duplicate records for repeat logins or concurrent requests.
 * 4. Never overwrites an admin user role to client.
 * 5. Updates user profile metadata (name, photoURL, phone, emailVerified) when provided.
 */
export async function syncAuthenticatedClientUser(data: SyncUserData): Promise<ClientUserRecord> {
  const cleanEmail = (data.email || "").trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Cannot persist user: valid email is required.");
  }

  const rawUid = (data.uid || "").trim();
  const fallbackUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const targetUid = rawUid || fallbackUid;
  const displayName = (data.name || "").trim() || cleanEmail.split("@")[0];
  const emailVerified = data.emailVerified ?? true;
  const requestedRole = data.role === "admin" ? "admin" : "client";

  // Step 1: Idempotent lookup by UID or Email
  const existingUser = (await prisma.user.findFirst({
    where: {
      OR: [
        { uid: targetUid },
        { email: cleanEmail },
      ],
    },
  })) as ClientUserRecord | null;

  // Step 2: If user already exists, update and reuse
  if (existingUser) {
    const updateData: Record<string, unknown> = {
      status: "Active",
    };

    // If existing user is not admin, keep role client
    if (existingUser.role !== "admin" && requestedRole !== "admin") {
      updateData.role = "client";
    }

    if (displayName && displayName !== existingUser.name && displayName !== "Studio Client") {
      updateData.name = displayName;
    }

    if (data.photoURL && data.photoURL !== existingUser.photoURL) {
      updateData.photoURL = data.photoURL;
    }

    if (data.phone && data.phone !== existingUser.phone) {
      updateData.phone = data.phone;
    }

    if (emailVerified && !existingUser.emailVerified) {
      updateData.emailVerified = true;
    }

    const updated = (await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
    })) as unknown as ClientUserRecord;

    return updated;
  }

  // Step 3: Insert fresh user with concurrency retry
  try {
    const created = (await prisma.user.create({
      data: {
        uid: targetUid,
        email: cleanEmail,
        name: displayName,
        photoURL: data.photoURL || null,
        phone: data.phone || null,
        role: requestedRole,
        emailVerified,
        status: "Active",
      },
    })) as unknown as ClientUserRecord;

    return created;
  } catch (err: unknown) {
    // Handle concurrent insertion (Postgres unique constraint violation P2002)
    const prismaErr = err as { code?: string } | null;
    if (prismaErr?.code === "P2002") {
      const concurrentUser = (await prisma.user.findFirst({
        where: {
          OR: [
            { uid: targetUid },
            { email: cleanEmail },
          ],
        },
      })) as ClientUserRecord | null;

      if (concurrentUser) {
        return concurrentUser;
      }
    }
    throw err;
  }
}
