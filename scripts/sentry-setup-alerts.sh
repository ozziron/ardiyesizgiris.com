#!/usr/bin/env bash
# Sentry Alert Rules — ardiyesizgiris.com
#
# Creates the baseline alert rules for the Sentry project.
# Requires: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
#
# Usage:
#   export SENTRY_AUTH_TOKEN="…"
#   export SENTRY_ORG="ardiyesizgiris"
#   export SENTRY_PROJECT="ardiyesizgiris-web"
#   bash scripts/sentry-setup-alerts.sh
#
# Alert rules created (idempotent — skipped if name already exists):
#   1. Error rate spike — >50 events in 30 min
#   2. New unhandled issue — first occurrence alert
#   3. API route error spike — >25 events in 15 min

set -euo pipefail

: "${SENTRY_AUTH_TOKEN:?SENTRY_AUTH_TOKEN required}"
: "${SENTRY_ORG:?SENTRY_ORG required}"
: "${SENTRY_PROJECT:?SENTRY_PROJECT required}"

SENTRY_API="https://sentry.io/api/0"
ORG_SLUG="$SENTRY_ORG"
PROJ_SLUG="$SENTRY_PROJECT"
AUTH_HEADER="Authorization: Bearer ${SENTRY_AUTH_TOKEN}"

# ---------------------------------------------------------------------------
# Resolve project slug → numeric project ID
# ---------------------------------------------------------------------------
resolve_project_id() {
  local org_slug="$1"
  local proj_slug="$2"

  # Use the organization-scoped project list endpoint (returns id + slug).
  local json
  json=$(curl -sS -H "$AUTH_HEADER" \
    "${SENTRY_API}/organizations/${org_slug}/projects/" 2>&1)

  # jq is preferred; fall back to grep otherwise.
  if command -v jq &>/dev/null; then
    echo "$json" | jq -r ".[] | select(.slug == \"${proj_slug}\") | .id" | head -1
  else
    # grep: extract the id whose JSON object also contains the target slug.
    echo "$json" \
      | tr '}' '\n' \
      | grep "\"slug\":\"${proj_slug}\"" \
      | grep -o '"id":"[^"]*"' \
      | head -1 \
      | cut -d'"' -f4
  fi
}

# ---------------------------------------------------------------------------
# Helper — check if alert rule name already exists
# ---------------------------------------------------------------------------
rule_exists() {
  local name="$1"
  curl -sS -H "$AUTH_HEADER" \
    "${SENTRY_API}/organizations/${ORG_SLUG}/combined-rules/" \
    | grep -q "\"name\":\"${name}\""
}

# ---------------------------------------------------------------------------
# Helper — create an alert rule from a JSON file/heredoc
# ---------------------------------------------------------------------------
create_rule() {
  local name="$1"
  local json_body="$2"

  if rule_exists "$name"; then
    echo "   → Already exists, skipping."
    return 0
  fi

  echo "   → Creating..."
  local http_code
  http_code=$(curl -sS -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    "${SENTRY_API}/organizations/${ORG_SLUG}/alert-rules/" \
    -d "$json_body" 2>&1)

  if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    echo "   ✓ Created (HTTP ${http_code})"
  else
    echo "   ⚠ Unexpected response: HTTP ${http_code}"
    # Re-run with visible output to help debug
    curl -sS -X POST \
      -H "$AUTH_HEADER" \
      -H "Content-Type: application/json" \
      "${SENTRY_API}/organizations/${ORG_SLUG}/alert-rules/" \
      -d "$json_body" 2>&1 || true
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

echo "→ Resolving project '${ORG_SLUG}/${PROJ_SLUG}'..."
PROJECT_ID=$(resolve_project_id "$ORG_SLUG" "$PROJ_SLUG")

if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: Could not resolve project ID for ${ORG_SLUG}/${PROJ_SLUG}."
  echo "Verify your SENTRY_ORG / SENTRY_PROJECT values and auth token."
  exit 1
fi

echo "→ Project ID: ${PROJECT_ID}"

# ---------------------------------------------------------------------------
# 1. Error rate spike
# ---------------------------------------------------------------------------
echo ""
echo "[1/3] Error rate spike — >50 events in 30 min"
RULE1=$(cat <<JSON
{
  "name": "High Error Rate — ardiyesizgiris.com",
  "environment": "production",
  "actionMatch": "all",
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
      "interval": "30m",
      "value": 50,
      "comparisonType": "count"
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners",
      "targetIdentifier": ""
    }
  ],
  "frequency": 30,
  "projects": ["${PROJECT_ID}"]
}
JSON
)
create_rule "High Error Rate — ardiyesizgiris.com" "$RULE1"

# ---------------------------------------------------------------------------
# 2. New unhandled / first-seen issue
# ---------------------------------------------------------------------------
echo ""
echo "[2/3] New unhandled issue alert"
RULE2=$(cat <<JSON
{
  "name": "New Unhandled Issue — ardiyesizgiris.com",
  "environment": "production",
  "actionMatch": "all",
  "conditions": [
    {
      "id": "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition"
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners",
      "targetIdentifier": ""
    }
  ],
  "frequency": 5,
  "projects": ["${PROJECT_ID}"]
}
JSON
)
create_rule "New Unhandled Issue — ardiyesizgiris.com" "$RULE2"

# ---------------------------------------------------------------------------
# 3. API route error spike
# ---------------------------------------------------------------------------
echo ""
echo "[3/3] API error spike — >25 events in 15 min"
RULE3=$(cat <<JSON
{
  "name": "API Error Spike — ardiyesizgiris.com",
  "environment": "production",
  "actionMatch": "all",
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
      "interval": "15m",
      "value": 25,
      "comparisonType": "count"
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners",
      "targetIdentifier": ""
    }
  ],
  "frequency": 15,
  "projects": ["${PROJECT_ID}"]
}
JSON
)
create_rule "API Error Spike — ardiyesizgiris.com" "$RULE3"

echo ""
echo "✓ Sentry alert rules configured for ${ORG_SLUG}/${PROJ_SLUG}"
echo "  View: https://${ORG_SLUG}.sentry.io/settings/projects/${PROJ_SLUG}/alerts/"
