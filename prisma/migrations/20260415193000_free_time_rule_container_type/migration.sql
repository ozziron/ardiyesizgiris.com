ALTER TABLE "free_time_rules"
ADD COLUMN "container_type" TEXT;

DROP INDEX "free_time_rules_port_id_shipping_company_id_effective_from_key";

UPDATE "free_time_rules"
SET "container_type" = '20DC'
WHERE "container_type" IS NULL;

INSERT INTO "free_time_rules" (
  "id",
  "port_id",
  "shipping_company_id",
  "container_type",
  "freeDays",
  "effective_from",
  "effective_until",
  "is_active",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
)
SELECT
  "id" || '-40DC',
  "port_id",
  "shipping_company_id",
  '40DC',
  "freeDays",
  "effective_from",
  "effective_until",
  "is_active",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
FROM "free_time_rules"
WHERE "container_type" = '20DC';

INSERT INTO "free_time_rules" (
  "id",
  "port_id",
  "shipping_company_id",
  "container_type",
  "freeDays",
  "effective_from",
  "effective_until",
  "is_active",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
)
SELECT
  "id" || '-40HC',
  "port_id",
  "shipping_company_id",
  '40HC',
  "freeDays",
  "effective_from",
  "effective_until",
  "is_active",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
FROM "free_time_rules"
WHERE "container_type" = '20DC';

ALTER TABLE "free_time_rules"
ALTER COLUMN "container_type" SET NOT NULL;

CREATE UNIQUE INDEX "free_time_rules_port_id_shipping_company_id_container_type_effective_from_key"
ON "free_time_rules"("port_id", "shipping_company_id", "container_type", "effective_from");
