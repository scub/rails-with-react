# frozen_string_literal: true

require 'prometheus/client'
require 'prometheus/middleware/collector'
require 'prometheus/middleware/exporter'

# Collector records default HTTP metrics, Exporter serves them 
# Both intercept requests before Rails' router sees them
Rails.application.middleware.use Prometheus::Middleware::Collector
Rails.application.middleware.use Prometheus::Middleware::Exporter
