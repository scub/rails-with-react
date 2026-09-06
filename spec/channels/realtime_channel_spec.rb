# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RealtimeChannel do
  it 'subscribes when provided a valid realtime_token' do
    subscribe(realtime_token: 'test-token-123')

    expect(subscription).to be_confirmed
  end

  it 'subscribed with its realtime_token' do
    subscribe(realtime_token: 'test-token-123')

    expect(subscription).to have_stream_from('test-token-123')
  end

  it 'rejects subscription without a realtime_token' do
    subscribe(realtime_token: nil)

    expect(subscription).to be_rejected
  end

  it 'rejects subscription with an empty realtime_token' do
    subscribe(realtime_token: '')

    expect(subscription).to be_rejected
  end
end
