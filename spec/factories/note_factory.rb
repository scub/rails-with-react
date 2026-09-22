# frozen_string_literal: true

FactoryBot.define do
  factory :note do
    board
    user
    content { 'Remember to water the plants' }
  end
end
