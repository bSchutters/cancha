import type { Access, FieldAccess } from 'payload'

/**
 * Platform super-admin (role 'admin'): manages every organization and bypasses
 * tenant isolation. Organizers are role 'manager' and are scoped to their
 * organization(s) by the multi-tenant plugin.
 */
export const isSuperAdmin = (user: { role?: string } | null | undefined): boolean => user?.role === 'admin'

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isAdminOrManager: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'manager'
}

export const isAdminField: FieldAccess = ({ req: { user } }) => {
  return user?.role === 'admin'
}

/**
 * Field readable by signed-in organizers only.
 *
 * Payload auto-mounts a REST route per collection, so a field on a publicly
 * readable collection is world-readable unless it says otherwise — that is how
 * team representatives' email and phone were exposed. Server-side reads for the
 * organizer console go through the Local API (access control off by default), so
 * they keep seeing the value; only anonymous REST callers get it stripped.
 */
export const isAdminOrManagerField: FieldAccess = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'manager'
}

type TenantRef = number | string | { id?: number | string } | null | undefined

const tenantIdOf = (t: TenantRef): number | string | null =>
  t != null && typeof t === 'object' ? (t.id ?? null) : (t ?? null)

/**
 * May `user` write documents owned by `tenant`?
 *
 * Super-admins may write anywhere. Anyone else only into an organization they
 * belong to; a missing tenant or a user without memberships never matches.
 */
export const userHasTenant = (
  user: { role?: string; tenants?: Array<{ tenant?: TenantRef }> } | null | undefined,
  tenant: TenantRef,
): boolean => {
  if (isSuperAdmin(user)) return true
  const id = tenantIdOf(tenant)
  if (id == null) return false
  return (user?.tenants ?? []).some((m) => {
    const own = tenantIdOf(m?.tenant)
    return own != null && String(own) === String(id)
  })
}
