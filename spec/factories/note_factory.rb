FactoryBot.define do
  factory :note do
    board
    content { 'Remember to water the plants' }
  end
end
