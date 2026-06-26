import * as migration_20260626_000000_add_org_default_locales from './20260626_000000_add_org_default_locales'

export const migrations = [
  {
    up: migration_20260626_000000_add_org_default_locales.up,
    down: migration_20260626_000000_add_org_default_locales.down,
    name: '20260626_000000_add_org_default_locales',
  },
]
