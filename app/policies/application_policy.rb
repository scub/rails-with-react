# frozen_string_literal: true

# Base policy for application-wide policies
class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def show?
    false
  end

  def create?
    false
  end
end
