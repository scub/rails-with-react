require 'rails_helper'

RSpec.describe NoteCreatedJob, type: :job do
  it 'logs the note id it processed' do
    allow(Rails.logger).to receive(:info).and_call_original

    described_class.perform_now(42)

    expect(Rails.logger).to have_received(:info).with('NoteCreatedJob processed note_id=42')
  end
end
