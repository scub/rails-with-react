# Standalone Rack app for Sidekiq's own /metrics
require 'sidekiq'
require 'sidekiq/prometheus/exporter'

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }
end

run Sidekiq::Prometheus::Exporter.to_app
