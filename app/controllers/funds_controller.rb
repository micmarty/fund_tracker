class FundsController < ApplicationController
  def index
    @dailyreports = DailyReport.all
  end
end
