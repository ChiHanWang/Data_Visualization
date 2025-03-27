// 設置圖表的尺寸和邊距
var margin = { top: 30, right: 30, bottom: 60, left: 80 },
    width = 1000 - margin.left - margin.right,  //放大圖表寬度
    height = 600 - margin.top - margin.bottom;  //放大圖表高度

// 建立 SVG 元素
var svg = d3.select("#my_parallel_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")  //讓SVG成為區塊元素
    .style("margin", "0 auto")  //CSS置中
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
// 顏色比例尺，用於不同的鳶尾花類別
var color = d3.scaleOrdinal()
	.domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
	.range(["#1f77b4", "#ff7f0e", "#2ca02c"]);
			
function pre_proccess(d) {
    for(let i = 0; i < d.length; i++){
        if (d[i]["sepal length"] === ""){
            // 刪除當前項目
            d.splice(i, 1)
        }
    }   
};

// 加載 iris.csv 資料
d3.csv("http://vis.lab.djosix.com:2024/data/iris.csv").then(function (data) {

    // 將存在缺失值得資料忽略處理
    pre_proccess(data)	
	
	// 使用 Object.keys() 來提取所有的軸名稱
	// Object.keys(data[0]) 用來獲取資料的所有欄位名稱
	// filter() 過濾掉 class 欄位，因為 class 是花卉種類欄位，不需要作為數值來繪製
	var dimensions = Object.keys(data[0]).filter(function(d) {
		return d !== "class";  // 排除分類欄位
	}); // ['sepal length', 'sepal width', 'petal length', 'petal width'], dimensions is array type

	// 對每個軸設定比例尺（線性比例）
	var y = {};
	dimensions.forEach(function(dimension) {
		y[dimension] = d3.scaleLinear()
			// 用來計算資料的最小值和最大值作為比例尺的 domain，轉換資料範圍
			.domain(d3.extent(data, function(d) { return +d[dimension]; }))
			// 定義了垂直方向上的繪製範圍，從圖表底部（height）到頂部（0）
			.range([height, 0]);
	});

	// X 軸的比例尺，用於定位每個軸
	// d3.scalePoint() 創建一個點比例尺，將每個維度（欄位）的位置均勻分佈在 X 軸上
	var x = d3.scalePoint()
		// 定義了 X 軸的繪製範圍
		.range([0, width])
		// 添加軸之間的間隔
		.padding(1)
		// 設置 X 軸上的欄位名稱
		.domain(dimensions);



	// Iris-setosa
	svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 828)
        .attr("y", 200)
        .text("Iris-setosa");

    svg.append("line")
        .attr("x1", 860)
        .attr("y1", 195)
        .attr("x2", 880)
        .attr("y2", 195)
        .style("stroke", "#1f77b4ff")
		.style("stroke-width", 5);

	// Iris-versicolor
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 850)
        .attr("y", 220)
        .text("Iris-versicolor");

    svg.append("line")
		.attr("x1", 860)
		.attr("y1", 215)
		.attr("x2", 880)
		.attr("y2", 215)
        .attr("r", 5)
        .style("stroke", "#ff7f0eff")
		.style("stroke-width", 5);

	// Iris-virginica
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 840)
        .attr("y", 240)
        .text("Iris-virginica");

    svg.append("line")
		.attr("x1", 860)
		.attr("y1", 235)
		.attr("x2", 880)
		.attr("y2", 235)
        .style("stroke", "#2ca02cff")
		.style("stroke-width", 5);

	// rectangle
	svg.append("rect")
		.attr("x", 740)
		.attr("y", 180)
		.attr("width", 150)
		.attr("height", 70)
		.style("stroke", "#000000ff")
		.style("fill", "none");
		
	// 畫每個軸（垂直線）
	svg.selectAll("myAxis")
		.data(dimensions)
		.enter()
		.append("g")
		.attr("class", "axis")
		.attr("transform", function(d) { return "translate(" + x(d) + ")"; })
		.each(function(d) { d3.select(this).call(d3.axisLeft(y[d])); });
		

	// 添加每個軸的標籤
	svg.selectAll("axisLabel")
		.data(dimensions)
		.enter()
		.append("text")
		.attr("class", "axis-label")
		.attr("x", function(d) { return x(d); })
		.attr("y", -10) // 位於軸的上方
		.style("text-anchor", "middle")
		.style("font-weight", "bold")
		.style("font-size", "20px")
		.text(function(d) { return d; })
		// 讓使用者能夠拖動調整座標軸與標籤的順序
		.call(d3.drag()
			.subject(function(event, d) { return { x: x(d) }; })
			.on("start", function(event, d) {
				/* dragging has a key-value, 舉例當我滑鼠點sepal length, 
				dragging會等於 {"sepal length" : sepal length 的起始座標值} */
				dragging[d] = x(d);
				console.log(dragging);
				svg.selectAll(".line").attr("d", path); // 更新線
			})
			.on("drag", function(event, d) {
				// 舉例: 當挪動滑鼠時, dragging[sepal length] changed 
				// event.x是滑鼠座標
				dragging[d] = Math.min(width, Math.max(0, event.x));
				x.domain(dimensions.sort(function(a, b) { return position(a) - position(b); }));
				svg.selectAll(".line").attr("d", path);
				svg.selectAll(".axis").attr("transform", function(d) { return "translate(" + position(d) + ")"; });
				svg.selectAll(".axis-label").attr("x", function(d) {return position(d); });
			})
			.on("end", function(event, d) {
				delete dragging[d];
				transition(svg.selectAll(".line").attr("d", path));
				transition(svg.selectAll(".axis").attr("transform", function(d) { return "translate(" + x(d) + ")"; }));
				transition(svg.selectAll(".axis-label").attr("x", function(d) { return x(d); }));
			}));

	var dragging = {};
	
	function position(d) {
		// if true, return x(d), else return dragging[d]
		return (dragging[d] == null) ? x(d) : dragging[d];
	}

	function transition(g) {
		return g.transition().duration(500);
	}
	
	// 畫線，連接每個花卉樣本的數據點
	function path(d) {
		return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
	}
	// 畫線條（多邊形線，代表花卉樣本）
	svg.selectAll("myPath")
		.data(data)
		.enter()
		.append("path")
		.attr("class", "line")
		.attr("d", path)
		.style("stroke", function(d) { return color(d.class); })
		.attr("fill", "none");

});
