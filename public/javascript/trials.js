var data = {};
data.trials = [];
var trialNumber = 0;
var numTrials = 0;
var dataset;
var width = 900,
    height = 360;

var chart = StreamScatterPlot()
    .x(function(d) { return +d.timeoffset; })
    .y(function(d) { return +d.value; })
    .flag(function(d) { return d.flag; })
    .id(function(d) { return d.id; })
    .width(width)
    .height(height)
    .allowZoom(false)
    .allowPause(false);
var cursorFunc = null;
var freezeFunc = null;

var experiment_sequence = [];
var trail = ["none", "ghost", "trail"];
var speed_density = [
    {"speed": "low", "density": "low"},
    {"speed": "high", "density": "low"},
    {"speed": "low", "density": "high"},
    {"speed": "high", "density": "high"},
];

//5X Technique
//   |3X Trail
//       |2X Speed by 2X Density
d3.json("data/sequence.json", function(error, data) {
    var sequence = [];
    sequence = data.sequence;

    var n = 0;
    for (i = 0; i < 5; i++) {
        var freezeType = sequence[i];
        for (j = 0; j < 3; j++) {
            var trailType = trail[j];
            for (k = 0; k < 4; k++) {
                var speed = speed_density[k].speed;
                var density = speed_density[k].speed;
                experiment_sequence[n] = {};
                experiment_sequence[n].freezeType = freezeType;
                experiment_sequence[n].trailType = trailType;
                experiment_sequence[n].speed = speed;
                experiment_sequence[n].density = density;
                n += 1;
            }
        }
    }
    console.log(experiment_sequence);
    load();
    createGo();
});

//Load JSON file
function load() {
  d3.json("data/stream_test.json", function(error, data) {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }

    numTrials = data.length;
    dataset = data;
  });
}

//Create chart
function createChart() {
  var now = +new Date() + 1000;
  dataset[trialNumber].forEach(function (d) {
    d.timeoffset = (now - (20 * 1000)) + d.timeoffset * 1000;
    d.timeoffset = +d.timeoffset;
    d.value = +d.value;
    d.primary = d.primary;
    d.secondary = d3.secondary;
  });

  var stream = d3.select("#trialsChart")
    .datum(dataset[trialNumber])
    .call(chart);

  //Start streaming
  chart.start();
}

//Redraw Cursors as needed
d3.timer(function() {
  if (cursorFunc == "normal") {
		NormalCursor.redraw();
	} else  if (cursorFunc == "bubble") {
		BubbleCursor.redraw();
	}

  if (freezeFunc == "FreezeAroundCursor") {
    FreezeAroundCursor.redraw();
  } else if (freezeFunc == "FreezeAroundClosest") {
    FreezeAroundClosest.redraw();
  } else if (freezeFunc == "FreezeTrajectory") {
    FreezeTrajectory.redraw();
  }
});

//Create Cursor
function setSelectors(cursorType, freezeType) {
  var svg = d3.select("svg").data(StreamScatterPlot.getData());

  d3.select("body").on("keydown.freezeSelector", null);
  svg.on("mousemove.freezeSelector", null);
  svg.on("mousemove.cursorSelector", null);

  //Set freeze selector
  if (freezeType == "FreezeWholeScreen") {
    FreezeWholeScreen(svg);
    freezeFunc = freezeType;
  } else if (freezeType == "FreezeAroundCursor"){
    FreezeAroundCursor(svg, true);
    freezeFunc = freezeType;
  } else if (freezeType == "FreezeAroundClosest") {
    FreezeAroundClosest(svg, true);
    freezeFunc = freezeType;
  } else if (freezeType == "FreezeTrajectory") {
    FreezeTrajectory(svg, true);
    freezeFunc = freezeType;
  }

  //Set cursor selector
  if (cursorType == "normal") {
    NormalCursor(svg);
    cursorFunc = cursorType;
    if (freezeType != "none") NormalCursor.tarName(".snapshot");
  } else  if (cursorType == "bubble") {
    BubbleCursor(svg);
    cursorFunc = cursorType;
    if (freezeType != "none") BubbleCursor.tarName(".snapshot");
  }
}

//Loads up chart streaming once GO is clicked
function createGo() {
  var svg = d3.select("#trialsChart").append("svg")
    .attr("id", "go")
    .attr("width", width)
    .attr("height", height);

  svg.append("rect")
             .attr("x", 0)
             .attr("y", 0)
             .attr("width", width)
             .attr("height", height)
             .style("stroke", "black")
             .style("fill", "none")
             .style("stroke-width", "1px");

  var g = svg.append("g").attr("class", "goButton");
  var goCircle = g.append("circle")
    .attr("cx", width/2)
    .attr("cy", height/2)
    .attr("r", 50)
    .style("fill", "#4CAF50");

  var goText = g.append("text")
    .attr("x", width/2 - 40)
    .attr("y", height/2 + 20)
    .style("font-family", "sans-serif")
    .style("font-size", "50px")
    .style("fill", "#F4F4F4")
    .style("cursor", "default")
    .text("GO");

  g.on("click.go", function() {
    g.on("click.go", null);
    svg.remove();
    d3.select('#trialsChart').html('');
    createChart();
    setSelectors("bubble", "FreezeAroundClosest");
  });
}

//Loads up secondary task
//If last trial continues to closing questionnaire
//Else pass over to secondary task
function createQuestion() {
  var svg = d3.select("#trialsChart").append("svg")
    .attr("id", "question")
    .attr("width", width)
    .attr("height", height);

  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", "1px");

  var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var rows = 3;
  var cols = 3;
  var g = svg.append("g").attr("class", "questionNumpad");
  var numpad = g.selectAll("nums").data(numbers);
  var text = g.selectAll("numtext").data(numbers);
  numpad.enter().append("rect")
    .attr("x", function(d, i) { return width/2 - cols*50/2 + (i%cols)*50; })
    .attr("y", function(d, i) { return height/2 - rows*50/2 + Math.trunc(i/rows)*50; })
    .attr("width", 40)
    .attr("height", 40)
    .style("fill", "#F44336");

  text.enter().append("text")
    .text(function(d, i) { return d; } )
    .attr("x", function(d, i) { return width/2 - cols*40/2 + (i%cols)*50; })
    .attr("y", function(d, i) { return height/2 - rows*40/2 + Math.trunc(i/rows)*50; })
    .style("fill", "#F4F4F4")
    .style("cursor", "default");

  numpad.on("click.numpad", function(d, i) {
    console.log(d3.select(this).data());
    svg.remove();
    numpad.on("click.numpad", null);
    d3.select('#trialsChart').html('');
    if (trialNumber < numTrials)
      createGo();
    else
      goToNext();
  });

  text.on("click.numpadText", function(d, i) {
    console.log(d3.select(this).data());
    svg.remove();
    text.on("click.numpadText", null);
    d3.select('#trialsChart').html('');
    if (trialNumber < numTrials)
      createGo();
    else
      goToNext();
  });
}

function goToNext() {
  experimentr.endTimer('all_trials');
  experimentr.addData(data);
  experimentr.next();
}

function addTrialData(err, time) {
  data.trials[trialNumber] = { "id": trialNumber, "errors": err, "time": time };
  trialNumber += 1;
}
