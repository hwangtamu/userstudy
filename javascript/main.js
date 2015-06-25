var chart = StreamScatterPlot()
    .x(function(d) { return +d.id; })
    .y(function(d) { return +d.yVal; })
    .width(window.innerWidth)
    .height(window.innerHeight/2)
    .pointRadius(10);

//Set handlers for each menu
var cursorMenu = d3.select("#cursormenu select")
	.on("change.cursor", change);

var freezeMenu = d3.select("#freezemenu select")
	.on("change.freeze", change);

var onclickMenu = d3.select("#onclickmenu select")
	.on("change.click", change);

var accumulateMenu = d3.select("#accumulatemenu select")
	.on("change.click", change);

//Holds current menus value
var cursor, freeze, onclickMenu, accumulate;

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
		d.id = +d.id;
		d.yVal = + d.yVal;
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
	change();

	//Load data into chart over time
	d3.timer(function() {
		data.forEach(function(d, i) {
			now = new Date();
			if (d.id < now) {
				chart.pushDatum([+data[i].id, +data[i].yVal]);
				data.splice(data.indexOf(d), 1);
			}
		});
	});
});

//Update current selectors
d3.timer(function() {
	//Redraw cursor selector
	if (cursor == "NormalCursor") {
		NormalCursor.redraw();
	} else  if (cursor == "BubbleCursor") {
		BubbleCursor.redraw();
	}

	//Redraw freeze selector
	if (freeze == "FreezeAroundCursor") {
		FreezeAroundCursor.redraw();
	} else if (freeze == "FreezeAroundClosest") {
		FreezeAroundClosest.redraw();
	} else if (freeze == "FreezeTrajectory") {
		FreezeTrajectory.redraw();
	}
});

function change() {
	//Obtain options from menus
	cursor = cursorMenu.property("value");
	freeze = freezeMenu.property("value");
	click = onclickMenu.property("value");
	accumulate = accumulateMenu.property("value");

	//Grab Svg
	var svg = d3.select("svg");

	//Remove any old cursor / freeze 
	d3.selectAll(".selector").remove();
	d3.selectAll(".snapshots").remove();
	d3.selectAll(".point").attr("id", "untagged");
	svg.on("click.freezeSelector", null);
	svg.on("mousemove.freezeSelector", null);

	//Convert click to bool
	if (click == "true") {
		click = true;
	} else {
		click = false;
	}

	//Convert accumulate to bool
	if (accumulate == "true") {
		accumulate = true;
	} else {
		accumulate = false;
	}

	//Set freeze selector
	if (freeze == "FreezeAroundCursor") {
		FreezeAroundCursor(svg, click);
		FreezeAroundCursor.accumulate(accumulate);
	} else if (freeze == "FreezeAroundClosest") {
		FreezeAroundClosest(svg, click);
		FreezeAroundClosest.accumulate(accumulate);
	} else if (freeze == "FreezeTrajectory") {
		FreezeTrajectory(svg, click);
		FreezeTrajectory.accumulate(accumulate);
	}
	
	//Set cursor selector
	if (cursor == "NormalCursor") {
		NormalCursor(svg);
		if (freeze != "None") NormalCursor.tarName(".snapshot");
	} else  if (cursor == "BubbleCursor") {
		BubbleCursor(svg);
		if (freeze != "None") BubbleCursor.tarName(".snapshot"); 
	}
}







