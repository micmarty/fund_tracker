class FundsController < ApplicationController



  def index
    @daily_reports = DailyReport.all

    @chart_properties =
        {
            min: 0,
            xtitle: "Data",
            ytitle: "Wartość funduszu",
            library:
                {
                    #width: 800,
                    #height:500,
                    #backgroundColor: "#E5FFCC"
                }
        }
  end
end
