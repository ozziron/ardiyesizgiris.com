-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('FREE', 'PREMIUM', 'CORPORATE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT,
    "company_name" TEXT,
    "phone" TEXT,
    "membership_type" "MembershipType" NOT NULL DEFAULT 'FREE',
    "subscription_active" BOOLEAN NOT NULL DEFAULT false,
    "subscription_end_date" TIMESTAMP(3),
    "calculations_count" INTEGER NOT NULL DEFAULT 0,
    "free_usage_remaining" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'TR',
    "city" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "country" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "shipping_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "free_time_rules" (
    "id" TEXT NOT NULL,
    "port_id" TEXT NOT NULL,
    "shipping_company_id" TEXT NOT NULL,
    "freeDays" INTEGER NOT NULL,
    "effective_from" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_until" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "free_time_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_rules" (
    "id" TEXT NOT NULL,
    "port_id" TEXT NOT NULL,
    "shipping_company_id" TEXT NOT NULL,
    "container_type" TEXT NOT NULL,
    "tier_1_days_from" INTEGER NOT NULL DEFAULT 1,
    "tier_1_days_to" INTEGER NOT NULL DEFAULT 5,
    "tier_1_price_per_day" DECIMAL(10,2) NOT NULL,
    "tier_2_days_from" INTEGER NOT NULL DEFAULT 6,
    "tier_2_days_to" INTEGER NOT NULL DEFAULT 10,
    "tier_2_price_per_day" DECIMAL(10,2) NOT NULL,
    "tier_3_days_from" INTEGER NOT NULL DEFAULT 11,
    "tier_3_price_per_day" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "effective_from" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_until" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "tariff_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "port_id" TEXT NOT NULL,
    "shipping_company_id" TEXT NOT NULL,
    "container_id" TEXT NOT NULL,
    "container_type" TEXT NOT NULL,
    "departure_date" DATE NOT NULL,
    "gate_in_date" DATE,
    "free_days" INTEGER NOT NULL,
    "free_until_date" DATE NOT NULL,
    "chargeable_days" INTEGER NOT NULL DEFAULT 0,
    "total_charge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,

    CONSTRAINT "calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "free_usage_tracking" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "identifier_type" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 1,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "free_usage_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ports_code_key" ON "ports"("code");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_companies_code_key" ON "shipping_companies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "free_time_rules_port_id_shipping_company_id_effective_from_key" ON "free_time_rules"("port_id", "shipping_company_id", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_rules_port_id_shipping_company_id_container_type_eff_key" ON "tariff_rules"("port_id", "shipping_company_id", "container_type", "effective_from");

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_companies" ADD CONSTRAINT "shipping_companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_time_rules" ADD CONSTRAINT "free_time_rules_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_time_rules" ADD CONSTRAINT "free_time_rules_shipping_company_id_fkey" FOREIGN KEY ("shipping_company_id") REFERENCES "shipping_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_time_rules" ADD CONSTRAINT "free_time_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_rules" ADD CONSTRAINT "tariff_rules_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_rules" ADD CONSTRAINT "tariff_rules_shipping_company_id_fkey" FOREIGN KEY ("shipping_company_id") REFERENCES "shipping_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_rules" ADD CONSTRAINT "tariff_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_shipping_company_id_fkey" FOREIGN KEY ("shipping_company_id") REFERENCES "shipping_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
