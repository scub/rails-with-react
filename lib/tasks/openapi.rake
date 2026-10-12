# frozen_string_literal: true

namespace :openapi do
  desc 'Run the specs with OPENAPI=1 to (re)generate doc/openapi.yaml from request specs'
  task generate: :environment do
    # RAILS_ENV=test is forced: the container sets development, which skips the :test gem group
    success = system({ 'RAILS_ENV' => 'test', 'OPENAPI' => '1' }, 'bundle', 'exec', 'rspec')
    exit 1 unless success
  end
end
