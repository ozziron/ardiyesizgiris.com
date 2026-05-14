"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useContainerTypes } from "@/hooks/use-container-types";
import { CalculationResultCard } from "@/components/calculation/result-card";
import { CalculationTimeline } from "@/components/calculation/timeline";

type CalculationMode = "planning" | "cost";

type SelectOption = {
  id: string;
  name: string;
};

type ChargeBreakdownItem = {
  tier: number;
  days: number;
  price_per_day: number;
  subtotal: number;
};

type CalculationResult = {
  free_days: number;
  free_until_date: string | Date;
  total_days_at_port: number;
  chargeable_days: number;
  total_charge: number;
  charge_breakdown?: ChargeBreakdownItem[];
  warning?: string;
  // Server returns this only for cost-mode calculations that get
  // persisted to the DB. Used downstream to attach export history
  // to the right calculation row.
  calculationId?: string | null;
};

type PlanningFormState = {
  portId: string;
  shippingCompanyId: string;
  containerType: string;
  departureDate: string;
};

type CostFormState = PlanningFormState & {
  containerId: string;
  gateInDate: string;
};

type ExportState = {
  recipientEmail: string;
  message: string;
  messageTone: "success" | "error" | null;
  isPdfLoading: boolean;
  isEmailLoading: boolean;
};

/**
 * Anticipatory result the live-preview shows BEFORE the user hits
 * "Hesapla". It only contains the data we can derive purely from
 * looking up the free-time rule — no chargeable days, no total cost.
 * Anything cost-related still requires the full /api/calculate roundtrip.
 */
type LivePreview = {
  freeDays: number;
  freeUntilDate: string;
};

type ModeCardContent = {
  value: CalculationMode;
  badge: string;
  title: string;
  description: string;
  points: string[];
  icon: LucideIcon;
};

type ResultActionsPanelProps = {
  mode: CalculationMode;
  sessionEmail?: string | null;
  recipientEmail: string;
  onRecipientEmailChange: (value: string) => void;
  onDownloadPdf: () => void;
  onSendEmail: () => void;
  isPdfLoading: boolean;
  isEmailLoading: boolean;
  message: string;
  messageTone: "success" | "error" | null;
};

const initialPlanningForm: PlanningFormState = {
  portId: "",
  shippingCompanyId: "",
  containerType: "20DC",
  departureDate: "",
};

const initialCostForm: CostFormState = {
  portId: "",
  shippingCompanyId: "",
  containerType: "20DC",
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

const modeCards: ModeCardContent[] = [
  {
    value: "planning",
    badge: "Planlama",
    title: "Ardiyesiz Giriş Tarihi",
    description:
      "Yükleme planlamanız için ardiyesiz giriş tarihini hızlıca hesaplayın.",
    points: [
      "Gate-in tarihi gerekli değildir.",
      "Masraf bilgisi mevcut değildir.",
      "PDF ve E-mail olarak paylaşılabilir.",
    ],
    icon: CalendarClock,
  },
  {
    value: "cost",
    badge: "Masraf",
    title: "Demurrage & Detention Hesaplama",
    description:
      "Gate-in tarihi ile birlikte Demurrage & Detention masraflarını hesaplayabilirsiniz.",
    points: [
      "Konteyner ID bilgisi girişi yapılabilir.",
      "Masraf kırılım bilgisi içerir.",
      "PDF ve E-mail olarak paylaşılabilir.",
    ],
    icon: Wallet,
  },
];

const formatLocalDate = (isoDate: string | Date | undefined) => {
  if (!isoDate) return "-";
  const dateObj = isoDate instanceof Date ? isoDate : new Date(isoDate);
  return dateObj.toLocaleDateString("tr-TR");
};

const formatCurrency = (value: number | undefined) => {
  if (value == null) return "0,00 TL";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
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

/**
 * Anticipatory preview card shown above the submit button once the four
 * lookup fields (port + carrier + container + departure) are filled.
 * Uses the same CalculationTimeline as the result card so the visual
 * promise carries through from form → submit → result.
 */
function LivePreviewCard({
  preview,
  departureDate,
}: {
  preview: LivePreview;
  departureDate: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          Önizleme
        </span>
        <span className="text-[11px] text-muted-foreground">
          Hesapla&apos;ya basarak detaylı sonucu görün
        </span>
      </div>
      <CalculationTimeline
        departureDate={departureDate}
        freeUntilDate={preview.freeUntilDate}
        freeDays={preview.freeDays}
      />
    </div>
  );
}

function ResultActionsPanel({
  mode,
  sessionEmail,
  recipientEmail,
  onRecipientEmailChange,
  onDownloadPdf,
  onSendEmail,
  isPdfLoading,
  isEmailLoading,
  message,
  messageTone,
}: ResultActionsPanelProps) {
  const usesSessionEmail = Boolean(sessionEmail && !recipientEmail.trim());
  const description =
    mode === "planning"
      ? "Planlama sonucunu PDF olarak kaydedin veya ekibinizle e-posta yoluyla paylaşın."
      : "Masraf sonucunu PDF alın veya operasyon ekibine anında e-posta olarak iletin.";

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Sonucu paylaş ve arşivle</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="w-fit border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
          {mode === "planning" ? "Planlama çıktısı" : "Masraf raporu"}
        </Badge>
      </div>

      {/* Single row layout: label on top, input + two buttons share one flex
          row so heights align. Buttons reordered: Email gönder is the primary
          action (sits right next to the email input), PDF indir is the
          secondary fallback on the far right. */}
      <div className="mt-4">
        <Label htmlFor={`${mode}-email`}>Email adresi</Label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <Input
            id={`${mode}-email`}
            type="email"
            value={recipientEmail}
            onChange={(event) => onRecipientEmailChange(event.target.value)}
            placeholder={sessionEmail ?? "operasyon@firma.com"}
            className="flex-1"
          />
          <Button
            type="button"
            className="gap-2 sm:flex-shrink-0"
            onClick={onSendEmail}
            disabled={isEmailLoading || isPdfLoading}
          >
            <Mail className="h-4 w-4" />
            {isEmailLoading ? "Email gönderiliyor..." : "Email gönder"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 sm:flex-shrink-0"
            onClick={onDownloadPdf}
            disabled={isPdfLoading || isEmailLoading}
          >
            <Download className="h-4 w-4" />
            {isPdfLoading ? "PDF hazırlanıyor..." : "PDF indir"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {usesSessionEmail
            ? `Boş bırakılırsa oturum emaili olan ${sessionEmail} kullanılır.`
            : "Oturum emailiniz yoksa gönderim için bir alıcı adresi yazın."}
        </p>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm ${
            messageTone === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default function HesaplamaPage() {
  const { data: session } = useSession();
  // activeTab starts null so the page opens with ONLY the mode-selection
  // cards visible. The form pane mounts only after the user picks a mode.
  const [activeTab, setActiveTab] = useState<CalculationMode | null>(null);
  const [ports, setPorts] = useState<SelectOption[]>([]);
  const [carriers, setCarriers] = useState<SelectOption[]>([]);
  // Container types come from the DB now (admin-managed). The hook
  // returns an empty list while loading so selects render empty rather
  // than crashing; once loaded the user sees the live list.
  const { options: containerTypes } = useContainerTypes();
  const getContainerTypeLabel = (code: string) =>
    containerTypes.find((c) => c.code === code)?.label ?? code;
  const [planningForm, setPlanningForm] = useState<PlanningFormState>(initialPlanningForm);
  const [costForm, setCostForm] = useState<CostFormState>(initialCostForm);
  const [planningResult, setPlanningResult] = useState<CalculationResult | null>(null);
  const [costResult, setCostResult] = useState<CalculationResult | null>(null);
  const [planningError, setPlanningError] = useState("");
  const [costError, setCostError] = useState("");
  const [planningExport, setPlanningExport] = useState<ExportState>(initialExportState);
  const [costExport, setCostExport] = useState<ExportState>(initialExportState);
  const [isPlanningLoading, setIsPlanningLoading] = useState(false);
  const [isCostLoading, setIsCostLoading] = useState(false);
  // Live preview — anticipatory result rendered between the form and the
  // submit button as soon as the four lookup fields are filled.
  const [planningPreview, setPlanningPreview] = useState<LivePreview | null>(null);
  const [costPreview, setCostPreview] = useState<LivePreview | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [portsRes, carriersRes] = await Promise.all([fetch("/api/ports"), fetch("/api/carriers")]);
        const portsData = await portsRes.json();
        const carriersData = await carriersRes.json();

        setPorts(portsData.data || []);
        setCarriers(carriersData.data || []);
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
      }
    };

    fetchOptions();
  }, []);

  // Live preview effects: debounced fetch to /api/free-time-preview each
  // time one of the four lookup fields changes. AbortController cancels
  // any in-flight request so only the latest response lands in state.
  useEffect(() => {
    const { portId, shippingCompanyId, containerType, departureDate } = planningForm;
    if (!portId || !shippingCompanyId || !containerType || !departureDate) {
      setPlanningPreview(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ portId, shippingCompanyId, containerType, departureDate });
        const res = await fetch(`/api/free-time-preview?${params}`, { signal: controller.signal });
        if (!res.ok) {
          setPlanningPreview(null);
          return;
        }
        const data = await res.json();
        setPlanningPreview({ freeDays: data.freeDays, freeUntilDate: data.freeUntilDate });
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setPlanningPreview(null);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [planningForm.portId, planningForm.shippingCompanyId, planningForm.containerType, planningForm.departureDate]);

  useEffect(() => {
    const { portId, shippingCompanyId, containerType, departureDate } = costForm;
    if (!portId || !shippingCompanyId || !containerType || !departureDate) {
      setCostPreview(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ portId, shippingCompanyId, containerType, departureDate });
        const res = await fetch(`/api/free-time-preview?${params}`, { signal: controller.signal });
        if (!res.ok) {
          setCostPreview(null);
          return;
        }
        const data = await res.json();
        setCostPreview({ freeDays: data.freeDays, freeUntilDate: data.freeUntilDate });
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setCostPreview(null);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [costForm.portId, costForm.shippingCompanyId, costForm.containerType, costForm.departureDate]);

  const resetExportFeedback = (mode: CalculationMode) => {
    if (mode === "planning") {
      setPlanningExport((current) => ({ ...current, message: "", messageTone: null }));
    } else {
      setCostExport((current) => ({ ...current, message: "", messageTone: null }));
    }
  };

  const updateExportState = (mode: CalculationMode, updater: (current: ExportState) => ExportState) => {
    if (mode === "planning") {
      setPlanningExport(updater);
    } else {
      setCostExport(updater);
    }
  };

  const requestCalculation = async (
    payload: Record<string, string | null | undefined>,
    type: CalculationMode,
  ) => {
    resetExportFeedback(type);

    if (type === "planning") {
      setIsPlanningLoading(true);
      setPlanningError("");
      setPlanningResult(null);
    } else {
      setIsCostLoading(true);
      setCostError("");
      setCostResult(null);
    }

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || data?.details?.[0]?.message || "Hesaplama sırasında bir hata oluştu.";
        throw new Error(message);
      }

      if (type === "planning") {
        setPlanningResult(data.data);
      } else {
        setCostResult(data.data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Hesaplama sırasında bir hata oluştu.";

      if (type === "planning") {
        setPlanningError(message);
      } else {
        setCostError(message);
      }
    } finally {
      if (type === "planning") {
        setIsPlanningLoading(false);
      } else {
        setIsCostLoading(false);
      }
    }
  };

  const validatePlanningForm = () => {
    if (!planningForm.portId) return "Liman seçiniz.";
    if (!planningForm.shippingCompanyId) return "Hat seçiniz.";
    if (!planningForm.containerType) return "Ekipman tipi seçiniz.";
    if (!planningForm.departureDate) return "Gemi kalkış tarihini giriniz.";
    return null;
  };

  const validateCostForm = () => {
    if (!costForm.portId) return "Liman seçiniz.";
    if (!costForm.shippingCompanyId) return "Hat seçiniz.";
    if (!costForm.containerType) return "Ekipman tipi seçiniz.";
    if (!costForm.containerId.trim()) return "Konteyner ID giriniz.";
    if (!costForm.departureDate) return "Gemi kalkış tarihini giriniz.";
    if (!costForm.gateInDate) return "Gate-in tarihini giriniz.";
    return null;
  };

  const handlePlanningSubmit = async () => {
    const validationError = validatePlanningForm();

    if (validationError) {
      setPlanningError(validationError);
      setPlanningResult(null);
      return;
    }

    await requestCalculation(
      {
        portId: planningForm.portId,
        shippingCompanyId: planningForm.shippingCompanyId,
        containerType: planningForm.containerType,
        departureDate: planningForm.departureDate,
        containerId: null,
        gateInDate: null,
      },
      "planning",
    );
  };

  const handleCostSubmit = async () => {
    const validationError = validateCostForm();

    if (validationError) {
      setCostError(validationError);
      setCostResult(null);
      return;
    }

    await requestCalculation(
      {
        portId: costForm.portId,
        shippingCompanyId: costForm.shippingCompanyId,
        containerType: costForm.containerType,
        departureDate: costForm.departureDate,
        containerId: costForm.containerId,
        gateInDate: costForm.gateInDate,
      },
      "cost",
    );
  };

  const getExportPayload = (mode: CalculationMode) => {
    const result = mode === "planning" ? planningResult : costResult;
    const form = mode === "planning" ? planningForm : costForm;

    if (!result) return null;

    return {
      calculationType: mode,
      // Only cost-mode results have a persisted DB row, and only those
      // can be tracked in export history. Sending null for planning is
      // explicit — server treats it the same as missing.
      calculationId: mode === "cost" ? result.calculationId ?? null : null,
      portalName: getOptionName(ports, form.portId),
      carrierName: getOptionName(carriers, form.shippingCompanyId),
      containerId: mode === "cost" ? costForm.containerId : null,
      containerType: getContainerTypeLabel(form.containerType),
      departureDate: form.departureDate,
      gateInDate: mode === "cost" ? costForm.gateInDate : null,
      freeDays: result.free_days,
      freeUntilDate: result.free_until_date,
      totalCharge: mode === "planning" ? 0 : result.total_charge,
      totalDaysAtPort: result.total_days_at_port,
      chargeableDays: result.chargeable_days,
      warning: result.warning,
      chargeBreakdown: result.charge_breakdown,
    };
  };

  const handleDownloadPdf = async (mode: CalculationMode) => {
    const payload = getExportPayload(mode);

    if (!payload) return;

    updateExportState(mode, (current) => ({
      ...current,
      isPdfLoading: true,
      message: "",
      messageTone: null,
    }));

    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "PDF oluşturulamadı.");
      }

      downloadPdfDataUri(data.pdfDataUri, buildFileName(mode, payload.containerId ?? undefined));

      updateExportState(mode, (current) => ({
        ...current,
        isPdfLoading: false,
        message: "PDF raporu indirildi.",
        messageTone: "success",
      }));
    } catch (error) {
      updateExportState(mode, (current) => ({
        ...current,
        isPdfLoading: false,
        message: error instanceof Error ? error.message : "PDF oluşturulamadı.",
        messageTone: "error",
      }));
    }
  };

  const handleSendEmail = async (mode: CalculationMode) => {
    const payload = getExportPayload(mode);
    const exportState = mode === "planning" ? planningExport : costExport;
    const recipientEmail = exportState.recipientEmail.trim();

    if (!payload) return;

    if (!session?.user?.email && !recipientEmail) {
      updateExportState(mode, (current) => ({
        ...current,
        message: "Email göndermek için bir alıcı adresi girin.",
        messageTone: "error",
      }));
      return;
    }

    updateExportState(mode, (current) => ({
      ...current,
      isEmailLoading: true,
      message: "",
      messageTone: null,
    }));

    try {
      const response = await fetch("/api/export/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          recipientEmail: recipientEmail || undefined,
        }),
      });

      const data = await response.json();

      // Email service intentionally not wired up yet (no real RESEND_API_KEY).
      // Render a soft "yakinda aktif olacak" message and steer the user to PDF
      // instead of treating this as a hard failure.
      if (response.status === 503 && data?.code === "EMAIL_NOT_CONFIGURED") {
        updateExportState(mode, (current) => ({
          ...current,
          isEmailLoading: false,
          message:
            "E-posta hizmeti henüz aktif değil. Sonucu şimdilik PDF olarak indirebilirsiniz.",
          messageTone: "error",
        }));
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Email gönderilemedi.");
      }

      const successDetail = data?.dryRun ? " (test modu)" : "";
      updateExportState(mode, (current) => ({
        ...current,
        isEmailLoading: false,
        message: `Sonuç ${recipientEmail || session?.user?.email} adresine gönderildi${successDetail}.`,
        messageTone: "success",
      }));
    } catch (error) {
      updateExportState(mode, (current) => ({
        ...current,
        isEmailLoading: false,
        message: error instanceof Error ? error.message : "Email gönderilemedi.",
        messageTone: "error",
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 pb-10 pt-8">
      <div className="mx-auto mt-12 w-full max-w-5xl">
        {/* Mode selection cards. These are the only thing visible on first
            load — the form panes mount conditionally below once activeTab
            is non-null. Removes the previous problem where users saw the
            form immediately and missed the mode affordance. */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {modeCards.map((card) => {
            const Icon = card.icon;
            const isActive = activeTab === card.value;

            return (
              <button
                key={card.value}
                type="button"
                onClick={() => setActiveTab(card.value)}
                className={`group rounded-2xl border p-5 text-left transition-all ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500/5 shadow-sm"
                    : "border-border bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="w-fit">
                      {card.badge}
                    </Badge>
                    <div>
                      <h2 className="text-lg font-semibold">{card.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {card.points.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* Minimal CTA: just an arrow that slides right on hover.
                    Inactive cards show it; the active card hides it (already
                    chosen, no need to point at it). */}
                {!isActive && (
                  <div className="mt-4 flex justify-end">
                    <ArrowRight className="h-4 w-4 text-emerald-600 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Form pane mounts only after the user picks a mode. The Tabs root
            stays for content-switching mechanics but the visible TabsList
            is removed — the mode cards above already drive activeTab. */}
        {activeTab && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CalculationMode)} className="w-full">
          <TabsContent value="planning" className="animate-in fade-in slide-in-from-top-4 duration-300">
            <Card className="mt-4">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CalendarClock className="h-5 w-5" />
                  <CardTitle>Konteyner çekilmeden önce planlama</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gate-in tarihi olmadan, sadece hat, liman, ekipman tipi ve kalkış tarihine göre ardiyesiz giriş
                  başlangıcını öğrenin.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Liman</Label>
                    <Select
                      value={planningForm.portId}
                      onValueChange={(value) => setPlanningForm((current) => ({ ...current, portId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Liman seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((port) => (
                          <SelectItem key={port.id} value={port.id}>
                            {port.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Hat (Carrier)</Label>
                    <Select
                      value={planningForm.shippingCompanyId}
                      onValueChange={(value) =>
                        setPlanningForm((current) => ({ ...current, shippingCompanyId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hat seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Ekipman Tipi</Label>
                    <Select
                      value={planningForm.containerType}
                      onValueChange={(value) => setPlanningForm((current) => ({ ...current, containerType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ekipman tipi seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {containerTypes.map((option) => (
                          <SelectItem key={option.id} value={option.code}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Gemi Kalkış Tarihi</Label>
                    <Input
                      type="date"
                      value={planningForm.departureDate}
                      onChange={(event) =>
                        setPlanningForm((current) => ({ ...current, departureDate: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Bu hesapta masraf bilgisi gösterilmez</AlertTitle>
                  <AlertDescription>
                    Maliyet hesabına geçmek için gate-in tarihi ile birlikte `Masraf Hesabı` sekmesini kullanın.
                  </AlertDescription>
                </Alert>

                <Button onClick={handlePlanningSubmit} className="w-full" disabled={isPlanningLoading}>
                  {isPlanningLoading ? "Hesaplanıyor..." : "Ardiyesiz Giriş Tarihini Hesapla"}
                </Button>

                {planningError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Hesaplama yapılamadı</AlertTitle>
                    <AlertDescription>{planningError}</AlertDescription>
                  </Alert>
                )}

                {/* Preview / Result share the same slot — preview shows while
                    inputs are complete but no real result yet; on submit the
                    preview unmounts and the richer result card animates into
                    its place (fade + zoom for the "grow into result" feel). */}
                {planningPreview && !planningResult && (
                  <LivePreviewCard
                    preview={planningPreview}
                    departureDate={planningForm.departureDate}
                  />
                )}

                {planningResult && (
                  <div className="animate-in fade-in zoom-in-95 duration-500">
                    <CalculationResultCard
                      mode="planning"
                      summary={[
                        { label: "Liman", value: getOptionName(ports, planningForm.portId) },
                        { label: "Hat", value: getOptionName(carriers, planningForm.shippingCompanyId) },
                        { label: "Konteyner", value: getContainerTypeLabel(planningForm.containerType) },
                        { label: "Kalkış", value: formatLocalDate(planningForm.departureDate), mono: true },
                      ]}
                      freeDays={planningResult.free_days}
                      freeUntilDate={planningResult.free_until_date}
                      departureDate={planningForm.departureDate}
                    >
                      <ResultActionsPanel
                        mode="planning"
                        sessionEmail={session?.user?.email}
                        recipientEmail={planningExport.recipientEmail}
                        onRecipientEmailChange={(value) =>
                          setPlanningExport((current) => ({ ...current, recipientEmail: value }))
                        }
                        onDownloadPdf={() => handleDownloadPdf("planning")}
                        onSendEmail={() => handleSendEmail("planning")}
                        isPdfLoading={planningExport.isPdfLoading}
                        isEmailLoading={planningExport.isEmailLoading}
                        message={planningExport.message}
                        messageTone={planningExport.messageTone}
                      />
                    </CalculationResultCard>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost" className="animate-in fade-in slide-in-from-top-4 duration-300">
            <Card className="mt-4">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Wallet className="h-5 w-5" />
                  <CardTitle>Detaylı masraf hesabı</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gate-in tarihi ve konteyner bilgisi ile birlikte toplam ücretli günleri ve oluşan masrafı görün.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Liman</Label>
                    <Select value={costForm.portId} onValueChange={(value) => setCostForm((current) => ({ ...current, portId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Liman seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((port) => (
                          <SelectItem key={port.id} value={port.id}>
                            {port.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Hat (Carrier)</Label>
                    <Select
                      value={costForm.shippingCompanyId}
                      onValueChange={(value) => setCostForm((current) => ({ ...current, shippingCompanyId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hat seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Ekipman Tipi</Label>
                    <Select
                      value={costForm.containerType}
                      onValueChange={(value) => setCostForm((current) => ({ ...current, containerType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ekipman tipi seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {containerTypes.map((option) => (
                          <SelectItem key={option.id} value={option.code}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Konteyner ID</Label>
                    <Input
                      type="text"
                      placeholder="Örn: CONT123456789"
                      value={costForm.containerId}
                      onChange={(event) => setCostForm((current) => ({ ...current, containerId: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Gemi Kalkış Tarihi</Label>
                    <Input
                      type="date"
                      value={costForm.departureDate}
                      onChange={(event) =>
                        setCostForm((current) => ({ ...current, departureDate: event.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Gate-in Tarihi</Label>
                    <Input
                      type="date"
                      value={costForm.gateInDate}
                      onChange={(event) => setCostForm((current) => ({ ...current, gateInDate: event.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={handleCostSubmit} className="w-full" disabled={isCostLoading}>
                  {isCostLoading ? "Hesaplanıyor..." : "Masrafı Hesapla"}
                </Button>

                {costError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Hesaplama yapılamadı</AlertTitle>
                    <AlertDescription>{costError}</AlertDescription>
                  </Alert>
                )}

                {/* Preview / Result share the same slot — see planning tab. */}
                {costPreview && !costResult && (
                  <LivePreviewCard
                    preview={costPreview}
                    departureDate={costForm.departureDate}
                  />
                )}

                {costResult && (
                  <div className="animate-in fade-in zoom-in-95 duration-500">
                    <CalculationResultCard
                      mode="cost"
                      summary={[
                        { label: "Liman", value: getOptionName(ports, costForm.portId) },
                        { label: "Hat", value: getOptionName(carriers, costForm.shippingCompanyId) },
                        { label: "Konteyner", value: getContainerTypeLabel(costForm.containerType) },
                        { label: "Konteyner ID", value: costForm.containerId, mono: true },
                        { label: "Kalkış", value: formatLocalDate(costForm.departureDate), mono: true },
                        { label: "Gate-in", value: formatLocalDate(costForm.gateInDate), mono: true },
                      ]}
                      freeDays={costResult.free_days}
                      freeUntilDate={costResult.free_until_date}
                      departureDate={costForm.departureDate}
                      totalCharge={costResult.total_charge}
                      chargeableDays={costResult.chargeable_days}
                      totalDaysAtPort={costResult.total_days_at_port}
                      chargeBreakdown={costResult.charge_breakdown}
                      warning={costResult.warning}
                    >
                      <ResultActionsPanel
                        mode="cost"
                        sessionEmail={session?.user?.email}
                        recipientEmail={costExport.recipientEmail}
                        onRecipientEmailChange={(value) => setCostExport((current) => ({ ...current, recipientEmail: value }))}
                        onDownloadPdf={() => handleDownloadPdf("cost")}
                        onSendEmail={() => handleSendEmail("cost")}
                        isPdfLoading={costExport.isPdfLoading}
                        isEmailLoading={costExport.isEmailLoading}
                        message={costExport.message}
                        messageTone={costExport.messageTone}
                      />
                    </CalculationResultCard>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}
