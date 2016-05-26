// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require chartkick
//= require bootstrap-sprockets
//= require moment
//= require bootstrap-datetimepicker
//= require_tree .

var daily_reports_reference = null;

function drawChart(daily_reports){
    //save reference to a global variable, for updateChart method
    daily_reports_reference = daily_reports;

    //When page loads, parse JSON and display chart with complete x-axis range
    parsed_data = parse_data_for_chartkick(daily_reports);
    Chartkick.LineChart("main-chart", parsed_data);
}

//convert JSON file from {report_date: date, value: value} into {date:value} pairs
function parse_data_for_chartkick(raw_array) {
    var length = raw_array.length;
    var parsed = {};

    for(var i = 0; i < length; i++) {
        parsed[raw_array[i].report_date] = raw_array[i].value;
    }
    return parsed;
}

//
function updateChart() {
    //get values from both datepickers
    var start_date = Date.parse(document.getElementById("datetimepicker1-input").value);
    var end_date = Date.parse(document.getElementById("datetimepicker2-input").value);
    var filtered_data = null;

    if(start_date >= end_date){
        alert("Starting date must be earlier than the ending date.");
    }else{//if dates are in a good order

        //filter JSON file using starting and ending date
        filtered_data = daily_reports_reference.filter(function (current) {

            var condition_a = Date.parse(current.report_date) <= end_date;
            var condition_b = Date.parse(current.report_date) >= start_date;

            //allow only for dates that are between starting and ending date
            if(condition_a && condition_b){
                return true;    //record is allowed to display
            }else{
                return false;   //record is ignored
            }
        });
    }
    drawChart(filtered_data);
}

