# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BoardsController do
  describe 'GET show' do
    let!(:board) { create(:board) }
    let!(:note) { create(:note, board: board, content: 'Buy milk') }

    before do
      get :show, params: { id: board.id }
    end

    it 'returns the correct status' do
      expect(response).to have_http_status(:ok)
    end

    it 'renders the empty shell view' do
      expect(response).to render_template('layouts/stub')
    end

    it 'exposes the board id, realtime_token, and existing notes for the frontend to hydrate from' do
      data = controller.send(:application_data)

      expect(data[:board_id]).to eq(board.id)
      expect(data[:realtime_token]).to eq(board.realtime_token)
      expect(data[:notes]).to contain_exactly(
        hash_including(id: note.id, content: 'Buy milk')
      )
    end
  end
end
