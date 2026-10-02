import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, isStaffRole } from "./shared";

export type Session = { uid: string; email: string; name: string; role: string };

/** Verifies the session cookie on the server (checks revocation). Returns null when signed out. */
export async function getSession(): Promise<Session | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const d = await adminAuth().verifySessionCookie(cookie, true);
    const email = d.email ?? "";
    return {
      uid: d.uid,
      email,
      name: (typeof d.name === "string" && d.name) || email.split("@")[0] || "there",
      role: typeof d.role === "string" ? d.role : "client",
    };
  } catch {
    return null;
  }
}

/** Client pages: signed-out visitors and staff accounts are sent to the client login. */
export async function requireClient(): Promise<Session> {
  const s = await getSession();
  if (!s || isStaffRole(s.role)) redirect("/login");
  return s;
}
