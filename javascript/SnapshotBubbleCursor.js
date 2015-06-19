//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function SnapshotBubbleCursor(selection) {
	//Hold previous mouse points for dynamic data
	var prevMousePt = [0,0];
	var previousPoint = null;

	//Name of svg element to grab for targets
	var targets = ".point"

	//Controls radius of freeze region
	var targetRadius = 70;

	//Controls accumulation behavior near freeze region
	var accumulations = true;

	//Color for corresponding points
	defaultColor = "steelblue";
	targetColor = "springgreen";
	snapColor = "orange";

	//Create cursor
	var svg = selection;
	var gCopies = svg.insert("g", ".chart").attr("class", "copies");
	var gSelection = svg.insert("g", ":first-child").attr("class", "selection");
	var cursor = gSelection.append("circle")
		.attr("class","cursor")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0)
		.style("fill","lightgray")
		.style("fill-opacity","0.5");

	//Create cursor morph
	var cursorMorph = gSelection.append("circle")
		.attr("class","cursorMorph")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0)
		.style("fill","lightgray")
		.style("fill-opacity","0.5");

	//Set on mousemove
	svg.on("mousemove.SnapshotBubbleCursor." + selection.attr("id"), function(d,i) {
		var target = SnapshotBubbleCursor.redraw(d3.mouse(this));
	});

	//Hide mouse when outside svg selection
	svg.on("mouseout.SnapshotBubbleCursor."  + selection.attr("id"), function(d, i) {
		cursor
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);

		cursorMorph
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);
	});

	//Draws bubble cursor and handles freezing of nearby targets
	//Requires dynamic data to call this function in it's update loop
	//Returns target obtained from bubble cursor as well
	SnapshotBubbleCursor.redraw = function(mouse) {
		var points = d3.selectAll(".point, .snapshot");
		var target;
		var mousePt;

		//If no mouse input given; use previous placement of mouse
		if (!arguments.length){
			mousePt = prevMousePt;
		} else {
			mousePt = [mouse[0], mouse[1]];
			prevMousePt = mousePt;
		}

		var currMin = 0;
		var currX, currY, currRad;
		var Dist = [],
			ConD = [],
			IntD = [];

		//Find closest target
		points
			.style("fill", function() { return d3.select(this).attr("id") == "snap" ? "orange" : defaultColor; })
			.style("stroke", function() { return d3.select(this).attr("id") == "snap" ? "orange" : defaultColor; })
			.style("fill-opacity", function() { return d3.select(this).attr("id") == "tagged" ? 0.5 : 1.0; })
			.style("stroke-opacity", function() { return d3.select(this).attr("id") == "tagged" ? 0.5 : 1.0; })
			.filter(function() { return d3.select(this).attr("id") != ("tagged"); })
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy"),
					r = +pt.attr("r");
				var targetPt = [x, y];
				var currDist = distance(mousePt,targetPt);
				Dist.push(currDist);

				ConD.push(currDist + r);
				IntD.push(currDist - r);

				if(IntD[i] <= IntD[currMin]) {
					currMin = i;
					currX = x;
					currY = y;
					currRad = r;
					target = pt;
				}
			});

		//Set previous point
		if (target != null && target.attr("id") == "snap") {
			previousPoint = target;
		}

		//If target isn't already a snapshot; create snapshot
		if (target.attr("id") != "snap") {
			target
				.attr("id", "tagged")
				.each(function(d, i) {
					gCopies.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("id", "snap")
						.attr("cx", currX)
						.attr("cy", currY)				
						.attr("r", currRad)
						.style("fill", targetColor)
						.style("stroke", targetColor);
				});
		}
		
		//Set coloration of selected target
		target
			.style("fill", targetColor)
			.style("stroke", targetColor); 


		//Find second closest point to pick from for cursor selection
		var secondMin = (currMin + 1) % points.size();
		for (var j = 0; j < Dist.length; j++) {
			if (j != currMin && IntD[j] < IntD[secondMin]) {
				secondMin = j;
			}
		}

		//Resize cursor radius
		if (isFinite(IntD[secondMin])) {
			cursorRadius = Math.min(ConD[currMin], IntD[secondMin]);
		} else {
			cursorRadius = ConD[currMin];
		} 

		//Set size of cursor
		cursor
			.attr("cx",mousePt[0])
			.attr("cy",mousePt[1])
			.attr("r", Math.abs(cursorRadius));

		//Set size of cursor morph
		cursorMorph
			.attr("cx", currX)
			.attr("cy", currY)
			.attr("r", targetRadius);

		//Snapshot points near target
		var currPt = [currX, currY];
		d3.selectAll(".point")
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy"),
					r = +pt.attr("r");point

				var targetPt = [x, y];
				var currDist = distance(currPt,targetPt);

				var point = pt;
				if(currDist < targetRadius && d3.select(".i" + d[0] +".snapshot").empty() && point.attr("id") != "tagged" && accumulations) {
					point.attr("id", "tagged");
					gCopies.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("id", "snap")
						.attr("cx", x)
						.attr("cy", y)				
						.attr("r", r)
						.style("fill", targetColor)
						.style("stroke", targetColor);
				} else if (currDist > targetRadius && point.attr("id") == "tagged" && previousPoint != target) {
					point.attr("id", "untagged");
				} else if (currDist > targetRadius && d3.select(".i" + d[0] +".snapshot").empty()) {
					point.attr("id", "untagged");
				}

			});

		//Update previouspoint if target is different
		if (previousPoint != target) {
			previousPoint = target;
		}

		//Remove snapshots out of targets area
		d3.selectAll(".snapshot") 
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy");

				var targetPt = [x, y];
				var currDist = distance(currPt,targetPt);

				if (currDist > targetRadius) {
					pt.remove();
				}
			});
		
		return target;
	};

	SnapshotBubbleCursor.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return SnapshotBubbleCursor;
	};

	SnapshotBubbleCursor.accumulate = function(_) {
		if(!arguments.length) return accumulations;
		accumulations = _;
		return SnapshotBubbleCursor;
	}
}

//Helper function for obtaining containment and intersection distances
function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}