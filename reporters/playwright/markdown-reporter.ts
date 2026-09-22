import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';

interface TestRow {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: string;
}

const escapeCell = (value: string) => value.replace(/\|/g, '\\|').replace(/\n/g, ' ');

class MarkdownReporter implements Reporter {
  private rows: TestRow[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.rows.push({
      name: test.title,
      status: result.status === 'passed' ? 'passed' : 'failed',
      duration: result.duration,
      error: result.error?.message,
    });
  }

  async onEnd(result: FullResult) {
    let markdown = this.buildResultsTable();

    const failures = this.rows.filter((row) => row.status === 'failed' && row.error);
    if (failures.length) {
      markdown += this.buildFailureDetails(failures);
    }

    markdown += `\n## Summary\n- **Global Status:** ${result.status.toUpperCase()}\n`;
    markdown += `- **Tests:** ${this.rows.length} (${this.rows.filter((r) => r.status === 'passed').length} passed, ${failures.length} failed)\n`;

    fs.writeFileSync('playwright-report.md', markdown);
    console.log('Markdown report generated: playwright-report.md');
  }

  private buildResultsTable() {
    let markdown = '## Results\n';
    markdown += '| | Test | Duration (ms) |\n|---|---|---|\n';
    for (const row of this.rows) {
      const statusEmoji = row.status === 'passed' ? '✅' : '❌';
      markdown += `| ${statusEmoji} | ${escapeCell(row.name)} | ${row.duration} |\n`;
    }
    return markdown;
  }

  private buildFailureDetails(failures: TestRow[]) {
    let markdown = '\n## Failures\n';
    for (const failure of failures) {
      markdown += `\n### ❌ ${failure.name}\n\`\`\`text\n${failure.error}\n\`\`\`\n`;
    }
    return markdown;
  }
}

export default MarkdownReporter;
