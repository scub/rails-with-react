# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pundit::Authorization

  # Every action in every controller here calls `authorize` itself (including
  # NotesController#index), so this has no exceptions to carve out — and Rails
  # 7.1+'s `raise_on_missing_callback_actions` rejects an `except:` naming an
  # action that doesn't exist on the controller being verified (e.g.
  # BoardsController has no :index).
  after_action :verify_authorized

  private

  # This toy has no auth system, so `authorize` (and Pundit's `pundit_user`)
  # always resolve to a nil user. BoardPolicy/NotePolicy don't key off
  # identity, so that's fine here — a real app's ApplicationController
  # returns `current_user` from its session instead.
  def current_user
    nil
  end
end
