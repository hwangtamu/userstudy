var chart = StreamScatterPlot()
    .x(function(d) { return +d.id; })
    .y(function(d) { return +d.yVal; })
    .pointRadius(10)
	// .setCursor(function(selection) { BubbleCursor(selection); })
	// .setCursorFunction(function(mouse) { BubbleCursor.redraw(); })
	// .setCursor(function(selection) {SnapshotCursor(selection); })
	// .setCursorFunction(function(mouse) {SnapshotCursor.redraw(); })
	// .setCursor(function(selection) {SnapshotBubbleCursor(selection); })
	// .setCursorFunction(function(mouse) {SnapshotBubbleCursor.redraw(); })
	.setCursor(function(selection) {SnapshotLineCursor(selection); })
	.setCursorFunction(function(mouse) {SnapshotLineCursor.redraw(); })
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

	//Chunk up data
	var d = [[]];
	var j = 0;
	var size = 20;
	for (var i = 0; i < data.length; i+= size) {
		d[j] = data.slice(i, i + size).reverse();
		j++;
	}

	//keybind changes cursor
	// d3.select("body")
	// .on("keydown", function() {
	// 	console.log(d3.event.keyCode);
	// 	if (d3.event.keyCode == 49) {
	// 		chart
	// 			.setCursor(function(selection) {SnapshotLineCursor(selection); })
	// 			.setCursorFunction(function(mouse) {SnapshotLineCursor.redraw(); });
	// 			chart.changeCursor();
	// 	} else if (d3.event.keyCode == 50) {
	// 		chart
	// 			.setCursor(function(selection) {SnapshotBubbleCursor(selection); })
	// 			.setCursorFunction(function(mouse) {SnapshotBubbleCursor.redraw(); });
	// 			chart.changeCursor();
	// 	} else if (d3.event.keyCode == 51) {
	// 		chart
	// 		    .setCursor(function(selection) {SnapshotCursor(selection); })
 //   				.setCursorFunction(function(mouse) {SnapshotCursor.redraw(); });
 //   				chart.changeCursor();
	// 	} else if (d3.event.keyCode == 52) {
	// 		chart
	// 		    .setCursor(function(selection) { BubbleCursor(selection); })
 //   				.setCursorFunction(function(mouse) { BubbleCursor.redraw(); });
 //   				chart.changeCursor();
	// 	}
	// })

	//Create chart with data bound to it
	var stream = d3.select("#StreamScatterPlot")
		.datum(d[0])
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