class DailyReport < ActiveRecord::Base

  def self.date_range(starting_day = nil, ending_day = nil)

    if starting_day.nil? and ending_day.nil?
      DailyReport.pluck(:report_date, :value).as_json(only: [:report_date, :value])
    else
      DailyReport.where("report_date > ? AND report_date < ?", starting_day, ending_day).pluck(:report_date, :value).as_json(only: [:report_date, :value])
    end

  end
end
