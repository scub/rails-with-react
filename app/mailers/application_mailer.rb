# frozen_string_literal: true

# Default application mailer, currently unused
class ApplicationMailer < ActionMailer::Base
  default from: 'penny@loves-to.dev'
  layout 'mailer'
end
