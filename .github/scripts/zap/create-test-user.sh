#!/usr/bin/env bash
# Signs up a throwaway user through the JSON endpoint and exports its session cookie for ZAP.
# RAILS_ENV=test has CSRF protection off, so a plain POST works. The ZAP actions forward
# ZAP_AUTH_HEADER and ZAP_AUTH_HEADER_VALUE into the ZAP container.
# Usage: create-test-user.sh [base-url]   (default http://localhost:3000)
set -euo pipefail

base_url=${1:-http://localhost:3000}
work_dir=${RUNNER_TEMP:-$(mktemp -d)}
headers_file="$work_dir/zap-headers.txt"
body_file="$work_dir/zap-body.json"

password=$(openssl rand -hex 24)
echo "::add-mask::$password"
email="zap-$(date +%s)@example.test"

status=$(
  jq -n --arg email "$email" --arg password "$password" \
    '{email_address: $email, password: $password, password_confirmation: $password}' |
    curl --silent --show-error --request POST "$base_url/registrations" \
      --header 'Content-Type: application/json' --data @- \
      --dump-header "$headers_file" --output "$body_file" \
      --write-out '%{http_code}'
)
if [ "$status" != "201" ]; then
  echo "::error::Signup returned HTTP $status"
  cat "$body_file"
  exit 1
fi

cookie=$(
  tr -d '\r' < "$headers_file" |
    sed -nE 's/^[Ss]et-[Cc]ookie: (session_id=[^;]+).*/\1/p' |
    head -n 1
)
if [ -z "$cookie" ]; then
  echo "::error::Signup response had no session_id cookie"
  exit 1
fi
echo "::add-mask::$cookie"
echo "::add-mask::${cookie#session_id=}"

{
  echo "ZAP_AUTH_HEADER=Cookie"
  echo "ZAP_AUTH_HEADER_VALUE=$cookie"
} >> "${GITHUB_ENV:?GITHUB_ENV must be set}"
