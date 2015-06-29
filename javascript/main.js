var chart = StreamScatterPlot()
    .x(function(d) { return +d.timeoffset; })
    .y(function(d) { return +d.val; })
    .width(window.innerWidth)
    .height(window.innerHeight/2)
    .pointRadius(10)
    .allowZoom(false)
    .allowPause(false);

//Set handlers for each menu
var cursorMenu = d3.select("#cursormenu select")
	.on("change.cursor", change);

var freezeMenu = d3.select("#freezemenu select")
	.on("change.freeze", change);

var onManualMenu = d3.select("#onmanualmenu select")
	.on("change.manual", change);

var accumulateMenu = d3.select("#accumulatemenu select")
	.on("change.accumulate", change);

var speedMenu = d3.select("#speedmenu select")
	.on("change.speed", change);

var speedInput = d3.select("#speedinput")
	.on("change.customSpeed", setSpeed);

//Holds current menus value
var cursor, freeze, manual, accumulate, speed;

//Load JSON file
//d3.json("data/stream_r2.json", function(error, data) {
d3.json("data/stream_s08.json", function(error, data) {
	if (error) {
		console.log(error);
	} else {
		console.log(data);
	}

	//Adds current time to time offset to simulate a realtime dataset
	var now = new Date();
	data.forEach(function (d) {
		d.timeoffset = (now - (20) * 1000) + d.timeoffset * 1000;
		d.timeoffset = +d.timeoffset;
		d.val = + d.val;
	});

	//Get past data
	var past = [];
	now = new Date();
	data.forEach(function(d, i) {
		if (d.timeoffset < now) {
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
	speedMenu.property("value", "normal");
	change();

	//Load data into chart over time
	d3.timer(function() {
		data.forEach(function(d, i) {
			now = new Date();
			if (d.timeoffset < now) {
				chart.pushDatum([+data[i].timeoffset, +data[i].val]);
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
		// NormalCursor.redraw();
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

function setSpeed() {
	speedMenu.property("value", "custom");
	StreamScatterPlot.setSpeed(speedInput.property("value"));
}

function change() {
	//Obtain options from menus
	cursor = cursorMenu.property("value");
	freeze = freezeMenu.property("value");
	manual = onManualMenu.property("value");
	accumulate = accumulateMenu.property("value");
	speed = speedMenu.property("value");

	//Grab Svg
	var svg = d3.select("svg").data(StreamScatterPlot.getData());

	//Remove any old cursor / freeze 
	d3.selectAll(".selector").remove();
	d3.selectAll(".snapshots").remove();
	d3.select("#freezeClip").remove();
	d3.selectAll(".point").attr("id", "untagged");
	d3.select("body").on("keydown.freezeSelector", null);
	svg.on("mousemove.freezeSelector", null);
	svg.on("mousemove.cursorSelector", null);
	svg.on("mousemove.cursorSelector", null);

	//Set speed
	if (speed == "super slow") {
		StreamScatterPlot.setSpeed(2000);
		speedInput.property("value", 200);
	} else if (speed == "slow") {
		StreamScatterPlot.setSpeed(1500);
		speedInput.property("value", 1500);
	} else if (speed == "normal") {
		StreamScatterPlot.setSpeed(1000);
		speedInput.property("value", 1000);
	} else if (speed == "fast") {
		StreamScatterPlot.setSpeed(500);
		speedInput.property("value", 500);
	} else if (speed == "super fast") {
		StreamScatterPlot.setSpeed(100);
		speedInput.property("value", 100);
	} else if (speed == "custom") {
		StreamScatterPlot.setSpeed(speedInput.property("value"));
	}

	//Convert manual to bool
	if (manual == "true") {
		manual = true;
	} else {
		manual = false;
	}

	//Convert accumulate to bool
	if (accumulate == "true") {
		accumulate = true;
	} else {
		accumulate = false;
	}

	//Set freeze selector
	if (freeze == "FreezeWholeScreen") {
		FreezeWholeScreen(svg);
	} else if (freeze == "FreezeAroundCursor"){
		FreezeAroundCursor(svg, manual);
		FreezeAroundCursor.accumulate(accumulate);
	} else if (freeze == "FreezeAroundClosest") {
		FreezeAroundClosest(svg, manual);
		FreezeAroundClosest.accumulate(accumulate);
	} else if (freeze == "FreezeTrajectory") {
		FreezeTrajectory(svg, manual);
		FreezeTrajectory.accumulate(accumulate);
	}
	
	//Set cursor selector
	if (cursor == "NormalCursor") {
		NormalCursor(svg);
		if (freeze != "None") NormalCursor.tarName(".snapshot");
	} else  if (cursor == "BubbleCursor") {
		// NormalCursor(svg);
		BubbleCursor(svg);
		if (freeze != "None") BubbleCursor.tarName(".snapshot"); 
	}
}