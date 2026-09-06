# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NotePolicy do
  let(:board) { create(:board) }
  let(:user) { nil }
  let(:policy) { described_class.new(user, note) }

  describe '#create?' do
    context 'with content' do
      let(:note) { build(:note, board: board, content: 'Buy milk') }

      it 'permits the action' do
        expect(policy.create?).to be true
      end
    end

    context 'without content' do
      let(:note) { build(:note, board: board, content: '') }

      it 'denies the action' do
        expect(policy.create?).to be false
      end
    end
  end
end
