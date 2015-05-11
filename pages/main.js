//-------------------------------------------------------------------------------
// that is a library of functions
// my - is the object/library name
// the reason to have a library is to avoid of polution the global name space
// all functions here work like static/class methods
//-------------------------------------------------------------------------------
var my = {};
 
//-------------------------------------------------------------------------------
// function generates CSV file from the Data object 
// input parameners
// d - it is a data object 
// input parementer 
// d - data object made from initial table 
// of following structure: 
// d = {
//      0:{'first name':'Sam','last name':'Smith','annual salary':'100000','super rate (%)':'9',
//          'payment start date':'01 March – 31 March'},
//      1:{'first name':'David','last name':'Rudd','annual salary':'500000','super rate (%)':'10',
//          'payment start date':'01 January – 31 January'}
// }
//-------------------------------------------------------------------------------
my.generatePayslip = function (d){
    "use strict";                
    try {                    
        // remove last line if it was empty
        if ( Object.keys(d[d.length-1]).length === 1 ){ 
            d.splice(d.length-1,1);
        }

        // check the column headers
        my.checkColumnHeaders(d); 

        //calculate result object to convert it in a table later 
        var result = [];                
        // parse the initial table line by line
        for (var i = 0; i < d.length; i++) {
            // check dates
            var date = (d[i]['payment start date']+' ');
            my.checkDates(date); //use main.js                        

            // fill resul object with data
            var annualSalary = d[i]['annual salary'];
            var grossIncome = Math.round(annualSalary / 12);                        
            var IncomeTax = my.IncomeTax(annualSalary);
            var superValue = Math.round(grossIncome * d[i]['super rate (%)'].match(/\d+/) / 100);
            result[i] = {name:          d[i]['first name'] + ' ' + d[i]['last name'],
                        'pay period':   d[i]['payment start date'],
                        'gross income': grossIncome, 
                        'income tax':   IncomeTax, 
                        'net income':   grossIncome - IncomeTax, 
                         super: superValue         
                        }
        }
    }
    catch (error) {
        alert (error.message);
        return;
    };                

    // make CSV string from object
    var csv = Papa.unparse(result);

    // save CSV locally in 3 steps
    // 1 - make temp DOM element
    $('<a></a>')
        .attr('id','downloadFile')
        .attr('href','data:text/csv;charset=utf8,' + '\uFEFF' + encodeURIComponent(csv))                    
        .attr('download','filename.csv')
        .appendTo('body');
    // 2 - activate it = download to local computer
    $('#downloadFile').ready(function() {
        $('#downloadFile').get(0).click();
    });
    // 3 - cleaning DOM
    $('#downloadFile').remove();
}; //end gotData function


//-------------------------------------------------------------------------------
// Function checks if the headers of the input data table is correct.
// It throws error if inconsistency is detected
//
// input parementer 
// d - data object of following structure 
// d = {
//      0:{'first name':'Sam','last name':'Smith','annual salary':'100000','super rate (%)':'9',
//          'payment start date':'01 March – 31 March'},
//      1:{'first name':'David','last name':'Rudd','annual salary':'500000','super rate (%)':'10',
//          'payment start date':'01 January – 31 January'}
// }
// returning value
//      none
//-------------------------------------------------------------------------------
my.checkColumnHeaders = function (d) {
    "use strict";
    var keys = ['first name', 'last name', 'annual salary', 'super rate (%)', 'payment start date'];
    for (var i = 0; i < keys.length; i++) {
        var s = keys[i];
        var s1 = Object.keys(d[0])[i];
        if (s.toUpperCase() !== s1.toUpperCase()) {
            throw new Error('Error in CSV format. There column name should be "' + s + '" but fine contain "' + s1 + '"!');
        }
    }
};


//-------------------------------------------------------------------------------
// Function checks dates from input file
// so there are 2 dates - 
// 1) the firs date must be the firs day of month
// 2) the second date must be the last day of the same month
//
// input parameters
//  s - string, the data from the 'payment start date' field 
//      example: '01 January – 31 January'
// returning value
//      none
//      it throws error if inconsistency is detected
//-------------------------------------------------------------------------------
my.checkDates = function (s) {
    "use strict";
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                  'August', 'September', 'October', 'November', 'December'];        
    s = s.trim();
    
    // for each possible month   
    var noMonthFound = true;
    for (var i = 0; i < months.length; i++) {
        // find a month
        var k = s.indexOf(months[i]);
        if (k !== -1) {
            noMonthFound = false;
            var l = months[i].length;
            
            // date one
            var date1str = s.substr(0, k + l).trim();
            var date1 = new Date(Date.parse(date1str));
            
            // check if the date one is the first day of month
            var tempDate = new Date(date1);
            tempDate.setDate(date1.getDate() - 1);
            if (date1.getMonth() === tempDate.getMonth()) {
                throw new Error('Error! The period should start from the first day of month. For the line: "' + s + '"');
            }
            
            // date two
            var date2str = s.substr(k + l, s.length).trim(); // cut off the firs date
            var day2 = date2str.match(/\d+/);  // looking for the first set of numbers in the rest of the line
            // cut off all characters before the first set of numbers
            var date2str = date2str.substr(date2str.indexOf(day2), date2str.length);  
            var date2 = new Date(Date.parse(date2str)); // create a date onbject from the date string

            // date3 = date one plus 1 month
            var date1PlusMonth = new Date(date1);
            date1PlusMonth.setMonth(date1.getMonth() + 1);
            date1PlusMonth.setDate(date1PlusMonth.getDate() - 1);
            
            // print result to the console for debugging 
            //console.log(date1str + '->' + date2str + '   ' +
            //            my.DateToStr(date1) + '->' + my.DateToStr(date2) + ' = ' + my.DateToStr(date1PlusMonth));
                        
            if ( +date2 !== +date1PlusMonth) {
              throw new Error('Error! The period is not one month. For the line: "'+s+'"');    
            }
        }

    }// end of for each month sycle

    if (noMonthFound) { 
        throw new Error('Error in the month name! Cannot recognize month from the line: "'+s+'"');
    }
}; //end checkDates


//-------------------------------------------------------------------------------
// Function converts date to string for debugging and testing
// input parameters
//      temp - Data object
// returning value
//      STRING
//-------------------------------------------------------------------------------
my.DateToStr = function (temp) {
    "use strict";
    // make it 2 digit number
    function padStr(i) {        
        return (i < 10) ? "0" + i : "" + i;
    }

    var dateStr = padStr(temp.getFullYear()) + '/' +
                  padStr(1 + temp.getMonth()) + '/' +
                  padStr(temp.getDate()) + ' ' +
                  padStr(temp.getHours()) + ':' +
                  padStr(temp.getMinutes()) + ':' +
                  padStr(temp.getSeconds());
    return ( dateStr );

}; //end function date-to-string


//-------------------------------------------------------------------------------
// Function calculates income tax
// input parameters
//      annual Salary - integer
// returning value
//      Income Tax - integer
//-------------------------------------------------------------------------------
my.IncomeTax = function (annualSalary) {
    "use strict";
    var taxRates = [
        {from:0,      to:18200,  base:0,     percentage:0,    over:0},
        {from:18201,  to:37000,  base:0,     percentage:19,   over:18200},
        {from:37001,  to:80000,  base:3572,  percentage:32.5, over:37000},
        {from:80001,  to:180000, base:17547, percentage:37,   over:80000},
        {from:180001, to:0,      base:54547, percentage:45,   over:18000}
        ];
    var taxSample;
    for (var j = 0; j < taxRates.length; j++) {
        taxSample = taxRates[j];
        if (taxSample.from <= annualSalary && annualSalary <= taxSample.to) {
          break;
        }                            
    }
    var result = (taxSample.base + (annualSalary - taxSample.over) * taxSample.percentage / 100) / 12;
    result = Math.round(result);
    
    return result;    
}; //end function IncomeTax


