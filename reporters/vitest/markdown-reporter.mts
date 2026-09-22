import * as fs from 'node:fs'
import path from 'node:path'
import type { CoverageMap } from 'istanbul-lib-coverage'
import type { Reporter, TestCase, TestModule, TestRunEndReason } from 'vitest/node'

interface TestRow {
  name: string
  status: 'passed' | 'failed'
  duration: number
  error?: string
}

const escapeCell = (value: string) => value.replace(/\|/g, '\\|').replace(/\n/g, ' ')

class MarkdownReporter implements Reporter {
  private rows: TestRow[] = []
  private coverageMap: CoverageMap | undefined

  onTestCaseResult(testCase: TestCase) {
    const result = testCase.result()
    const duration = testCase.diagnostic()?.duration ?? 0

    this.rows.push({
      name: testCase.fullName,
      status: result.state === 'passed' ? 'passed' : 'failed',
      duration,
      error: result.state === 'failed' ? result.errors?.[0]?.message : undefined,
    })
  }

  onCoverage(coverageMap: CoverageMap) {
    this.coverageMap = coverageMap
  }

  onTestRunEnd(_testModules: ReadonlyArray<TestModule>, _unhandledErrors: unknown, reason: TestRunEndReason) {
    let markdown = this.buildResultsTable()

    const failures = this.rows.filter((row) => row.status === 'failed' && row.error)
    if (failures.length) {
      markdown += this.buildFailureDetails(failures)
    }

    markdown += `\n## Summary\n- **Global Status:** ${reason.toUpperCase()}\n`
    markdown += `- **Tests:** ${this.rows.length} (${this.rows.filter((r) => r.status === 'passed').length} passed, ${failures.length} failed)\n`

    if (this.coverageMap) {
      markdown += this.buildCoverage(this.coverageMap)
    }

    fs.writeFileSync('vitest-report.md', markdown)
    console.log('Markdown report generated: vitest-report.md')
  }

  private buildResultsTable() {
    let markdown = '## Results\n'
    markdown += '| | Test | Duration (ms) |\n|---|---|---|\n'
    for (const row of this.rows) {
      const statusEmoji = row.status === 'passed' ? '✅' : '❌'
      markdown += `| ${statusEmoji} | ${escapeCell(row.name)} | ${row.duration.toFixed(1)} |\n`
    }
    return markdown
  }

  private buildFailureDetails(failures: TestRow[]) {
    let markdown = '\n## Failures\n'
    for (const failure of failures) {
      markdown += `\n### ❌ ${failure.name}\n\`\`\`text\n${failure.error}\n\`\`\`\n`
    }
    return markdown
  }

  private buildCoverage(coverageMap: CoverageMap) {
    const overall = coverageMap.getCoverageSummary()
    let markdown = '\n## Coverage\n'
    markdown += '| Metric | % | Covered/Total |\n|---|---|---|\n'
    for (const key of ['lines', 'statements', 'functions', 'branches'] as const) {
      const m = overall[key]
      markdown += `| ${key} | ${m.pct}% | ${m.covered}/${m.total} |\n`
    }

    const files = coverageMap.files()
      .map((file) => ({
        file: path.relative(process.cwd(), file),
        summary: coverageMap.fileCoverageFor(file).toSummary(),
      }))
      .sort((a, b) => a.summary.lines.pct - b.summary.lines.pct)

    markdown += '\n### Per-file\n'
    markdown += '| File | Lines | Statements | Functions | Branches |\n|---|---|---|---|---|\n'
    for (const { file, summary } of files) {
      markdown += `| ${file} | ${summary.lines.pct}% | ${summary.statements.pct}% | ${summary.functions.pct}% | ${summary.branches.pct}% |\n`
    }
    return markdown
  }
}

export default MarkdownReporter
