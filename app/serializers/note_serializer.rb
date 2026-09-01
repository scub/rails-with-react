# frozen_string_literal: true

class NoteSerializer
  def initialize(note)
    @note = note
  end

  def as_json(*)
    {
      id: @note.id,
      content: @note.content,
      created_at: @note.created_at.to_i
    }
  end
end
