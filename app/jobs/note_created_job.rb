class NoteCreatedJob < ApplicationJob
  queue_as :default

  # Do some work inside of the Sidekiq pipeline
  def perform(note_id)
    Rails.logger.info("NoteCreatedJob processed note_id=#{note_id}")
  end
end
