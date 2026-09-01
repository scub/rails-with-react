# frozen_string_literal: true

# The only real view in this toy app. Every top-level route funnels through a
# controller like this one to authorize the request and hand a JSON blob of
# initial state to React — never to render page-specific markup.
class BoardsController < ApplicationController
  def show
    @board = Board.find(params[:id] || Board.first_or_create!.id)
    authorize @board, :show?

    render 'layouts/stub'
  end

  private

  # Serialized once into #application-data in app/views/layouts/application.html.erb.
  # React reads this exactly once, at boot (see frontend/app/javascript/entrypoints/application.jsx).
  def application_data
    {
      board_id: @board.id,
      realtime_token: @board.realtime_token,
      current_user_name: current_user_name,
      security_token: session[:security_token] ||= SecureRandom.hex(16),
      notes: @board.notes.order(:created_at).map { |note| NoteSerializer.new(note).as_json }
    }
  end
  helper_method :application_data

  def current_user_name
    # Stand-in for the real app's `current_user`/Devise session.
    session[:user_name] ||= "Learner-#{rand(1000)}"
  end
end
