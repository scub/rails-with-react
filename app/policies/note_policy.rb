# frozen_string_literal: true

# Policy class for Note model
class NotePolicy < ApplicationPolicy
  def create?
    record.content.present?
  end
end
