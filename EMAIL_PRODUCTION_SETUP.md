# Email Production Setup

This app can send calculation result emails through Resend, but production
delivery must be enabled outside the codebase.

## Current Runtime Behavior

- If `RESEND_API_KEY` is missing or still set to the placeholder `re_xxxxx`,
  `/api/export/email` returns `503` with `EMAIL_NOT_CONFIGURED`.
- The UI should treat that as a graceful "email service is not active yet"
  state and keep PDF export available.
- If `EMAIL_DRY_RUN="true"`, the server logs the composed email and does not
  call Resend.

## Required Production Environment Variables

Set these in Vercel Production environment variables:

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="Ardiyesiz Giriş <noreply@ardiyesizgiris.com>"
EMAIL_DRY_RUN="false"
```

Use a sender address that belongs to a verified Resend domain. Do not use the
placeholder key in production.

## Activation Checklist

1. Create or open the Resend account for `ardiyesizgiris.com`.
2. Add the sending domain in Resend.
3. Add the DNS records Resend provides at the domain DNS provider.
4. Wait until Resend marks the domain as verified.
5. Create a production API key in Resend.
6. Add `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_DRY_RUN` in Vercel
   Production env vars.
7. Redeploy the production app so the new env vars are loaded.
8. Send a test email from the calculation result flow.
9. Confirm the email attempt appears in calculation export history with
   `status: success`.

## Local Smoke Test

For local UI testing without sending real email:

```env
EMAIL_DRY_RUN="true"
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@ardiyesizgiris.com"
```

Then call the email export flow and confirm the server logs an
`[email:dry-run]` entry.

## Failure Modes

- `EMAIL_NOT_CONFIGURED`: production env is missing or still placeholder.
- `500 E-posta gonderilemedi`: Resend rejected the send request or returned an
  API error. Check server logs and Resend dashboard logs.
- Email sent but not received: check recipient spam/quarantine and Resend event
  logs.
