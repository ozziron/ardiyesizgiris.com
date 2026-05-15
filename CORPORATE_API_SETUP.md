# Corporate API and Team Management

Corporate users can manage a team at `/kurumsal` and create API keys for server-to-server calculation access.

## Data Model

The Prisma schema adds:

- `Team`
- `TeamMember`
- `CorporateApiKey`
- `TeamRole`

Apply the migration before production use:

```bash
npx prisma migrate deploy
```

## API Key Flow

1. A Corporate user opens `/kurumsal`.
2. The first visit creates a team owned by that user.
3. The user creates an API key. The plain key is shown once.
4. The key hash is stored in `corporate_api_keys`; the plain key is never stored.

## Corporate Calculation Endpoint

`POST /api/corporate/calculate`

Headers:

```http
Authorization: Bearer ag_live_xxxxxx
```

or:

```http
x-api-key: ag_live_xxxxxx
```

Body matches the normal calculation API:

```json
{
  "portId": "...",
  "shippingCompanyId": "...",
  "containerId": "MSCU1234567",
  "containerType": "40HC",
  "departureDate": "2026-05-15",
  "gateInDate": "2026-05-10"
}
```

Only active keys whose team owner has `membershipType = CORPORATE` are accepted.
