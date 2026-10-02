import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { can, isStaffRole, type Permission, type StaffRole } from "./permissions";

export const ADMIN_SESSION_COOKIE = "sutra_admin_session";
export type Staff = { uid: string; email: string; name: string; role: StaffRole };

export async function getStaff(): Promise<Staff | null> {
  const cookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const d = await adminAuth().verifySessionCookie(cookie, true);
    if (!isStaffRole(d.role)) return null;
    const email = d.email ?? "";
    return { uid: d.uid, email, name: (typeof d.name === "string" && d.name) || email.split("@")[0] || "Team", role: d.role };
  } catch {
    return null;
  }
}

/** For pages: signed-out goes to login; signed-in staff without the permission sees a 404 (the page "does not exist" for them). */
export async function requireStaff(permission?: Permission): Promise<Staff> {
  const s = await getStaff();
  if (!s) redirect("/login");
  if (permission && !can(s.role, permission)) notFound();
  return s;
}

/** For server actions: throws instead of redirecting. */
export async function assertStaff(permission: Permission): Promise<Staff> {
  const s = await getStaff();
  if (!s || !can(s.role, permission)) throw new Error("Not allowed");
  return s;
}
