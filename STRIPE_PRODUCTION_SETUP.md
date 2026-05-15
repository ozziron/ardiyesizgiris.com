# Stripe Premium Setup

Premium gating is enforced in `POST /api/calculate`: free users get 3 successful calculations per 90-day window. When the limit is reached, the API returns `402` with `code: "UPGRADE_REQUIRED"` and the calculation page opens Stripe Checkout.

## Required Stripe setup

1. Create a recurring Premium product and Price in Stripe Billing.
2. Set these environment variables in local and Vercel Production:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PREMIUM_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. Add a Stripe webhook endpoint:
   - URL: `https://YOUR_DOMAIN/api/billing/webhook`
   - Event: `checkout.session.completed`
4. Redeploy after changing production environment variables.

## Runtime behavior

- `/api/billing/checkout` requires a logged-in user and creates a Stripe Checkout subscription session.
- `/api/billing/webhook` verifies the Stripe signature and marks the user as `PREMIUM` with `subscriptionActive=true` after checkout completion.
- Corporate users bypass the free limit.
- Anonymous users are limited by IP address.

## Notes

This implementation activates Premium from `checkout.session.completed`. Subscription cancellation and failed recurring payment handling should be added when Stripe customer/subscription IDs are stored in the database.
