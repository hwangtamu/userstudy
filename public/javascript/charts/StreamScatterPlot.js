function StreamScatterPlot() {

	//FOR EXPERIMENTAL REASONS
	var errors;
	var time_start;
	var dots_clicked;
	var dots_missed;
	var click_period;

	//Controls experimental clockdrift
	var clockdrift = 0;
	var drift_timer = 0;

	//Default values for chart
	var margin = {top: 10, right: 10, bottom: 30, left: 0},
		height = 420,
		width = 860,
		xValue = function(d) { return d[0]; },
		yValue = function (d) { return d[1]; },
		flagValue = function(d) { return d[2]; },
		idValue = function(d) { return d[2]; },
		xScale = d3.time.scale();
		yScale = d3.scale.linear();
		xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
		yAxis = d3.svg.axis().scale(yScale).orient("left"),
		xLabel = "time",
		yLabel = "value",
		pWidth = 10,
		pHeight = 10,
		cursor = function(selection) {},
		cursorFunction = function(selection) {},
		targetName = ".target",
		zoomAllowed = true,
		pauseAllowed = true,
		paused = false,
		trailsAllowed = true,
		interval = 1000, //Determines base unit to measure by
		numIntervals = 20; //Determines the number of base intervals shown in window of time

	//Used to kill step timer
	var end = false;

	//Selectors, dataset, and points to grab
	var svg,
		defs,
		gChart,
		gData,
		gCursor,
		dataset,
		points;

	//Initial creation of streaming scatter plot
	function chart(selection) {
		//Init experimental things
		time_start = +new Date();
		errors = 0;
		dots_clicked = 0;
		dots_missed = 0;
		click_period = Math.floor((Math.random() * 5) + 5) * 1000;

		drift_timer = +new Date();

		selection.each(function(data) {
			//Map corresponding data points x to d[0] and y to d[1]
			data = data.map(function(d, i) {
				return [xValue.call(data, d, i),
								yValue.call(data, d, i),
								flagValue.call(data, d, i),
								idValue.call(data, d, i)];
			});

			dataset = data;
			//Update the x-scale
			var now = new Date(Date.now() - interval);
			xScale
				.domain([now - (numIntervals) * interval, now - interval])
				.range([0, width - margin.left - margin.right]);

			//Update the y-scale
			yScale
				.domain([0, d3.max(dataset, function(d) { return d[1]; })])
				.range([height - margin.top - margin.bottom, 0]);

			//Select the svg element, if it exists
			svg = d3.select(this).selectAll("svg").data([data]);

			//Otherwise, create the skeletal chart
			var gEnter = svg.enter().append("svg")
				.on("wheel.zoom", zoom);

			//Create Border
			svg.append("rect")
		             .attr("x", 0)
		             .attr("y", 0)
		             .attr("width", width)
		             .attr("height", height)
		             .style("stroke", "black")
		             .style("fill", "none")
		             .style("stroke-width", "1px");

			//Create rest of skeletal chart
			defs = gEnter.append("defs");
			defs.append("clipPath")
					.attr("id", "StreamScatterPlotClip")
				.append("rect")
					.attr("width", width)
					.attr("height", height + margin.bottom)
					.attr("transform", "translate(" + margin.left + "," + -margin.bottom + ")");
			gData = gEnter.append("g").attr("class", "data");
			gEnter = gEnter.append("g").attr("class", "chart");
				gEnter.append("g").attr("class", "x axis");
				gEnter.append("g").attr("class", "y axis");
			gCursor = svg.append("g").attr("class", "cursor icon");

			svg.call(cursor);

			//Update the outer dimensions
			svg
				.attr("id", "chart")
				.attr("width", width)
				.attr("height", height)
				.attr("cursor", "none");

			//Update the inner dimensions
			gChart = svg.select("g.chart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			//Update the x-axis
			gChart.select(".x.axis")
					.attr("transform", "translate(0," + yScale.range()[0] + ")")
					.call(xAxis)
				.append("text")
					.attr("class", "label")
					.attr("x", width - margin.left)
					.attr("y", -6)
					.style("text-anchor", "end")
					.text(xLabel);

			//Update the y-axis
			gChart.select(".y.axis")
					.call(yAxis)
				.append("text")
					.attr("class", "label")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".35em")
					.style("text-anchor", "end")
					.text("value");

			//Bind the initial set of points
			points = gData.selectAll(".point")
				.data(data)
				.datum(function(d) { return {id: d3.select(this).attr("id")}; });

			//Bind pause-start option
			d3.select("body")
				.on("keydown.StreamScatterPlot", function() {
					if (d3.event.keyCode == 32) {
						chart.pause();
					}
				})

			//Create Cursor
			gCursor.append("line")
				.attr("class", "vertical")
				.style("stroke-width", "1")
				.style("stroke", "black");
			gCursor.append("line")
				.attr("class", "horizontal")
				.style("stroke-width", "1")
				.style("stroke", "black");

			//Set on mousemove to update position of cursor
			svg.on("mousemove.StreamScatterPlot", function(d,i) {
				var mouse = d3.mouse(this);
				var x = mouse[0],
						y = mouse[1];

				gCursor.select(".vertical")
					.attr("x1", x)
					.attr("y1", y + 5)
					.attr("x2", x)
					.attr("y2", y - 5);
				gCursor.select(".horizontal")
					.attr("x1", x + 5)
					.attr("y1", y)
					.attr("x2", x - 5)
					.attr("y2", y);
			});

			//Set on click handler
			svg.on("mousedown.StreamScatterPlot", function() {
				var target = d3.select(targetName);
				if (d3.select(targetName).empty())
					target = null;
				if (trailsAllowed) var targetTrail = d3.select("#targetTrail");
				if (target != null && !d3.event.shiftKey && !end) {
					//Point animation
					target.transition().duration(0).transition().duration(500).ease("bounce")
							.style("fill-opacity", 0.0)
						.transition().duration(500).ease("bounce")
							.style("fill-opacity", 1.0);

					//Trail animation
					if (trailsAllowed) {
						targetTrail.transition().duration(500).ease("bounce")
								.style("stroke-opacity", 0.0)
							.transition().duration(500).ease("bounce")
								.style("stroke-opacity", 1.0);
					}

					//Start Experiment Stuff
					if (target.attr("class").includes("target") && target.attr("class").includes("primary")) {
						dots_clicked += 1;
						StreamScatterPlot.newRedDot(target);

						// var time_end = +new Date();
						// var trial_time = time_end - time_start;
						// // var dis = chart.getDistractors();
						// chart.destroy();
						// createQuestion(errors, trial_time, dis, true);
					} else {
						errors += 1;
					} //End Experiment Stuff
				}
			});

			//Init trails for optional use
			TrailDrawer(svg);
		});
	}

	chart.destroy = function() {
		d3.selectAll("snapshot.target, point.target")
			.attr("class", function() { return d3.select(this).attr("class").slice(0, -7); });
		d3.select("body").on("keydown.StreamScatterPlot", null);
		svg
			.on("wheel.zoom", null)
			.on("mousemove.StreamScatterPlot.", null)
			.on("mousedown.StreamScatterPlot", null)
			.remove();
		end = true;
	};

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

	//Set flag
	chart.flag = function(_) {
		if (!arguments.length) return flagValue;
		flagValue = _;
		return chart;
	};

	//Set id
	chart.id = function(_) {
		if (!arguments.length) return idValue;
		idValue = _;
		return chart;
	};

	//Set point width
	chart.pointWidth = function(_) {
		if (!arguments.length) return pWidth;
		pWidth = _;
		return chart;
	};

	//Set point height
	chart.pointHeight = function(_) {
		if (!arguments.length) return pHeight;
		pHeight = _;
		return chart;
	};

	//Set interval
	//Selection from "seconds", "minutes", "hours", "days"
	chart.interval = function(_) {
		if (!arguments.length) return interval;
		interval = _;
		return chart;
	};

	//Set #numIntervals
	chart.numIntervals = function(_) {
		if (!arguments.length) return numIntervals;
		numIntervals = _;
		return chart;
	};

	//Set custom cursor for selection
	chart.setCursor = function(_) {
		if (!arguments.length) return cursor;
		cursor = _;
		return chart;
	};

	//Set function of cursor
	chart.setCursorFunction = function(_) {
		if (!arguments.length) return cursorFunction;
		cursorFunction = _;
		return chart;
	};

	//Push data to chart
	chart.pushDatum = function(datum) {
		dataset.push(datum);
	};

	//Updates the visual stream
	chart.step = function() {

		//Slide window of time for x axis
		now = +new Date();
		xScale.domain([now - (numIntervals) * interval, now - interval]);

		//Update X Axis
		d3.select(".x.axis")
			.call(xAxis);

		//Simulates clock drifting
		//NOTE: Should never really be used expect when having to do weird things for experimental reasons
		if ( ((+new Date()) - drift_timer) > 1) {
			drift_timer = +new Date()
			console.log("drift")
			dataset.forEach(function(d, i) {
				d[0] -= clockdrift;
			});
		}
		//Bind only data that would show up on screen to points
		var subset = dataset.filter(function(d, i) { return d[0] < now; } );
		points = gData.selectAll(".point").data(subset, function(d, i) { return d; });

		//Update
		points
			.attr("x", function(d) { return xScale(d[0]) + pWidth/2; })
			.each(function(d) {
				if (this.getAttribute("x") < margin.left - pWidth){
					dataset.splice(dataset.indexOf(d), 1);
					if (this.getAttribute("class") == "primary point") {
						dots_missed += 1;
						StreamScatterPlot.newRedDot();
					}
				}
			});

		//Enter
		points
			.enter()
			.append("rect")
				.attr("class", function(d) { return d[2]; })
				.attr("rx", function(d) { return d[2] == "secondary point" ? 0 : 100})
				.attr("ry", function(d) { return d[2] == "secondary point" ? 0 : 100})
				.attr("width", pWidth)
				.attr("height", pHeight)
				.attr("x", function(d) { return xScale(d[0]) + pWidth/2; })
				.attr("y", function(d) { return yScale(d[1]) + pHeight/2; });

		//Exit
		points.exit().each(function(d, i) {
			var point = d3.select(this);
			if (trailsAllowed) TrailDrawer.destroyTrail(d[3]);
			point.remove();
		});

		//Update Cursor
		cursorFunction();

		//Update Trails if ON
		if (trailsAllowed) {
			TrailDrawer.redraw();
		}
		return;
	};

	//Starts the chart streaming
	chart.start = function() {
		end = false;
		d3.timer(function() {
			var time_end = +new Date();
			var trial_time = time_end - time_start;
			if(trial_time >= click_period) {
				var dis = chart.getDistractors();
				chart.destroy();
				createQuestion(errors, trial_time, dis, click_period, dots_clicked, dots_missed);
			}
			if(!paused) {
				chart.step();
			}
			return end;
		})
	};

	//Pauses the chart steptreaming
	chart.pause = function() {
		if (!pauseAllowed) {
			pause = false;
		}
		else if(paused) {
			paused = !paused;
		} else {
			paused = true;
		}
	};

	chart.allowZoom = function(_) {
		if (!arguments.length) return zoomAllowed;
		zoomAllowed = _;
		return chart;
	};

	chart.allowPause = function(_) {
		if (!arguments.length) return pauseAllowed;
		pauseAllowed = _;
		return chart;
	};

	chart.allowTrails = function(_) {
		if (!arguments.length) return trailsAllowed;
		trailsAllowed = _;
		return chart;
	}

	//Alters the time scale so you can 'zoom' in and out of time
	function zoom() {
		if (zoomAllowed) {
			dy = +d3.event.wheelDeltaY;
			if (interval + dy > 100)
				interval += dy;
			else
				interval = 100;
			chart.step();
		}
	};

	StreamScatterPlot.setTrails = function(_) {
		trailsAllowed = _;
	};

	StreamScatterPlot.setNumIntervals = function(_) {
		numIntervals = _;
	};

	StreamScatterPlot.setInterval = function(_) {
		interval = _;
	};

	StreamScatterPlot.setClockDrift = function(_) {
		clockdrift = _;
	};

	StreamScatterPlot.getData = function(_) {
		return dataset;
	};

	chart.getDistractors = function() {
		var n = 0;
		d3.selectAll(".secondary.point").each(function() {
			n += 1;
		});
		return n;
	}

	StreamScatterPlot.getTrailsAllowed = function() {
		return trailsAllowed;
	}

	StreamScatterPlot.newRedDot = function(target) {
		var prev_id = null;

		if (target != null) {
			if (target.attr("class").includes("snapshot")) {
				var pt = d3.select(".primary.point")
					.attr("class", "point");
				target.attr("class", target.attr("class").replace("primary", ""));
				pt.datum()[2] = "point";
				// dataset[dataset.indexOf(pt)][2] = "point";
				prev_id = pt.datum()[3];
			} else {
				target.attr("class", "point");
				target.datum()[2] = "point";
				// dataset[target.datum()[3]][2] = "point";
				prev_id = target.datum()[3];
			}
		}

		var new_id = prev_id;
		var pt = null;
		while (prev_id == new_id) {
			var points = d3.selectAll(".point");
			var sz = points[0].length;
			new_index = Math.floor((Math.random() * sz*2/3) + sz/3);
			pt = d3.select(points[0][new_index]);
			new_id = pt.datum()[3];
		}

		pt.attr("class", "primary point");
		pt.datum()[2] = "primary point";
		// dataset[pt.datum()[3]][2] = "primary point";

		if (!d3.select(".i" + new_id + ".snapshot").empty()) {
			var snap = d3.select(".i" + new_id + ".snapshot");
			snap
				.attr("class", "primary " + snap.attr("class"))
		};
	}

	return chart;
}
