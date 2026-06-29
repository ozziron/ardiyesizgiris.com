import { NextResponse } from "next/server"
import { buildAppleAppSiteAssociation } from "@/lib/deep-link/config"

/**
 * GET /.well-known/apple-app-site-association
 *
 * iOS Universal Links verification endpoint.
 *
 * Apple's CDN fetches this file (once per app install / update) to verify
 * which native app handles HTTPS links for this domain.  Must be served
 * over HTTPS with Content-Type: application/json, no file extension, and
 * no redirects or authentication.
 *
 * Reference: https://developer.apple.com/documentation/xcode/supporting-universal-links
 */
export async function GET() {
  const payload = buildAppleAppSiteAssociation()

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      // Apple CDN caches aggressively.  Keep TTL reasonable so Team ID
      // or bundle ID changes propagate without manual intervention.
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  })
}
