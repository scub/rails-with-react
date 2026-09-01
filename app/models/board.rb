# frozen_string_literal: true

class Board < ApplicationRecord
  include Broadcastable

  has_many :notes, dependent: :destroy
end
