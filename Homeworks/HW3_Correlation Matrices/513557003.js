// Graph dimension
const margin = { top: 20, right: 20, bottom: 20, left: 20 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom

const data_path = "http://vis.lab.djosix.com:2024/data/abalone.data"

d3.text(data_path).then(function (data) {
    // console.log("data", data)
    
    var features = ["Length", "Diameter", "Height", "Whole weight", "Shucked weight", "Viscera weight", "Shell weight", "Rings"]
    var data_male = [];
    var data_female = [];
    var data_infant = [];
    
    var rows = data.split("\n");
	// console.log(rows)
    for (var i = 0; i < rows.length; i++) {
        var cols = rows[i].split(",");
		// console.log(cols)
        var list = [];
        for (var j = 0; j < 8; j++) {
            list.push(+cols[j + 1])
        }

        if (cols[0] == "M") {
            data_male.push(list);
        }
        if (cols[0] == "F") {
            data_female.push(list);
        }
        if (cols[0] == "I") {
            data_infant.push(list);
        }
    }

    male = correlation_matrix(data_male)
    female = correlation_matrix(data_female)
    infant = correlation_matrix(data_infant)

    render_legend()
    render_corrmtx(male)

    // Add an event listener for the change event
	// As changing, it will implement function of matrix_selected()
    const radioButtons = document.querySelectorAll('input[name="sex"]');
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('change', matrix_selected);
    }
	
	// The matrix_selected function redraws the correlation matrix of the corresponding gender based on the selected gender.
    function matrix_selected() {
        if (this.checked) {
            if (this.value == "male") {
                render_corrmtx(male)
            }
            if (this.value == "female") {
                render_corrmtx(female)
            }
            if (this.value == "infant") {
                render_corrmtx(infant)
            }
        }
    }

    function correlation_matrix(data) {
		// data transpose: all the values of same feature name will put into an array
        const matrix = math.transpose(data);
		// console.log("matrix", matrix)
        let corr_mtx = []

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix.length; j++) {
				// calculate Pearson correlation coefficient between two features
                let corr = math.corr(matrix[i], matrix[j]);
                // corr_mtx.set([i, j], corr);
				
				// save in the array of corr_mtx
				// stored as {x: feature1, y: feature2, value: correlation}
                corr_mtx.push({
                    x: features[i],
                    y: features[j],
					// correlation value assigned to "value"
                    value: +corr
                });

            }
        }
        // console.log("corr_mtx", corr_mtx)

        return corr_mtx
    }
	
	// Legend(圖例) for plotting a correlation matrix
    function render_legend() {
        // legend scale
        var legend_up = 13;
        var legend_height = 16;

        var legend_svg = d3.selectAll(".legend").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", legend_height + legend_up + 20)
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + legend_up + ")");
		
		// define linear gradient(線性漸層)
        var defs = legend_svg.append("defs");

		// linearGradient is an element of SVG，表示顏色漸變效果
        var gradient = defs.append("linearGradient")
			// id = linear_gradient
            .attr("id", "linear_gradient");

		// offset: 用於設定顏色的位置。範圍是從0到1，0表示漸層的起點(最左邊)，1表示漸層的終點(最右邊)
		// value: 表示對應數據的值（負相關、零相關和正相關）
        var stops = [{ offset: 0, color: "#d73027", value: -1 }, { offset: .5, color: "#f7f7f7", value: 0 }, {
            offset: 1, color: "#1a9850", value: 1 }];

        gradient.selectAll("stop")
            .data(stops)
			// 每個 stop 物件會被添加到 linearGradient 中(這是 D3 的一個概念，用於處理尚未存在於 DOM 中的資料)
            .enter().append("stop")
			// 設定 stop 元素的 offset 屬性。這個屬性決定漸層中每個顏色出現的位置
			// d.offset 乘以 100 並附加 % 是為了將 0-1 的數字轉換為百分比(例如，0 對應 0%，1 對應 100%，0.5 對應 50%)
            .attr("offset", function (d) { return (100 * d.offset) + "%"; })
			// 設定每個 stop 的 stop-color 屬性，這個屬性決定 offset 位置的顏色值
			// 此處通過 d.color 來動態設置每個 stop 的顏色
            .attr("stop-color", function (d) { return d.color; });

        legend_svg.append("rect")
            .attr("width", width)
            .attr("height", legend_height)
            .style("fill", "url(#linear_gradient)");

        legend_svg.selectAll("text")
            .data(stops)
            .enter().append("text")
            .attr("x", function (d) { return width * d.offset; })
            .attr("dy", -3)
            .style("text-anchor", function (d, i) { return i == 0 ? "start" : i == 1 ? "middle" : "end"; })
            .text(function (d, i) { return d.value.toFixed(2); })
            .style("font-size", 12)
    }

	// Plot the correlation matrix
    function render_corrmtx(corr_mtx) {
        // clean svg
        d3.select("#corr_mtx").select('svg').remove()

        // List of all variables and number of them
        let domain = Array.from(new Set(corr_mtx.map(function (d) { return d.x })))
        let num = Math.sqrt(corr_mtx.length)

        // Create a color scale
        let color = d3.scaleLinear()
            .domain([-1, 0, 1])
            .range(["#d73027", "#f7f7f7", "#1a9850"]);

        // Create a size scale for bubbles on top right. Watch out: must be a rootscale!
        let size = d3.scaleSqrt()
            .domain([0, 1])
            .range([0, 12]);

        // X scale
        let x = d3.scalePoint()
            .range([0, width])
            .domain(domain)

        // Y scale
        let y = d3.scalePoint()
            .range([0, height])
            .domain(domain)
        
        // Create the svg area
        let svg = d3.select("#corr_mtx")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create one 'g' element for each cell of the correlogram
        let cor = svg.selectAll(".cor")
            .data(corr_mtx)
            .join("g")
            .attr("class", "cor")
            .attr("transform", function (d) {
                return `translate(${x(d.x)}, ${y(d.y)})`
            });

        // Low left part + Diagonal: Add the text with specific color
        cor.filter(function (d) {
            let ypos = domain.indexOf(d.y);
            let xpos = domain.indexOf(d.x);
            return xpos <= ypos;
        })
            .append("text")
            .attr("y", 6)
            .text(function (d) {
                if (d.x === d.y) {
                    return d.x;
                } else {
                    return d.value.toFixed(2);
                }
            })
            .style("font-size", 12)
            .attr("text-anchor", "middle")
            .style("fill", function (d) {
                if (d.x === d.y) {
                    return "#000";
                } else {
                    return color(d.value);
                }
            });


        // Up right part: add circles
        cor.filter(function (d) {
            let ypos = domain.indexOf(d.y);
            let xpos = domain.indexOf(d.x);
            return xpos > ypos;
        })
            .append("circle")
            .attr("r", function (d) { return size(Math.abs(d.value)) })
            .style("fill", function (d) {
                if (d.x === d.y) {
                    return "#000";
                } else {
                    return color(d.value);
                }
            })
            .style("opacity", 0.8)
    }
})