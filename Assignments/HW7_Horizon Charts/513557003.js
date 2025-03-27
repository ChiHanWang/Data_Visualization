const data_path = "http://vis.lab.djosix.com:2024/data/air-pollution.csv"
// const data_path = "./Measurement_summary.csv"


// Load and process data from CSV	
d3.csv(data_path).then(function (data) { 
    // console.log("data:", data)

    Temp = function (num, decimal) { return Math.round((num + Number.EPSILON) * Math.pow(10, decimal)) / Math.pow(10, decimal); }
	// console.log("Temp:", Temp)
	
    function aggregate(data, type) {
        var SumbyDayperYear = data.reduce(function (RegionInfobyDayperYear, obj) {
            var date = obj["Measurement date"].split(" ")[0];
            var station = obj["Station code"];
            if (!RegionInfobyDayperYear[date]) {
                RegionInfobyDayperYear[date] = {};
            }
            if (!RegionInfobyDayperYear[date][station]) {
                RegionInfobyDayperYear[date][station] = { sum: 0, count: 0 };
            }
            RegionInfobyDayperYear[date][station].sum += +obj[type];
            RegionInfobyDayperYear[date][station].count++;
			// console.log("RegionInfobyDayperYear:", RegionInfobyDayperYear)
            return RegionInfobyDayperYear;
        }, Object.create(null));

        return Object.keys(SumbyDayperYear).map(function (date) {
            // console.log("SumbyDayperYear:", SumbyDayperYear)
            // console.log("SumbyDayperYear[date]:", SumbyDayperYear[date])
            return Object.keys(SumbyDayperYear[date]).map(function (station) {
                // console.log("date:", date)
                // console.log("station:", station)
                return {
                    "ts": new Date(date),
                    "region_code": station,
                    "val": Temp(SumbyDayperYear[date][station].sum / SumbyDayperYear[date][station].count, 4),
                };
            });
        });
    }

    // add an event listener for the change event
    const radioButtons = document.querySelectorAll('input[name="type"]');
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('change', showSelected);
    }

    function showSelected(e) {
        // console.log(e);
        if (this.checked) {
            render(this.value)
        }
    }
    
    function render(type) {
        var TooltipA = aggregate(data, type)
        // console.log("TooltipA:", TooltipA)

        var TooltipB = [].concat(...TooltipA);
        // console.log("TooltipB:", TooltipB)

        HorizonTSChart()(document.getElementById('horizon_chart'))
            .data(TooltipB)
            .series('region_code')
    }

    render("CO");
});



