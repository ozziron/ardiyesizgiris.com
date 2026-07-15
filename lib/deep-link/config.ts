/**
 * Deep Link / Native App Configuration
 *
 * Centralised config for Android App Links (assetlinks.json) and
 * iOS Universal Links (apple-app-site-association).  All values are
 * driven by environment variables so the mobile team can ship the
 * native app without a backend deploy — just set the env vars and
 * the .well-known/ endpoints pick them up on the next request.
 *
 * ARDA-45: Deep link + .well-known/ dosyaları
 */

/** Parsed Android App Links target. */
export interface AndroidAppLinksTarget {
  namespace: "android_app"
  package_name: string
  sha256_cert_fingerprints: string[]
}

/** Parsed iOS Universal Links detail entry. */
export interface IosAppLinksDetail {
  appID: string
  paths: string[]
}

/** Canonical shape of the assetlinks.json payload. */
export interface AssetLinksPayload {
  relation: string[]
  target: AndroidAppLinksTarget
}

/** Canonical shape of the apple-app-site-association payload. */
export interface AppleAppSiteAssociationPayload {
  applinks: {
    apps: string[]
    details: IosAppLinksDetail[]
  }
  webcredentials?: {
    apps: string[]
  }
}

// ---------------------------------------------------------------------------
// Android
// ---------------------------------------------------------------------------

function getAndroidPackageName(): string {
  return (
    process.env.DEEP_LINK_ANDROID_PACKAGE_NAME?.trim() ||
    "com.ardiyesizgiris.web"
  )
}

function getAndroidSha256Fingerprints(): string[] {
  const raw = process.env.DEEP_LINK_ANDROID_SHA256_FINGERPRINTS?.trim()
  if (!raw) return []
  return raw
    .split(",")
    .map((fp) => fp.trim().toUpperCase())
    .filter((fp) => /^[A-F0-9]{64}$/.test(fp))
}

// ---------------------------------------------------------------------------
// iOS
// ---------------------------------------------------------------------------

function getIosBundleId(): string {
  return (
    process.env.DEEP_LINK_IOS_BUNDLE_ID?.trim() ||
    "com.ardiyesizgiris.web"
  )
}

function getIosTeamId(): string {
  return process.env.DEEP_LINK_IOS_TEAM_ID?.trim() || ""
}

function buildIosAppId(): string {
  const teamId = getIosTeamId()
  const bundleId = getIosBundleId()
  // Format: <TeamID>.<BundleID>  — Apple's appID convention for AASA.
  // When TEAM_ID is empty the entry is a placeholder; deep linking won't
  // pass Apple's validation but the file is still valid JSON and won't
  // cause an App Review rejection.
  return teamId ? `${teamId}.${bundleId}` : `??????.${bundleId}`
}

// ---------------------------------------------------------------------------
// Public helpers consumed by the .well-known/ route handlers
// ---------------------------------------------------------------------------

/** Build the complete assetlinks.json payload for Android App Links. */
export function buildAssetLinks(): AssetLinksPayload[] {
  const fingerprints = getAndroidSha256Fingerprints()

  // When no fingerprints are configured the array is empty — Google treats
  // this as "no Android app handles this domain", which is the correct
  // default until the native app is published and signed.
  if (fingerprints.length === 0) return []

  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: getAndroidPackageName(),
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]
}

/**
 * Build the apple-app-site-association payload for iOS Universal Links.
 *
 * Also includes a `webcredentials` entry so the native app can use
 * Associated Domains for password autofill (same domain).
 */
export function buildAppleAppSiteAssociation(): AppleAppSiteAssociationPayload {
  const appID = buildIosAppId()
  const teamId = getIosTeamId()

  const details: IosAppLinksDetail[] = teamId
    ? [
        {
          appID,
          // "*" covers all paths so deep links from emails (verification,
          // calculation results, etc.) all open in the native app when
          // installed.  Restrict to specific prefixes if the app only
          // handles a subset of routes.
          paths: ["*"],
        },
      ]
    : []

  // webcredentials allows iOS Password Autofill to suggest the native
  // app for the same domain — low-effort UX win, same Associated Domain.
  const webcredentialsApps: string[] = teamId ? [appID] : []

  return {
    applinks: {
      apps: [], // Always empty — Apple reserves this for non-standard use.
      details,
    },
    webcredentials: {
      apps: webcredentialsApps,
    },
  }
}
