# frozen_string_literal: true

FactoryBot.define do
  factory :note do
    board
    content { 'Remember to water the plants' }
  end
end
