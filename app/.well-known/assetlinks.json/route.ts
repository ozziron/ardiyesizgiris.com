import { NextResponse } from "next/server"
import { buildAssetLinks } from "@/lib/deep-link/config"

/**
 * GET /.well-known/assetlinks.json
 *
 * Android App Links verification endpoint.
 *
 * Google Play services periodically fetches this file to verify that the
 * domain owner allows the Android app to handle HTTPS links for this domain.
 * Must be served over HTTPS with Content-Type: application/json and no
 * redirects or authentication.
 *
 * Reference: https://developer.android.com/training/app-links/verify-android-applinks
 */
export async function GET() {
  const payload = buildAssetLinks()

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      // Allow Google's crawler to cache the file briefly but refetch
      // within a reasonable window so fingerprint rotations propagate.
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  })
}
