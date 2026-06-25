import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Adds the per-organization default language selects (manage + public).
// Payload `select` fields map to Postgres enums named enum_<table>_<column>,
// nullable, with a default — mirroring the existing base_color / radius columns.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_organizations_default_manage_locale" AS ENUM('fr', 'nl', 'en');
    CREATE TYPE "public"."enum_organizations_default_public_locale" AS ENUM('fr', 'nl', 'en');
    ALTER TABLE "organizations" ADD COLUMN "default_manage_locale" "enum_organizations_default_manage_locale" DEFAULT 'fr';
    ALTER TABLE "organizations" ADD COLUMN "default_public_locale" "enum_organizations_default_public_locale" DEFAULT 'fr';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "organizations" DROP COLUMN IF EXISTS "default_manage_locale";
    ALTER TABLE "organizations" DROP COLUMN IF EXISTS "default_public_locale";
    DROP TYPE IF EXISTS "public"."enum_organizations_default_manage_locale";
    DROP TYPE IF EXISTS "public"."enum_organizations_default_public_locale";
  `)
}
