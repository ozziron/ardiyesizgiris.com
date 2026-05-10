INSERT INTO "tariff_rules" (
  "id",
  "port_id",
  "shipping_company_id",
  "container_type",
  "tier_1_days_from",
  "tier_1_days_to",
  "tier_1_price_per_day",
  "tier_2_days_from",
  "tier_2_days_to",
  "tier_2_price_per_day",
  "tier_3_days_from",
  "tier_3_price_per_day",
  "currency",
  "effective_from",
  "effective_until",
  "is_active",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
)
SELECT
  CONCAT(base."id", '-40DC'),
  base."port_id",
  base."shipping_company_id",
  '40DC',
  base."tier_1_days_from",
  base."tier_1_days_to",
  base."tier_1_price_per_day",
  base."tier_2_days_from",
  base."tier_2_days_to",
  base."tier_2_price_per_day",
  base."tier_3_days_from",
  base."tier_3_price_per_day",
  base."currency",
  base."effective_from",
  base."effective_until",
  base."is_active",
  COALESCE(base."notes", '20DC tarifesinden otomatik çoğaltıldı'),
  NOW(),
  NOW(),
  base."created_by"
FROM "tariff_rules" base
WHERE base."container_type" = '20DC'
  AND NOT EXISTS (
    SELECT 1
    FROM "tariff_rules" existing
    WHERE existing."port_id" = base."port_id"
      AND existing."shipping_company_id" = base."shipping_company_id"
      AND existing."container_type" = '40DC'
      AND existing."effective_from" = base."effective_from"
  );

INSERT INTO "tariff_rules" (
  "id",
  "port_id",
  "shipping_company_id",
  "container_type",
  "tier_1_days_from",
  "tier_1_days_to",
  "tier_1_price_per_day",
  "tier_2_days_from",
  "tier_2_days_to",
  "tier_2_price_per_day",
  "tier_3_days_from",
  "tier_3_price_per_day",
  "currency",
  "effective_from",
  "effective_until",
  "is_active",
  "notes",
  "created_at",
  "updated_at",
  "created_by"
)
SELECT
  CONCAT(base."id", '-40HC'),
  base."port_id",
  base."shipping_company_id",
  '40HC',
  base."tier_1_days_from",
  base."tier_1_days_to",
  base."tier_1_price_per_day",
  base."tier_2_days_from",
  base."tier_2_days_to",
  base."tier_2_price_per_day",
  base."tier_3_days_from",
  base."tier_3_price_per_day",
  base."currency",
  base."effective_from",
  base."effective_until",
  base."is_active",
  COALESCE(base."notes", '20DC tarifesinden otomatik çoğaltıldı'),
  NOW(),
  NOW(),
  base."created_by"
FROM "tariff_rules" base
WHERE base."container_type" = '20DC'
  AND NOT EXISTS (
    SELECT 1
    FROM "tariff_rules" existing
    WHERE existing."port_id" = base."port_id"
      AND existing."shipping_company_id" = base."shipping_company_id"
      AND existing."container_type" = '40HC'
      AND existing."effective_from" = base."effective_from"
  );
