require 'rails_helper'

RSpec.describe Note, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:content) }
  end

  describe '#broadcast_created' do
    let(:board) { create(:board) }

    before do
      allow(board).to receive(:alert_remote)
    end

    it 'alerts the board with the notes channel on create' do
      note = create(:note, board: board, content: 'Ship the toy app')

      expect(board).to have_received(:alert_remote).with(
        'notes',
        data: { id: note.id, content: 'Ship the toy app', created_at: note.created_at.to_i }
      )
    end

    it 'does not alert when the note fails to save' do
      build(:note, board: board, content: nil).save

      expect(board).not_to have_received(:alert_remote)
    end

    it 'enqueues a NoteCreatedJob on create' do
      note = create(:note, board: board)

      expect(NoteCreatedJob).to have_been_enqueued.with(note.id)
    end
  end
end
