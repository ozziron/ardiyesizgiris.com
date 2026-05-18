import { z } from "zod"

const dateField = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Gecerli bir tarih girin",
})

const optionalDateField = z
  .union([z.literal(""), dateField])
  .optional()
  .nullable()
  .transform((value) => (value === "" || value == null ? null : value))

const optionalTextField = z
  .union([z.literal(""), z.string().trim()])
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null) return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  })

// Calculation form schema
export const calculationFormSchema = z.object({
  portId: z.string().min(1, "Liman seciniz"),
  shippingCompanyId: z.string().min(1, "Hat seciniz"),
  containerId: optionalTextField,
  containerType: z.string().min(1, "Konteyner tipi seciniz"),
  imoCargo: z.boolean().optional().default(false),
  departureDate: dateField,
  gateInDate: optionalDateField,
})

// Container type form schema — admin-managed lookup
export const containerTypeFormSchema = z.object({
  code: z
    .string()
    .min(1, "Kod girin")
    .max(20, "Kod en fazla 20 karakter olmalı")
    .regex(/^[A-Z0-9]+$/, "Sadece büyük harf ve rakam (örn. 20DC, 40HC, 20RF)")
    .toUpperCase(),
  label: z.string().min(1, "Açıklama girin").max(120, "Açıklama en fazla 120 karakter"),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional().nullable(),
})

// Port form schema
export const portFormSchema = z.object({
  name: z.string().min(1, "Liman adi girin"),
  code: z.string().min(1, "Liman kodu girin").toUpperCase(),
  country: z.string().default("TR"),
  city: z.string().optional(),
  isActive: z.boolean().default(true),
})

// Carrier form schema
export const carrierFormSchema = z.object({
  name: z.string().min(1, "Hat adi girin"),
  code: z.string().min(1, "Hat kodu girin").toUpperCase(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
})

// Tariff rule schema
//
// Muafiyet (free time) artık ayrı bir tablo değil — TariffRule Tier 1 ile
// modellenir: tier1PricePerDay = 0 olduğunda tier1DaysFrom..tier1DaysTo
// aralığı muafiyet penceresidir. Bu yüzden tier1PricePerDay positive değil,
// nonnegative. Tier 2 ve 3 hâlâ pozitif (ücretli kademeler).
export const tariffRuleSchema = z
  .object({
    portId: z.string().min(1, "Liman seciniz"),
    shippingCompanyId: z.string().min(1, "Hat seciniz"),
    containerType: z.string().min(1, "Konteyner tipi seciniz"),
    imoCargo: z.boolean().default(false),
    tier1DaysFrom: z.coerce.number().int().min(1),
    tier1DaysTo: z.coerce.number().int().min(1),
    tier1PricePerDay: z.coerce.number().nonnegative("Fiyat negatif olamaz (0 girilirse muafiyet olarak değerlendirilir)"),
    tier2DaysFrom: z.coerce.number().int().min(1),
    tier2DaysTo: z.coerce.number().int().min(1),
    tier2PricePerDay: z.coerce.number().positive(),
    tier2Enabled: z.boolean().default(true),
    tier3DaysFrom: z.coerce.number().int().min(1),
    tier3PricePerDay: z.coerce.number().positive(),
    tier3Enabled: z.boolean().default(true),
    currency: z.string().default("TRY"),
    effectiveFrom: dateField,
    effectiveUntil: optionalDateField,
    isActive: z.boolean().default(true),
    notes: z.string().optional(),
  })
  .refine((data) => data.tier1DaysTo >= data.tier1DaysFrom, {
    message: "Tier 1 gun araligi gecersiz",
    path: ["tier1DaysTo"],
  })
  .refine((data) => {
    if (!data.tier2Enabled) return true
    return data.tier2DaysFrom > data.tier1DaysTo
  }, {
    message: "Tier 2, Tier 1 bittikten sonra baslamali",
    path: ["tier2DaysFrom"],
  })
  .refine((data) => {
    if (!data.tier2Enabled) return true
    return data.tier2DaysTo >= data.tier2DaysFrom
  }, {
    message: "Tier 2 gun araligi gecersiz",
    path: ["tier2DaysTo"],
  })
  .refine((data) => {
    if (!data.tier3Enabled) return true
    if (!data.tier2Enabled) return false
    return data.tier3DaysFrom > data.tier2DaysTo
  }, {
    message: "Tier 3, Tier 2 bittikten sonra baslamali",
    path: ["tier3DaysFrom"],
  })
  .refine((data) => {
    // Tier 3 sadece Tier 2 aktifse açılabilir
    if (data.tier3Enabled && !data.tier2Enabled) return false
    return true
  }, {
    message: "Tier 3'ü açmak için Tier 2 de aktif olmalıdır",
    path: ["tier3Enabled"],
  })

// Carrier surcharge form schema — admin-managed surcharge definitions
export const carrierSurchargeFormSchema = z.object({
  shippingCompanyId: z.string().min(1, "Hat seciniz"),
  name: z.string().min(1, "Ek ucret adi girin").max(200),
  description: z.string().max(500).optional().nullable(),
  amount: z.coerce.number().positive("Tutar pozitif olmalidir"),
  currency: z.string().default("USD"),
  applyType: z.string().default("PER_CONTAINER"),
  containerTypes: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
})

// API calculation request schema
export const apiCalculationSchema = z.object({
  portId: z.string(),
  shippingCompanyId: z.string(),
  containerId: optionalTextField,
  containerType: z.string(),
  imoCargo: z.boolean().optional(),
  departureDate: dateField,
  gateInDate: optionalDateField,
})
