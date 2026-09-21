# frozen_string_literal: true

require 'fileutils'
require 'json'

# Renders a SimpleCov JSON report as GitHub-flavored markdown and checks it against a minimum.
module CoverageReport
  SIMPLECOV_JSON = 'coverage/coverage.json'

  module_function

  def render(data, minimum, root: "#{Dir.pwd}/", docker_root: '/app/')
    rows = file_rows(data, root, docker_root)
    [summary_table(data.fetch('metrics'), rows.size, minimum), file_table(rows)].join("\n\n")
  end

  def file_rows(data, root, docker_root)
    rows = data.fetch('files').map do |file|
      name = file.fetch('filename').delete_prefix(root).delete_prefix(docker_root)
      [name, file.fetch('covered_percent'), file.fetch('covered_lines'), file.fetch('lines_of_code')]
    end
    rows.sort_by { |name, percent, _covered, _total| [percent, name] }
  end

  def summary_table(metrics, file_count, minimum)
    actual = metrics.fetch('covered_percent')
    rows = [['Line coverage', pct(actual)],
            ['Covered lines', "#{metrics.fetch('covered_lines')} / #{metrics.fetch('total_lines')}"],
            ['Files', file_count]]
    if minimum
      status = actual >= minimum ? '✅ Passed' : '❌ Failed'
      rows.unshift(['Status', status], ['Minimum required', "#{minimum}%"])
    end
    ['## Rails Coverage Report', '', '| Metric | Value |', '| --- | ---: |',
     *rows.map { |label, value| "| #{label} | #{value} |" }].join("\n")
  end

  def file_table(rows)
    lines = ['| File | Coverage | Covered | Missed | Lines |', '| --- | ---: | ---: | ---: | ---: |']
    rows.each do |name, percent, covered, total|
      lines << "| `#{name}` | #{pct(percent)} | #{covered} | #{total - covered} | #{total} |"
    end
    lines.join("\n")
  end

  def pct(value)
    "#{format('%.2f', value)}%"
  end

  def publish(markdown)
    if (summary_file = ENV.fetch('GITHUB_STEP_SUMMARY', nil))
      File.open(summary_file, 'a') { |file| file.puts markdown }
    else
      puts markdown
    end
  end

  # Runs the suite with progress output on the console. SimpleCov writes coverage/coverage.json as it finishes,
  # so a stale copy is removed first to avoid reporting an old run if rspec dies before writing.
  def run_rspec
    FileUtils.rm_f(SIMPLECOV_JSON)
    system({ 'RAILS_ENV' => 'test' }, 'bundle', 'exec', 'rspec', '--format', 'progress')
  end

  # Always writes the markdown report; returns false only when a minimum is given and not met.
  def report_meets_minimum?(json_file, minimum)
    data = JSON.parse(File.read(json_file))
    publish(render(data, minimum))
    actual = data.dig('metrics', 'covered_percent')
    puts "Code coverage: #{pct(actual)}"
    return true unless minimum

    puts "Minimum #{minimum}% #{actual >= minimum ? 'met' : 'NOT met'}"
    actual >= minimum
  end
end

namespace :coverage do
  desc 'Run rspec, write markdown coverage report to $GITHUB_STEP_SUMMARY or stdout; enforce MIN_COVERAGE_PERCENT'
  task report: :environment do
    json_file = CoverageReport::SIMPLECOV_JSON
    minimum = ENV['MIN_COVERAGE_PERCENT']&.then { |value| Integer(value) }
    specs_passed = CoverageReport.run_rspec
    coverage_met = CoverageReport.report_meets_minimum?(json_file, minimum)
    exit 1 unless specs_passed && coverage_met
  rescue ArgumentError => e
    warn e.message
    warn 'ERROR: MIN_COVERAGE_PERCENT must be an integer, e.g. MIN_COVERAGE_PERCENT=100 rails coverage:report'
    exit 1
  rescue Errno::ENOENT => e
    warn e.message
    warn "ERROR: could not find json coverage file: #{json_file}, rspec may have failed before writing it"
    exit 1
  rescue JSON::ParserError => e
    warn "ERROR: unexpected coverage file format: #{e.message}"
    exit 1
  end
end
