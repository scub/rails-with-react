# frozen_string_literal: true

unless Rails.env.test? || ENV.fetch('OBSERVABILITY_ENABLED', 'false') == 'false'
  require 'pyroscope'
  require 'pyroscope/otel'
  require 'opentelemetry/sdk'
  require 'opentelemetry/exporter/otlp'

  app_name = ENV.fetch('OTEL_SERVICE_NAME', 'rails-react-monolith')
  pyroscope_server_address = ENV.fetch('PYROSCOPE_SERVER_ADDRESS', 'http://pyroscope:4040')
  otlp_traces_endpoint = ENV.fetch('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT', 'http://tempo:4318/v1/traces')

  Pyroscope.configure do |config|
    config.app_name = app_name
    config.server_address = pyroscope_server_address
  end

  OpenTelemetry::SDK.configure do |c|
    c.service_name = app_name
    c.use_all

    c.add_span_processor Pyroscope::Otel::SpanProcessor.new("#{app_name}.cpu", pyroscope_server_address)

    c.add_span_processor(
      OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
        OpenTelemetry::Exporter::OTLP::Exporter.new(endpoint: otlp_traces_endpoint)
      )
    )
  end
end
