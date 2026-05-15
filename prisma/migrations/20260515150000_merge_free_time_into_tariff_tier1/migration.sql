-- Muafiyet'i Tier 1'e birleştir (TICKET-023).
--
-- Önce: mevcut FreeTimeRule kayıtlarını eşleşen TariffRule'a backfill et.
-- Eşleştirme anahtarı: portId + shippingCompanyId + containerType + overlap'lı
-- effective tarih aralığı. Çoklu eşleşmede en yeni aktif TariffRule alınır.
-- TariffRule.tier1DaysFrom = 1, tier1DaysTo = freeDays, tier1PricePerDay = 0
-- yapılır. Eşleşen TariffRule yoksa kayıt log için NOTICE basılır ve atlanır.
--
-- Sonra: free_time_rules tablosu DROP edilir.

DO $$
DECLARE
  ft RECORD;
  matched_id TEXT;
  unmatched_count INT := 0;
  matched_count INT := 0;
BEGIN
  FOR ft IN
    SELECT id, port_id, shipping_company_id, container_type, free_days,
           effective_from, effective_until
    FROM free_time_rules
    WHERE is_active = true
  LOOP
    SELECT id
      INTO matched_id
      FROM tariff_rules
      WHERE port_id = ft.port_id
        AND shipping_company_id = ft.shipping_company_id
        AND container_type = ft.container_type
        AND is_active = true
        AND effective_from <= COALESCE(ft.effective_until, ft.effective_from)
        AND (effective_until IS NULL OR effective_until >= ft.effective_from)
      ORDER BY effective_from DESC
      LIMIT 1;

    IF matched_id IS NULL THEN
      RAISE NOTICE 'FreeTimeRule % (% gün) için eşleşen TariffRule bulunamadı (port=%, carrier=%, container=%)',
        ft.id, ft.free_days, ft.port_id, ft.shipping_company_id, ft.container_type;
      unmatched_count := unmatched_count + 1;
      CONTINUE;
    END IF;

    UPDATE tariff_rules
       SET tier_1_days_from = 1,
           tier_1_days_to = ft.free_days,
           tier_1_price_per_day = 0,
           updated_at = NOW()
     WHERE id = matched_id;

    matched_count := matched_count + 1;
    matched_id := NULL;
  END LOOP;

  RAISE NOTICE 'Backfill complete: % matched, % unmatched.', matched_count, unmatched_count;
END $$;

-- Drop the FreeTimeRule table and its foreign keys.
DROP TABLE IF EXISTS "free_time_rules";
