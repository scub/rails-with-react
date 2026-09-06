# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NoteSerializer do
  let(:note) { create(:note, content: 'Buy milk') }
  let(:serialized_note) { described_class.new(note).as_json }

  it 'returns only the expected keys' do
    expect(serialized_note.keys).to contain_exactly(:id, :content, :created_at)
  end

  it 'serializes created_at as an integer timestamp' do
    expect(serialized_note[:created_at]).to eq(note.created_at.to_i)
  end

  it 'exposes the note content' do
    expect(serialized_note[:content]).to eq('Buy milk')
  end
end
