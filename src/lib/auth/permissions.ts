/**
 * SUTRA STUDIO — Master RBAC & Permission Matrix
 * Maps application roles to fine-grained operational permissions.
 */

export type AppRole = 
  | 'superAdmin'
  | 'admin'
  | 'editor'
  | 'support'
  | 'metaAdsManager'
  | 'client';

export type Permission =
  | 'orders.create'
  | 'orders.view_own'
  | 'orders.view_all'
  | 'orders.approve'
  | 'orders.edit_draft'
  | 'orders.reject_regenerate'
  | 'plans.read'
  | 'plans.write'
  | 'metaads.connect_own'
  | 'metaads.run'
  | 'metaads.view_all'
  | 'users.manage'
  | 'files.upload'
  | 'files.manage_all'
  | 'content.write'
  | 'workflows.run'
  | 'workflows.view_logs'
  | 'chat.takeover'
  | 'settings.manage'
  | 'audit.view';

export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  superAdmin: [
    'orders.create',
    'orders.view_own',
    'orders.view_all',
    'orders.approve',
    'orders.edit_draft',
    'orders.reject_regenerate',
    'plans.read',
    'plans.write',
    'metaads.connect_own',
    'metaads.run',
    'metaads.view_all',
    'users.manage',
    'files.upload',
    'files.manage_all',
    'content.write',
    'workflows.run',
    'workflows.view_logs',
    'chat.takeover',
    'settings.manage',
    'audit.view',
  ],
  admin: [
    'orders.create',
    'orders.view_own',
    'orders.view_all',
    'orders.approve',
    'orders.edit_draft',
    'orders.reject_regenerate',
    'plans.read',
    'plans.write',
    'metaads.run',
    'metaads.view_all',
    'users.manage',
    'files.upload',
    'files.manage_all',
    'content.write',
    'workflows.run',
    'workflows.view_logs',
    'chat.takeover',
    'settings.manage',
    'audit.view',
  ],
  metaAdsManager: [
    'orders.view_all',
    'metaads.run',
    'metaads.view_all',
    'files.upload',
    'audit.view',
  ],
  editor: [
    'orders.view_all',
    'orders.edit_draft',
    'content.write',
    'files.upload',
  ],
  support: [
    'orders.view_all',
    'chat.takeover',
    'audit.view',
  ],
  client: [
    'orders.create',
    'orders.view_own',
    'plans.read',
    'metaads.connect_own',
    'files.upload',
  ],
} as const;

/**
 * Checks if a specific role has the requested permission.
 */
export function checkPermission(role: AppRole | string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as AppRole];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Checks if a role belongs to staff (admin or operator clearance).
 */
export function isStaffRole(role: AppRole | string): boolean {
  return ['superAdmin', 'admin', 'editor', 'support', 'metaAdsManager'].includes(role);
}
