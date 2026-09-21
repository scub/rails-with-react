# frozen_string_literal: true

require 'json'
require 'tempfile'

# Renders RuboCop's JSON formatter output as GitHub-flavored markdown tables.
module RubocopMarkdown
  module_function

  def render(data)
    offenses = flatten_offenses(data.fetch('files'))
    parts = [summary_table(data.fetch('summary'), data.fetch('metadata'), offenses)]
    parts << offense_table(offenses) if offenses.any?
    parts.join("\n\n")
  end

  def flatten_offenses(files)
    offenses = files.flat_map do |file|
      file.fetch('offenses').map { |offense| offense.merge('path' => file.fetch('path')) }
    end
    offenses.sort_by { |offense| [offense['path'], *offense.fetch('location').values_at('start_line', 'start_column')] }
  end

  def summary_table(summary, metadata, offenses)
    by_severity = offenses.group_by { |offense| offense['severity'] }.transform_values(&:size)
    <<~MD.chomp
      ## RuboCop Report

      | Metric | Value |
      | --- | ---: |
      | Status | #{summary.fetch('offense_count').zero? ? '✅ Passed' : '❌ Failed'} |
      | Offenses | #{summary.fetch('offense_count')} |
      | Files inspected | #{summary.fetch('inspected_file_count')} |
      #{metadata_rows(metadata)}
      #{by_severity.sort.map { |severity, count| "| #{severity.capitalize} offenses | #{count} |" }.join("\n")}
    MD
  end

  def metadata_rows(metadata)
    { 'RuboCop version' => 'rubocop_version', 'Ruby version' => 'ruby_version',
      'Ruby patchlevel' => 'ruby_patchlevel', 'Ruby platform' => 'ruby_platform' }
      .map { |label, key| "| #{label} | #{metadata.fetch(key)} |" }.join("\n")
  end

  def offense_table(offenses)
    lines = ['| Location | Severity | Cop | Message |', '| --- | --- | --- | --- |']
    offenses.each do |offense|
      location = "#{offense['path']}:#{offense.dig('location', 'start_line')}"
      lines << "| `#{location}` | #{offense['severity']} | `#{offense['cop_name']}` | #{escape(offense['message'])} |"
    end
    lines.join("\n")
  end

  def escape(text)
    text.to_s.gsub('|', '\|').tr("\n", ' ')
  end
end

namespace :rubocop do
  desc 'Run rubocop: progress output to the console, markdown report to $GITHUB_STEP_SUMMARY (or stdout if unset)'
  task markdown: :environment do
    json_file = Tempfile.new(['rubocop', '.json'])
    success = system('bundle', 'exec', 'rubocop', '--format', 'progress', '--format', 'json', '--out', json_file.path)
    markdown = RubocopMarkdown.render(JSON.parse(File.read(json_file.path)))
    if (summary_file = ENV.fetch('GITHUB_STEP_SUMMARY', nil))
      File.open(summary_file, 'a') { |file| file.puts markdown }
    else
      puts markdown
    end
    exit 1 unless success
  rescue JSON::ParserError, KeyError => e
    warn "ERROR: unexpected rubocop output: #{e.message}"
    exit 1
  ensure
    json_file&.close!
  end
end
