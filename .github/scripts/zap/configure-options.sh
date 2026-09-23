#!/usr/bin/env bash
# Builds the ZAP command line options and writes them to $GITHUB_OUTPUT:
#   cmd_options      for the full scan (zap-full-scan.py)
#   api_cmd_options  for the API scan (zap-api-scan.py, which has no spider)
# ZAP_MAX_MINUTES (optional, empty = no limit) caps the spider and the active scan.
set -euo pipefail

max_minutes=${ZAP_MAX_MINUTES:-}

# DELETE /session destroys the test user's session row, which would log ZAP out mid-scan, so keep it
# out of the scan. Several -config options share one -z argument.
zap_config='-config globalexcludeurl.url_list.url(0).regex=.*/session$'
zap_config+=' -config globalexcludeurl.url_list.url(0).enabled=true'
spider_options=''

if [ -n "$max_minutes" ]; then
  if ! [[ "$max_minutes" =~ ^[1-9][0-9]*$ ]]; then
    echo "::error::ZAP_MAX_MINUTES must be a positive integer, got '$max_minutes'"
    exit 1
  fi
  # -m limits the spider, the scanner option limits the active scan
  spider_options="-m $max_minutes"
  zap_config+=" -config scanner.maxScanDurationInMins=$max_minutes"
fi

{
  echo "cmd_options=$spider_options -z \"$zap_config\""
  echo "api_cmd_options=-z \"$zap_config\""
} >> "${GITHUB_OUTPUT:?GITHUB_OUTPUT must be set}"
