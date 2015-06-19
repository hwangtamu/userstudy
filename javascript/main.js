var chart = StreamScatterPlot()
    .x(function(d) { return +d.id; })
    .y(function(d) { return +d.yVal; })
    .width(1500)
    .height(600)
    .pointRadius(10)
	// .setCursor(function(selection) { BubbleCursor(selection); })
	// .setCursorFunction(function(mouse) { return BubbleCursor.redraw(); })
	// .setCursor(function(selection) {SnapshotCursor(selection); SnapshotCursor.accumulate(true); })
	// .setCursorFunction(function(mouse) {SnapshotCursor.redraw(); })
	.setCursor(function(selection) {SnapshotBubbleCursor(selection); SnapshotBubbleCursor.accumulate(true); })
	.setCursorFunction(function(mouse) {SnapshotBubbleCursor.redraw(); })
	// .setCursor(function(selection) {SnapshotLineCursor(selection); SnapshotLineCursor.accumulate(true); })
	// .setCursorFunction(function(mouse) {SnapshotLineCursor.redraw(); })
    ;

//Load JSON file
d3.json("data/stream_r2.json", function(error, data) {
	if (error) {
		console.log(error);
	} else {
		console.log(data);
	}

	//Adds time to id (simulate time stamp for streaming data)
	var now = new Date();
	data.forEach(function (d) {
		d.id = (now - (20) * 1000) + d.id * 1000;
	});

	//Get past data
	var past = [];
	now = new Date();
	data.forEach(function(d, i) {
		if (d.id < now) {
			past.push(d);
			data.splice(data.indexOf(d), 1);
		}
	});

	//Create chart with past data bound to it
	var stream = d3.select("#StreamScatterPlot")
		.datum(past)
		.call(chart);

	//Start streaming of chart
	chart.start();

	//Load data into chart over time
	d3.timer(function() {
		data.forEach(function(d, i) {
			now = new Date();
			if (d.id < now) {
				chart.pushData([+data[i].id, +data[i].yVal]);
				data.splice(data.indexOf(d), 1);
			}
		});
	});
});