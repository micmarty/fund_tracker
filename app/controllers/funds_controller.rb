class FundsController < ApplicationController


  def index
    @daily_reports = DailyReport.pluck(:report_date, :value).to_h
  end
end
