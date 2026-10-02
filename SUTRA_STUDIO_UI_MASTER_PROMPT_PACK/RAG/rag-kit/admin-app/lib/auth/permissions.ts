export const STAFF_ROLES = ["superAdmin", "admin", "editor", "support", "metaAdsManager"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export type Permission =
  | "chat.manage" | "orders.read" | "orders.approve" | "leads.read" | "leads.write"
  | "users.manage" | "content.write" | "files.upload" | "plans.write"
  | "metaads.run" | "settings.manage" | "audit.read";

/** superAdmin has everything. Adjust the others to your final role matrix. */
const MATRIX: Record<StaffRole, readonly Permission[] | "*"> = {
  superAdmin: "*",
  admin: ["chat.manage", "orders.read", "orders.approve", "leads.read", "leads.write", "content.write", "files.upload", "plans.write", "metaads.run", "audit.read"],
  editor: ["orders.read", "content.write", "files.upload"],
  support: ["chat.manage", "orders.read", "leads.read", "leads.write"],
  metaAdsManager: ["orders.read", "metaads.run"],
};

export const isStaffRole = (v: unknown): v is StaffRole => typeof v === "string" && (STAFF_ROLES as readonly string[]).includes(v);

export function can(role: StaffRole, permission: Permission): boolean {
  const p = MATRIX[role];
  return p === "*" || p.includes(permission);
}
