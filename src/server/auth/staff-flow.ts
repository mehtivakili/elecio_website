import 'server-only';
import { headers } from 'next/headers';
import { auth } from './config';
import { knex } from '@/server/db/knex';
import { can, roles, type AppAction, type AppResource, type AppRole } from './rbac';

export const STAFF_ROLES: AppRole[] = ['support', 'editor', 'admin', 'owner'];
export { staffInternalHeaders } from './staff-gateway';
export { createInvitationToken, hashInvitationToken, strongPassword } from './staff-policy';

export type StaffPrincipal = { userId: string; sessionId: string; role: AppRole };
export async function getStaffPrincipal(): Promise<StaffPrincipal | null> {
  const session = await auth.api.getSession({ headers: await headers() }); if (!session) return null;
  const row = await knex('user_profiles as p')
    .select('p.role', 'p.is_active').where('p.user_id', session.user.id).first();
  if (!row?.is_active || !roles.includes(row.role) || !STAFF_ROLES.includes(row.role)) return null;
  return { userId: session.user.id, sessionId: session.session.id, role: row.role };
}

export async function requireStaffPermission(resource: AppResource, action: AppAction, relationship: 'own' | 'assigned' | 'all' = 'all') {
  const principal = await getStaffPrincipal();
  if (!principal || !can(principal.role, resource, action, relationship)) throw new Error('FORBIDDEN');
  return principal;
}

export async function requireRecentStaffPermission(resource: AppResource, action: AppAction, maxAgeSeconds = 10 * 60) {
  const principal = await requireStaffPermission(resource, action);
  const session = await knex('auth_sessions').select('created_at').where({ id: principal.sessionId, user_id: principal.userId }).first();
  if (!session || new Date(session.created_at).getTime() < Date.now() - maxAgeSeconds * 1000) throw new Error('REAUTH_REQUIRED');
  return principal;
}
