// Set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 0, left: 10 },
    width = 560 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#ThemeRiver")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Data source path
const data_path = "http://vis.lab.djosix.com:2024/data/ma_lga_12345.csv"

// Parse the Data
d3.csv(data_path).then(function (data) {
    var tempData1 = {};
    for (let i = 0; i < data.length; i++) {
        if (!(data[i]["saledate"] in tempData1)) {
            tempData1[data[i]["saledate"]] = {
                "house with 2 bedrooms": 0,
                "house with 3 bedrooms": 0,
                "house with 4 bedrooms": 0,
                "house with 5 bedrooms": 0,
                "unit with 1 bedrooms": 0,
                "unit with 2 bedrooms": 0,
                "unit with 3 bedrooms": 0,
            }
        }
        let class_str = data[i]["type"] + " with " + data[i]["bedrooms"] + " bedrooms";
        tempData1[data[i]["saledate"]][class_str] = +data[i]["MA"];
    }

    var tempData2 = [];
    for (const [key, value] of Object.entries(tempData1)) {
        value["date"] = moment(key, "DD/MM/YYYY").toDate();
        tempData2.push(value);
    }
    tempData2.sort((a, b) => a["date"] - b["date"]);
    data = tempData2;

    // List of groups (columns of the data)
    var keys = Object.keys(data[0]).slice(0, -1);

    
    // const color = d3.scaleOrdinal()
        // .domain(keys)
        // .range(keys.map(key => {
            // return key.startsWith('house') ? d3.interpolateBlues(Math.random() * 0.6 + 0.5)
                                           // : d3.interpolateOranges(Math.random() * 0.5 + 0.5);
        // }));
		
	// Color palette based on property type and bedrooms
	const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeDark2);
		
    // Append clickable legend with interactivity to hide/show streams
    var blocks = document.getElementById('blocks');
    let html = "";
    keys.forEach((key, i) => {
        html += `<div class="list-group-item" style="background-color:${color(key)}" onclick="toggleStream('${key}')">${key}</div>`;
    });
    blocks.innerHTML = html;

    let activeKeys = keys.slice();  // Store active keys to handle show/hide functionality

    function toggleStream(key) {
        if (activeKeys.includes(key)) {
            activeKeys = activeKeys.filter(k => k !== key);
        } else {
            activeKeys.push(key);
        }
        render(activeKeys);  // Re-render chart with updated activeKeys
    }
	
	// Enable reordering of streams using Sortable.js
    var sortable = new Sortable(blocks, {
        animation: 150,
        onEnd: function (evt) {
            let newOrder = [];
            let blocks_divs = blocks.getElementsByTagName("div");
            for (let i = 0; i < blocks_divs.length; i++) {
                newOrder.push(blocks_divs[i].textContent);
            }
            render(newOrder);
        }
    });
	
	
    // Call the initial rendering
    render(keys);

    function render(keys) {
        svg.selectAll('*').remove();

        let new_keys = Array.from(keys).reverse();

        // Add X axis
        const x_scale = d3.scaleLinear()
            .domain(d3.extent(data, d => d["date"]))
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0, ${height * 0.8})`)
            .call(d3.axisBottom(x_scale).ticks(4).tickFormat(d3.utcFormat("%B %d, %Y")).tickSize(-height * 0.7))
            .select(".domain").remove();

        svg.selectAll(".tick line").attr("stroke", "#b8b8b8");

        svg.append("text")
            .attr("text-anchor", "start")
            .attr("x", width - 280)
            .attr("y", height - 40)
            .text("Date");

        // Add Y axis
        const y_scale = d3.scaleLinear()
            .domain([-4000000, 4000000])
            .range([height, 0]);

        // Stack the data
        const stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(new_keys)
            (data);
			
		// Create a tooltip
        const Tooltip = svg
            .append("g")
            .style("opacity", 0)
            .attr("class", "tooltip");

        Tooltip.append("rect")
            .attr("width", 220)
            .attr("height", 30)
            .attr("fill", "white")
            .style("opacity", 0.8);

        Tooltip.append("text")
            .attr("x", 90)
            .attr("y", 25)
            .attr("text-anchor", "middle");

        // Mouse event handlers for tooltip
        const mouseover = function (event, d) {
            Tooltip.style("opacity", 1);
            d3.selectAll(".myArea").style("opacity", 0.2);
            d3.select(this)
                .style("stroke", "#ffffff")
                .style("opacity", 1);
        };
        const mousemove = function (event, d) {
			const [x, y] = d3.pointer(event);
            let grp = d.key;
			Tooltip.select("text").text(`Property Type: ${grp}`);
            Tooltip.attr("transform", `translate(${x},${y - 70})`);
            // let format = d3.utcFormat("%B %d, %Y");
            // Tooltip.text(grp);
        };
        const mouseleave = function (event, d) {
            Tooltip.style("opacity", 0);
            d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none");
        };

        // Area generator with smooth curve
        const area = d3.area()
            .curve(d3.curveBasis)  // Smooth curve (cubic basis)
            .x(d => x_scale(d.data["date"]))
            .y0(d => y_scale(d[0]))
            .y1(d => y_scale(d[1]));

        // Show the areas with transition
        svg
            .selectAll("mylayers")
            .data(stackedData)
            .join("path")
            .attr("class", "myArea")
            .style("fill", d => color(d.key))
            .attr("d", area)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .transition()  // Apply transition for smooth reordering
            .duration(100);
    }
});
