# frozen_string_literal: true

class NotePolicy < ApplicationPolicy
  def create?
    record.content.present?
  end
end
