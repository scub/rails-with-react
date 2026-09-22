# frozen_string_literal: true

# Board policy defines who can see boards (right now: everyone)
class BoardPolicy < ApplicationPolicy
  def show?
    true
  end
end
