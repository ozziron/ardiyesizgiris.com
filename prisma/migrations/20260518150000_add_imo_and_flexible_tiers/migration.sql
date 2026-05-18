-- Add imoCargo flag to TariffRule so the same container type
-- (e.g. 20DC) can have separate standard and IMO tariff rows.
ALTER TABLE "tariff_rules" ADD COLUMN "imo_cargo" BOOLEAN NOT NULL DEFAULT false;

-- Add tier enable/disable toggles so OT (and other) equipment
-- can use fewer than 3 tiers. Tier 1 is always mandatory.
ALTER TABLE "tariff_rules" ADD COLUMN "tier_2_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "tariff_rules" ADD COLUMN "tier_3_enabled" BOOLEAN NOT NULL DEFAULT true;

-- Recreate the unique constraint to include imo_cargo.
-- Prisma doesn't provide a name for @@unique so we infer it from the schema.
-- Drop the old constraint and create a new one.
ALTER TABLE "tariff_rules" DROP CONSTRAINT IF EXISTS "tariff_rules_port_id_shipping_company_id_container_type_eff_key";
ALTER TABLE "tariff_rules" ADD CONSTRAINT "tariff_rules_port_id_shipping_company_id_container_imo_key"
  UNIQUE ("port_id", "shipping_company_id", "container_type", "imo_cargo", "effective_from");
