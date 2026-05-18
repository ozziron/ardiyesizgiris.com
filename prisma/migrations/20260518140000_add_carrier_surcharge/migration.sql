-- Migration: add_carrier_surcharge (TICKET-042)
-- Hat bazli ek ucret sistemi. Ornek seed: Maersk + 20RF/40RF + 160 USD DTE-Freetime Extension Surcharge.

CREATE TABLE IF NOT EXISTS "carrier_surcharges" (
  "id" TEXT NOT NULL,
  "shipping_company_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "apply_type" TEXT NOT NULL DEFAULT 'PER_CONTAINER',
  "container_types" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "carrier_surcharges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "carrier_surcharges_shipping_company_id_is_active_idx"
  ON "carrier_surcharges"("shipping_company_id", "is_active");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'carrier_surcharges_shipping_company_id_fkey'
  ) THEN
    ALTER TABLE "carrier_surcharges"
      ADD CONSTRAINT "carrier_surcharges_shipping_company_id_fkey"
      FOREIGN KEY ("shipping_company_id")
      REFERENCES "shipping_companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Seed: Maersk + 20RF/40RF + 160 USD DTE-Freetime Extension Surcharge
-- Idempotent: NOT EXISTS guard ile tekrar calistirilirsa yeni kayit eklemez.
INSERT INTO "carrier_surcharges" (
  "id", "shipping_company_id", "name", "description",
  "amount", "currency", "apply_type", "container_types",
  "is_active", "created_at", "updated_at"
)
SELECT
  gen_random_uuid()::TEXT,
  sc.id,
  'DTE-Freetime Extension Surcharge',
  'Days 0-5 will be included in DTE-Freetime Extension Surcharge of USD 160 per reefer container',
  160.00,
  'USD',
  'PER_CONTAINER',
  ARRAY['20RF', '40RF'],
  true,
  NOW(),
  NOW()
FROM "shipping_companies" sc
WHERE sc.code = 'MAEU'
  AND NOT EXISTS (
    SELECT 1 FROM "carrier_surcharges" cs
    WHERE cs.shipping_company_id = sc.id
      AND cs.name = 'DTE-Freetime Extension Surcharge'
  );
