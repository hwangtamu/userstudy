//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function FreezeAroundClosest(selection, clickOnly) {
	//Hold previous mouse points for dynamic data
	var prevMousePt = [0,0];
	var previousPoint = null;

	//Name of svg element to grab for targets
	var targets = ".point"

	//Controls radius of freeze region
	var frzRadius = Math.sqrt((window.innerWidth * window.innerHeight/2) / (10 * Math.PI));

	//Controls accumulation behavior near freeze region
	var accumulations = false;
	var swap = false;
	
	//If click is true then freeze will only happen on click
	var click = (typeof clickOnly === 'undefined') ? false : clickOnly;

	//Create cursor
	var svg = selection;
	var gCopies = svg.insert("g", ".chart").attr("class", "snapshots");
	var gSelection = svg.insert("g", ":first-child").attr("class", "freeze selector");

	//Create cursor morph
	var freezeRegion = gSelection.append("circle")
		.attr("class","freezeRegion")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0);

	if(click) {
		var clickFreezeRegion = gSelection.append("circle")
			.attr("class","click freezeRegion")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 0);
	}

	//Set on mousemove
	svg.on("mousemove.FreezeAroundClosest." + selection.attr("id"), function(d,i) {
		FreezeAroundClosest.redraw(d3.mouse(this));
	});

	if (click) {
		svg.on("click.FreezeAroundCursor." + selection.attr("id"), function(d,i) {
			var mouse = d3.mouse(this);
			var target = FreezeAroundClosest.findClosest(mouse);
			var currPt = [target.attr("cx"), target.attr("cy")];
			FreezeAroundClosest.cleanSnapshots(currPt);
			FreezeAroundClosest.createSnapshots(currPt, target);
			clickFreezeRegion
				.attr("cx",currPt[0])
				.attr("cy",currPt[1])
				.attr("r",frzRadius);
		});
	}

	FreezeAroundClosest.redraw = function(mouse) {
		var target;
		var mousePt;

		//If no mouse input given; use previous placement of mouse
		if (!arguments.length){
			mousePt = prevMousePt;
		} else {
			mousePt = [mouse[0], mouse[1]];
			prevMousePt = mousePt;
		}

		//Find closest target
		var target = FreezeAroundClosest.findClosest(mousePt);
		var currPt = [target.attr("cx"), target.attr("cy")];
		
		//Set size of cursor morph
		FreezeAroundClosest.drawCursor(currPt);

		//Snapshot points near target
		if(!click) {
			FreezeAroundClosest.createSnapshots(currPt, target);
		}

		//Remove snapshots out of targets area
		if (!click) {
			FreezeAroundClosest.cleanSnapshots(currPt);
		}
	};

	FreezeAroundClosest.findClosest = function(mousePt) {
		var points = d3.selectAll(".point, .snapshot");
		var target;
		var Dist = [],
			ConD = [],
			IntD = [];
		var currMin = 0;

		points
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
					target = pt;
				}
			});

		//Set previous point
		if (target != null && previousPoint == null) {
			previousPoint = target;
		} else if (target == null || previousPoint == null) { 
			console.log("bad");
		} else if ( target.attr("class") != previousPoint.attr("class") ) {
			previousPoint = target;
			swap = true;
		} else {
			swap = false;
		}
		return target;
	};

	FreezeAroundClosest.drawCursor = function(currPt) {
		freezeRegion
			.attr("cx", currPt[0])
			.attr("cy", currPt[1])
			.attr("r", frzRadius);
	};

	FreezeAroundClosest.createSnapshots = function(currPt, target) {
		if (target.attr("id") != "snap") {
			target
				.attr("id", "tagged")
				.each(function(d, i) {
					gCopies.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("id", "snap")
						.attr("cx", currPt[0])
						.attr("cy", currPt[1])				
						.attr("r", d3.select(this).attr("r"));
				});
		}

		d3.selectAll(".point")
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy"),
					r = +pt.attr("r");point

				var targetPt = [x, y];
				var currDist = distance(currPt,targetPt);

				var point = pt;
				if(currDist <= frzRadius && d3.select(".i" + d[0] +".snapshot").empty() && point.attr("id") != "tagged" && (accumulations || swap || click)) {
					point.attr("id", "tagged");
					gCopies.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("id", "snap")
						.attr("cx", x)
						.attr("cy", y)				
						.attr("r", r)
				} else if (currDist > frzRadius && point.attr("id") == "tagged" && d3.select(".i" + d[0] +".snapshot").empty()) {
					point.attr("id", "untagged");
				}

			});
	};

	FreezeAroundClosest.cleanSnapshots = function(currPt) {
		d3.selectAll(".snapshot") 
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy");

				var targetPt = [x, y];
				var currDist = distance(currPt,targetPt);

				if (currDist > frzRadius) {
					pt.remove();
				}
			});
	};

	FreezeAroundClosest.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return FreezeAroundClosest;
	};

	FreezeAroundClosest.accumulate = function(_) {
		if(!arguments.length) return accumulations;
		accumulations = _;
		return FreezeAroundClosest;
	}
}

//Helper function for obtaining containment and intersection distances
function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}