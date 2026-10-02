export type Role = 'superAdmin' | 'admin' | 'editor' | 'support' | 'metaAdsManager' | 'client';

export type Permission = 
  | 'orders.approve'
  | 'orders.edit'
  | 'orders.regenerate'
  | 'plans.write'
  | 'services.write'
  | 'users.manage'
  | 'files.upload'
  | 'content.write'
  | 'metaads.run'
  | 'metaads.manage'
  | 'settings.manage'
  | 'audit.view'
  | 'workflows.run'
  | 'workflows.view';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  superAdmin: ['orders.approve','orders.edit','orders.regenerate','plans.write','services.write','users.manage','files.upload','content.write','metaads.run','metaads.manage','settings.manage','audit.view','workflows.run','workflows.view'],
  admin: ['orders.approve','orders.edit','orders.regenerate','plans.write','services.write','users.manage','files.upload','content.write','metaads.run','metaads.manage','settings.manage','audit.view','workflows.view'],
  metaAdsManager: ['metaads.run','metaads.manage','orders.view' as any],
  editor: ['content.write','files.upload'],
  support: ['orders.view' as any, 'audit.view'],
  client: [],
};

export function hasPermission(role: Role, perm: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(perm) || false;
}
