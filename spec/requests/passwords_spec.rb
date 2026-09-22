# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Passwords' do
  describe 'POST /passwords' do
    it 'sends reset email when user exists' do
      user = create(:user)

      expect { post '/passwords', params: { email_address: user.email_address } }
        .to have_enqueued_mail(PasswordsMailer, :reset)
    end

    it 'returns ok when user exists' do
      user = create(:user)
      post '/passwords', params: { email_address: user.email_address }
      expect(response).to have_http_status(:ok)
    end

    it 'returns ok without leaking user existence' do
      post '/passwords', params: { email_address: 'everyone@loves-to.dev' }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'PATCH /passwords/:token' do
    let(:user) { create(:user) }
    let(:token) { user.password_reset_token }

    it 'resets the password with confirmation' do
      patch "/passwords/#{token}", params: { password: 'newpass', password_confirmation: 'newpass' }
      expect(response).to have_http_status(:ok)
    end

    it 'destroys sessions on reset' do
      user.sessions.create!(user_agent: 'rpsec', ip_address: '127.0.0.1')

      expect do
        patch "/passwords/#{token}", params: { password: 'newpass', password_confirmation: 'newpass' }
      end.to change(user.sessions, :count).from(1).to(0)
    end

    it 'rejects incorrect password_confirmation' do
      patch "/passwords/#{token}", params: { password: 'newpass', password_confirmation: 'something_different' }
      expect(response).to have_http_status(:unauthorized)
    end

    it 'rejects an invalid token' do
      patch '/passwords/invalid-token', params: { password: 'newpass', password_confirmation: 'newpass' }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
