const margin = { top: 50, right: 250, bottom: 50, left: 100 },
      width = 1300 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

const svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const parseDate = d3.timeParse("%Y-%m-%d");

d3.csv("filtered_covid_deaths.csv").then(data => {
    // Parse data
    data.forEach(d => {
        d.date = parseDate(d.date);
        for (let key in d) {
            if (key !== "date") d[key] = +d[key];
        }
    });

    const countries = data.columns.slice(1);

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(countries, key => d[key]))])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x-axis") // 添加類別
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "y-axis") // 添加類別
        .call(d3.axisLeft(yScale));

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(countries);

    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));

    const countryData = countries.map(country => ({
        key: country,
        values: data.map(d => ({ date: d.date, value: d[country] })),
        visible: true
    }));

    const lines = svg.selectAll(".line")
        .data(countryData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", d => colorScale(d.key))
        .style("fill", "none")
        .style("stroke-width", 1.5);

    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.8)")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("pointer-events", "none")
        .style("display", "none")
        .style('font-family', "'Comic Sans MS', cursive, sans-serif")
        .style("font-size", "14px")
        .style("text-align", "left");
    // Add mouse-over effects
    const mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    const mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(countryData)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", d => colorScale(d.key))
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

    mouseG.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', () => {
            d3.select(".mouse-line").style("opacity", "0");
            d3.selectAll(".mouse-per-line circle").style("opacity", "0");
            d3.selectAll(".mouse-per-line text").style("opacity", "0");
            tooltip.style("display", "none");
        })
        .on('mouseover', () => {
            d3.select(".mouse-line").style("opacity", "1");
            d3.selectAll(".mouse-per-line circle").style("opacity", "1");
            d3.selectAll(".mouse-per-line text").style("opacity", "1");
        })
        .on('mousemove', function(event) {
            const mouse = d3.pointer(event);
            const date = xScale.invert(mouse[0]);

            const closestData = data.reduce((prev, curr) =>
                Math.abs(curr.date - date) < Math.abs(prev.date - date) ? curr : prev
            );

            const topCountries = countries
                .map(country => ({ country, value: closestData[country] }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            d3.select(".mouse-line")
                .attr("d", `M${mouse[0]},${height} ${mouse[0]},0`);

            d3.selectAll(".mouse-per-line")
                .attr("transform", d => {
                    const xDate = date;
                    const idx = d.values.findIndex(v => v.date >= xDate);
                    const pos = {
                        x: mouse[0],
                        y: yScale(d.values[idx]?.value || 0)
                    };
                    return `translate(${pos.x},${pos.y})`;
                });

            tooltip
                .html(
                    `<strong>${d3.timeFormat("%Y/%m/%d")(date)}</strong><br>` +
                    topCountries.map(d => `${d.country}: ${d.value}`).join("<br>")
                )
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`)
                .style("display", "block");
        });

        const sliderWidth = width;
        const sliderRange = d3
        .sliderBottom()
        .min(d3.min(data, d => d.date))
        .max(d3.max(data, d => d.date))
        .width(sliderWidth)
        .tickFormat(d3.timeFormat('%Y-%m-%d'))
        .ticks(3)
        .default([d3.min(data, d => d.date), d3.max(data, d => d.date)])
        .fill('#85bb65');
    
        sliderRange.on('onchange', val => {
            // 篩選數據
            const filteredData = data.filter(d => d.date >= val[0] && d.date <= val[1]);
        
            // 更新 xScale 和 yScale 的 domain
            xScale.domain([val[0], val[1]]);
            yScale.domain([
                0,
                d3.max(filteredData, d => d3.max(countries, country => d[country]))
            ]);
        
            // 更新軸
            svg.select(".x-axis") // 更新 X 軸
                .call(d3.axisBottom(xScale));

            svg.select(".y-axis") // 更新 Y 軸
                .call(d3.axisLeft(yScale));
        
            // 更新折線
            lines.attr("d", d => 
                line(d.values.filter(dd => dd.date >= val[0] && dd.date <= val[1]))
            );
        });
    
    // 繪製滑塊
    const gRange = d3.select('#slider-range')
        .append('svg')
        .attr('width', sliderWidth + 300)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(90,30)');
    
    gRange.call(sliderRange);
    


    // Create checkbox container
    const checkboxContainer = d3.select("#my_dataviz").append("div")
        .attr("id", "checkbox-container")
        .style("position", "absolute")
        .style("top", `${margin.top}px`)
        .style("right", `${margin.right - 200}px`)
        .style("width", "200px")
        .style("height", `${height}px`)
        .style("overflow-y", "auto")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("background-color", "#f9f9f9")
        .style("text-align", "left");

    // Add "Select All" checkbox
    checkboxContainer.append("input")
        .attr("type", "checkbox")
        .attr("id", "select-all")
        .property("checked", true)
        .on("change", function() {
            const isChecked = this.checked;
            d3.selectAll(".country-checkbox")
                .property("checked", isChecked);
            toggleCountries(isChecked ? countries : []);
        });

    checkboxContainer.append("label")
        .attr("for", "select-all")
        .text("Select All")
        .style("color", "#996B1F");

    checkboxContainer.append("br");

    // Add checkboxes for each country
    countries.forEach(country => {
        const checkbox = checkboxContainer.append("input")
            .attr("type", "checkbox")
            .attr("class", "country-checkbox")
            .attr("id", `checkbox-${country}`)
            .attr("value", country)
            .property("checked", true)
            .on("change", function() {
                const selectedCountries = d3.selectAll(".country-checkbox")
                    .nodes()
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value);
                toggleCountries(selectedCountries);

                // Update "Select All" checkbox state
                const allChecked = selectedCountries.length === countries.length;
                d3.select("#select-all").property("checked", allChecked);
            });

        checkboxContainer.append("label")
            .attr("for", `checkbox-${country}`)
            .text(country);

        checkboxContainer.append("br");
    });

    function toggleCountries(selectedCountries) {
        countryData.forEach(d => d.visible = selectedCountries.includes(d.key));

        // Update line visibility
        lines.style("display", d => (countryData.find(cd => cd.key === d.key).visible ? null : "none"));
    }
    
}).catch(err => console.error("Error loading data:", err));
