# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Notes', openapi: { tags: %w[Notes] } do
  let(:board) { create(:board) }
  let(:notes_path) { "/api/v1/boards/#{board.id}/notes" }

  describe 'GET /api/v1/boards/:board_id/notes', openapi: { summary: 'List notes on a board' } do
    before do
      create(:note, board: board, content: 'Buy milk')
      get notes_path, as: :json
    end

    it 'returns ok' do
      expect(response).to have_http_status(:ok)
    end

    it 'lists the notes belonging to the board' do
      expect(response.parsed_body).to contain_exactly(hash_including('content' => 'Buy milk'))
    end
  end

  # One operation, so the summary and security requirement live on the group, not on each response context
  describe 'POST /api/v1/boards/:board_id/notes',
           openapi: { summary: 'Create a note', security: [{ 'SessionCookie' => [] }] } do
    let(:user) { create(:user, password: 'password12345') }
    let(:content) { 'Buy milk' }
    let(:sign_in) { post '/session', params: { email_address: user.email_address, password: 'password12345' } }

    before do
      sign_in
      post notes_path, params: { note: { content: content } }, as: :json
    end

    context 'with valid params' do
      it 'returns created' do
        expect(response).to have_http_status(:created)
      end

      it 'returns the serialized note' do
        expect(response.parsed_body).to include('content' => 'Buy milk')
      end
    end

    context 'with a blank note' do
      let(:content) { '' }

      it 'returns unprocessable content' do
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'returns validation errors' do
        expect(response.parsed_body['errors']).to be_present
      end
    end

    context 'when signed out' do
      let(:sign_in) { nil }

      it 'returns unauthorized' do
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
