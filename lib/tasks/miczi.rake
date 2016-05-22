namespace :miczi do
  desc "TODO"
  task populate_db_with_csv: :environment do
    filename = 'db/data.csv'
    chunk_size = 100

    options = {:chunk_size => chunk_size, :key_mapping => {:data => :report_date, :wartosc => :value}}
    n = SmarterCSV.process(filename, options) do |chunk|
      chunk.each do |record|
        DailyReport.create(record)
      end
      puts "chunk persisted"
    end
  end

end
