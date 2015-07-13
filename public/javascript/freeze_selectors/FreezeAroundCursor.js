function FreezeAroundCursor(selection, manualFreeze) {
	//Hold previous mouse point for dynamic data
	var prevMousePt = [0, 0];

	//Name of svg element to grab for targets
	var targets = ".point";

	//NOTE: Don't combine manual with accumulations... it doesn't work.
	//Controls accumulation behavior near freeze region
	var accumulations = false;

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
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", frzRadius);

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

	if (!manualFrz) {
		//Redraw freeze region and update frozen elements on mouse move
		selection.on("mousemove.freezeSelector", function(d,i) {
			var mouse = d3.mouse(this);
			freezeRegion
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",frzRadius);
			clip
				.attr("cx",mouse[0])
				.attr("cy",mouse[1]);
			FreezeAroundCursor.redraw(mouse);
		});
	} else {
		//Redraw freeze region on mousemove; store mouse location
		selection.on("mousemove.freezeSelector", function(d,i) {
			var mouse = d3.mouse(this);
			freezeRegion
				.attr("cx",mouse[0])
				.attr("cy",mouse[1])
				.attr("r",frzRadius);
			prevMousePt = mouse;
		});
	}

	//Set activator for manual freeze (shift key)
	if (manualFrz) {
		d3.select("body")
		.on("keydown.freezeSelector", function() {
			var mouse = prevMousePt;
			if (d3.event.shiftKey) {

				//Update location of manual freeze region
				manualFreezeRegion
						.attr("cx",mouse[0])
						.attr("cy",mouse[1])
						.attr("r",frzRadius);

				//Update location of its clip
				clip
					.attr("cx",mouse[0])
					.attr("cy",mouse[1]);

				//Clean then create snapshots inside freeze region
				d3.selectAll(targets).attr("id", "untagged");
				d3.selectAll(".snapshot").remove();
				FreezeAroundCursor.cleanSnapshots(mouse);
				FreezeAroundCursor.createSnapshots(mouse);
			} else if (d3.event.keyCode == 67) {
				//Update location of manual freeze region
				manualFreezeRegion
						.attr("cx",0)
						.attr("cy",0)
						.attr("r",0);

				//Update location of its clip
				clip
					.attr("cx",0)
					.attr("cy",0);

				d3.selectAll(targets).attr("id", "untagged");
				d3.selectAll(".snapshot").remove();
				FreezeAroundCursor.cleanSnapshots(mouse);
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

		//Update location of freeze region
		FreezeAroundCursor.drawCursor(mousePt);

		//Freeze points within cursor by creating snapshots
		FreezeAroundCursor.createSnapshots(mousePt);

		//Delete snapshots outside of freeze region
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

				if (currDist <= frzRadius && d3.select(".i" + d[3] + ".snapshot").empty()) {
					pt.attr("id", "tagged");

					gCopies.append("rect")
						.attr("class", d[2].replace("point", "") + "i" + d[3] + " snapshot")
						.attr("width", w)
						.attr("height", h)
						.attr("x", x)
						.attr("y", y)
						.attr("rx", rx)
						.attr("ry", ry)
						.attr("fill", fill);

				} else if (currDist > frzRadius && d3.select(".i" + d[3] +".snapshot").empty()) {
					pt.attr("id", "untagged");
				}
			});
	};

	//Destroy snapshots outside of freeze region
	FreezeAroundCursor.cleanSnapshots = function(mousePt) {
		d3.selectAll(".snapshot")
			.each(function(d, i) {
				var pt = d3.select(this)
				var x = +pt.attr("x"),
						y = +pt.attr("y"),
						w = +pt.attr("width")
						h = +pt.attr("height")
						rx = +pt.attr("rx")
						ry = +pt.attr("ry")
						fill = pt.attr("fill");
				var r = Math.sqrt(w*w + h*h);

				var targetPt = [x, y];

				var currDist = distance(mousePt, targetPt);
				if (currDist > frzRadius) {
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
