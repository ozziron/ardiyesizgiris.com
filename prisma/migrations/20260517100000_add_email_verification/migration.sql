-- Email verification sistemi için User tablosuna emailVerified alanı ve
-- VerificationToken tablosu ekleme (TICKET-028).

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_tokens_token_key" UNIQUE ("token"),
    CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE ("identifier","token")
);
