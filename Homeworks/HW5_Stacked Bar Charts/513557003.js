// set the dimensions and margins of the graph
const margin = { top: 80, right: 20, bottom: 50, left: 400 };
const width = 1500 - margin.left - margin.right;
const height = 20000 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#stacked_bar_chart")
    .append("svg")
    .attr("width", "1500px")
    .attr("height", "20000px")
	// .attr("viewBox", "0 0 450 5000") 
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const data_path = "http://vis.lab.djosix.com:2024/data/TIMES_WorldUniversityRankings_2024.csv"
const features = ["scores_teaching", "scores_research", "scores_citations", "scores_industry_income", "scores_international_outlook"];
const color = d3.scaleOrdinal(["#ee79b8", "#526eac", "#e9da38", "#abbc62", "#59a14f"]);

// parse the Data
d3.csv(data_path).then(function (data) {
    // console.log("data:", data)
    
    // console.log("features:", features)

    new_data = []
    for (let i = 0; i < data.length; i++) {
        if (data[i]["rank"] != "Reporter") {
            new_data.push({
                "name": data[i]["name"],
                "scores_overall": +data[i]["scores_overall"].split("–")[0],
                "scores_teaching": +data[i]["scores_teaching"],
                "scores_research": +data[i]["scores_research"],
                "scores_citations": +data[i]["scores_citations"],
                "scores_industry_income": +data[i]["scores_industry_income"],
                "scores_international_outlook": +data[i]["scores_international_outlook"],
            })
        }
    }
    // console.log("new_data:", new_data)
	
    function sort_data(data, sort_by, sort_order) {
        if (sort_order == "descending") {
            data.sort((a, b) => b[sort_by] - a[sort_by]);
        }
        else {
            data.sort((a, b) => a[sort_by] - b[sort_by]);
        }
        return data
    }
    
    function render_stacked_bar_charts(data) {
		// 此操作用於清除之前繪製的圖形，以便在重新渲染圖表時不會產生舊數據與新數據混在一起
		// 選擇 svg 中的所有元素（* 是通配符，表示選擇所有類型的元素，如 rect、g、text 等）
        svg.selectAll('*').remove();

        // stack the new_data
        const stack = d3.stack()
            .keys(features)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)
        const stackedData = stack(data)

        // X scale and Axis
        const formater = d3.format(".1s")
        const x_scale = d3.scaleLinear()
            .domain([0, 500])
            .range([0, width])

        // Y scale and Axis
        const y_scale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, height])
            .padding(.2);

        // set vertical grid line
        const grid_line = function () { return d3.axisBottom().scale(x_scale) };
        svg
            .append("g")
            .attr("class", "grid")
            .call(grid_line()
                .tickSize(height, 0, 0)
                .tickFormat("")
                .ticks(8)
        );

        // create a tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("id", "chart")
            .attr("class", "tooltip");

        // tooltip events
        const mouseover = function (d) {
            tooltip
                .style("opacity", .8)
            d3.select(this)
                .style("opacity", .5)
        }
        const mousemove = function (event, d) {
            tooltip
                .html((d[1] - d[0]).toFixed(1))
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px");
        }
        const mouseleave = function (d) {
            tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("opacity", 1)
        }
        
        // create bars
        const bars = svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => x_scale(d[0]))
            .attr("y", d => y_scale(d.data.name))
			// 初始寬度為0，用於動畫效果
			.attr("width", d => 0)
            .attr("height", y_scale.bandwidth())
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
			.transition()  // 動畫過渡效果
			.duration(1000) // 動畫持續時間
			.attr("width", d => x_scale(d[1]) - x_scale(d[0]));
        
        // set X and Y axis
        svg
            .append('g')
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x_scale).ticks(7).tickSize(0).tickPadding(6).tickFormat(formater))
            .call(d => d.select(".domain").remove());
        svg
            .append('g')
            .call(d3.axisLeft(y_scale).tickSize(0).tickPadding(8));

        // set Y axis label
        svg
            .append("text")
            .attr("class", "chart-label")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom / 2)
            .attr("text-anchor", "middle")
            .text("Each Score (0~100)")
        
        // set title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", -(margin.left) * 0.8)
            .attr("y", -(margin.top) / 1.5)
            .attr("text-anchor", "start")
            .text("Indicators for Times World University Rankings 2024")

        //set legend
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#ee79b8")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 20)
            .attr("y", -(margin.top / 2.5))
            .text("teaching")
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8 + 100)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#526eac")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 120)
            .attr("y", -(margin.top / 2.5))
            .text("research")
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8 + 200)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#e9da38")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 220)
            .attr("y", -(margin.top / 2.5))
            .text("citations")
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8 + 300)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#abbc62")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 320)
            .attr("y", -(margin.top / 2.5))
            .text("industry income")
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8 + 445)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#59a14f")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 465)
            .attr("y", -(margin.top / 2.5))
            .text("international outlook")
    }

    function onclick_button() {
        // console.log("onclick_button()!")
        let sort_by = document.querySelector("#sort-by").value
        let sort_order = document.querySelector("#sort-order").value

        // sort data
        let sorted_data = sort_data(new_data, sort_by, sort_order)
        // console.log("new_data:", new_data)
        // console.log("sorted_data:", sorted_data)

        // render stacked bar charts
        render_stacked_bar_charts(sorted_data)
    }

    const sort_button = document.querySelector("#sort-button");
    sort_button.addEventListener("click", onclick_button);

    onclick_button();
})