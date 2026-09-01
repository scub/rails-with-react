# frozen_string_literal: true

class Note < ApplicationRecord
  belongs_to :board

  validates :content, presence: true

  after_create :broadcast_created

  private

  # The write path (Api::V1::NotesController#create) and the fan-out path are
  # separate: every subscriber to the board's realtime_token — including the
  # tab that just POSTed — learns about the new note over the socket, not from
  # the HTTP response. See frontend/app/javascript/stores/notes_store.js.
  def broadcast_created
    board.alert_remote('notes', data: NoteSerializer.new(self).as_json)
    NoteCreatedJob.perform_later(id)
  end
end
