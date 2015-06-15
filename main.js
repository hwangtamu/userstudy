var chart = StreamScatterPlot()
    .x(function(d) { return +d.id; })
    .y(function(d) { return +d.yVal; })
    .pointRadius(10)
    // .setCursor(function(selection) { BubbleCursor(selection); })
    // .setCursorFunction(function(mouse) { BubbleCursor.draw(); })
    // .setCursor(function(selection) {SnapshotCursor(selection); })
    // .setCursorFunction(function(mouse) {SnapshotCursor.draw(); })
	.setCursor(function(selection) {SnapshotBubbleCursor(selection); })
	.setCursorFunction(function(mouse) {SnapshotBubbleCursor.draw(); })
	// .setCursor(function(selection) {SnapshotLineCursor(selection); })
	// .setCursorFunction(function(mouse) {SnapshotLineCursor.draw(); })
    ;

//Load JSON file
d3.json("data/stream_r1.json", function(error, data) {
	if (error) {
		console.log(error);
	} else {
		console.log(data);
	}
	//Adds time to id (simulate time stamp for streaming data)
	now = new Date();
	data.forEach(function (d) {
		d.id = (now - (20) * 1000) + d.id * 1000;
	});

	var stream = d3.select("#StreamScatterPlot")
		.datum(data)
		.call(chart);

	chart.start();
});