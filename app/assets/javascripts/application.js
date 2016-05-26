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
    var start_date = Date.parse(document.getElementById("range-start-picker-input").value);
    var end_date = Date.parse(document.getElementById("range-end-picker-input").value);
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
    parsed_data = parse_data_for_chartkick(filtered_data);
    Chartkick.LineChart("main-chart", parsed_data);
}


//load both datepickers
function loadDatePickers(option){
    jQuery.noConflict();
    jQuery(document).ready(function($) {
        if(option == 'range-pickers'){
            $('#range-start-picker').datetimepicker();
            $('#range-end-picker').datetimepicker();
        }else if(option == 'deposit-pickers'){
            $('#deposit-start-picker').datetimepicker();
            $('#deposit-end-picker').datetimepicker();
        }
    });
}

function calculateDeposit(){
    var deposit_value = document.getElementById('deposit-value-input').value;
    var annual_rate = document.getElementById('interest-rate-input').value / 100;
    var compounding_frequency = document.getElementById('compounding-frequency-input').value;
    var compounding_frequency_selected_type = document.getElementById('compounding-frequency-select').value;

    var period_beggining = document.getElementById('deposit-start-picker-input').value;
    var period_ending = document.getElementById('deposit-end-picker-input').value;


    period_beggining = Date.parse(period_beggining);
    period_ending = Date.parse(period_ending);


    //period given in years
    var deposit_period = (period_ending - period_beggining)/(1000*60*60*24*365);

    var in_a_year = 0;
    switch(compounding_frequency_selected_type){
        case 'days':
            in_a_year = 365;
            break;
        case 'weeks':
            in_a_year = 52;
            break;
        case 'months':
            in_a_year = 12;
            break;
        case 'years':
            in_a_year = 1;
            break;
    }
    annual_compounds = in_a_year / compounding_frequency;
    var deposit_value_after = deposit_value * Math.pow(1 + (annual_rate/annual_compounds),annual_compounds*deposit_period);

    
}
