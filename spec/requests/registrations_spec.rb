# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Registrations' do
  describe 'POST /registrations' do
    it 'creates a user and returns success' do
      post '/registrations',
           params: { email_address: 'penny@loves-to.dev', password: 'password12345',
                     password_confirmation: 'password12345' }
      expect(response).to have_http_status(:success)
    end
  end
end
