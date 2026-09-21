# frozen_string_literal: true

module AuthenticationHelpers
  def sign_in_as(user)
    session = user.sessions.create!(user_agent: 'RSpec', ip_address: '127.0.0.1')
    request.cookie_jar.signed[:session_id] = session.id
  end
end
