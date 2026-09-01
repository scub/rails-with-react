require 'rails_helper'

RSpec.describe Board, type: :model do
  describe '#realtime_token' do
    context 'on create' do
      let(:board) { create(:board) }

      it 'assigns a token' do
        expect(board.realtime_token).to be_present
      end
    end

    context 'when already set' do
      let(:board) { build(:board, realtime_token: 'existing-token') }

      it 'does not overwrite it' do
        board.save!

        expect(board.realtime_token).to eq('existing-token')
      end
    end
  end

  describe '#alert_remote' do
    let(:board) { create(:board) }

    it 'broadcasts to its own realtime_token, tagged with the given channel' do
      expect(ActionCable.server).to receive(:broadcast).with(board.realtime_token, { foo: 'bar', channel: 'notes' })

      board.alert_remote('notes', data: { foo: 'bar' })
    end
  end
end
