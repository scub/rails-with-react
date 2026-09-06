# frozen_string_literal: true

# Model for Boards, stores notes
class Board < ApplicationRecord
  include Broadcastable

  has_many :notes, dependent: :destroy
end
