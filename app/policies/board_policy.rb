# frozen_string_literal: true

# App currently has no auth so any session may view any board.
class BoardPolicy < ApplicationPolicy
  def show?
    true
  end
end
