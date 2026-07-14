-- ============================================================================
-- Maersk (MAEU) — Tüm Limanlar ve Konteyner Tipleri için Tarife Verisi
-- Neon SQL Editor'da kopyala-yapıştır ile çalıştırabilirsiniz.
-- UPSERT pattern: tekrar çalıştırılırsa duplicate oluşturmaz, günceller.
-- ============================================================================

BEGIN;

-- 1. Maersk hattını garantile (yoksa ekle)
-- ---------------------------------------------------------------------------
INSERT INTO shipping_companies (id, name, code, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'Maersk', 'MAEU', true, now(), now())
ON CONFLICT (code) DO UPDATE SET name = 'Maersk', is_active = true, updated_at = now();

-- 2. Limanları ekle (7 liman)
-- ---------------------------------------------------------------------------
INSERT INTO ports (id, name, code, country, city, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Ambarlı',       'TRAMB', 'TR', 'İstanbul', true, now(), now()),
  (gen_random_uuid(), 'Gemlik',        'TRGEM', 'TR', 'Bursa',    true, now(), now()),
  (gen_random_uuid(), 'Gebze',         'TRGEB', 'TR', 'Kocaeli',  true, now(), now()),
  (gen_random_uuid(), 'İskenderun',    'TRISK', 'TR', 'Hatay',    true, now(), now()),
  (gen_random_uuid(), 'İzmir',         'TRIZM', 'TR', 'İzmir',    true, now(), now()),
  (gen_random_uuid(), 'İzmit Körfezi', 'TRIZT', 'TR', 'Kocaeli',  true, now(), now()),
  (gen_random_uuid(), 'Mersin',        'TRMER', 'TR', 'Mersin',   true, now(), now())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city, is_active = true, updated_at = now();

-- 3. Konteyner tiplerini ekle (10 yeni tip)
-- ---------------------------------------------------------------------------
INSERT INTO container_types (id, code, label, display_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), '20OT', '20'' Açık Üst (OT)',        3, true, now(), now()),
  (gen_random_uuid(), '40OT', '40'' Açık Üst (OT)',        4, true, now(), now()),
  (gen_random_uuid(), '20FR', '20'' Flat Rack (FR)',       5, true, now(), now()),
  (gen_random_uuid(), '40FR', '40'' Flat Rack (FR)',       6, true, now(), now()),
  (gen_random_uuid(), '20RF', '20'' Buzdolabı (RF)',       7, true, now(), now()),
  (gen_random_uuid(), '40RF', '40'' Buzdolabı (RF)',       8, true, now(), now()),
  (gen_random_uuid(), '20OG', '20'' Out-of-Gauge (OG)',    9, true, now(), now()),
  (gen_random_uuid(), '40OG', '40'' Out-of-Gauge (OG)',   10, true, now(), now()),
  (gen_random_uuid(), '20IM', '20'' IMO Cargo (IM)',      11, true, now(), now()),
  (gen_random_uuid(), '40IM', '40'' IMO Cargo (IM)',      12, true, now(), now())
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, is_active = true, updated_at = now();

-- 4. DTE-Freetime Extension Surcharge (varsa güncelle, yoksa ekle)
-- ---------------------------------------------------------------------------
INSERT INTO carrier_surcharges (id, shipping_company_id, name, description, amount, currency, apply_type, container_types, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(),
  sc.id,
  'DTE-Freetime Extension Surcharge',
  'Days 0-5 will be included in DTE-Freetime Extension Surcharge of USD 160 per reefer container',
  160,
  'USD',
  'PER_CONTAINER',
  ARRAY['20RF', '40RF'],
  true,
  now(),
  now()
FROM shipping_companies sc
WHERE sc.code = 'MAEU'
  AND NOT EXISTS (
    SELECT 1 FROM carrier_surcharges cs
    WHERE cs.shipping_company_id = sc.id
      AND cs.name = 'DTE-Freetime Extension Surcharge'
  );

-- ============================================================================
-- 5. TARİFE KURALLARI (TARIFF RULES)
-- Her liman için 4 kategoride, 20' ve 40' konteyner başına ayrı kayıt.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- AMBARLI (TRAMB)
-- ---------------------------------------------------------------------------

-- Dry & In-Gauge: Tier 1: 1-8 FREE, Tier 2: 9-14, Tier 3: 15+
DO $$
DECLARE v_port_id text; v_carrier_id text;
BEGIN
  SELECT id INTO v_port_id FROM ports WHERE code = 'TRAMB';
  SELECT id INTO v_carrier_id FROM shipping_companies WHERE code = 'MAEU';

  -- 20DC
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES (gen_random_uuid(), v_port_id, v_carrier_id, '20DC', 1, 8, 0, 9, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Ambarlı 20DC')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO UPDATE SET
    tier_1_days_from=1, tier_1_days_to=8, tier_1_price_per_day=0, tier_2_days_from=9, tier_2_days_to=14, tier_2_price_per_day=15, tier_3_days_from=15, tier_3_price_per_day=30, currency='USD';

  -- 40DC
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES (gen_random_uuid(), v_port_id, v_carrier_id, '40DC', 1, 8, 0, 9, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Ambarlı 40DC')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO UPDATE SET
    tier_1_days_from=1, tier_1_days_to=8, tier_1_price_per_day=0, tier_2_days_from=9, tier_2_days_to=14, tier_2_price_per_day=30, tier_3_days_from=15, tier_3_price_per_day=60, currency='USD';

  -- 20OT, 40OT, 20FR, 40FR (same as Dry for respective sizes)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OT', 1, 8, 0, 9, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Ambarlı 20OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OT', 1, 8, 0, 9, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Ambarlı 40OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20FR', 1, 8, 0, 9, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Ambarlı 20FR'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40FR', 1, 8, 0, 9, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Ambarlı 40FR')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- Reefer (20RF, 40RF): Tier 1: 1-5 FREE (DTE covers), Tier 2: 6-10 @ 85, Tier 3: 11+ @ 100
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20RF', 1, 5, 0, 6, 10, 85, 11, 100, 'USD', '2026-01-01', true, 'Reefer - Maersk Ambarlı 20RF'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40RF', 1, 5, 0, 6, 10, 85, 11, 100, 'USD', '2026-01-01', true, 'Reefer - Maersk Ambarlı 40RF')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- OOG (20OG, 40OG): 1+ flat rate, no free — Tier 1: 1-365 @ 75/100
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OG', 1, 365, 75, 366, 366, 75, 367, 75, 'USD', '2026-01-01', true, 'OOG - Maersk Ambarlı 20OG'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OG', 1, 365, 100, 366, 366, 100, 367, 100, 'USD', '2026-01-01', true, 'OOG - Maersk Ambarlı 40OG')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- IMO (20IM, 40IM): Tier 1: 1-7 FREE, Tier 2: 8-14 (20/40), Tier 3: 15+ (40/80)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20IM', 1, 7, 0, 8, 14, 20, 15, 40, 'USD', '2026-01-01', true, 'IMO - Maersk Ambarlı 20IM'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40IM', 1, 7, 0, 8, 14, 40, 15, 80, 'USD', '2026-01-01', true, 'IMO - Maersk Ambarlı 40IM')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;
END $$;

-- ---------------------------------------------------------------------------
-- GEMLİK (TRGEM)
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_port_id text; v_carrier_id text;
BEGIN
  SELECT id INTO v_port_id FROM ports WHERE code = 'TRGEM';
  SELECT id INTO v_carrier_id FROM shipping_companies WHERE code = 'MAEU';

  -- Dry & In-Gauge: Tier 1: 1-7 FREE, Tier 2: 8-14 (15/30), Tier 3: 15+ (30/60)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20DC', 1, 7, 0, 8, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Gemlik 20DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40DC', 1, 7, 0, 8, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Gemlik 40DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OT', 1, 7, 0, 8, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Gemlik 20OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OT', 1, 7, 0, 8, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Gemlik 40OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20FR', 1, 7, 0, 8, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Gemlik 20FR'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40FR', 1, 7, 0, 8, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Gemlik 40FR')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- Reefer (20RF, 40RF): Tier 1: 1-5 FREE, Tier 2: 6-10 @ 70, Tier 3: 11+ @ 90
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20RF', 1, 5, 0, 6, 10, 70, 11, 90, 'USD', '2026-01-01', true, 'Reefer - Maersk Gemlik 20RF'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40RF', 1, 5, 0, 6, 10, 70, 11, 90, 'USD', '2026-01-01', true, 'Reefer - Maersk Gemlik 40RF')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- OOG (20OG, 40OG): 1+ flat rate, no free — Tier 1: 1-365 @ 50/60
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OG', 1, 365, 50, 366, 366, 50, 367, 50, 'USD', '2026-01-01', true, 'OOG - Maersk Gemlik 20OG'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OG', 1, 365, 60, 366, 366, 60, 367, 60, 'USD', '2026-01-01', true, 'OOG - Maersk Gemlik 40OG')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- IMO (20IM, 40IM): Tier 1: 1-7 FREE, Tier 2: 8-14 (20/40), Tier 3: 15+ (40/80)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20IM', 1, 7, 0, 8, 14, 20, 15, 40, 'USD', '2026-01-01', true, 'IMO - Maersk Gemlik 20IM'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40IM', 1, 7, 0, 8, 14, 40, 15, 80, 'USD', '2026-01-01', true, 'IMO - Maersk Gemlik 40IM')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;
END $$;

-- ---------------------------------------------------------------------------
-- GEBZE (TRGEB)
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_port_id text; v_carrier_id text;
BEGIN
  SELECT id INTO v_port_id FROM ports WHERE code = 'TRGEB';
  SELECT id INTO v_carrier_id FROM shipping_companies WHERE code = 'MAEU';

  -- Dry & In-Gauge: Tier 1: 1-10 FREE, Tier 2: 11-14 (15/30), Tier 3: 15+ (30/60)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20DC', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Gebze 20DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40DC', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Gebze 40DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OT', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Gebze 20OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OT', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Gebze 40OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20FR', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Gebze 20FR'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40FR', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Gebze 40FR')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- Reefer (20RF, 40RF): Tier 1: 1-5 FREE, Tier 2: 6-10 @ 80, Tier 3: 11+ @ 100
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20RF', 1, 5, 0, 6, 10, 80, 11, 100, 'USD', '2026-01-01', true, 'Reefer - Maersk Gebze 20RF'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40RF', 1, 5, 0, 6, 10, 80, 11, 100, 'USD', '2026-01-01', true, 'Reefer - Maersk Gebze 40RF')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- OOG (20OG, 40OG): 1+ flat rate, no free — Tier 1: 1-365 @ 40/50
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OG', 1, 365, 40, 366, 366, 40, 367, 40, 'USD', '2026-01-01', true, 'OOG - Maersk Gebze 20OG'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OG', 1, 365, 50, 366, 366, 50, 367, 50, 'USD', '2026-01-01', true, 'OOG - Maersk Gebze 40OG')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- IMO (20IM, 40IM): Tier 1: 1-7 @ 10/20 (NO free), Tier 2: 8-14 @ 20/40, Tier 3: 15+ @ 40/80
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20IM', 1, 7, 10, 8, 14, 20, 15, 40, 'USD', '2026-01-01', true, 'IMO - Maersk Gebze 20IM'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40IM', 1, 7, 20, 8, 14, 40, 15, 80, 'USD', '2026-01-01', true, 'IMO - Maersk Gebze 40IM')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;
END $$;

-- ---------------------------------------------------------------------------
-- İSKENDERUN (TRISK)
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_port_id text; v_carrier_id text;
BEGIN
  SELECT id INTO v_port_id FROM ports WHERE code = 'TRISK';
  SELECT id INTO v_carrier_id FROM shipping_companies WHERE code = 'MAEU';

  -- Dry & In-Gauge: Tier 1: 1-7 FREE, Tier 2: 8-14 (15/30), Tier 3: 15+ (30/60)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20DC', 1, 7, 0, 8, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İskenderun 20DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40DC', 1, 7, 0, 8, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İskenderun 40DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OT', 1, 7, 0, 8, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İskenderun 20OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OT', 1, 7, 0, 8, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İskenderun 40OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20FR', 1, 7, 0, 8, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İskenderun 20FR'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40FR', 1, 7, 0, 8, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İskenderun 40FR')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- Reefer (20RF, 40RF): Tier 1: 1-5 FREE, Tier 2: 6-10 @ 90, Tier 3: 11+ @ 100
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20RF', 1, 5, 0, 6, 10, 90, 11, 100, 'USD', '2026-01-01', true, 'Reefer - Maersk İskenderun 20RF'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40RF', 1, 5, 0, 6, 10, 90, 11, 100, 'USD', '2026-01-01', true, 'Reefer - Maersk İskenderun 40RF')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- OOG (20OG, 40OG): 1+ flat rate, no free — Tier 1: 1-365 @ 40/50
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OG', 1, 365, 40, 366, 366, 40, 367, 40, 'USD', '2026-01-01', true, 'OOG - Maersk İskenderun 20OG'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OG', 1, 365, 50, 366, 366, 50, 367, 50, 'USD', '2026-01-01', true, 'OOG - Maersk İskenderun 40OG')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- IMO (20IM, 40IM): Tier 1: 1-7 @ 10/20 (NO free), Tier 2: 8-14 @ 20/40, Tier 3: 15+ @ 40/80
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20IM', 1, 7, 10, 8, 14, 20, 15, 40, 'USD', '2026-01-01', true, 'IMO - Maersk İskenderun 20IM'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40IM', 1, 7, 20, 8, 14, 40, 15, 80, 'USD', '2026-01-01', true, 'IMO - Maersk İskenderun 40IM')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;
END $$;

-- ---------------------------------------------------------------------------
-- İZMİR (TRIZM)
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_port_id text; v_carrier_id text;
BEGIN
  SELECT id INTO v_port_id FROM ports WHERE code = 'TRIZM';
  SELECT id INTO v_carrier_id FROM shipping_companies WHERE code = 'MAEU';

  -- Dry & In-Gauge: Tier 1: 1-10 FREE, Tier 2: 11-14 (15/30), Tier 3: 15+ (30/60)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20DC', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İzmir 20DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40DC', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İzmir 40DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OT', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İzmir 20OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OT', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İzmir 40OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20FR', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İzmir 20FR'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40FR', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İzmir 40FR')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- Reefer (20RF, 40RF): Tier 1: 1-5 FREE, Tier 2: 6-10 @ 80, Tier 3: 11+ @ 100
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20RF', 1, 5, 0, 6, 10, 80, 11, 100, 'USD', '2026-01-01', true, 'Reefer - Maersk İzmir 20RF'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40RF', 1, 5, 0, 6, 10, 80, 11, 100, 'USD', '2026-01-01', true, 'Reefer - Maersk İzmir 40RF')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- OOG (20OG, 40OG): Tier 1: 1-5 FREE, Tier 2: 6-365 @ 40/50, Tier 3: 366+ @ 40/50
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OG', 1, 5, 0, 6, 365, 40, 366, 40, 'USD', '2026-01-01', true, 'OOG - Maersk İzmir 20OG'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OG', 1, 5, 0, 6, 365, 50, 366, 50, 'USD', '2026-01-01', true, 'OOG - Maersk İzmir 40OG')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- IMO (20IM, 40IM): Tier 1: 1-7 FREE, Tier 2: 8-14 (20/40), Tier 3: 15+ (40/80)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20IM', 1, 7, 0, 8, 14, 20, 15, 40, 'USD', '2026-01-01', true, 'IMO - Maersk İzmir 20IM'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40IM', 1, 7, 0, 8, 14, 40, 15, 80, 'USD', '2026-01-01', true, 'IMO - Maersk İzmir 40IM')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;
END $$;

-- ---------------------------------------------------------------------------
-- İZMİT KÖRFEZİ (TRIZT)
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_port_id text; v_carrier_id text;
BEGIN
  SELECT id INTO v_port_id FROM ports WHERE code = 'TRIZT';
  SELECT id INTO v_carrier_id FROM shipping_companies WHERE code = 'MAEU';

  -- Dry & In-Gauge: Tier 1: 1-10 FREE, Tier 2: 11-14 (15/30), Tier 3: 15+ (30/60)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20DC', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İzmit Körfezi 20DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40DC', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İzmit Körfezi 40DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OT', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İzmit Körfezi 20OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OT', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İzmit Körfezi 40OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20FR', 1, 10, 0, 11, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk İzmit Körfezi 20FR'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40FR', 1, 10, 0, 11, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk İzmit Körfezi 40FR')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- Reefer (20RF, 40RF): Tier 1: 1-5 FREE, Tier 2: 6-10 @ 70, Tier 3: 11+ @ 90
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20RF', 1, 5, 0, 6, 10, 70, 11, 90, 'USD', '2026-01-01', true, 'Reefer - Maersk İzmit Körfezi 20RF'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40RF', 1, 5, 0, 6, 10, 70, 11, 90, 'USD', '2026-01-01', true, 'Reefer - Maersk İzmit Körfezi 40RF')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- OOG (20OG, 40OG): Tier 1: 1-10 FREE, Tier 2: 11-365 @ 75/90, Tier 3: 366+ @ 75/90
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OG', 1, 10, 0, 11, 365, 75, 366, 75, 'USD', '2026-01-01', true, 'OOG - Maersk İzmit Körfezi 20OG'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OG', 1, 10, 0, 11, 365, 90, 366, 90, 'USD', '2026-01-01', true, 'OOG - Maersk İzmit Körfezi 40OG')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- IMO (20IM, 40IM): Tier 1: 1-7 FREE, Tier 2: 8-14 (20/40), Tier 3: 15+ (40/80)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20IM', 1, 7, 0, 8, 14, 20, 15, 40, 'USD', '2026-01-01', true, 'IMO - Maersk İzmit Körfezi 20IM'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40IM', 1, 7, 0, 8, 14, 40, 15, 80, 'USD', '2026-01-01', true, 'IMO - Maersk İzmit Körfezi 40IM')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;
END $$;

-- ---------------------------------------------------------------------------
-- MERSİN (TRMER)
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_port_id text; v_carrier_id text;
BEGIN
  SELECT id INTO v_port_id FROM ports WHERE code = 'TRMER';
  SELECT id INTO v_carrier_id FROM shipping_companies WHERE code = 'MAEU';

  -- Dry & In-Gauge: Tier 1: 1-6 FREE, Tier 2: 7-14 (15/30), Tier 3: 15+ (30/60)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20DC', 1, 6, 0, 7, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Mersin 20DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40DC', 1, 6, 0, 7, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Mersin 40DC'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OT', 1, 6, 0, 7, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Mersin 20OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OT', 1, 6, 0, 7, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Mersin 40OT'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '20FR', 1, 6, 0, 7, 14, 15, 15, 30, 'USD', '2026-01-01', true, 'Dry - Maersk Mersin 20FR'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40FR', 1, 6, 0, 7, 14, 30, 15, 60, 'USD', '2026-01-01', true, 'Dry - Maersk Mersin 40FR')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- Reefer (20RF, 40RF): Tier 1: 1-5 FREE, Tier 2: 6-10 @ 95, Tier 3: 11+ @ 110
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20RF', 1, 5, 0, 6, 10, 95, 11, 110, 'USD', '2026-01-01', true, 'Reefer - Maersk Mersin 20RF'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40RF', 1, 5, 0, 6, 10, 95, 11, 110, 'USD', '2026-01-01', true, 'Reefer - Maersk Mersin 40RF')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- OOG (20OG, 40OG): Tier 1: 1-5 FREE, Tier 2: 6-365 @ 75/90, Tier 3: 366+ @ 75/90
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20OG', 1, 5, 0, 6, 365, 75, 366, 75, 'USD', '2026-01-01', true, 'OOG - Maersk Mersin 20OG'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40OG', 1, 5, 0, 6, 365, 90, 366, 90, 'USD', '2026-01-01', true, 'OOG - Maersk Mersin 40OG')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;

  -- IMO (20IM, 40IM): Tier 1: 1-6 FREE, Tier 2: 7-14 (20/40), Tier 3: 15+ (40/80)
  INSERT INTO tariff_rules (id, port_id, shipping_company_id, container_type, tier_1_days_from, tier_1_days_to, tier_1_price_per_day, tier_2_days_from, tier_2_days_to, tier_2_price_per_day, tier_3_days_from, tier_3_price_per_day, currency, effective_from, is_active, notes)
  VALUES
    (gen_random_uuid(), v_port_id, v_carrier_id, '20IM', 1, 6, 0, 7, 14, 20, 15, 40, 'USD', '2026-01-01', true, 'IMO - Maersk Mersin 20IM'),
    (gen_random_uuid(), v_port_id, v_carrier_id, '40IM', 1, 6, 0, 7, 14, 40, 15, 80, 'USD', '2026-01-01', true, 'IMO - Maersk Mersin 40IM')
  ON CONFLICT (port_id, shipping_company_id, container_type, effective_from) DO NOTHING;
END $$;

COMMIT;

-- ============================================================================
-- DOĞRULAMA SORGULARI (isteğe bağlı, kontrol için)
-- ============================================================================
-- SELECT p.name AS liman, tr.container_type, tr.tier_1_days_from, tr.tier_1_days_to,
--        tr.tier_1_price_per_day, tr.tier_2_days_from, tr.tier_2_days_to,
--        tr.tier_2_price_per_day, tr.tier_3_days_from, tr.tier_3_price_per_day,
--        tr.currency
-- FROM tariff_rules tr
-- JOIN ports p ON p.id = tr.port_id
-- JOIN shipping_companies sc ON sc.id = tr.shipping_company_id
-- WHERE sc.code = 'MAEU' AND tr.is_active = true
-- ORDER BY p.name, tr.container_type;
