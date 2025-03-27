// 設定圖表尺寸和邊距
const margin = { top: 50, right: 250, bottom: 50, left: 100 };
const width = 1800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let sortAscending = false; // 預設排序方式為從大到小

// 加載資料
d3.csv("./filtered_covid_deaths.csv").then(data => {

    const dateColumnName = Object.keys(data[0])[0];
    const countries = Object.keys(data[0]).slice(1);
    const formattedData = [];

    data.forEach(row => {
        const rawDate = row[dateColumnName];
        if (rawDate) {
            const dateParts = rawDate.split("-");
            const formattedDate = new Date(
                +dateParts[0],
                +dateParts[1] - 1,
                +dateParts[2]
            );
            countries.forEach(country => {
                formattedData.push({
                    date: formattedDate,
                    country: country,
                    deaths: +row[country] || 0,
                });
            });
        }
    });

    const groupedData = d3.group(formattedData, d => d.date);
    const dates = Array.from(groupedData.keys()).sort((a, b) => a - b);

    const x = d3.scaleLinear().range([0, width - 200]);
    const y = d3.scaleBand().range([0, height]).padding(0.1);
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(countries);

    const updateChart = (currentData, currentDate) => {
        const top10 = currentData.sort((a, b) => sortAscending ? a.deaths - b.deaths : b.deaths - a.deaths).slice(0, 10);
        const totalDeaths = currentData.reduce((sum, d) => sum + d.deaths, 0);

        x.domain([0, d3.max(top10, d => d.deaths)]);
        y.domain(top10.map(d => d.country));

        svg.selectAll(".x-axis").remove();
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(5))
            .selectAll("text")
            .style("font-size", "14px");

        // 添加 X 軸標籤
        svg.selectAll(".x-axis-label").remove(); // 確保每次更新刪除舊標籤
        svg.append("text")
            .attr("class", "x-axis-label")
            .style("font-size", "24px")
            .attr("text-anchor", "middle")
            .attr("x", width / 2 + 600)
            .attr("y", height + margin.bottom - 0)
            .text("Total Death Number");

        svg.selectAll(".grid").remove(); // 確保每次更新刪除舊標籤
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)
            .ticks(5)
            .tickSize(-height)
            .tickFormat(""));

        svg.selectAll(".y-axis").remove();
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).tickSize(0))
            .selectAll("text")
            .style("font-size", "14px");

        // 添加 Y 軸標籤
        svg.selectAll(".y-axis-label").remove(); // 確保每次更新刪除舊標籤
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .attr("transform", `translate(${-margin.left + 100}, ${height / 2 - 380})`)
            .text("Country");

        const bars = svg.selectAll(".bar")
            .data(top10, d => d.country);

        bars.exit().remove();

        bars.transition()
            .duration(100)
            .attr("x", 0)
            .attr("y", d => y(d.country))
            .attr("width", d => x(d.deaths))
            .attr("height", y.bandwidth())
            .attr("fill", d => color(d.country));

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.country))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.deaths))
            .attr("fill", d => color(d.country))
            .append("title")
            .text(d => `${d.country}: ${d.deaths}`);

        const labels = svg.selectAll(".label")
            .data(top10, d => d.country);

        labels.exit().remove();

        labels.transition()
            .duration(100)
            .attr("x", d => x(d.deaths) + 5)
            .attr("y", d => y(d.country) + y.bandwidth() / 2 + 5)
            .text(d => d.deaths.toLocaleString());

        labels.enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d.deaths) + 5)
            .attr("y", d => y(d.country) + y.bandwidth() / 2 + 5)
            .text(d => d.deaths.toLocaleString())
            .style("font-size", "14px")
            .style("fill", "black");

        const currentDateText = svg.selectAll(".current-date-text")
        .data([currentDate]);

        currentDateText.exit().remove();

        currentDateText.enter()
            .append("text")
            .attr("class", "current-date-text")
            .attr("x", width - 450) // 偏右
            .attr("y", height - 350) // 偏下
            .style("font-size", "64px")
            .style("fill", "gray")
            .merge(currentDateText)
            .text(`${currentDate.toISOString().split("T")[0]}`);

        const totalDeathsText = svg.selectAll(".total-deaths-text")
            .data([totalDeaths]);
    
        totalDeathsText.exit().remove();
    
        totalDeathsText.enter()
            .append("text")
            .attr("class", "total-deaths-text")
            .attr("x", width - 450) // 偏右
            .attr("y", height - 300) // 偏下，位置比日期稍上
            .style("font-size", "40px")
            .style("fill", "gray")
            .merge(totalDeathsText)
            .text(`Total: ${totalDeaths.toLocaleString()}`);
    };

    let i = 0;
    let playing = true;

    const interval = setInterval(() => {
        if (playing) {
            if (i < dates.length) {
                const currentDate = dates[i];
                const currentData = groupedData.get(currentDate);

                updateChart(currentData, currentDate);

                i++;
            } else {
                clearInterval(interval);
            }
        }
    }, 10);

    const playButton = d3.select("#playButton img");
    function togglePlayPause() {
        playing = !playing;
        playButton.attr("src", playing ? "pause-button.png" : "play-button.png");
    }
    d3.select("#playButton").on("click", togglePlayPause);

    d3.select("#HighestButton").on("click", () => {
        HighestButton.style.backgroundColor = "black";
        HighestButton.style.color = "white";
        LowestButton.style.backgroundColor = "white";
        LowestButton.style.color = "black";
        sortAscending = false;
        if (i > 0 && i < dates.length) {
            const currentDate = dates[i - 1];
            const currentData = groupedData.get(currentDate);
            updateChart(currentData, currentDate);
        }
    });
    d3.select("#LowestButton").on("click", () => {
        HighestButton.style.backgroundColor = "white";
        HighestButton.style.color = "black";
        LowestButton.style.backgroundColor = "black";
        LowestButton.style.color = "white";
        sortAscending = true;
        if (i > 0 && i < dates.length) {
            const currentDate = dates[i - 1];
            const currentData = groupedData.get(currentDate);
            updateChart(currentData, currentDate);
        }
    });
});


