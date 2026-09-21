class RegistrationsController < ApplicationController
  allow_unauthenticated_access only: :create
  skip_after_action :verify_authorized
  rate_limit to: 10, within: 3.minutes, only: :create,
    with: -> { render json: { error: "Try again later" }, status: :too_many_requests }

  def create
    user = User.new(params.permit(:email_address, :password, :password_confirmation))

    if user.save
      start_new_session_for user
      render json: { user: { id: user.id, email_address: user.email_address } }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end
end
