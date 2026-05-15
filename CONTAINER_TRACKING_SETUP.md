# Container Tracking Setup

`/takip` and `POST /api/container-tracking` provide the v3 Phase 2 container tracking surface. The app uses a provider adapter so the UI and API are ready without hard-coding one carrier or vendor.

## Environment Variables

- `CONTAINER_TRACKING_API_URL`: external provider endpoint
- `CONTAINER_TRACKING_API_KEY`: optional bearer token
- `CONTAINER_TRACKING_SOURCE`: display name shown in the UI

The endpoint is called with these query params:

- `containerId`
- `carrierCode` when supplied

## Expected Provider Response

The adapter accepts camelCase or snake_case fields:

```json
{
  "containerId": "MSCU1234567",
  "carrierCode": "MSC",
  "status": "Gate out",
  "location": "Ambarli",
  "eta": "2026-05-20T09:00:00.000Z",
  "lastUpdatedAt": "2026-05-15T12:00:00.000Z",
  "events": [
    {
      "status": "Discharged",
      "location": "Ambarli",
      "eventTime": "2026-05-14T08:30:00.000Z",
      "vesselName": "Example Vessel",
      "voyage": "001E"
    }
  ]
}
```

If `CONTAINER_TRACKING_API_URL` is empty, the API returns `503` with `code: "TRACKING_NOT_CONFIGURED"` so production does not silently show stale or fake data.
