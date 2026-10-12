// Renders a Biome JSON report as GitHub-flavored markdown tables.
// Usage: node .github/scripts/biome/summary.mjs [biome-report.json] >> "$GITHUB_STEP_SUMMARY"
import { readFileSync } from "node:fs";

const escape = (text) => String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");

const locationOf = ({ location }) => {
  const path = typeof location?.path === "string" ? location.path : location?.path?.file;
  if (!path) return "";
  const line = location.start?.line;
  return line ? `${path}:${line}` : path;
};

const render = ({ summary, diagnostics }) => {
  const { errors, warnings, infos } = summary;
  const status = errors + warnings === 0 ? "✅ Passed" : "❌ Failed";
  const out = [
    "## Biome Report",
    "",
    "| Metric | Value |",
    "| --- | ---: |",
    `| Status | ${status} |`,
    `| Errors | ${errors} |`,
    `| Warnings | ${warnings} |`,
    `| Infos | ${infos} |`,
    `| Files checked | ${summary.changed + summary.unchanged} |`,
  ];

  if (diagnostics.length > 0) {
    const rows = diagnostics.map((diagnostic) => ({ ...diagnostic, where: locationOf(diagnostic) }));
    rows.sort((a, b) => a.where.localeCompare(b.where, undefined, { numeric: true }));
    out.push("", "| Location | Severity | Rule | Message |", "| --- | --- | --- | --- |");
    for (const row of rows) {
      out.push(`| \`${row.where}\` | ${row.severity} | \`${row.category}\` | ${escape(row.message)} |`);
    }
  }
  if (summary.diagnosticsNotPrinted > 0) {
    out.push("", `_${summary.diagnosticsNotPrinted} more diagnostics not shown (biome --max-diagnostics)._`);
  }
  return out.join("\n");
};

try {
  const report = JSON.parse(readFileSync(process.argv[2] ?? "biome-report.json", "utf8"));
  console.log(render(report));
} catch (error) {
  console.error(`ERROR: could not render biome report: ${error.message}`);
  process.exit(1);
}
