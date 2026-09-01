# frozen_string_literal: true

class BoardPolicy < ApplicationPolicy
  # Toy app has no real auth — any session may view any board.
  def show?
    true
  end
end
