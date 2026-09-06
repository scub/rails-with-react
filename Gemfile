# frozen_string_literal: true

source 'https://rubygems.org'

gem 'bootsnap', require: false # Reduces boot times through caching; required in config/boot.rb
gem 'pg', '~> 1.1'
gem 'puma', '>= 5.0'
gem 'rack', '~> 3.0'
gem 'rack-cors'
gem 'rails', '~> 8.0.5', '>= 8.0.5.1'
gem 'redis'
gem 'sidekiq'
gem 'sidekiq-cron'
gem 'sidekiq-prometheus-exporter'
gem 'tzinfo-data', platforms: %i[windows jruby]

# Pin below 3.0: that release dropped the `quirks_mode` option ActiveSupport's
# JSON encoder still passes, breaking `#to_json` under Rails 8.0.5.1.
gem 'json', '~> 2.21'
# The modern asset pipeline for Rails [https://github.com/rails/propshaft]
gem 'propshaft'
# Object authorization for the boards/notes policies [https://github.com/varvet/pundit]
gem 'pundit'
# Vite-powered frontend (React) instead of importmap/Turbo/Stimulus [https://vite-ruby.netlify.app]
gem 'vite_rails'

# Observability
gem 'opentelemetry-exporter-otlp'
gem 'opentelemetry-instrumentation-pg'
gem 'opentelemetry-instrumentation-rails'
gem 'opentelemetry-instrumentation-sidekiq'
gem 'opentelemetry-sdk'
gem 'prometheus-client'
gem 'pyroscope', '~> 1.1'
gem 'pyroscope-otel'

# Better connection pooling https://github.com/mperham/connection_pool
# gem 'connection_pool'

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
# gem "bcrypt", "~> 3.1.7"

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
# gem "image_processing", "~> 1.2"

group :development, :test do
  gem 'brakeman'
  gem 'bundler-audit'
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem 'debug', platforms: %i[mri windows], require: 'debug/prelude'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'pry-bond'
  gem 'pry-byebug'
  gem 'pry-rails'
  gem 'rspec_api_documentation'
  gem 'rspec-rails'
  gem 'rubocop', require: false
  gem 'rubocop-factory_bot', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
  gem 'rubocop-rspec_rails', require: false
  # gem "rubocop-rails-omakase", require: false
  gem 'vcr'
  gem 'webmock'
end

group :development do
  gem 'annotaterb'
  gem 'listen'                    # https://github.com/guard/listen
  gem 'reek'                      # https://github.com/troessner/reek
  gem 'web-console'               # https://github.com/rails/web-console
end

group :test do
  gem 'rails-controller-testing'
  gem 'shoulda-matchers'                       # https://github.com/thoughtbot/shoulda-matchers
  gem 'simplecov', require: false              # https://github.com/simplecov-ruby/simplecov
  gem 'simplecov-json', require: false         # https://github.com/vicentllongo/simplecov-json
  gem 'timecop'                                # https://github.com/travisjeffery/timecop
end
