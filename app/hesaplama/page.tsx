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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTAINER_TYPE_OPTIONS } from "@/lib/constants/container-types";

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
    title: "Ardiyesiz giris tarihini ogren",
    description:
      "Konteyner cekilmeden once, sadece temel operasyon bilgileriyle dogru giris gununu hizlica planlayin.",
    points: [
      "Gate-in tarihi gerekmez",
      "Musteri oncesi planlama icin uygundur",
      "Masraf hesaplamasi gostermez",
    ],
    icon: CalendarClock,
  },
  {
    value: "cost",
    badge: "Operasyon",
    title: "Masrafi tum detaylariyla hesapla",
    description:
      "Gate-in ve konteyner bilgisi netlestiginde, ucretli gunleri ve toplam masrafi aninda gorun.",
    points: [
      "Toplam liman gunu ve ucretli gunu verir",
      "Masraf kirilimini listeler",
      "PDF ve email olarak paylasilabilir",
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

const getContainerTypeLabel = (value: string) =>
  CONTAINER_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;

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
      ? "Planlama sonucunu PDF olarak kaydedin veya ekibinizle e-posta yoluyla paylasin."
      : "Masraf sonucunu PDF alin veya operasyon ekibine aninda e-posta olarak iletin.";

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Sonucu paylas ve arsivle</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="w-fit border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
          {mode === "planning" ? "Planlama cikti" : "Masraf raporu"}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-email`}>Email adresi</Label>
          <Input
            id={`${mode}-email`}
            type="email"
            value={recipientEmail}
            onChange={(event) => onRecipientEmailChange(event.target.value)}
            placeholder={sessionEmail ?? "operasyon@firma.com"}
          />
          <p className="text-xs text-muted-foreground">
            {usesSessionEmail
              ? `Bos birakilirsa oturum emaili olan ${sessionEmail} kullanilir.`
              : "Oturum emailiniz yoksa gonderim icin bir alici adresi yazin."}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={onDownloadPdf}
          disabled={isPdfLoading || isEmailLoading}
        >
          <Download className="h-4 w-4" />
          {isPdfLoading ? "PDF hazirlaniyor..." : "PDF indir"}
        </Button>

        <Button type="button" className="gap-2" onClick={onSendEmail} disabled={isEmailLoading || isPdfLoading}>
          <Mail className="h-4 w-4" />
          {isEmailLoading ? "Email gonderiliyor..." : "Email gonder"}
        </Button>
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
  const [activeTab, setActiveTab] = useState<CalculationMode>("planning");
  const [ports, setPorts] = useState<SelectOption[]>([]);
  const [carriers, setCarriers] = useState<SelectOption[]>([]);
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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [portsRes, carriersRes] = await Promise.all([fetch("/api/ports"), fetch("/api/carriers")]);
        const portsData = await portsRes.json();
        const carriersData = await carriersRes.json();

        setPorts(portsData.data || []);
        setCarriers(carriersData.data || []);
      } catch (error) {
        console.error("Veri yukleme hatasi:", error);
      }
    };

    fetchOptions();
  }, []);

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
        const message = data?.error || data?.details?.[0]?.message || "Hesaplama sirasinda bir hata olustu.";
        throw new Error(message);
      }

      if (type === "planning") {
        setPlanningResult(data.data);
      } else {
        setCostResult(data.data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Hesaplama sirasinda bir hata olustu.";

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
    if (!planningForm.portId) return "Liman seciniz.";
    if (!planningForm.shippingCompanyId) return "Hat seciniz.";
    if (!planningForm.containerType) return "Ekipman tipi seciniz.";
    if (!planningForm.departureDate) return "Gemi kalkis tarihini giriniz.";
    return null;
  };

  const validateCostForm = () => {
    if (!costForm.portId) return "Liman seciniz.";
    if (!costForm.shippingCompanyId) return "Hat seciniz.";
    if (!costForm.containerType) return "Ekipman tipi seciniz.";
    if (!costForm.containerId.trim()) return "Konteyner ID giriniz.";
    if (!costForm.departureDate) return "Gemi kalkis tarihini giriniz.";
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
        throw new Error(data?.error || "PDF olusturulamadi.");
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
        message: error instanceof Error ? error.message : "PDF olusturulamadi.",
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
        message: "Email gondermek icin bir alici adresi girin.",
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
            "E-posta hizmeti henuz aktif degil. Sonucu simdilik PDF olarak indirebilirsiniz.",
          messageTone: "error",
        }));
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Email gonderilemedi.");
      }

      const successDetail = data?.dryRun ? " (test modu)" : "";
      updateExportState(mode, (current) => ({
        ...current,
        isEmailLoading: false,
        message: `Sonuc ${recipientEmail || session?.user?.email} adresine gonderildi${successDetail}.`,
        messageTone: "success",
      }));
    } catch (error) {
      updateExportState(mode, (current) => ({
        ...current,
        isEmailLoading: false,
        message: error instanceof Error ? error.message : "Email gonderilemedi.",
        messageTone: "error",
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 pb-10 pt-8">
      <div className="mx-auto mt-12 w-full max-w-5xl">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Ardiye Hesaplama</h1>
          <p className="max-w-3xl text-muted-foreground">
            Operasyonun hangi asamasinda oldugunuza gore iki farkli hesaplama akisindan birini kullanin. Ilk akista
            sadece ardiyesiz giris tarihini planlayin, ikinci akista ise gate-in bilgisiyle birlikte toplam masrafi
            tum detaylariyla gorun.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {modeCards.map((card) => {
            const Icon = card.icon;
            const isActive = activeTab === card.value;

            return (
              <button
                key={card.value}
                type="button"
                onClick={() => setActiveTab(card.value)}
                className={`rounded-2xl border p-5 text-left transition-all ${
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

                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Bu akisla devam et
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CalculationMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger value="planning" className="w-full">
              Tarih Hesabi
            </TabsTrigger>
            <TabsTrigger value="cost" className="w-full">
              Masraf Hesabi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <Card className="mt-4">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CalendarClock className="h-5 w-5" />
                  <CardTitle>Konteyner cekilmeden once planlama</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gate-in tarihi olmadan, sadece hat, liman, ekipman tipi ve kalkis tarihine gore ardiyesiz giris
                  baslangicini ogrenin.
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
                        <SelectValue placeholder="Liman seciniz" />
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
                        <SelectValue placeholder="Hat seciniz" />
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
                        <SelectValue placeholder="Ekipman tipi seciniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTAINER_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Gemi Kalkis Tarihi</Label>
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
                  <AlertTitle>Bu hesapta masraf bilgisi gosterilmez</AlertTitle>
                  <AlertDescription>
                    Maliyet hesabina gecmek icin gate-in tarihi ile birlikte `Masraf Hesabi` sekmesini kullanin.
                  </AlertDescription>
                </Alert>

                <Button onClick={handlePlanningSubmit} className="w-full" disabled={isPlanningLoading}>
                  {isPlanningLoading ? "Hesaplaniyor..." : "Ardiyesiz Giris Tarihini Hesapla"}
                </Button>

                {planningError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Hesaplama yapilamadi</AlertTitle>
                    <AlertDescription>{planningError}</AlertDescription>
                  </Alert>
                )}

                {planningResult && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Tarih Hesabi Sonucu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                          <p className="text-sm text-muted-foreground">Muafiyet Suresi</p>
                          <p className="mt-1 text-2xl font-semibold">{planningResult.free_days} gun</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-sm text-muted-foreground">Ardiyesiz Giris Baslangici</p>
                          <p className="mt-1 text-2xl font-semibold">{formatLocalDate(planningResult.free_until_date)}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        <CalendarClock className="mt-0.5 h-4 w-4 text-emerald-600" />
                        <p>
                          Bu sonuc planlama amaclidir. Gate-in tarihi kesinlestiginde masraf hesabina gecerek toplam
                          ucreti olusturabilirsiniz.
                        </p>
                      </div>

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
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost">
            <Card className="mt-4">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Wallet className="h-5 w-5" />
                  <CardTitle>Detayli masraf hesabi</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gate-in tarihi ve konteyner bilgisi ile birlikte toplam ucretli gunleri ve olusan masrafi gorun.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Liman</Label>
                    <Select value={costForm.portId} onValueChange={(value) => setCostForm((current) => ({ ...current, portId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Liman seciniz" />
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
                        <SelectValue placeholder="Hat seciniz" />
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
                        <SelectValue placeholder="Ekipman tipi seciniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTAINER_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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
                      placeholder="Orn: CONT123456789"
                      value={costForm.containerId}
                      onChange={(event) => setCostForm((current) => ({ ...current, containerId: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Gemi Kalkis Tarihi</Label>
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
                  {isCostLoading ? "Hesaplaniyor..." : "Masrafi Hesapla"}
                </Button>

                {costError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Hesaplama yapilamadi</AlertTitle>
                    <AlertDescription>{costError}</AlertDescription>
                  </Alert>
                )}

                {costResult && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Masraf Hesabi Sonucu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-sm text-muted-foreground">Ardiyesiz Giris Baslangici</p>
                          <p className="mt-1 text-xl font-semibold">{formatLocalDate(costResult.free_until_date)}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                          <p className="text-sm text-muted-foreground">Toplam Masraf</p>
                          <p className="mt-1 text-xl font-semibold">{formatCurrency(costResult.total_charge)}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Muafiyet Suresi</p>
                          <p className="mt-1 text-lg font-semibold">{costResult.free_days} gun</p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Toplam Liman Gunu</p>
                          <p className="mt-1 text-lg font-semibold">{costResult.total_days_at_port} gun</p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Ucretli Gun</p>
                          <p className="mt-1 text-lg font-semibold">{costResult.chargeable_days} gun</p>
                        </div>
                      </div>

                      {costResult.warning && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Uyari</AlertTitle>
                          <AlertDescription>{costResult.warning}</AlertDescription>
                        </Alert>
                      )}

                      {costResult.charge_breakdown && costResult.charge_breakdown.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-emerald-600" />
                              <p className="font-medium">Masraf Kirilimi</p>
                            </div>
                            <div className="space-y-2">
                              {costResult.charge_breakdown.map((item) => (
                                <div
                                  key={`${item.tier}-${item.days}`}
                                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                                >
                                  <div>
                                    <p className="font-medium">Kademe {item.tier}</p>
                                    <p className="text-muted-foreground">
                                      {item.days} gun x {formatCurrency(item.price_per_day)}
                                    </p>
                                  </div>
                                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

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
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
