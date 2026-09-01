require 'simplecov'
require 'simplecov-json'
require 'factory_bot'
require 'webmock/rspec'

SimpleCov.start 'rails' do
  skip 'app/channels/application_cable'
  skip 'app/jobs/application_job.rb'
  skip 'app/models/application_record.rb'
  skip '/bin/'
  skip '/db/'
  skip '/lib/tasks/'
  skip '/spec/'
  formatter SimpleCov::Formatter::MultiFormatter.new([
    SimpleCov::Formatter::HTMLFormatter,
    SimpleCov::Formatter::JSONFormatter
  ])
end

WebMock.enable!

require 'vcr_helper'

RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
end
