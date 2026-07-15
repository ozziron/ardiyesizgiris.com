"use client";

import { useEffect, useState } from "react";
import { apiFetch } from '@/lib/api-client';


export type SelectOption = {
  id: string;
  name: string;
};

/**
 * Loads port and carrier dropdown options for the calculation form.
 * Self-contained; no form coupling.
 *
 * shippingCompanyId verilirse liman listesi o hatta hizmet veren (aktif
 * tarife kuralı olan) limanlarla sınırlanır; hat değiştikçe yeniden yüklenir.
 */
export function useCalculationOptions(shippingCompanyId?: string) {
  const [ports, setPorts] = useState<SelectOption[]>([]);
  const [carriers, setCarriers] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const carriersRes = await apiFetch("/api/carriers");
        const carriersData = await carriersRes.json();
        setCarriers(carriersData.data || []);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      }
    };
    fetchCarriers();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchPorts = async () => {
      try {
        const url = shippingCompanyId
          ? `/api/ports?shippingCompanyId=${encodeURIComponent(shippingCompanyId)}`
          : "/api/ports";
        const portsRes = await apiFetch(url);
        const portsData = await portsRes.json();
        if (!cancelled) setPorts(portsData.data || []);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      }
    };
    fetchPorts();
    return () => {
      cancelled = true;
    };
  }, [shippingCompanyId]);

  return { ports, carriers };
}
