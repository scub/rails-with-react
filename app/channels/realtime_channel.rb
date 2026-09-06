# frozen_string_literal: true

# Deliberately generic: it streams from whatever token it's given, and has no
# idea whether that token belongs to a Board, a Project, or anything else.
# Semantic routing happens client-side via the "channel" tag on each message
# (see Broadcastable#alert_remote and stores/global/cable_store.js).
class RealtimeChannel < ApplicationCable::Channel
  def subscribed
    token = params[:realtime_token]
    reject if token.blank?

    stream_from token
  end
end
