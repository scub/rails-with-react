# frozen_string_literal: true

# Model for Notes
class Note < ApplicationRecord
  belongs_to :board
  belongs_to :user

  validates :content, presence: true

  after_create :broadcast_created

  private

  def broadcast_created
    board.alert_remote('notes', data: NoteSerializer.new(self).as_json)
    NotesMetrics::NOTES_CREATED.increment
    NotesMetrics::BOARD_NOTES_COUNT.set(board.notes.count, labels: { board_id: board.id })
    NoteCreatedJob.perform_later(id)
  end
end
