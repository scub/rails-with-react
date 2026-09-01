require 'rails_helper'

RSpec.describe Api::V1::NotesController, type: :controller do
  let(:board) { create(:board) }
  let(:parsed_response) { JSON.parse(response.body) }

  describe 'GET index' do
    let!(:note) { create(:note, board: board, content: 'Buy milk') }

    before do
      get :index, params: { board_id: board.id }
    end

    it 'returns the correct status' do
      expect(response).to have_http_status(:ok)
    end

    it 'returns the notes belonging to the board' do
      expect(parsed_response).to contain_exactly(hash_including('id' => note.id, 'content' => 'Buy milk'))
    end
  end

  describe 'POST create' do
    context 'with valid params' do
      before do
        post :create, params: { board_id: board.id, note: { content: 'Buy milk' } }
      end

      it 'returns the correct status' do
        expect(response).to have_http_status(:created)
      end

      it 'creates a note scoped to the board' do
        expect(board.notes.count).to eq(1)
        expect(board.notes.first.content).to eq('Buy milk')
      end

      it 'returns the serialized note' do
        expect(parsed_response).to include('content' => 'Buy milk')
      end
    end

    context 'with invalid params' do
      before do
        post :create, params: { board_id: board.id, note: { content: '' } }
      end

      it 'returns an unprocessable content status' do
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'does not create a note' do
        expect(board.notes.count).to eq(0)
      end

      it 'returns validation errors' do
        expect(parsed_response['errors']).to be_present
      end
    end

    context 'with an attribute not permitted by strong params' do
      it 'silently drops it rather than raising' do
        expect do
          post :create, params: { board_id: board.id, note: { content: 'Buy milk', board_id: 'other-board' } }
        end.not_to raise_error

        expect(response).to have_http_status(:created)
      end
    end
  end
end
