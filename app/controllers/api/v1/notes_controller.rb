# frozen_string_literal: true

module Api
  module V1
    # Reached from the frontend via `fetcher()` (frontend/app/javascript/utils/fetch.js)
    # with `internal: true`, which attaches the CSRF token read from `csrf_meta_tags`.
    class NotesController < ApplicationController
      allow_unauthenticated_access only: :index
      before_action :set_board

      def index
        authorize @board, :show?
        notes = @board.notes.order(:created_at)
        render json: notes.map { |note| NoteSerializer.new(note).as_json }
      end

      def create
        note = @board.notes.new(note_params.merge(user: current_user))

        authorize note

        save_note(note)
      rescue Pundit::NotAuthorizedError
        # NotePolicy#create? denies exactly the notes that would also fail
        note.valid?
        render json: { errors: note.errors.full_messages }, status: :unprocessable_content
      end

      private

      def set_board
        @board = Board.find(params.expect(:board_id))
      end

      def save_note(note)
        if note.save
          # Broadcasting happens on the model (see Note#broadcast_created)
          render json: NoteSerializer.new(note).as_json, status: :created
        else
          render json: { errors: note.errors.full_messages }, status: :unprocessable_content
        end
      end

      # Only :content is writable from the frontend. Anything not permitted here is dropped
      def note_params
        params.expect(note: [:content])
      end
    end
  end
end
