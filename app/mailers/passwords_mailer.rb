# frozen_string_literal: true

# Mailer handles password reset emails
class PasswordsMailer < ApplicationMailer
  def reset(user)
    @user = user
    mail subject: t('email_sub_reset_password'), to: user.email_address
  end
end
