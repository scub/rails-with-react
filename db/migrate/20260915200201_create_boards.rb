class CreateBoards < ActiveRecord::Migration[8.0]
  def change
    create_table :boards do |t|
      t.string :realtime_token

      t.timestamps
    end
  end
end
