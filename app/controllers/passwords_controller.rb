# frozen_string_literal: true

# Passwords controller from `rails generate authentication`
class PasswordsController < ApplicationController
  allow_unauthenticated_access
  skip_after_action :verify_authorized
  before_action :set_user_by_token, only: %i[update]
  rate_limit to: 10, within: 3.minutes, only: :create,
             with: -> { render json: { error: 'Try again later' }, status: :too_many_requests }

  def create
    if (user = User.find_by(email_address: params[:email_address]))
      PasswordsMailer.reset(user).deliver_later
    end

    render json: { notice: 'Password reset instructions sent (if user with that email address exists).' }, status: :ok
  end

  def update
    if @user.update(params.permit(:password, :password_confirmation))
      @user.sessions.destroy_all
      render json: { notice: 'Password has been reset.' }, status: :ok
    else
      render json: { error: 'Passwords did not match' }, status: :unauthorized
    end
  end

  private

  def set_user_by_token
    @user = User.find_by_token_for!(:password_reset, params.expect(:token))
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    render json: { error: 'Password reset link is invalid or expired' }, status: :unauthorized
  end
end
