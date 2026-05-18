"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useContainerTypes } from "@/hooks/use-container-types";
import { useCalculationOptions, type SelectOption } from "@/hooks/use-calculation-options";
import { useCalculationPreview, type LivePreview } from "@/hooks/use-calculation-preview";
import type { CalculationApiResult, ChargeBreakdownItem } from "@/types/calculation";
import { formatTR } from "@/lib/format";
import { BILLING_ENABLED } from "@/lib/billing/config";

export type { ChargeBreakdownItem, SelectOption, LivePreview };

export type CalculationMode = "planning" | "cost";

export type CalculationResult = CalculationApiResult;

export type FormState = {
  portId: string;
  shippingCompanyId: string;
  containerType: string;
  departureDate: string;
  containerId: string;
  gateInDate: string;
};

export type FieldErrors = Partial<Record<keyof FormState, string>>;

export type ExportState = {
  recipientEmail: string;
  message: string;
  messageTone: "success" | "error" | null;
  isPdfLoading: boolean;
  isEmailLoading: boolean;
};

type CalculationErrorPayload = {
  error?: string;
  details?: { message?: string }[];
  code?: string;
};

export type SummaryRow = { label: string; value: string; mono?: boolean };

const initialForm: FormState = {
  portId: "",
  shippingCompanyId: "",
  containerType: "",
  departureDate: "",
  containerId: "",
  gateInDate: "",
};

const initialExportState: ExportState = {
  recipientEmail: "",
  message: "",
  messageTone: null,
  isPdfLoading: false,
  isEmailLoading: false,
};

const getOptionName = (options: SelectOption[], id: string) =>
  options.find((option) => option.id === id)?.name ?? "-";

const buildFileName = (mode: CalculationMode, containerId?: string) => {
  const dateStamp = new Date().toISOString().slice(0, 10);
  if (mode === "planning") return `ardiyesiz-planlama-${dateStamp}.pdf`;
  const safeContainerId = (containerId || "rapor").replace(/[^a-zA-Z0-9-_]/g, "-");
  return `ardiyesiz-masraf-${safeContainerId}-${dateStamp}.pdf`;
};

const downloadPdfDataUri = (pdfDataUri: string, filename: string) => {
  const link = document.createElement("a");
  link.href = pdfDataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function useCalculationForm() {
  const { data: session } = useSession();
  const { ports, carriers } = useCalculationOptions();
  const { options: containerTypes } = useContainerTypes();
  const getContainerTypeLabel = (code: string) =>
    containerTypes.find((c) => c.code === code)?.label ?? code;

  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [submittedMode, setSubmittedMode] = useState<CalculationMode | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [exportState, setExportState] = useState<ExportState>(initialExportState);
  const [isLoading, setIsLoading] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);
  const [usage, setUsage] = useState<{
    isPremium: boolean
    remaining: number | null
    limit: number
    resetAt: string | null
  } | null>(null);
  const preview = useCalculationPreview({
    portId: form.portId,
    shippingCompanyId: form.shippingCompanyId,
    containerType: form.containerType,
    departureDate: form.departureDate,
  });

  const mode: CalculationMode = form.gateInDate ? "cost" : "planning";

  const updateForm = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setFieldErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as (keyof FormState)[]) {
        delete next[key];
      }
      if ("gateInDate" in patch && !patch.gateInDate) {
        delete next.containerId;
      }
      return next;
    });
  };

  const setRecipientEmail = (value: string) =>
    setExportState((current) => ({ ...current, recipientEmail: value }));

  const validateForm = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!form.shippingCompanyId) nextErrors.shippingCompanyId = "Hat seçiniz.";
    if (!form.portId) nextErrors.portId = "Liman seçiniz.";
    if (!form.containerType) nextErrors.containerType = "Ekipman tipi seçiniz.";
    if (!form.departureDate) nextErrors.departureDate = "Gemi kalkış tarihini giriniz.";
    if (form.gateInDate && !form.containerId.trim()) {
      nextErrors.containerId = "Masraf hesabı için konteyner no giriniz.";
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("");
      setResult(null);
      return;
    }

    setFieldErrors({});
    setExportState((current) => ({ ...current, message: "", messageTone: null }));
    setCheckoutError("");
    setIsLoading(true);
    setError("");
    setResult(null);

    const submissionMode: CalculationMode = form.gateInDate ? "cost" : "planning";
    const payload = {
      portId: form.portId,
      shippingCompanyId: form.shippingCompanyId,
      containerType: form.containerType,
      departureDate: form.departureDate,
      containerId: form.gateInDate ? form.containerId : null,
      gateInDate: form.gateInDate || null,
    };

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data as CalculationErrorPayload;
        if (response.status === 402 || errorPayload?.code === "UPGRADE_REQUIRED") {
          setUpgradePrompt(true);
        }
        const message = data?.error || data?.details?.[0]?.message || "Hesaplama sırasında bir hata oluştu.";
        throw new Error(message);
      }

      setUpgradePrompt(false);
      setResult(data.data);
      setSubmittedMode(submissionMode);
      if (data.data?.usage) {
        setUsage(data.data.usage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hesaplama sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCheckout = async () => {
    setCheckoutError("");

    if (!BILLING_ENABLED) return;

    if (!session?.user?.id) {
      window.location.href = "/giris?callbackUrl=/hesaplama";
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const response = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Premium ödeme sayfası açılamadı.");
      }

      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Premium ödeme sayfası açılamadı.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    setCheckoutError("");

    if (!BILLING_ENABLED) return;

    if (!session?.user?.id) {
      window.location.href = "/giris?callbackUrl=/hesaplama";
      return;
    }

    setIsBuyingCredits(true);

    try {
      const response = await fetch("/api/billing/buy-credits", { method: "POST" });
      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Kredi satın alma sayfası açılamadı.");
      }

      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Kredi satın alma sayfası açılamadı.");
    } finally {
      setIsBuyingCredits(false);
    }
  };

  const getExportPayload = () => {
    if (!result || !submittedMode) return null;
    const isCost = submittedMode === "cost";

    return {
      calculationType: submittedMode,
      calculationId: isCost ? result.calculationId ?? null : null,
      portalName: getOptionName(ports, form.portId),
      carrierName: getOptionName(carriers, form.shippingCompanyId),
      containerId: isCost ? form.containerId : null,
      containerType: getContainerTypeLabel(form.containerType),
      departureDate: form.departureDate,
      gateInDate: isCost ? form.gateInDate : null,
      freeDays: result.free_days,
      freeUntilDate: result.free_until_date,
      totalCharge: isCost ? result.total_charge : 0,
      currency: result.currency || "TRY",
      totalDaysAtPort: result.total_days_at_port,
      chargeableDays: result.chargeable_days,
      warning: result.warning,
      chargeBreakdown: result.charge_breakdown,
      surcharges: result.surcharges,
    };
  };

  const handleDownloadPdf = async () => {
    const payload = getExportPayload();
    if (!payload || !submittedMode) return;

    setExportState((current) => ({ ...current, isPdfLoading: true, message: "", messageTone: null }));

    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "PDF oluşturulamadı.");

      downloadPdfDataUri(data.pdfDataUri, buildFileName(submittedMode, payload.containerId ?? undefined));

      setExportState((current) => ({
        ...current,
        isPdfLoading: false,
        message: "PDF raporu indirildi.",
        messageTone: "success",
      }));
    } catch (err) {
      setExportState((current) => ({
        ...current,
        isPdfLoading: false,
        message: err instanceof Error ? err.message : "PDF oluşturulamadı.",
        messageTone: "error",
      }));
    }
  };

  const handleSendEmail = async () => {
    const payload = getExportPayload();
    const recipientEmail = exportState.recipientEmail.trim();
    if (!payload) return;

    if (!session?.user?.email && !recipientEmail) {
      setExportState((current) => ({
        ...current,
        message: "Email göndermek için bir alıcı adresi girin.",
        messageTone: "error",
      }));
      return;
    }

    setExportState((current) => ({ ...current, isEmailLoading: true, message: "", messageTone: null }));

    try {
      const response = await fetch("/api/export/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, recipientEmail: recipientEmail || undefined }),
      });
      const data = await response.json();

      if (response.status === 503 && data?.code === "EMAIL_NOT_CONFIGURED") {
        setExportState((current) => ({
          ...current,
          isEmailLoading: false,
          message: "E-posta hizmeti henüz aktif değil. Sonucu şimdilik PDF olarak indirebilirsiniz.",
          messageTone: "error",
        }));
        return;
      }

      if (!response.ok) throw new Error(data?.error || "Email gönderilemedi.");

      const successDetail = data?.dryRun ? " (test modu)" : "";
      setExportState((current) => ({
        ...current,
        isEmailLoading: false,
        message: `Sonuç ${recipientEmail || session?.user?.email} adresine gönderildi${successDetail}.`,
        messageTone: "success",
      }));
    } catch (err) {
      setExportState((current) => ({
        ...current,
        isEmailLoading: false,
        message: err instanceof Error ? err.message : "Email gönderilemedi.",
        messageTone: "error",
      }));
    }
  };

  const isCostResult = submittedMode === "cost";
  const summaryRows: SummaryRow[] = [
    { label: "Liman", value: getOptionName(ports, form.portId) },
    { label: "Hat", value: getOptionName(carriers, form.shippingCompanyId) },
    { label: "Konteyner", value: getContainerTypeLabel(form.containerType) },
    ...(isCostResult ? [{ label: "Konteyner ID", value: form.containerId, mono: true }] : []),
    { label: "Kalkış", value: formatTR(form.departureDate), mono: true },
    ...(isCostResult ? [{ label: "Gate-in", value: formatTR(form.gateInDate), mono: true }] : []),
  ];

  return {
    session,
    ports,
    carriers,
    containerTypes,
    form,
    updateForm,
    mode,
    submittedMode,
    result,
    error,
    fieldErrors,
    upgradePrompt,
    isLoading,
    isCheckoutLoading,
    checkoutError,
    preview,
    exportState,
    setRecipientEmail,
    summaryRows,
    handleSubmit,
    handleStartCheckout,
    handleBuyCredits,
    handleDownloadPdf,
    handleSendEmail,
    isBuyingCredits,
    usage,
  };
}
