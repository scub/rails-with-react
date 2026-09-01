require 'rails_helper'

RSpec.describe BoardPolicy do
  let(:board) { create(:board) }
  let(:policy) { described_class.new(user, board) }

  describe '#show?' do
    context 'with a user' do
      let(:user) { double('user') }

      it 'permits the action' do
        expect(policy.show?).to be true
      end
    end

    context 'without a user' do
      let(:user) { nil }

      it 'permits the action' do
        expect(policy.show?).to be true
      end
    end
  end
end
