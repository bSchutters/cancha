import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField } from '../access'
import { isDemoUser } from '@/lib/demo/config'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  auth: true,
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    // Only platform super-admins reach the Payload back-office. Organizers
    // (role 'manager') authenticate and work entirely in the custom /manage UI.
    admin: ({ req: { user } }) => (user as { role?: string } | undefined)?.role === 'admin',
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      // Manager can only read their own account
      if (user) return { id: { equals: user.id } }
      return false
    },
    create: isAdmin,
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      // The demo credentials are public: letting that account change its own
      // email or password would lock every other visitor out of the demo.
      if (isDemoUser(user as { email?: string } | null)) return false
      // Manager can only update their own account
      if (user) return { id: { equals: user.id } }
      return false
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'manager',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
      ],
      access: {
        update: isAdminField,
      },
    },
  ],
}
