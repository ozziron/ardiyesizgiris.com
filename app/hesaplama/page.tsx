"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CreditCard,
  Download,
  Mail,
  ChevronsUpDown,
  Check,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  LogIn,
  UserPlus,
  Crown,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { BILLING_ENABLED } from "@/lib/billing/config";
import { CostResultCard, PlanningResultCard } from "@/components/calculation/result-card";
import { CalculationTimeline } from "@/components/calculation/timeline";
import { CalculationResultSkeleton } from "@/components/calculation/result-skeleton";
import {
  useCalculationForm,
  type CalculationMode,
  type LivePreview,
  type SelectOption,
} from "@/hooks/use-calculation-form";

// ---------------------------------------------------------------------------
// Tip yardımcıları
// ---------------------------------------------------------------------------

type AutocompleteOption = {
  id: string;
  name: string;
};

type AutocompleteProps = {
  options: AutocompleteOption[];
  value: string;
  onSelect: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  emptyText?: string;
  triggerClassName?: string;
  ariaInvalid?: boolean;
};

// ---------------------------------------------------------------------------
// AutocompleteField - Popover + Command ile autocomplete bileşeni
// ---------------------------------------------------------------------------

function AutocompleteField({
  options,
  value,
  onSelect,
  placeholder,
  disabled = false,
  emptyText = "Sonuç bulunamadı.",
  triggerClassName,
  ariaInvalid = false,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.id === value)?.name ?? "";

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedLabel && "text-muted-foreground",
            triggerClassName
          )}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ minWidth: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder={`${placeholder} ara...`} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onSelect(opt.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Yardımcı alt bileşenler
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Ana sayfa
// ---------------------------------------------------------------------------

export default function HesaplamaPage() {
  const {
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
  } = useCalculationForm();

  // "Masraf hesapla" checkbox durumu - conditional gate-in/container alanlarını açar
  const [masrafHesaplaAcik, setMasrafHesaplaAcik] = useState(false);

  // Erişim kontrolü dialog'ları
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  // Üyelik durumu (session callback'inde set ediliyor)
  const isLoggedIn = Boolean(session?.user?.id);
  const isPremium = !BILLING_ENABLED || (
    session?.user?.role === "ADMIN" ||
    session?.user?.membershipType === "CORPORATE" ||
    (session?.user?.membershipType === "PREMIUM" &&
      session?.user?.subscriptionActive === true)
  );

  // Premium tikini değiştirmek isteyince erişim kontrolü
  const handleMasrafHesaplaToggle = (checked: boolean) => {
    if (checked && BILLING_ENABLED) {
      if (!isLoggedIn) {
        setLoginDialogOpen(true);
        return;
      }
      if (!isPremium) {
        setPremiumDialogOpen(true);
        return;
      }
    }
    setMasrafHesaplaAcik(checked);
    if (!checked) {
      updateForm({ gateInDate: "", containerId: "" });
    }
  };

  // Hesapla butonu: önce erişim kontrolü, sonra mevcut handleSubmit
  const handleSubmitGated = () => {
    if (BILLING_ENABLED) {
      if (!isLoggedIn) {
        setLoginDialogOpen(true);
        return;
      }
      if (masrafHesaplaAcik && !isPremium) {
        setPremiumDialogOpen(true);
        return;
      }
    }
    handleSubmit();
  };

  useEffect(() => {
    if (result && submittedMode && !isLoading) {
      setResultDialogOpen(true);
    }
  }, [result, submittedMode, isLoading]);

  // Carrier listesini AutocompleteField formatına dönüştür
  const carrierOptions: AutocompleteOption[] = (carriers as SelectOption[]).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  // Port listesini AutocompleteField formatına dönüştür
  const portOptions: AutocompleteOption[] = (ports as SelectOption[]).map((p) => ({
    id: p.id,
    name: p.name,
  }));

  // Ekipman tipi listesini AutocompleteField formatına dönüştür
  const equipmentOptions: AutocompleteOption[] = containerTypes.map((ct) => ({
    id: ct.code,
    name: ct.label,
  }));

  return (
    <div className="container mx-auto px-4 pb-10 pt-8">
      <div className="mx-auto mt-12 w-full max-w-3xl md:mt-16">
        <h1 className="sr-only">Ardiyesiz Giriş ve Ardiye Masrafı Hesaplama</h1>

        <Card>
          <CardHeader>
            <CardTitle>Sefer Bilgileri</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Hat, POL, ekipman ve ETD bilgilerini girin; ardiyesiz giriş tarihini
              anında hesaplayın.
            </p>
          </CardHeader>
          <CardContent>
            {/* Kredi durumu göstergesi */}
            {isLoggedIn && !isPremium && usage && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">
                  Kalan kredi:{' '}
                  <span className="font-semibold tabular-nums">
                    {usage.remaining !== null ? usage.remaining : '—'}
                  </span>
                  <span className="text-muted-foreground"> / {usage.limit}</span>
                </span>
              </div>
            )}

            {/* ---- Dikey form layout ---- */}
            <div className="flex flex-col gap-4">

              {/* Hat */}
              <div className="flex flex-col gap-1.5">
                <Label>Hat</Label>
                <AutocompleteField
                  options={carrierOptions}
                  value={form.shippingCompanyId}
                  onSelect={(id) => updateForm({ shippingCompanyId: id })}
                  placeholder="Maersk, MSC, CMA CGM..."
                  emptyText="Bu hat sistemde tanımlı değil."
                  ariaInvalid={Boolean(fieldErrors.shippingCompanyId)}
                  triggerClassName={fieldErrors.shippingCompanyId ? "border-destructive text-foreground" : undefined}
                />
                {fieldErrors.shippingCompanyId && (
                  <p className="text-sm text-destructive">{fieldErrors.shippingCompanyId}</p>
                )}
              </div>

              {/* POL - Yükleme Limanı */}
              <div className="flex flex-col gap-1.5">
                <Label>Yükleme Limanı (POL)</Label>
                <AutocompleteField
                  options={portOptions}
                  value={form.portId}
                  onSelect={(id) => updateForm({ portId: id })}
                  placeholder="Ambarlı, Mersin, İzmir..."
                  emptyText="Bu liman sistemde tanımlı değil."
                  ariaInvalid={Boolean(fieldErrors.portId)}
                  triggerClassName={fieldErrors.portId ? "border-destructive text-foreground" : undefined}
                />
                {fieldErrors.portId && (
                  <p className="text-sm text-destructive">{fieldErrors.portId}</p>
                )}
              </div>

              {/* Ekipman Tipi */}
              <div className="flex flex-col gap-1.5">
                <Label>Ekipman Tipi</Label>
                <AutocompleteField
                  options={equipmentOptions}
                  value={form.containerType}
                  onSelect={(code) => updateForm({ containerType: code })}
                  placeholder="20DC, 40HC, 20RF..."
                  emptyText="Bu ekipman tipi sistemde tanımlı değil."
                  ariaInvalid={Boolean(fieldErrors.containerType)}
                  triggerClassName={fieldErrors.containerType ? "border-destructive text-foreground" : undefined}
                />
                {fieldErrors.containerType && (
                  <p className="text-sm text-destructive">{fieldErrors.containerType}</p>
                )}
              </div>

              {/* ETD - Gemi Kalkış Tarihi */}
              <div className="flex flex-col gap-1.5">
                <Label>Gemi Kalkış Tarihi (ETD)</Label>
                <Input
                  type="date"
                  value={form.departureDate}
                  onChange={(event) => updateForm({ departureDate: event.target.value })}
                                  aria-invalid={Boolean(fieldErrors.departureDate)}
                  className={cn(fieldErrors.departureDate && "border-destructive focus-visible:ring-destructive")}
                />
                {fieldErrors.departureDate && (
                  <p className="text-sm text-destructive">{fieldErrors.departureDate}</p>
                )}
              </div>

              {/* -----------------------------------------------------------------------
                  PREMIUM: gate-in & container number - bu blok ileride feature flag ile
                  gate'lenecek. Şu an tüm kullanıcılara açık; premium mimariye hazırlık
                  için ayrı bir bölüm olarak işaretlendi.
                  ----------------------------------------------------------------------- */}
              <div
                className={cn(
                  "relative rounded-xl border p-5 flex flex-col gap-4 transition-colors",
                  masrafHesaplaAcik
                    ? "border-primary/40 bg-primary/[0.03]"
                    : "border-border bg-muted/30",
                )}
              >
                {/* Başlık satırı: Lock/Unlock ikonu + başlık + Premium rozeti */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                        masrafHesaplaAcik
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {masrafHesaplaAcik ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold leading-tight">
                        Ardiye Masrafı Analizi
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Gate-in bazlı kademeli tarife · konteyner başına net tutar
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300"
                  >
                    <Sparkles className="h-3 w-3" />
                    Premium
                  </Badge>
                </div>

                {/* Checkbox satırı */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="masraf-hesapla"
                    checked={masrafHesaplaAcik}
                    onCheckedChange={(checked) => handleMasrafHesaplaToggle(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <Label
                      htmlFor="masraf-hesapla"
                      className="cursor-pointer text-sm font-medium leading-tight"
                    >
                      Masraf analizini aç
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Gate-in ve konteyner alanları aktifleşir.
                    </p>
                  </div>
                </div>

                {/* Premium value-prop listesi */}
                <div className="rounded-lg border border-dashed border-amber-300/60 bg-amber-50/40 p-3 dark:border-amber-700/40 dark:bg-amber-950/20">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    Premium içeriğinde
                  </p>
                  <ul className="flex flex-col gap-1.5 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>Konteyner başına net ardiye tutarı</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>Tier 1 / 2 / 3 kademeli tarife dökümü</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>Free time ile gate-in karşılaştırması</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>PDF rapor ve e-posta paylaşımı</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>Konteyner numarasıyla masraf geçmişi</span>
                    </li>
                  </ul>
                </div>

                {/* Gate-in Tarihi */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="gate-in-tarihi"
                      className={cn(!masrafHesaplaAcik && "text-muted-foreground")}
                    >
                      Gate-in Tarihi
                    </Label>
                    {!masrafHesaplaAcik && (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
                    )}
                  </div>
                  <Input
                    id="gate-in-tarihi"
                    type="date"
                    value={form.gateInDate}
                    onChange={(event) => updateForm({ gateInDate: event.target.value })}
                    disabled={!masrafHesaplaAcik}
                    className={cn(!masrafHesaplaAcik && "cursor-not-allowed opacity-60")}
                  />
                </div>

                {/* Konteyner No */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="konteyner-id"
                      className={cn(!masrafHesaplaAcik && "text-muted-foreground")}
                    >
                      Konteyner No{" "}
                      {masrafHesaplaAcik && form.gateInDate && (
                        <span className="text-xs font-normal text-muted-foreground">
                          (zorunlu)
                        </span>
                      )}
                    </Label>
                    {!masrafHesaplaAcik && (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
                    )}
                  </div>
                  <Input
                    id="konteyner-id"
                    type="text"
                    placeholder="MSCU1234567"
                    value={form.containerId}
                    onChange={(event) => updateForm({ containerId: event.target.value })}
                    disabled={!masrafHesaplaAcik}
                    aria-invalid={Boolean(fieldErrors.containerId)}
                    className={cn(
                      !masrafHesaplaAcik && "cursor-not-allowed opacity-60",
                      fieldErrors.containerId && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {fieldErrors.containerId && (
                    <p className="text-sm text-destructive">{fieldErrors.containerId}</p>
                  )}
                </div>
              </div>
              {/* END PREMIUM BLOCK */}

              {/* Hesapla butonu */}
              <Button onClick={handleSubmitGated} className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Hesaplama yapılıyor..."
                  : mode === "cost"
                    ? "Ardiye Masrafını Hesapla"
                    : "Ardiyesiz Giriş Tarihini Hesapla"}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Hesaplama tamamlanamadı</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>{error}</p>
                    {upgradePrompt && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Kredi satın alarak hesaplamaya devam edebilir veya sınırsız erişim için Premium'a geçebilirsiniz.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="gap-2"
                            onClick={handleBuyCredits}
                            disabled={isBuyingCredits || isCheckoutLoading}
                          >
                            <CreditCard className="h-4 w-4" />
                            {isBuyingCredits ? "Stripe açılıyor..." : "Kredi Satın Al"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={handleStartCheckout}
                            disabled={isCheckoutLoading || isBuyingCredits}
                          >
                            <Crown className="h-4 w-4" />
                            {isCheckoutLoading ? "Stripe açılıyor..." : "Premium'a Geç"}
                          </Button>
                        </div>
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

            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Hesaplama sonucu dialog ---- */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto p-4 sm:max-w-4xl sm:p-6">
          <DialogHeader>
            <DialogTitle>Hesaplama Sonucu</DialogTitle>
            <DialogDescription>
              Sonucunuz aşağıdaki formatta hazırlandı.
            </DialogDescription>
          </DialogHeader>

          {result && submittedMode && !isLoading && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              {(() => {
                const actions = (
                  <ResultActionsPanel
                    mode={submittedMode}
                    sessionEmail={session?.user?.email}
                    recipientEmail={exportState.recipientEmail}
                    onRecipientEmailChange={setRecipientEmail}
                    onDownloadPdf={handleDownloadPdf}
                    onSendEmail={handleSendEmail}
                    isPdfLoading={exportState.isPdfLoading}
                    isEmailLoading={exportState.isEmailLoading}
                    message={exportState.message}
                    messageTone={exportState.messageTone}
                  />
                );
                return submittedMode === "cost" ? (
                  <CostResultCard
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
                    surcharges={result.surcharges}
                  >
                    {actions}
                  </CostResultCard>
                ) : (
                  <PlanningResultCard
                    summary={summaryRows}
                    freeDays={result.free_days}
                    freeUntilDate={result.free_until_date}
                    departureDate={form.departureDate}
                    warning={result.warning}
                    surcharges={result.surcharges}
                  >
                    {actions}
                  </PlanningResultCard>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Login gerekli dialog ---- */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LogIn className="h-6 w-6" />
            </div>
            <DialogTitle>Hesaplama için giriş yapın</DialogTitle>
            <DialogDescription>
              Ardiyesiz giriş hesaplamasını kullanabilmek için ücretsiz hesabınızla
              giriş yapın. Henüz üye değilseniz birkaç saniyede kayıt olabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Üyelik avantajları
            </p>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Sınırsız ardiyesiz giriş hesaplaması</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Geçmiş hesaplamaları kaydetme</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>PDF ve e-posta paylaşımı</span>
              </li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/giris">
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/kayit">
                <UserPlus className="h-4 w-4" />
                Ücretsiz Üye Ol
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Premium gerekli dialog ---- */}
      <Dialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
              <Crown className="h-6 w-6" />
            </div>
            <DialogTitle>Bu özellik Premium üyelere özel</DialogTitle>
            <DialogDescription>
              Ardiye masrafı analizi; gate-in tarihinize göre tam kademeli ücret
              hesabını ve konteyner bazlı raporu içerir. Premium üyeliğe geçerek
              tüm masraf araçlarına erişin.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-dashed border-amber-300/60 bg-amber-50/40 p-3 dark:border-amber-700/40 dark:bg-amber-950/20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Premium ile elde edersiniz
            </p>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Konteyner başına net ardiye tutarı</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Tier 1 / 2 / 3 kademeli tarife dökümü</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Free time ile gate-in karşılaştırması</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>PDF rapor ve e-posta paylaşımı</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Konteyner numarasıyla masraf geçmişi</span>
              </li>
            </ul>
          </div>

          {checkoutError && (
            <p className="text-sm text-red-600 dark:text-red-400">{checkoutError}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setPremiumDialogOpen(false)}
            >
              Vazgeç
            </Button>
            <Button
              onClick={handleStartCheckout}
              disabled={isCheckoutLoading}
              className="gap-2 bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
            >
              <Sparkles className="h-4 w-4" />
              {isCheckoutLoading ? "Stripe açılıyor..." : "Premium'a Geç"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



