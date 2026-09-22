# frozen_string_literal: true

# This holds a users session
class Session < ApplicationRecord
  belongs_to :user
end
