function FreezeAroundClosest(selection, manualFreeze) {
	//Hold previous mouse points for dynamic data
	var prevMousePt = [0,0];
	var previousPoint = null;

	//Name of svg element to grab for targets
	var targets = ".point"

	//Controls accumulation behavior near freeze region
	var accumulations = false;
	var swap = false;

	//If manual is true then freeze will only happen on shift
	var manualFrz = (typeof manualFreeze === 'undefined') ? false : manualFreeze;

	//Element that contains the 'snapshots' of frozen data
	var gCopies = selection.insert("g", ".chart").attr("class", "snapshots");

	//Element that contains the freeze region
	var gSelection = selection.insert("g", ":first-child").attr("class", "freeze selector");

	//Freeze radius is based off the golden ratio ^4th of the chart size
	var width = +selection.style("width").slice(0, -2);
	var height = +selection.style("height").slice(0, -2);
	var ratio = Math.pow((1 + Math.sqrt(5) / 2), 4);
	var frzRadius = Math.sqrt((width * height) / (ratio * Math.PI));

	//Create freeze region visual
	var freezeRegion = gSelection.append("circle")
		.attr("class","freezeRegion")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0);

	if(manualFrz) {
		//Create manual freeze region visual if applicable
		var manualFreezeRegion = gSelection.append("circle")
			.attr("class","manual freezeRegion")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 0);
	}

	//Create clip for freeze region
	var clip = selection.select("defs")
		.append("clipPath")
			.attr("id", "freezeClip")
		.append("circle")
			.attr("class","clip freezeRegion")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", frzRadius);

	//Redraw freeze region on mousemove
	selection.on("mousemove.freezeSelector", function(d,i) {
		FreezeAroundClosest.redraw(d3.mouse(this));
	});

	//Set activator for manual freeze (shift key)
	if (manualFrz) {
		d3.select("body")
		.on("keydown.freezeSelector", function() {
			if (d3.event.shiftKey) {
				d3.selectAll(targets).attr("id", "untagged");
				d3.selectAll(".snapshot").remove();
				var mouse = prevMousePt;
				var target = FreezeAroundClosest.findClosest(mouse);
				var currPt = [target.attr("x"), target.attr("y")];

				//Update location of manual freeze region
				manualFreezeRegion
						.attr("cx", currPt[0])
						.attr("cy", currPt[1])
						.attr("r", frzRadius);

				//Update location of its clip
				clip
					.attr("cx",currPt[0])
					.attr("cy",currPt[1]);

				//Clean and untag current snapshots
				FreezeAroundClosest.cleanSnapshots(currPt);
				d3.selectAll(".point").attr("id", "untagged");

				//Create new snapshots inside freeze region
				FreezeAroundClosest.createSnapshots(currPt, target);
			}
		});
	}

	//Update freeze selector
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
		var currPt = [target.attr("x"), target.attr("y")];

		//Set size of cursor morph
		FreezeAroundClosest.drawCursor(currPt);

		//Snapshot points near target
		if(!manualFrz) {
			FreezeAroundClosest.createSnapshots(currPt, target);
		}

		//Update freeze region clip
		if(!manualFrz) {
			clip
				.attr("cx",currPt[0])
				.attr("cy",currPt[1]);
		}

		//Remove snapshots out of targets area
		if (!manualFrz) {
			FreezeAroundClosest.cleanSnapshots(currPt);
		}
	};

	//Gets the closest target
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
				var x = +pt.attr("x"),
						y = +pt.attr("y"),
						w = +pt.attr("width")
						h = +pt.attr("height")
						rx = +pt.attr("rx")
						ry = +pt.attr("ry")
						fill = pt.attr("fill");

				var r = Math.sqrt(w*w + h*h);
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

	//Update position of freeze region
	FreezeAroundClosest.drawCursor = function(currPt) {
		//NOTE: This is no good on node server; great on python server?????
		freezeRegion.transition().duration(25).ease("linear")
			.attr("cx", currPt[0])
			.attr("cy", currPt[1])
			.attr("r", frzRadius);
	};

	//Create snapshots inside of freeze region
	FreezeAroundClosest.createSnapshots = function(currPt, target) {
		if (target.attr("id") != "snap") {
			target
				.attr("id", "tagged")
				.each(function(d, i) {
					gCopies.append("rect")
						.attr("class", "i" + d[3] + " snapshot")
						.attr("id", "snap")
						.attr("x", currPt[0])
						.attr("y", currPt[1])
						.attr("width", d3.select(this).attr("width"))
						.attr("height", d3.select(this).attr("height"))
						.attr("rx", d3.select(this).attr("rx"))
						.attr("ry", d3.select(this).attr("ry"));
				});
		}

		d3.selectAll(".point")
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("x"),
						y = +pt.attr("y"),
						w = +pt.attr("width")
						h = +pt.attr("height")
						rx = +pt.attr("rx")
						ry = +pt.attr("ry")
						fill = pt.attr("fill");

				var r = Math.sqrt(w*w + h*h);
				var targetPt = [x, y];
				var currDist = distance(currPt,targetPt);

				var point = pt;
				if(currDist <= (frzRadius + r) && d3.select(".i" + d[3] +".snapshot").empty() && point.attr("id") != "tagged" && (accumulations || swap || manualFrz)) {
					point.attr("id", "tagged");
					gCopies.append("rect")
						.attr("class", "i" + d[3] + " snapshot")
						.attr("id", "snap")
						.attr("width", w)
						.attr("height", h)
						.attr("x", x)
						.attr("y", y)
						.attr("rx", rx)
						.attr("ry", ry)
						.attr("fill", fill);
				} else if (currDist > (frzRadius + r) && point.attr("id") == "tagged" && d3.select(".i" + d[3] +".snapshot").empty()) {
					point.attr("id", "untagged");
				}

			});
	};

	//Destroy snapshots outside of freeze region
	FreezeAroundClosest.cleanSnapshots = function(currPt) {
		d3.selectAll(".snapshot")
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("x"),
						y = +pt.attr("y"),
						w = +pt.attr("width")
						h = +pt.attr("height")
						rx = +pt.attr("rx")
						ry = +pt.attr("ry")
						fill = pt.attr("fill");
				var r = Math.sqrt(w*w + h*h);

				var targetPt = [x, y];
				var currDist = distance(currPt,targetPt);

				if (currDist > frzRadius + r) {
					pt.remove();
				}
			});
	};

	//Set the class name used to obtain targets
	FreezeAroundClosest.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return FreezeAroundClosest;
	};

	//If accumulations is true, then build up will occur on the edge of freeze region
	FreezeAroundClosest.accumulate = function(_) {
		if(!arguments.length) return accumulations;
		accumulations = _;
		return FreezeAroundClosest;
	}
}

function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}
