# frozen_string_literal: true

# Main application controller
class ApplicationController < ActionController::Base
  include Pundit::Authorization

  # Every action in every controller here calls `authorize` itself (including
  after_action :verify_authorized

  private

  # Currently retuns nil as there is no auth system
  def current_user
    nil
  end
end
