"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  CreditCard,
  Download,
  Mail,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContainerTypes } from "@/hooks/use-container-types";
import { CalculationResultCard } from "@/components/calculation/result-card";
import { CalculationTimeline } from "@/components/calculation/timeline";
import { CalculationResultSkeleton } from "@/components/calculation/result-skeleton";

// Single-mode page. Gate-in is optional: when empty the user gets a planning
// result (free_until_date only); when filled they get a cost result (tier
// breakdown + total_charge). The two-card mode picker has been removed.
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
  /** ISO-4217 (TRY/USD/EUR…) from the matched tariff. */
  currency?: string;
  charge_breakdown?: ChargeBreakdownItem[];
  warning?: string;
  // Server returns this only for cost-mode calculations that get persisted
  // to the DB. Used downstream to attach export history to the right row.
  calculationId?: string | null;
};

type FormState = {
  portId: string;
  shippingCompanyId: string;
  containerType: string;
  departureDate: string;
  // Optional cost-mode fields. When gateInDate is empty the request is sent
  // as planning (null containerId, null gateInDate); the same form/result
  // pair holds both modes.
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

type CalculationErrorPayload = {
  error?: string;
  details?: { message?: string }[];
  code?: string;
};

type LivePreview = {
  freeDays: number;
  freeUntilDate: string;
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

const initialForm: FormState = {
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

const formatLocalDate = (isoDate: string | Date | undefined) => {
  if (!isoDate) return "-";
  const dateObj = isoDate instanceof Date ? isoDate : new Date(isoDate);
  return dateObj.toLocaleDateString("tr-TR");
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

      <div className="mt-4">
        <Label htmlFor="result-email">Email adresi</Label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <Input
            id="result-email"
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
  const [ports, setPorts] = useState<SelectOption[]>([]);
  const [carriers, setCarriers] = useState<SelectOption[]>([]);
  const { options: containerTypes } = useContainerTypes();
  const getContainerTypeLabel = (code: string) =>
    containerTypes.find((c) => c.code === code)?.label ?? code;

  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [submittedMode, setSubmittedMode] = useState<CalculationMode | null>(null);
  const [error, setError] = useState("");
  const [exportState, setExportState] = useState<ExportState>(initialExportState);
  const [isLoading, setIsLoading] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [preview, setPreview] = useState<LivePreview | null>(null);

  // Mode is derived from gateInDate, not from a separate toggle. submittedMode
  // pins the mode used for the most recent successful calculation so the
  // result card doesn't flicker if the user starts editing gate-in after.
  const mode: CalculationMode = form.gateInDate ? "cost" : "planning";

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [portsRes, carriersRes] = await Promise.all([fetch("/api/ports"), fetch("/api/carriers")]);
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

  // Debounced free-time preview. Fires as soon as the 4 lookup fields are
  // filled, regardless of whether gate-in is also filled.
  useEffect(() => {
    const { portId, shippingCompanyId, containerType, departureDate } = form;
    if (!portId || !shippingCompanyId || !containerType || !departureDate) {
      setPreview(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ portId, shippingCompanyId, containerType, departureDate });
        const res = await fetch(`/api/free-time-preview?${params}`, { signal: controller.signal });
        if (!res.ok) {
          setPreview(null);
          return;
        }
        const data = await res.json();
        setPreview({ freeDays: data.freeDays, freeUntilDate: data.freeUntilDate });
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setPreview(null);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [form.portId, form.shippingCompanyId, form.containerType, form.departureDate]);

  const resetExportFeedback = () => {
    setExportState((current) => ({ ...current, message: "", messageTone: null }));
  };

  const validateForm = (): string | null => {
    if (!form.portId) return "Liman seçiniz.";
    if (!form.shippingCompanyId) return "Hat seçiniz.";
    if (!form.containerType) return "Ekipman tipi seçiniz.";
    if (!form.departureDate) return "Gemi kalkış tarihini giriniz.";
    if (form.gateInDate && !form.containerId.trim()) {
      return "Masraf hesabı için konteyner ID giriniz.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    resetExportFeedback();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hesaplama sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCheckout = async () => {
    setCheckoutError("");

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

  const getExportPayload = () => {
    if (!result || !submittedMode) return null;
    const isCost = submittedMode === "cost";

    return {
      calculationType: submittedMode,
      // Only cost-mode results have a persisted DB row.
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

      // Email service intentionally not wired up yet (no real RESEND_API_KEY).
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

  // Result-card summary rows. Cost-mode adds Container ID + Gate-in.
  const isCostResult = submittedMode === "cost";
  const summaryRows = [
    { label: "Liman", value: getOptionName(ports, form.portId) },
    { label: "Hat", value: getOptionName(carriers, form.shippingCompanyId) },
    { label: "Konteyner", value: getContainerTypeLabel(form.containerType) },
    ...(isCostResult ? [{ label: "Konteyner ID", value: form.containerId, mono: true }] : []),
    { label: "Kalkış", value: formatLocalDate(form.departureDate), mono: true },
    ...(isCostResult ? [{ label: "Gate-in", value: formatLocalDate(form.gateInDate), mono: true }] : []),
  ];

  return (
    <div className="container mx-auto px-4 pb-10 pt-8">
      <div className="mx-auto mt-8 w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Ardiyesiz Giriş Hesaplama
          </h1>
          <p className="mt-3 text-muted-foreground">
            Liman, hat, ekipman ve tarihleri girin. Gate-in tarihi <strong>opsiyoneldir</strong> —
            boş bırakırsanız muafiyet başlangıcını gösteririz, doldurursanız oluşan masrafı da hesaplarız.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hesaplama Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Liman</Label>
                <Select
                  value={form.portId}
                  onValueChange={(value) => setForm((current) => ({ ...current, portId: value }))}
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
                  value={form.shippingCompanyId}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, shippingCompanyId: value }))
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
                  value={form.containerType}
                  onValueChange={(value) => setForm((current) => ({ ...current, containerType: value }))}
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
                  value={form.departureDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, departureDate: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>
                  Gate-in Tarihi <span className="text-xs text-muted-foreground">(opsiyonel — masraf için)</span>
                </Label>
                <Input
                  type="date"
                  value={form.gateInDate}
                  onChange={(event) => setForm((current) => ({ ...current, gateInDate: event.target.value }))}
                />
              </div>

              <div>
                <Label>
                  Konteyner ID{" "}
                  <span className="text-xs text-muted-foreground">
                    {form.gateInDate ? "(masraf için zorunlu)" : "(gate-in girilirse zorunlu)"}
                  </span>
                </Label>
                <Input
                  type="text"
                  placeholder="Örn: CONT123456789"
                  value={form.containerId}
                  onChange={(event) => setForm((current) => ({ ...current, containerId: event.target.value }))}
                  disabled={!form.gateInDate}
                />
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
              {isLoading
                ? "Hesaplanıyor..."
                : mode === "cost"
                  ? "Masrafı Hesapla"
                  : "Ardiyesiz Giriş Tarihini Hesapla"}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hesaplama yapılamadı</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>{error}</p>
                  {upgradePrompt && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="gap-2"
                        onClick={handleStartCheckout}
                        disabled={isCheckoutLoading}
                      >
                        <CreditCard className="h-4 w-4" />
                        {isCheckoutLoading ? "Stripe açılıyor..." : "Premium'a Geç"}
                      </Button>
                      {checkoutError && <p className="text-sm">{checkoutError}</p>}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="animate-in fade-in duration-300">
                <CalculationResultSkeleton />
              </div>
            )}

            {preview && !result && !isLoading && (
              <LivePreviewCard preview={preview} departureDate={form.departureDate} />
            )}

            {result && submittedMode && !isLoading && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <CalculationResultCard
                  mode={submittedMode}
                  summary={summaryRows}
                  freeDays={result.free_days}
                  freeUntilDate={result.free_until_date}
                  departureDate={form.departureDate}
                  totalCharge={result.total_charge}
                  chargeableDays={result.chargeable_days}
                  totalDaysAtPort={result.total_days_at_port}
                  chargeBreakdown={result.charge_breakdown}
                  currency={result.currency || "TRY"}
                  warning={result.warning}
                >
                  <ResultActionsPanel
                    mode={submittedMode}
                    sessionEmail={session?.user?.email}
                    recipientEmail={exportState.recipientEmail}
                    onRecipientEmailChange={(value) =>
                      setExportState((current) => ({ ...current, recipientEmail: value }))
                    }
                    onDownloadPdf={handleDownloadPdf}
                    onSendEmail={handleSendEmail}
                    isPdfLoading={exportState.isPdfLoading}
                    isEmailLoading={exportState.isEmailLoading}
                    message={exportState.message}
                    messageTone={exportState.messageTone}
                  />
                </CalculationResultCard>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
