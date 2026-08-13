export const roles = ['customer', 'support', 'editor', 'admin', 'owner'] as const;
export type AppRole = (typeof roles)[number];

export const resources = [
  'profile',
  'support',
  'downloads',
  'content',
  'media',
  'leads',
  'users',
  'staff',
  'integrations',
  'audit',
] as const;
export type AppResource = (typeof resources)[number];
export type AppAction = 'read' | 'create' | 'update' | 'delete' | 'publish' | 'manage';

type Scope = 'none' | 'own' | 'assigned' | 'all';
type Grant = { actions: readonly AppAction[]; scope: Scope };

const allActions: readonly AppAction[] = ['read', 'create', 'update', 'delete', 'publish', 'manage'];

export const permissionMatrix: Record<AppRole, Partial<Record<AppResource, Grant>>> = {
  customer: {
    profile: { actions: ['read', 'update', 'delete'], scope: 'own' },
    support: { actions: ['read', 'create'], scope: 'own' },
    downloads: { actions: ['read'], scope: 'own' },
    content: { actions: ['read'], scope: 'all' },
  },
  support: {
    profile: { actions: ['read'], scope: 'assigned' },
    support: { actions: ['read', 'update'], scope: 'assigned' },
    downloads: { actions: ['read'], scope: 'assigned' },
    leads: { actions: ['read', 'update'], scope: 'assigned' },
    content: { actions: ['read'], scope: 'all' },
  },
  editor: {
    content: { actions: ['read', 'create', 'update', 'publish'], scope: 'all' },
    media: { actions: ['read', 'create', 'update', 'delete'], scope: 'all' },
  },
  admin: {
    profile: { actions: ['read', 'update'], scope: 'all' },
    support: { actions: ['read', 'create', 'update', 'manage'], scope: 'all' },
    downloads: { actions: ['read', 'manage'], scope: 'all' },
    content: { actions: allActions, scope: 'all' },
    media: { actions: allActions, scope: 'all' },
    leads: { actions: ['read', 'update', 'manage'], scope: 'all' },
    users: { actions: ['read', 'update', 'manage'], scope: 'all' },
    audit: { actions: ['read'], scope: 'all' },
  },
  owner: Object.fromEntries(
    resources.map((resource) => [resource, { actions: allActions, scope: 'all' }])
  ) as Record<AppResource, Grant>,
};

export function getPermission(role: AppRole, resource: AppResource): Grant | null {
  return permissionMatrix[role][resource] ?? null;
}

export function can(
  role: AppRole,
  resource: AppResource,
  action: AppAction,
  relationship: Exclude<Scope, 'none'> = 'all'
): boolean {
  const grant = getPermission(role, resource);
  if (!grant || !grant.actions.includes(action)) return false;
  if (grant.scope === 'all') return true;
  return grant.scope === relationship;
}
