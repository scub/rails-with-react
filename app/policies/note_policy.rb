# frozen_string_literal: true

# Policy class for Note model
class NotePolicy < ApplicationPolicy
  def create?
    user.present? && record.content.present?
  end

  # not wired in yet
  def update?
    record.user == user
  end

  def destroy?
    record.user == user
  end
end
