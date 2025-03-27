// 設置圖表的尺寸和邊距
var margin = { top: 30, right: 30, bottom: 60, left: 80 },
    width = 800 - margin.left - margin.right,  //放大圖表寬度
    height = 600 - margin.top - margin.bottom;  //放大圖表高度

// 建立 SVG 元素
var svg = d3.select("#my_scatter_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")  //讓SVG成為區塊元素
    .style("margin", "0 auto")  //CSS置中
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function pre_process(d) {
    for(let i = 0; i < d.length; i++){
        if (d[i]["sepal length"] === ""){
            // 刪除當前項目
            d.splice(i, 1)
            console.log(d)
        }
    }   
};

// 加載 iris.csv 資料
d3.csv("http://vis.lab.djosix.com:2024/data/iris.csv").then(function (data) {

    // 將存在缺失值得資料忽略處理
    pre_process(data)

    // 設定 X 軸和 Y 軸的比例尺
    // range定義輸出圖表的顯示範圍（座標軸線的長短）
	// scaleLinear()代表線性比例尺
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // 建立顏色比例尺
    var color = d3.scaleOrdinal()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range(["#ffa07aff", "#32cd32ff", "#fde725ff"]);

    // 畫 X 軸 
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")");

    // 畫 Y 軸
    var yAxis = svg.append("g");

    // 添加 X 軸標籤
    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)  // 設定標籤位置（下方距離 X 軸一段距離）
        .text("X-axis");  // 預設標籤，可以動態更新

    // 添加 Y 軸標籤
    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")  // 旋轉標籤
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)  // 設定標籤位置
        .text("Y-axis");  // 預設標籤，可以動態更新
    

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 700)
        .attr("y", -10)
        .text("Iris-setosa");

    svg.append("circle")
        .attr("text-anchor", "end")
        .attr("cx", 710)
        .attr("cy", -15)
        .attr("r", 5)
        .style("fill", "#ffa07aff")

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 700)
        .attr("y", 5)
        .text("Iris-versicolor");

    svg.append("circle")
        .attr("text-anchor", "end")
        .attr("cx", 710)
        .attr("cy", 0)
        .attr("r", 5)
        .style("fill", "#32cd32ff")

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 700)
        .attr("y", 20)
        .text("Iris-virginica");

    svg.append("circle")
        .attr("text-anchor", "end")
        .attr("cx", 710)
        .attr("cy", 18)
        .attr("r", 5)
        .style("fill", "#fde725ff")

    // 建立 tooltip（提示框）
    var tooltip = d3.select("#my_scatter_plot")
                    .append("div")
                    .style("position", "absolute")
                    .style("visibility", "hidden")
                    .style("background-color", "pink")
                    .style("border", "1px solid #ccc")
                    .style("padding", "5px")
                    .style("border-radius", "5px")
                    .style("font-size", "12px");


    // 初始圖表繪製
    function updateChart(selectedX, selectedY) {

        // 設定 domain 為過濾後資料的範圍,即定義輸入圖表資料的上下限（座標軸上的數字）
        x.domain([d3.min(data, d => +d[selectedX]) - 1, d3.max(data, d => +d[selectedX]) + 1]);
        y.domain([d3.min(data, d => +d[selectedY]) - 1, d3.max(data, d => +d[selectedY]) + 1]);

        // 更新 X 軸
        xAxis.call(d3.axisBottom(x));

        // 更新 Y 軸
        yAxis.call(d3.axisLeft(y));
		
		// 更新 X 軸標籤的文字
		svg.select(".x-label")
			.text(selectedX);

		// 更新 Y 軸標籤的文字
		svg.select(".y-label")
			.text(selectedY);

        // 綁定資料，更新散點
        var dots = svg.selectAll(".dot").data(data);

        dots.enter()
            .append("circle")
            .attr("class", "dot")
            .merge(dots)
            .attr("cx", d => x(+d[selectedX]))
            .attr("cy", d => y(+d[selectedY]))
            .attr("r", 5)
            .style("fill", d => color(d.class))
            // 增加滑鼠移入事件來顯示 tooltip
            .on("mouseover", function (event, d) {
                tooltip.style("visibility", "visible")
                    .html("X: " + d[selectedX] + "<br>Y: " + d[selectedY]);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });

        dots.exit().remove();
    }

    // 初始化圖表（使用初始選擇的軸）
    updateChart("sepal length", "sepal length");

    // 當使用者改變 X 或 Y 軸的選擇時，重新繪製圖表
    d3.select("#xSelect").on("change", function () {
        var selectedX = d3.select(this).property("value");
        var selectedY = d3.select("#ySelect").property("value");
        updateChart(selectedX, selectedY);
    });

    d3.select("#ySelect").on("change", function () {
        var selectedX = d3.select("#xSelect").property("value");
        var selectedY = d3.select(this).property("value");
        updateChart(selectedX, selectedY);
    });
});
