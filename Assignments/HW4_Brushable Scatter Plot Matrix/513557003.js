// 綜合下面兩行，圖表的"可繪製區域"不會佔據整個 250px x 250px 的大小，而是會扣掉內邊距
// 定義了每個子圖（例如散佈圖, 長條圖）的長和寬為 250 像素(250px x 250px 的大小)
var size = 250;
// 內邊距設置為 30 像素，為子圖裡的"繪製區域"與外部框架設置"邊距"，使圖形呈現更完整
var padding = 30;


// 定義x,y軸比例尺(scaleLinear)

// x 軸比例尺 (x): range([padding / 2, size - padding / 2]) 指定了 x 軸範圍的起點和終點
// "padding / 2" 確保數據點不會緊貼邊框，"size - padding / 2" 則設置了比例尺的最大範圍，這是根據圖表的大小進行調整
var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

// y 軸比例尺 (y): 和 x 軸相似，不同之處在於 y 軸的方向是自上而下的
// D3 使用 [size - padding / 2, padding / 2] 來實現這一點
// "size - padding / 2" 是最底部的位置，"padding / 2" 是最頂部的位置，因此這個範圍是從下到上的
var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

// d3.scaleOrdinal(): 使用"分類"比例尺來映射不同的分類值對應到不同的顏色
const color = d3.scaleOrdinal()
    .domain(["setosa", "versicolor", "virginica"])
    .range(["#ef402a", "#32cd32", "#ddac23"])
const features = ["sepal length", "sepal width", "petal length", "petal width"]


d3.csv("http://vis.lab.djosix.com:2024/data/iris.csv", function (data) {
    
    pre_process(data);
	
	// 用來儲存每個 trait (ex. sepal length, sepal width, petal length, petal width) 的"最大及最小值"範圍
    var rangeofTrait = {};
    var n = features.length;
	
	// 掃過features array裡每一個特徵
    features.forEach(function (trait) {
		
		// d3.extent 會遍歷整個 data, 並針對 input 的 trait 值, 
		// return 該 trait 在整個 data 中的最小值與最大值, 形成一個二元陣列 [min, max]
		// ex. rangeofTrait['sepal length'] = [4.3, 7.9]
        rangeofTrait[trait] = d3.extent(data, function (d) { return d[trait]; });
    });


    var brush = d3.brush()
        .on("start", brushstart)
        .on("brush", brushmove)
        .on("end", brushend)
        .extent([[15, 15], [size-15, size-15]]); // 定義了brush的範圍限制, 設定brush只能在每個子圖的範圍內進行，避免超出繪圖區域
	
	
	// 使用 D3.js 選取 HTML 中 id 為 brushable_scatter_plot_matrix 的 div 元素，並在其中創建一個新的 svg 元素來容納圖表
    var svg = d3.select("#brushable_scatter_plot_matrix").append("svg")
        .attr("width", size * n + padding)
        .attr("height", size * n + padding)
        .append("g") // g 用來將相關的圖形元素集合在一起
		
		// 使用 transform 屬性來平移整個 g 群組。這裡將群組向右和向下移動了 padding 和 padding / 2 個像素，讓圖形不至於貼邊
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");
	
    var cell = svg.selectAll(".cell") // 選擇 svg 中所有帶有 .cell 類別的元素
	
		// cross(features, features) 是一個生成所有trait兩兩組合的函數（包括同一特徵和自身的組合）
		// 散佈圖矩陣中的每個子圖代表一個特徵與另一個特徵之間的關係
        .data(cross(features, features))
		
		// .enter() 表示在資料綁定的同時，為每個新的資料點創建一個新的 g 元素
		// 這裡每個新的 g 群組對應一個子圖，也就是兩個特徵的組合
        .enter().append("g")
		
		// 為每個新創建的 g 元素添加一個 class 屬性，設置其類別為 .cell
		// 這樣以後可以通過這個類別來選擇或操作這些子圖
        .attr("class", "cell")
		
		// 用來決定散佈圖矩陣中每個子圖的位置，可想像僅是每一個"空白紙"的位置，還未將繪製的圖形放入其中
        .attr("transform", function (d) { return "translate(" + d.i * size + "," + d.j * size + ")"; })
        
		// 此處call function plot(p)
		.each(plot);
	
	// call brush function
    cell.call(brush);

    function plot(p) {
		
		// d3.select(this) 選擇當前 DOM 元素。這裡的 this 代表的是 cell 元素
        var cell = d3.select(this);

        x.domain(rangeofTrait[p.x]); // p.x會是4個trait的其中一個, p.x 可能是 sepal length
        y.domain(rangeofTrait[p.y]); // p.y會是4個trait的其中一個, p.y 可能是 sepal width

		// 用來將不同的特徵名（features）對應到散佈圖矩陣中的點位，並為每個特徵分配相應的位置
		// 整體作用: 這四個特徵，它們會被分佈到 0 到 1 之間的位置
		// sepal length 可能對應 0 , sepal width 可能對應 1/3, petal length 可能對應 2/3, petal width 可能對應 1
        var position = d3.scalePoint()
            
			// 輸入為4個trait的名稱
			.domain(features)
			
			// 輸出範圍
            .range([0, 1])
		console.log(position(p.x))	
			
		// 非對角線的子圖
        if (p.x != p.y) {
            // Add a 'g' at the right position
            var canvas = cell
                .append('g')
                .attr("transform", `translate(${position(p.x) + padding / 2},${position(p.y) + padding / 2})`);
            
			// 添增矩形將作為每個子圖裡"繪製區域"的框架
            canvas.append("rect")
			
				// 使用html中css的.frame, 為框架設置樣式
                .attr("class", "frame")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", size - padding)
                .attr("height", size - padding);

			// Add X Scale of each graph
            var x_extent = d3.extent(data, function (d) { return +d[p.x] }) // +d[p.x] 是將 d[p.x] 轉換為數值，因為數據可能以字串形式存儲
            var x1 = d3.scaleLinear()
                .domain(x_extent)
                .range([padding / 2, size - padding / 2]);

            // Add Y Scale of each graph
            var y_extent = d3.extent(data, function (d) { return +d[p.y] }) // +d[p.y] 是將 d[p.y] 轉換為數值
            var y1 = d3.scaleLinear()
                .domain(y_extent)
                .range([size - padding / 2, padding / 2]);

            // Add X and Y axis in canvas
            canvas.append("g")
			
				// 通過平移來定位 x 軸。將 x 軸"向下"平移到子圖的底部，即 y = size - padding，x 軸方向上略微向左移動 -padding / 2
                .attr("transform", `translate(${-padding / 2}, ${size - padding})`)
				
				// d3.axisBottom(): 用於生成 x 軸，並且放置在圖表的底部
				// scale(x1) 表示軸線應使用上面定義的 x1 比例尺來進行數據映射 
				// ticks() 用來指定該座標軸上要顯示多少個刻度, 但 D3 對於 ticks 的數量只有 5 的倍數可以使用
                .call(d3.axisBottom().scale(x1).ticks(6));
				
            canvas.append("g")
				
				// translate(x, y)
				// x（水平位移量）：0 表示在 X 軸方向上不進行位移
				// y（垂直位移量）：因為前面有一個負號，表示將元素沿 Y 軸方向"向上"移動 padding / 2 像素
                .attr("transform", `translate(0, ${-padding / 2})`)
				
				// d3.axisLeft(): 用於生成 y 軸，並且放置在圖表的左側
				// scale(y1) 使用了 y1 軸比例尺
                .call(d3.axisLeft().scale(y1).ticks(6));

            cell.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", function (d) { return x(d[p.x]); })
                .attr("cy", function (d) { return y(d[p.y]); })
                .attr("r", 4)
                .style("fill", function (d) { return color(d.class); });
        }
        else {
            // Add a 'g' at the right position
            var canvas = cell
                .append('g')
				// JavaScript 會首先計算 position(p.x) + padding / 2 的值，然後將其作為字串插入到 translate(...) 的對應位置
                .attr("transform", `translate(${position(p.x) + padding / 2},${position(p.y) + padding / 2})`);

            // X axis
            var x_extent = d3.extent(data, function (d) { return +d[p.x] })
            var x2 = d3.scaleLinear()
                .domain(x_extent).nice()
                .range([0, size - padding]);

            // set the parameters for the histogram
            var histogram = d3.histogram()
                .value(function (d) { return +d[p.x]; })   // I need to give the vector of value
                .domain(x2.domain())  // then the domain of the graphic
                .thresholds(x2.ticks(15)); // then the numbers of bins

            // And apply this function to data to get the bins
            var bins = histogram(data);

            // Y axis: scale and draw:
            var y2 = d3.scaleLinear()
                .range([size - padding, 0])
                .domain([0, d3.max(bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously

            // append the bar rectangles to the svg element
            canvas.append('g').attr("transform", `translate(${0}, ${0})`)
                .selectAll("rect")
                .data(bins)
                .enter()
                .append("rect")
                .attr("x", 1)
                .attr("transform", function (d) { return "translate(" + x2(d.x0) + "," + y2(d.length) + ")"; })
                .attr("width", function (d) { return x2(d.x1) - x2(d.x0); })
                .attr("height", function (d) { return (size - padding) - y2(d.length); })
                .style("fill", "#add8e6")
                .attr("stroke", "white")
            
            // append label of each attribute
            canvas.append("text")
                .text(p.x)
                .attr("text-anchor", "end")
                .attr("x", size - padding - 10)
                .attr("y", padding/2)
                .style("fill", "#000000")
                .style("font-size", 15)
            
            canvas.append("rect")
                .attr("class", "frame")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", size - padding)
                .attr("height", size - padding);
            
            // Add X and Y axis in canvas
            canvas.append("g")
                .attr("transform", `translate(${0}, ${size - padding})`)
                .call(d3.axisBottom().scale(x2).ticks(6));
            canvas.append("g")
                .attr("transform", `translate(0, ${0})`)
                .call(d3.axisLeft().scale(y2).ticks(6));
        }
    }

    // Add legend:
    svg.append("circle")
        .attr("cx", (size * n) / 2 - 135)
        .attr("cy", -5)
        .attr("r", 4)
        .style("fill", "#ef402a");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (size * n)/2 - 100)
        .attr("y", 0)
        .text("setosa")
        .style("fill", "#ef402a")
        .style("font-size", "16px")
    svg.append("circle")
        .attr("cx", (size * n) / 2 - 45)
        .attr("cy", -5)
        .attr("r", 4)
        .style("fill", "#32cd32");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (size * n) / 2)
        .attr("y", 0)
        .text("versicolor")
        .style("fill", "#32cd32")
        .style("font-size", "16px")
    svg.append("circle")
        .attr("cx", (size * n) / 2 + 60)
        .attr("cy", -5)
        .attr("r", 4)
        .style("fill", "#ddac23");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (size * n) / 2 + 100)
        .attr("y", 0)
        .text("virginica")
        .style("fill", "#ddac23")
        .style("font-size", "16px")

    var brushCell;

    // Clear the previously-active brush, if any.
    function brushstart(p) {
        if (brushCell !== this) {
            d3.select(brushCell).call(brush.move, null);
            brushCell = this;
            x.domain(rangeofTrait[p.x]);
            y.domain(rangeofTrait[p.y]);
        }
    }

    // Highlight the selected circles.
    function brushmove(p) {
        var e = d3.brushSelection(this);
	
        svg.selectAll("circle").classed("hidden", function (d) {
            if (!e) {
                return false;
            }
            else {
                if (p.x == p.y) {
                    return false;
                }
                else {
                    return (
                        e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
                        || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
                    );
                }
            }
        });
    }

    // If the brush is empty, select all circles.
    function brushend() {
        var e = d3.brushSelection(this);
        if (e === null) {
			svg.selectAll(".hidden").classed("hidden", false);
		}
    }
});

// input: (a, b) 兩個參數都是陣列
function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
	// for(): 先將 i 增加 1（從 -1 變成 0），然後檢查是否小於 n（a.length）。這樣可以確保迴圈正確遍歷 a 中的所有元素
    for (i = -1; ++i < n;) {
        for (j = -1; ++j < m;) {
            c.push({ x: a[i], i: i, y: b[j], j: j });
        }
    }
	// console.log(c)
	// c array 包含了所有配對組合，並記錄了每個兩兩配對的trait和對應的index
	// 0: {x: 'sepal length', i: 0, y: 'sepal length', j: 0}
	// 1: {x: 'sepal length', i: 0, y: 'sepal width', j: 1}
	// 4: {x: 'sepal width', i: 1, y: 'sepal length', j: 0} ...
	// 14: {x: 'petal width', i: 3, y: 'petal length', j: 2}
	// 15: {x: 'petal width', i: 3, y: 'petal width', j: 3}
    return c;
};
function pre_process(d) {
    for(let i = 0; i < d.length; i++){
        if (d[i]["sepal length"] === ""){
            // 刪除當前項目
            d.splice(i, 1)
        }
    }   
};