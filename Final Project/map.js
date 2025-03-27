// 設定邊距與地圖大小
const margin = {top: 30, right: 30, bottom: 60, left: 80 },
      width = 1200 - margin.left - margin.right,
      height = 650 - margin.top - margin.bottom;

// 建立 SVG 元素
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const countryNameMapping = {
    "United States": "USA",
    "United Kingdom": "England",
    // 添加更多對應
};
const countryCoordinates = {
  "Singapore": [103.8198, 1.3521], // 新加坡
};

const continentBounds = {
    "World": [[-180, -90], [180, 90]],
    "Asia": [[40, 0], [150, 55]],
    "Africa": [[-20, -35], [55, 40]],
    "Europe": [[0, 35], [40, 65]],
    "North America": [[-168, 7], [-52, 83]],
    "South America": [[-85, -60], [-30, 15]],
    "Oceania": [[120, -55], [178, 0]]
};

// 地圖投影
const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

const tooltip = d3.select("#tooltip");

// 地圖路徑生成器
const path = d3.geoPath().projection(projection);

// 播放狀態
let isPlaying = false;
let playInterval;

Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("./filtered_covid_deaths.csv")
]).then(([geoData, csvData]) => {
    const countries = csvData.columns.slice(1);
    const dates = csvData.map(row => row.date);
    const dataByDate = {};

    csvData.forEach(row => {
        const date = row.date;
        dataByDate[date] = {};
        countries.forEach(country => {
            dataByDate[date][country] = +row[country] || 0;
        });
    });

    countries.forEach(country => {
      const geoFeature = geoData.features.find(d => d.properties.name.toLowerCase() === country.toLowerCase());
      if (!geoFeature) {
          console.log(`Country ${country} not found in GeoJSON.`);
      } else {
          const coords = d3.geoCentroid(geoFeature);
          if (!coords || coords.some(isNaN)) {
              console.log(`Invalid coordinates for country: ${country}`);
          }
      }
    });

    const slider = d3.select("#slider")
        .attr("min", 0)
        .attr("max", dates.length - 1)
        .on("input", function () {
            const index = +this.value;
            updateMap(dates[index]);
            updateTooltipPosition(index);
            stopPlaying(); // 暫停播放
        });

    const leftButton = d3.select("#leftButton").on("click", () => {
        slider.property("value", 0);
        updateMap(dates[0]);
        updateTooltipPosition(0);
        stopPlaying(); // 暫停播放
    });

    const rightButton = d3.select("#rightButton").on("click", () => {
        slider.property("value", dates.length - 1);
        updateMap(dates[dates.length - 1]);
        updateTooltipPosition(dates.length - 1);
        stopPlaying(); // 暫停播放
    });
	
	// 播放按鈕圖片切換
	const playButton = d3.select("#playButton img");
	function togglePlayPause() {
		if (isPlaying) {
			playButton.attr("src", "play-button.png");
			stopPlaying();
		} else {
			playButton.attr("src", "pause-button.png");
			startPlaying();
		}
	}
	
	// 監聽播放按鈕點擊事件
	d3.select("#playButton").on("click", togglePlayPause);

	// 開始播放
	function startPlaying() {
		isPlaying = true;
		let index = +slider.property("value");
		playInterval = setInterval(() => {
			if (index < dates.length - 1) {
				index++;
				slider.property("value", index);
				updateMap(dates[index]);
				updateTooltipPosition(index);
			} else {
				stopPlaying(); // 自動停止播放
			}
		}, 10); // 每 10 毫秒移動一次
	}

	// 停止播放
	function stopPlaying() {
		isPlaying = false;
		clearInterval(playInterval);
	}

    const dropdown = d3.select("#dropdown").on("change", function () {
        const selectedContinent = this.value;
        zoomToContinent(selectedContinent);
    });

    // 顏色與大小縮放
    const color = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(csvData, d => d3.max(countries.map(c => +d[c])))]);

    const size = d3.scaleSqrt()
        .domain([0, d3.max(csvData, d => d3.max(countries.map(c => +d[c])))])
        .range([0, 50]);

    svg.append("g")
        .selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#F3F3FA")
        .attr("stroke", "#333");

    const bubbles = svg.append("g");

    function updateMap(date) {
        const data = dataByDate[date];
        const bubbleData = countries.map(country => {
            const mappedCountry = countryNameMapping[country] || country; // 使用對應名稱
            const geoFeature = geoData.features.find(d => d.properties.name === mappedCountry);
            const coords = geoFeature ? d3.geoCentroid(geoFeature) : countryCoordinates[country] || null;
            return coords ? { country, value: data[country], coordinates: projection(coords) } : null;
        }).filter(d => d && d.value > 0);

        const circles = bubbles.selectAll("circle")
            .data(bubbleData, d => d.country);

        circles.enter()
            .append("circle")
            .merge(circles)
            .attr("cx", d => d.coordinates[0])
            .attr("cy", d => d.coordinates[1])
            .attr("r", d => size(d.value))
            .style("fill", d => color(d.value))
            .attr("stroke", "#333")
            .attr("stroke-width", 0.5)
            .attr("fill-opacity", 0.7);

        circles.exit().remove();
    }

    function zoomToContinent(continent) {
        const bounds = continentBounds[continent];
        if (!bounds) return;

        const [[x0, y0], [x1, y1]] = bounds;

        if (continent === "World") {
            projection.scale(150).translate([width / 2, height / 2 + 180]);
            // 重置所有國家的透明度
            svg.selectAll("path")
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);

            bubbles.selectAll("circle")
                .style("fill-opacity", 0.7)
                .style("stroke-opacity", 1);
        } else {
            projection.fitExtent(
                [[margin.left, margin.top], [width + margin.right, height + margin.bottom]],
                {
                    type: "FeatureCollection",
                    features: geoData.features.filter(feature => {
                        const [lon, lat] = d3.geoCentroid(feature);
                        return lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1;
                    })
                }
            );
            // 篩選屬於該大洲的國家
            const selectedCountries = geoData.features
                .filter(feature => {
                    const [lon, lat] = d3.geoCentroid(feature);
                    return lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1;
                })
                .map(feature => feature.properties.name);
    
            // 更新地圖透明度
            svg.selectAll("path")
                .attr("fill-opacity", d => selectedCountries.includes(d.properties.name) ? 1 : 0.3)
                .attr("stroke-opacity", d => selectedCountries.includes(d.properties.name) ? 1 : 0.3);
    
            // 更新氣泡透明度
            bubbles.selectAll("circle")
                .style("fill-opacity", d => selectedCountries.includes(d.country) ? 0.7 : 0.2)
                .style("stroke-opacity", d => selectedCountries.includes(d.country) ? 1 : 0.2);
        }

        svg.selectAll("path").attr("d", path);
        updateMap(dates[slider.property("value")]);
    }

    function updateTooltipPosition(index) {
        const sliderElement = document.getElementById("slider");
        const rect = sliderElement.getBoundingClientRect();
        const thumbWidth = 15; // 滑桿拇指的寬度
        const sliderWidth = rect.width - thumbWidth;
        // 計算 tooltip 的水平位置
		const position = (index / (dates.length - 1)) * sliderWidth + rect.left + thumbWidth / 2;
		// 更新 tooltip 的樣式
		tooltip.style("left", `${position - 50}px`)
			   .style("top", `${rect.top - 35}px`) // 提高位置，讓 tooltip 顯示在滑桿正上方
			   .style("width", "80px") // 增加 tooltip 的寬度
			   .style("height", "20px") // 增加 tooltip 的高度
			   .style("font-size", "12px") // 增加字體大小
			   .style("font-family", "'Comic Sans MS', cursive, sans-serif") // 改為 Comic Sans MS
			   .style("text-align", "center") // 水平置中
			   .style("line-height", "20px") // 垂直置中
			   .text(dates[index]);
    }

    function startPlaying() {
        isPlaying = true;
        playButton.text("Pause");
        let index = +slider.property("value");
        playInterval = setInterval(() => {
            if (index < dates.length - 1) {
                index++;
                slider.property("value", index);
                updateMap(dates[index]);
                updateTooltipPosition(index);
            } else {
                stopPlaying(); // 自動停止播放
            }
        }, 10); // 每 10 毫秒移動一次
    }

    function stopPlaying() {
        isPlaying = false;
        playButton.text("Play");
        clearInterval(playInterval);
    }

    function createLegend() {
        const legendContainer = d3.select("#legend");
        const legendData = [
            { color: "#FFF5F0", range: "0 - 1,000" },
            { color: "#FEE0D2", range: "1,001 - 10,000" },
            { color: "#FCBBA1", range: "10,001 - 50,000" },
            { color: "#FC9272", range: "50,001 - 100,000" },
            { color: "#FB6A4A", range: "100,001 - 500,000" },
            { color: "#CB181D", range: "> 500,000" }
        ];
    
        // 清空圖例
        legendContainer.selectAll("*").remove();
    
        legendData.forEach(d => {
            const legendItem = legendContainer.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("gap", "5px");
    
            legendItem.append("div")
                .style("width", "50px")
                .style("height", "20px")
                .style("background-color", d.color)
                .style("border", "1px solid #333")
                .style("border-radius", "2px");
    
            legendItem.append("span")
                .text(d.range)
                .style("font-size", "14px")
                .style("color", "#333");
        });
    }

    slider.property("value", 0);
    updateMap(dates[0]);
    zoomToContinent("World");
    updateTooltipPosition;
    createLegend(); // 呼叫圖例函數
});