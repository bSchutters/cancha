import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Adds the per-organization default language selects (manage + public).
// Payload `select` fields map to Postgres enums named enum_<table>_<column>,
// nullable, with a default — mirroring the existing base_color / radius columns.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Idempotent: CREATE TYPE has no IF NOT EXISTS, so guard each enum so a re-run
  // (or replay after a partial failure) is a no-op instead of a hard error.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_organizations_default_manage_locale" AS ENUM('fr', 'nl', 'en');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_organizations_default_public_locale" AS ENUM('fr', 'nl', 'en');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "default_manage_locale" "enum_organizations_default_manage_locale" DEFAULT 'fr';
    ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "default_public_locale" "enum_organizations_default_public_locale" DEFAULT 'fr';
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
