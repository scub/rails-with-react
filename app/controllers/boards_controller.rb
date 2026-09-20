# frozen_string_literal: true

# The only real view in this toy app. Every top-level route funnels through a
# controller like this one to authorize the request and hand a JSON blob of
# initial state to React — never to render page-specific markup.
class BoardsController < ApplicationController
  allow_unauthenticated_access only: :show

  def show
    @board = Board.find(params[:id] || Board.first_or_create!.id)
    authorize @board, :show?

    render 'layouts/stub'
  end

  private

  # Serialized once into #application-data in app/views/layouts/application.html.erb.
  def application_data
    {
      authenticated: current_user.present?,
      board_id: @board.id,
      realtime_token: @board.realtime_token,
      security_token: session[:security_token] ||= SecureRandom.hex(16),
      notes: @board.notes.order(:created_at).map { |note| NoteSerializer.new(note).as_json }
    }
  end
  helper_method :application_data
end
