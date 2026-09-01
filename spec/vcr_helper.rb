require 'vcr'

VCR.configure do |config|
  if (log = ENV.fetch('VCR_DEBUG_LOG', nil))
    config.debug_logger = File.open(log, 'w')
  end

  config.default_cassette_options = { record: :none, match_requests_on: %i[method host path], allow_playback_repeats: true }
  config.hook_into :webmock
  config.allow_http_connections_when_no_cassette = true
  config.cassette_library_dir = 'spec/cassettes'

  config.before_record do |interaction|
    unless interaction.response.nil?
      if !interaction.response.headers['Retry-After'].nil?
        interaction.response.headers['Retry-After'] = '1'
      elsif !interaction.response.headers['retry-after'].nil?
        interaction.response.headers['retry-after'] = '1'
      end
    end
  end
end

RSpec.configure do |config|
  # Add VCR to any tests with `:vcr` tags
  config.around(:each) do |example|
    vcr_tag = example.metadata[:vcr]

    if vcr_tag.blank?
      VCR.turned_off(&example)
      next
    end

    cassette_name = example.metadata[:vcr_cassette]

    options = vcr_tag.is_a?(Hash) ? vcr_tag : {}
    if cassette_name.blank?
      path_data = [example.metadata[:description]]
      parent = example.example_group
      while parent != RSpec::ExampleGroups
        path_data << parent.metadata[:description]
        parent = parent.module_parent
      end

      cassette_name = path_data.map { |str| str.underscore.delete('.').gsub(%r{[^\w/]+}, '_').gsub(%r{/$}, '') }.reverse.join('/')
    end

    VCR.use_cassette(cassette_name, options, &example)
  end
end