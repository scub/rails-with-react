# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Sessions' do
  describe 'POST /session' do
    let(:user) { create(:user, password: 'password12345') }

    it 'returns correct status with valid creds' do
      post '/session', params: { email_address: user.email_address, password: 'password12345' }
      expect(response).to have_http_status(:created)
    end

    it 'starts session on login' do
      expect do
        post '/session', params: { email_address: user.email_address, password: 'password12345' }
      end.to change(user.sessions, :count).by(1)
    end

    it 'rejects bad creds' do
      post '/session', params: { email_address: user.email_address, password: 'wrong' }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /session' do
    let(:user) { create(:user, password: 'password12345') }

    before do
      post '/session', params: { email_address: user.email_address, password: 'password12345' }
    end

    it 'returns no content' do
      delete '/session'
      expect(response).to have_http_status(:no_content)
    end

    it 'deletes the session' do
      expect { delete '/session' }.to change(Session, :count).by(-1)
    end
  end
end
