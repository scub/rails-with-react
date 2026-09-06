# frozen_string_literal: true

# Mixed into any model that owns a realtime_token and wants to push tagged
# events to every client subscribed to that token.
module Broadcastable
  extend ActiveSupport::Concern

  included do
    before_create :set_realtime_token
  end

  # `channel` is an application-level tag (e.g. "notes"), frontend's cable_store.js
  # reads it from message.channel to route the payload to the right domain store.
  def alert_remote(channel, data: {})
    NotesMetrics::REALTIME_BROADCASTS.increment(labels: { channel: channel })
    ActionCable.server.broadcast(realtime_token, data.merge(channel: channel))
  end

  private

  def set_realtime_token
    self.realtime_token ||= SecureRandom.hex(12)
  end
end
