class CreateDailyReports < ActiveRecord::Migration
  def change
    create_table :daily_reports do |t|
      t.date :report_date
      t.decimal :value

      t.timestamps null: false
    end
  end
end
