function FreezeAroundCursor(selection, manualFreeze) {
	//Hold previous mouse point for dynamic data
	var prevMousePt = [0, 0];

	//Name of svg element to grab for targets
	var targets = ".point";

	//Freeze/Cursor radius
	var ratio = Math.pow((1 + Math.sqrt(5) / 2), 4);
	var frzRadius = Math.sqrt((window.innerWidth * window.innerHeight/2) / (ratio * Math.PI));

	//NOTE: Don't combine manual with accumulations... it doesn't work.
	//Controls accumulation behavior near freeze region
	var accumulations = false;
	//If manual is true then freeze will only happen on shift
	var manualFrz = (typeof manualFreeze === 'undefined') ? false : manualFreeze;

	//Create cursor
	var svg = selection;
	var gCopies = svg.insert("g", ".chart").attr("class", "snapshots");
	var gSelection = svg.insert("g", ":first-child").attr("class", "freeze selector");
	var freezeRegion = gSelection.append("circle")
		.attr("class","freezeRegion")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", frzRadius);

	//Create manual frozen region element if set
	if(manualFrz) {
		var manualFreezeRegion = gSelection.append("circle")
			.attr("class","manual freezeRegion")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 0);

		var clip = svg.select("defs")
			.append("clipPath")
				.attr("id", "freezeClip")
			.append("circle")
				.attr("class","manual freezeRegion")
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("r", frzRadius);
	}

	//Set on mousemove functionality
	if (!manualFrz) {
		svg.on("mousemove.freezeSelector", function(d,i) {
			freezeRegion
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",frzRadius);
			FreezeAroundCursor.redraw(d3.mouse(this));
		});
	} else {
		svg.on("mousemove.freezeSelector", function(d,i) {
			var mouse = d3.mouse(this);
			freezeRegion
				.attr("cx",mouse[0])
				.attr("cy",mouse[1])
				.attr("r",frzRadius);
			prevMousePt = mouse;
		});
	}

	//Set activator for freeze
	if (manualFrz) {
		d3.select("body")
		.on("keydown.freezeSelector", function() {
			if (d3.event.shiftKey) {
				var mouse = prevMousePt;
				manualFreezeRegion
						.attr("cx",mouse[0])
						.attr("cy",mouse[1])
						.attr("r",frzRadius);
				clip
					.attr("cx",mouse[0])
					.attr("cy",mouse[1]);
				FreezeAroundCursor.cleanSnapshots(mouse);
				FreezeAroundCursor.createSnapshots(mouse);
			}
		});
	}
	//Update freeze selector
	FreezeAroundCursor.redraw = function(mouse) {
		var mousePt;
		if (!arguments.length && !accumulations){
			return;
		} else if (!arguments.length) {
			mousePt = prevMousePt;
		} else {
			mousePt = [mouse[0], mouse[1]];
		}

		prevMousePt = mousePt;

		//Update location of cursor
		FreezeAroundCursor.drawCursor(mousePt);

		//Copy-Pause points within cursor
		FreezeAroundCursor.createSnapshots(mousePt);

		//Only delete snapshots outside of cursor window
		FreezeAroundCursor.cleanSnapshots(mousePt);
	};

	//Update position of freeze region
	FreezeAroundCursor.drawCursor = function(mousePt) {
		freezeRegion
			.attr("cx", mousePt[0])
			.attr("cy", mousePt[1]);
	}

	//Create snapshots inside of freeze region
	FreezeAroundCursor.createSnapshots = function(mousePt) {
		var points = d3.selectAll(targets);
		points
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy"),
					r = +pt.attr("r");

				var targetPt = [x, y];
				var currDist = distance(mousePt,targetPt);

				if (currDist <= (frzRadius + r) && d3.select(".i" + d[0] + ".snapshot").empty()) {
					pt.attr("id", "tagged");

					gCopies.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("r", r)
						.attr("cx", x)
						.attr("cy", y);

				} else if (currDist > (frzRadius + r) && d3.select(".i" + d[0] +".snapshot").empty()) {
					pt.attr("id", "untagged");
				}
			});
	};

	//Destroy snapshots outside of freeze region
	FreezeAroundCursor.cleanSnapshots = function(mousePt) {
		d3.selectAll(".snapshot")
			.each(function(d, i) {
				var pt = d3.select(this)
				var x = +pt.attr("cx"),
					y = +pt.attr("cy"),
					r = +pt.attr("r");

				var targetPt = [x, y];

				var currDist = distance(mousePt, targetPt);
				if (currDist > frzRadius + r) {
					pt.remove();
				}
			});
	};

	//Set the class name used to obtain targets
	FreezeAroundCursor.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return FreezeAroundCursor;
	};

	//Set freeze region radius
	FreezeAroundCursor.freezeRadius = function(_) {
		if(!arguments.length) return frzRadius;
		frzRadius = _;
		return FreezeAroundCursor;
	};

	//If accumulations is true, then build up will occur on the edge of freeze region
	FreezeAroundCursor.accumulate = function(_) {
		if(!arguments.length) return accumulations;
		accumulations = _;
		return FreezeAroundCursor;
	};

	return FreezeAroundCursor;
}

//Helper function for obtaining containment and intersection distances
function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}