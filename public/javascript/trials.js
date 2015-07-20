//Hold data collected
var data = {};

//Hold per combination trial numbers
var trialNumber = 0;
var numTrials = 0;

//Holds entire dataset used
var dataset;

//Holds combination number
var experiment_number = 0;
var experiment_length = 0;

var practice_number = 0;

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
    .allowPause(false)
    .allowTrails(false);

var cursorFunc = null;
var freezeFunc = null;

var previousFrz = "";
var previousTrail = "";

var practice = false;

var experiment_sequence = [];
var trail = ["none", "ghost", "trail"];
var speed_density = [
    {"speed": "low", "density": "low"},
    {"speed": "high", "density": "low"},
    {"speed": "low", "density": "high"},
    {"speed": "high", "density": "high"},
];

//Shuffle trail and speed_density arrays
shuffle(trail);
shuffle(speed_density);
function shuffle(o){
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

//Generate trial sequence
d3.json("data/sequence.json", function(error, data) {
    var sequence = [];
    sequence = data.sequence;

    var n = 0;
    //5X Technique
    for (i = 0; i < sequence.length; i++) {
        var freezeType = sequence[i];
        //3X Trail
        for (j = 0; j < 3; j++) {
            var trailType = trail[j];
            if (freezeType == "none") {
                trailType = "none";
                j = 4;
            }
            //2X Speed by 2X Density
            for (k = 0; k < 4; k++) {
                var speed = speed_density[k].speed;
                var density = speed_density[k].density;
                experiment_sequence[n] = {};
                experiment_sequence[n].freezeType = freezeType;
                experiment_sequence[n].trailType = trailType;
                experiment_sequence[n].speed = speed;
                experiment_sequence[n].density = density;
                n += 1;
            }
        }
    }
    experiment_length = experiment_sequence.length;
    console.log(experiment_length);
    loadNextTrial();
});

//Load JSON file
function load(file, callback) {
    d3.json("data/" + file, function(error, data) {
        if (error) {
            console.log(error);
        } else {
            console.log(data);
        }

        numTrials = data.length;
        dataset = data;

        if (typeof callback == "function") {
            callback();
        }
    });
}

//Create chart
function createChart(_speed, _trail) {
  //Add offset to current time to simulate real time data
  var now = +new Date() + 1000;
  dataset[trialNumber].forEach(function (d) {
    d.timeoffset = (now - (20 * 1000)) + d.timeoffset * 1000;
    d.timeoffset = +d.timeoffset;
    d.value = +d.value;
    d.primary = d.primary;
    d.secondary = d3.secondary;
  });

  //Create chart with specified data
  var stream = d3.select("#trialsChart")
    .datum(dataset[trialNumber])
    .call(chart);

  //Set speed modifier
  if (_speed === "high") {
    StreamScatterPlot.setClockDrift(25);
  } else {
    StreamScatterPlot.setClockDrift(0);
  }

  //Set trail modifier
  if (_trail === "none") {
      d3.select("#trails").html(
        "#tagged.point {" +
            "fill-opacity: 0.0 !important;" +
            "stroke-opacity: 0.0 !important;" +
        "}"
      );
      StreamScatterPlot.setTrails(false);
  } else if (_trail === "trail") {
      d3.select("#trails").html(
        "#tagged.point {" +
            "fill-opacity: 0.5 !important;" +
            "stroke-opacity: 0.5 !important;" +
        "}"
      );
      StreamScatterPlot.setTrails(true);
  } else {
      d3.select("#trails").html(
        "#tagged.point {" +
            "fill-opacity: 0.5 !important;" +
            "stroke-opacity: 0.5 !important;" +
        "}"
      );
      StreamScatterPlot.setTrails(false);
  }

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
    .style("fill", "#8BC34A");

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
    d3.select("#trialsChart").html("");
    loadNextTrial();
  });
}

//Loads up secondary task
//If last trial continues to closing questionnaire
//Else pass over to secondary task
function createQuestion(err, time, dis, click_period, dots_c, dots_m) {
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
        .style("fill", "#E57373");

    text.enter().append("text")
        .text(function(d, i) { return d; } )
        .attr("x", function(d, i) { return width/2 - cols*40/2 + (i%cols)*50; })
        .attr("y", function(d, i) { return height/2 - rows*40/2 + Math.trunc(i/rows)*50; })
        .style("fill", "#F4F4F4")
        .style("cursor", "default");

    numpad.on("click.numpad", click_handler)

    text.on("click.numpadText", click_handler);

    function click_handler() {
        var ans = d3.select(this).data();

        text.on("click.numpadText", null);
        numpad.on("click.numpad", null);
        svg.remove();
        d3.select("#trialsChart").html("");

        if (practice) {
            d3.select("#question_info").text(
                "Distractors On Screen: " + dis +
                " Your answer: " + ans[0]
            );
        }

        if (experiment_number + 1 == experiment_length && trialNumber + 1 >= numTrials) {
            addTrialData(err, time, dis, ans[0], click_period, dots_c, dots_m);
            goToNext();
        } else {
            addTrialData(err, time, dis, ans[0], click_period, dots_c, dots_m);
            createGo();
        }
    }
}

function createTrainer() {
    var _freeze = experiment_sequence[experiment_number].freezeType;
    var _trail= experiment_sequence[experiment_number].trailType;

    d3.select("#trainInfo").append("div")
        .attr("class", "question_info");

    d3.select("#trainInfo").append("div")
        .attr("class", "training_info")
        .html("<b>Freeze Technique: " + _freeze + "<br>" +
                "Trail Style: " + _trail + "</b><br>" +
                "'Shift' to activate freeze; 'C' to clear frozen elements" + "<br>");

    var button = d3.select("#trainInfo").append("button")
            .attr("id", "done_training")
            .text("DONE TRAINING");

    d3.select("#trialInfo").html("");

    button.on("click", function() {
        chart.destroy();
        button.on("click.train", null);
        d3.select("#trialsChart").html("");
        d3.select("#trainInfo").html("");
        practice = false;
        createGo();
    });
};

function loadNextTrial() {
    //load and display trial information
    var _freeze = experiment_sequence[experiment_number].freezeType;
    var _trail= experiment_sequence[experiment_number].trailType;
    var _speed = experiment_sequence[experiment_number].speed;
    var _density = experiment_sequence[experiment_number].density;

    if(!practice) {
        d3.select("#trainInfo").html("");

        d3.select("#trialInfo").html(
        "<b>Freeze Selector: </b>" + _freeze + "<br>" +
        "<b>Trail Type: </b>" + _trail + "<br>" +
        "<b>Speed: </b>" + _speed + "<br>" +
        "<b>Density: </b>" + _density + "<br>"
        );
    }

    if (previousFrz != _freeze || previousTrail != _trail) {
        previousFrz = _freeze;
        previousTrail = _trail;
        practice = true;
        practice_number = Math.floor((Math.random() * 3))
        createTrainer()
    }

    if (practice) {
        _practice_speed = speed_density[practice_number].speed;
        _practice_density = speed_density[practice_number].density;
        load("practice_" + _practice_density + "_density.json", function() {
            createChart(_practice_speed, _trail);
            setSelectors("normal", _freeze);
        });
        practice_number += 1;
        if (practice_number > 3)
            practice_number = 0;
    } else {
        //Do some checking to load new file only when density changes or trial number is too high
        load("stream_" + _density + "_density.json", function() {
            createChart(_speed, _trail);
            setSelectors("normal", _freeze);
        });
    }
}

function goToNext() {
    experimentr.endTimer("all_trials");
    experimentr.addData(data);
    experimentr.next();
}

function addTrialData(err, time, dis, dis_ans, click_period, dots_c, dots_m) {
    if (!practice) {

        var _freeze = experiment_sequence[experiment_number].freezeType;
        var _trail = experiment_sequence[experiment_number].trailType;
        var _speed = experiment_sequence[experiment_number].speed;
        var _density = experiment_sequence[experiment_number].density;

        var t_id = _freeze + "_" + _trail + "_" + _speed + "_" + _density + "_" + trialNumber;

        var id_time = "time_" + t_id;
        var id_err = "errors_" + t_id;
        var id_dis = "num_distractors_" + t_id;
        var id_dis_ans = "distractors_answer_" + t_id;
        var id_dots_c = "dots_clicked_" + t_id;
        var id_dots_m = "dots_missed_" + t_id;
        var id_click_period = "click_time_period_" + t_id;

        data[id_err] = err;
        data[id_time] = time;
        data[id_dis] = dis;
        data[id_dis_ans] = dis_ans;
        data[id_dots_c] = dots_c;
        data[id_dots_m] = dots_m;
        data[id_click_period] = click_period;

        trialNumber += 1;
        if (trialNumber >= numTrials) {
            console.log(JSON.stringify(data, null, "\t"));
            trialNumber = 0;
            experiment_number += 1;
        }
    }
}
