#!/usr/bin/env bash
# Appends a ZAP markdown report to the job summary. A step summary is limited to 1 MiB and anything
# larger is dropped, so oversized reports are cut with some headroom.
# Usage: .github/scripts/zap/report-summary.sh <title> <artifact-name> [report.md]
set -euo pipefail

title=$1
artifact=$2
report=${3:-report_md.md}
limit=900000
size=$(wc -c < "$report")

{
  printf '## %s\n\n' "$title"
  if [ "$size" -le "$limit" ]; then
    cat "$report"
  else
    # sed drops the last line, which head may have cut mid-line or mid-character
    head -c "$limit" "$report" | sed '$d'
    printf '\n\n> ⚠️ Report truncated for the job summary (%s bytes, limit %s). The full report is in the **%s** artifact.\n' \
      "$size" "$limit" "$artifact"
  fi
} >> "${GITHUB_STEP_SUMMARY:?GITHUB_STEP_SUMMARY must be set}"
