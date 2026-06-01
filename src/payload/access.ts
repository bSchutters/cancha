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
