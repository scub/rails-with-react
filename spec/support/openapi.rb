# frozen_string_literal: true

# Generate the OpenAPI document with: OPENAPI=1 bundle exec rspec (or `rake openapi:generate`).
# Only request specs are recorded; the hooks are inert unless OPENAPI is set.
require 'rspec/openapi'

RSpec::OpenAPI.path = 'doc/openapi.yaml'
RSpec::OpenAPI.title = 'Rails with React API'
RSpec::OpenAPI.application_version = '1.0.0'
# 3.0.x is the most widely supported by tooling (ZAP, Swagger UI, codegen); the gem defaults to 3.2.0
RSpec::OpenAPI.openapi_version = '3.0.3'
# Examples embed DB ids and timestamps, which change on every run and make the generated file churn
RSpec::OpenAPI.enable_example = false
RSpec::OpenAPI.servers = [{ url: 'http://localhost:3000' }]
RSpec::OpenAPI.security_schemes = {
  'SessionCookie' => {
    description: 'Signed session cookie set by POST /session or POST /registrations',
    type: 'apiKey',
    in: 'cookie',
    name: 'session_id'
  }
}
