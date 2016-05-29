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
//= require lodash
//= require_tree .


var daily_reports_reference = null; //global reference to JSON data for charts
                                    //(so that we don't need to force server each time to resend db tables content

function callChartkick(id_tag, parsed_data){

    Chartkick.AreaChart(id_tag, parsed_data,
        {
            library:{
                title: "Company's performance table",
                hAxis:{
                    title:"Date",
                    format:"dd/MM/yy"
                },
                vAxis:{
                    title:"Value"
                },
                discrete: false,    //don't show all possible xaxis values(dates)
                curveType: "none",  //avoid curves
                pointSize: 0        //shrink dot size to 0
            }

        }
    );
}

function drawChart(daily_reports){
    //save reference to a global variable, for updateChart method
    daily_reports_reference = daily_reports;

    //When page loads, parse JSON and display chart with complete x-axis range
    callChartkick("main-chart",daily_reports);
}

//AT THIS POINT THIS FUNCTION CAN BE DELETED, it took to much time to handle on the client side
//convert JSON file from {report_date: date, value: value} into {date:value} pairs
// function parse_data_for_chartkick(raw_array) {
//     var length = raw_array.length;
//     var parsed = {};
//
//     for(var i = 0; i < length; i++) {
//         parsed[raw_array[i].report_date] = raw_array[i].value;
//     }
//     return parsed;
// }

function updateChart() {

    //get values from both datepickers
    var start_date = Date.parse(document.getElementById("range-start-picker-input").value);
    var end_date = Date.parse(document.getElementById("range-end-picker-input").value);
    var filtered_data = null;

    if(start_date >= end_date){
        alert("Starting date must be earlier than the ending date.");
    }else{//if dates are in a good order

        // collection_length = daily_reports_reference.length;
        // for(curr_record = 0; curr_record<collection_length;curr_record++){
        //     if(daily_reports_reference)
        // }

        var filtered_data = {};

        for (key in daily_reports_reference) {
            if (daily_reports_reference.hasOwnProperty(key)) {
                var condition_a = Date.parse(key) <= end_date;
                var condition_b = Date.parse(key) >= start_date;

                //allow only for dates that are between starting and ending date
                if(condition_a && condition_b){
                    filtered_data[key] = daily_reports_reference[key];
                }
            }
        }
    }
    callChartkick("main-chart",filtered_data);
}



function loadDatePickers(option){
    //load both datepickers
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

function valueForDay(date){
    //return value for given record date
    //TODO I tried to use lodash library with functional operators and predicates, but it didn't work at all

    for (key in daily_reports_reference) {
        if (daily_reports_reference.hasOwnProperty(key)) {
            var a = new Date(date);var a_day = a.getDate();var a_month= a.getMonth();var a_year=a.getFullYear();
            var b = new Date(key);var b_day = b.getDate();var b_month= b.getMonth();var b_year=b.getFullYear();

            if(a_day == b_day && a_month == b_month && a_year == b_year){
                return daily_reports_reference[key];
            }
        }
    }

}

function calculateDeposit(){
    //get values from form
    var deposit_value = parseInt(document.getElementById('deposit-value-input').value);
    var annual_rate = parseFloat(document.getElementById('interest-rate-input').value / 100);
    var compounding_frequency = parseInt(document.getElementById('compounding-frequency-input').value);
    var compounding_frequency_selected_type = document.getElementById('compounding-frequency-select').value;

    var period_beginning = document.getElementById('deposit-start-picker-input').value;
    var period_ending = document.getElementById('deposit-end-picker-input').value;

    //use input string for later use(investment fund)
    //truncate hours from date string(we need day/month/year only and it takes 10 symbols in a string
    var investment_beginning_value =  valueForDay(period_beginning.substring(0, 10));
    var investment_ending_value =  valueForDay(period_ending.substring(0, 10));

    //cast strings to date objects
    period_beginning = Date.parse(period_beginning);
    period_ending = Date.parse(period_ending);

    //period given in years(cast from milliseconds)
    var deposit_period = parseInt((period_ending - period_beginning)/(1000*60*60*24*365));

    //DEBUGGING USE ONLY
    //console.log("deposit value" + deposit_value);
    //console.log("annual rate " + annual_rate);
    //console.log("compounding_frequency " + compounding_frequency + compounding_frequency_selected_type);
    //console.log("deposit_period " + deposit_period);

    //cast string input to int values
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


    //calculate final deposit value at once
    var deposit_value_after = deposit_value * Math.pow(1 + (annual_rate/annual_compounds),annual_compounds*deposit_period);

    //prepare chart data to display(calculate each stage of financial growth)
    var chart_coordinates = [];                     //container for all of the points x:y
    deposit_value_at_x = parseInt(deposit_value);   //assuming that deposit shouldn't be float or decimal
    chart_coordinates[0] = [0, deposit_value_at_x]; //create first point for chart(just the deposite value)

    //for each period calculate value from formula
    //Kn+1 = Kn + Kn * percent_rate / how_many_capitalization_in_a_year
    var x=1;
    for(x; x <= in_a_year * deposit_period ; x++) {
        chart_coordinates[x] = [x, deposit_value_at_x];
        deposit_value_at_x = deposit_value_at_x + deposit_value_at_x * annual_rate/annual_compounds;
    }
    //insert final value also!
    chart_coordinates[x] = [x, deposit_value_at_x];

    //put chart in div with id=comparator-chart
    Chartkick.LineChart("comparator-chart", chart_coordinates,
        {
            library:{
                title: "Deposit value in time",
                hAxis:{
                    title:"Compounding period number"
                },
                vAxis:{
                    title:"Deposit value"
                },
                discrete: false,    //don't show all possible xaxis values(dates)
                curveType: "none",  //avoid curves
                pointSize: 0        //shrink dot size to 0
            }

        }
    );

    //show final values in a paragraph
    var deposit = document.getElementById("deposit-final-value");
    var investment = document.getElementById("investment-final-value");

    deposit.style.display = "initial";
    investment.style.display = "initial";


    var investment_final = ((parseFloat(investment_ending_value-investment_beginning_value)*100)/investment_beginning_value).toString();

    var deposit_p_text = deposit_value_after.toString();
    var investment_p_text = investment_final.toString();

    deposit.innerHTML = "Deposit final value: " + deposit_p_text + " PLN";
    investment.innerHTML = "Investment value increased by " + investment_p_text + "%";

}



