//Creates a streaming scatter plot
function StreamScatterPlot() {

	//Default values for chart
	var margin = {top: 10, right: 10, bottom: 30, left: 30},
		height = 420,
		width = 860,
		xValue = function(d) { return d[0]; },
		yValue = function (d) { return d[1]; },
		// xScale = d3.fisheye.scale(d3.time.scale),
		// yScale = d3.fisheye.scale(d3.scale.linear),
		xScale = d3.time.scale();
		yScale = d3.scale.linear();
		xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
		yAxis = d3.svg.axis().scale(yScale).orient("left"),
		xLabel = "time",
		yLabel = "value",
		pointRadius = 6,
		cursor = function(selection) {},
		cursorFunction = function(selection) {},
		duration = 1000, //Determines the unit of time used on axis
		ticks = 20; //Determines the number of ticks on axis based on time (n - 4 roughly shown)

	var svg,
		dataset,
		points,
		paused = false,
		target;

	//Initial creation of streaming scatter plot
	function chart(selection) {
		selection.each(function(data) {

			//Map corresponding data points x to d[0] and y to d[1]
			data = data.map(function(d, i) {
				return [xValue.call(data, d, i), yValue.call(data, d, i)];
			});

			dataset = data;
			//Update the x-scale
			var now = new Date(Date.now() - duration);
			xScale
				.domain([now - (ticks) * duration, now - duration])
				.range([0, width - margin.left - margin.right]);

			//Update the y-scale
			yScale
				.domain(d3.extent(data, function(d) { return d[1]; }))
				.range([height - margin.top - margin.bottom, 0]);

			//Select the svg element, if it exists
			svg = d3.select(this).selectAll("svg").data([data]);

			//Otherwise, create the skeletal chart
			var gEnter = svg.enter().append("svg")
				.on("wheel.zoom", zoom);

			//Create cursor before chart to prevent overlap
			gEnter.call(cursor);

			//Create rest of skeletal chart
			gEnter = gEnter.append("g");
			gEnter.append("g").attr("class", "x axis");
			gEnter.append("g").attr("class", "y axis");


			//Update the outer dimensions
			svg .attr("width", width)
				.attr("height", height);

			//Update the inner dimensions
			var g = svg.select("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			//Update the x-axis
			g.select(".x.axis")
					.attr("transform", "translate(0," + yScale.range()[0] + ")")
					.call(xAxis)
				.append("text")
					.attr("class", "label")
					.attr("x", width - margin.left)
					.attr("y", -6)
					.style("text-anchor", "end")
					.text(xLabel);

			//Update the y-axis
			g.select(".y.axis")
					.call(yAxis)
				.append("text")
					.attr("class", "label")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".35em")
					.style("text-anchor", "end")
					.text("value");

			//Create the initial set of points
			points = svg.selectAll(".point")
				.data(data)
				.datum(function(d) { return {id: d3.select(this).attr("id")}; });

			points.enter().append("circle")
				.attr("class", "point")
				.attr("r", pointRadius)
				.attr("cx", function(d) { return xScale(d[0]); })
				.attr("cy", function(d) { return yScale(d[1]); });

			//Create pause-start option
			// d3.select("body")
			// 	.on("keydown", function() {
			// 		//console.log(d3.event.keyCode);
			// 		if (d3.event.keyCode == 32) {
			// 			chart.pause();
			// 		}
			// 	})

			/* FISHEYE CURSOR */
			// svg.on("mousemove", function() {
			// 	var mouse = d3.mouse(this);

			// 	xScale.distortion(4.5).focus(mouse[0]);
			// 	yScale.distortion(2.5).focus(mouse[1]);

			// 	svg.select("x.axis").call(xAxis);
			// 	svg.select(".y.axis").call(yAxis);
			// 	svg.call(cursorFunction, mouse);
			// 	//BubbleCursor.draw(d3.mouse(this));
			// 	chart.step();
			// 	points.attr("cy", function(d) { return yScale(d[1]); })
			// });
		});
	}

	//Set margins
	chart.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return chart;
	};

	//Set width
	chart.width = function(_) {
		if (!arguments.length) return width;
		width = _;
		return chart;
	};

	//Set height
	chart.height = function(_) {
		if (!arguments.length) return height;
		height = _;
		return chart;
	};

	//Set x label
	chart.xLabel = function(_) {
		if (!arguments.length) return xLabel;
		height = _;
		return chart;
	};

	//Set y label
	chart.yLabel = function(_) {
		if (!arguments.length) return yLabel;
		height = _;
		return chart;
	};

	//Set x value
	chart.x = function(_) {
		if (!arguments.length) return xValue;
		xValue = _;
		return chart;
	};

	//Set y value
	chart.y = function(_) {
		if (!arguments.length) return yValue;
		yValue = _;
		return chart;
	};

	//Set point radius
	chart.pointRadius = function(_) {
		if (!arguments.length) return pointRadius;
		pointRadius = _;
		return chart;
	}

	//Set duration
	//Selection from "seconds", "minutes", "hours", "days"
	chart.duration = function(_) {
		if (!arguments.length) return duration;
		if (_ === "seconds") {
			duration = 1000;
		}
		else if (_ === "minutes") {
			duration = 60000;
		}
		else if (_ === "hours") {
			duration = 3600000;
		}
		else if (_ === "days") {
			duration = 86400000;
		}
		else {
			console.log("not an optional duration of time");
		}
		return chart;
	};

	//Set #ticks
	chart.ticks = function(_) {
		if (!arguments.length) return ticks;
		ticks = _;
		return chart;
	};

	//Set custom cursor for selection
	chart.setCursor = function(_) {
		if (!arguments.length) return cursor;
		cursor = _;
		return chart;
	}

	//Set function of cursor
	chart.setCursorFunction = function(_) {
		if (!arguments.length) return cursorFunction;
		cursorFunction = _;
		return chart;
	}

	//Push data to chart
	chart.pushData = function(data) {
		// data = data.map(function(d, i) {
		// 		return [xValue.call(data, d, i), yValue.call(data, d, i)];
		// });
		dataset.push(data);
	}

	// chart.changeCursor = function() {
	// 	svg.call(cursor);
	// }

	//Updates the visual stream
	chart.step = function() {

		//Slide window of time for x axis
		now = new Date();
		xScale.domain([now - (ticks - 2) * duration, now - duration]);

		//Update X Axis
		d3.select(".x.axis")
			.call(xAxis);

		//Bind data to points
		points = svg.selectAll(".point").data(dataset, function(d) { return d; });

		//Update
		points
			.attr("cx", function(d) { return xScale(d[0]); })
			.each(function(d) {
				if(this.getAttribute("cx") < margin.left){
					dataset.splice(dataset.indexOf(d), 1)
				}
			});

		//Enter
		points.enter().append("circle")
			.attr("class", "point")
			.attr("r", pointRadius)
			.attr("cx", function(d) { return xScale(d[0]); })
			.attr("cy", function(d) { return yScale(d[1]); });

		//Exit
		points.exit().remove();

		//Update Cursor and grab target
		target = svg.call(cursorFunction);
	};

	//Starts the chart streaming
	chart.start = function() {
		d3.timer(function() {
			if(!paused) {
				chart.step();
			}
		})
	};

	//Pauses the chart steptreaming
	chart.pause = function() {
		if(paused) {
			paused = !paused;
		} else {
			paused = true;
		}
	};

	function zoom() {
		dy = +d3.event.wheelDeltaY;
		if (duration + dy > 100)
			duration += dy;
		else 
			duration = 100;
		chart.step();
	}

	return chart;
}