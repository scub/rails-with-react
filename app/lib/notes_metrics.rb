# frozen_string_literal: true

# Application-specific Prometheus metrics, registered once at boot and
# incremented/set from wherever the corresponding event actually happens
# (see Note#broadcast_created and Broadcastable#alert_remote) — same idea as
# NoteSerializer or NotePolicy, a small object the domain code reaches for.
#
# The generic HTTP metrics (request count/duration by route+status) come
# free from the Prometheus::Middleware::Collector in
# config/initializers/prometheus_metrics.rb; these three exist to show a
# Counter, a labeled Gauge, and a labeled Counter for something only this
# app's domain logic knows about.
module NotesMetrics
  REGISTRY = Prometheus::Client.registry

  NOTES_CREATED = REGISTRY.counter(
    :notes_created_total,
    docstring: 'Total number of notes created'
  )

  BOARD_NOTES_COUNT = REGISTRY.gauge(
    :board_notes_count,
    docstring: 'Current number of notes on a board',
    labels: [:board_id]
  )

  REALTIME_BROADCASTS = REGISTRY.counter(
    :realtime_broadcasts_total,
    docstring: 'Total number of ActionCable broadcasts sent, by channel tag',
    labels: [:channel]
  )
end
