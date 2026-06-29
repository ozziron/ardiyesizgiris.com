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
 */
export function useCalculationOptions() {
  const [ports, setPorts] = useState<SelectOption[]>([]);
  const [carriers, setCarriers] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [portsRes, carriersRes] = await Promise.all([
          apiFetch("/api/ports"),
          apiFetch("/api/carriers"),
        ]);
        const portsData = await portsRes.json();
        const carriersData = await carriersRes.json();
        setPorts(portsData.data || []);
        setCarriers(carriersData.data || []);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      }
    };
    fetchOptions();
  }, []);

  return { ports, carriers };
}
