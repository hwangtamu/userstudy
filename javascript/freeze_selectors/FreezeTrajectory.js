function FreezeTrajectory(selection, clickOnly) {
	//Hold previous mouse points for dynamic data
	var prevMousePt = [0, 0];
	var extMousePt = [0, 0];
	var pts = [[]];
	var ox = 0,
		oy = 0
		lx1 = 0,
		ly1 = 0,
		lx2 = 0,
		ly2 = 0,
		x1 = 0, y1 = 0, x2 = 0, y2 = 0;

	//Name of svg element to grab for targets
	var targets = ".point";

	//Controls the 'tail' of cursor
	var i = 0;
	var threshold = 10;

	//Angle of 'flashlight'
	var angle = 50;

	//Controls accumulation behavior near freeze region
	var accumulations = false;
	//If click is true then freeze will only happen on click
	var click = (typeof clickOnly === 'undefined') ? false : clickOnly;;

	//Create cursor
	var svg = selection;
	var gCopies = svg.insert("g", ".chart").attr("class", "snapshots");
	var gSelection = svg.insert("g", ":first-child").attr("class", "freeze selector");
	var freezeRegion = gSelection.append("polyline")
		.attr("class", "freezeRegion")
		.attr("points", "0,0 0,0 0,0");

	//Create clipping for cursor selector
	var clip = svg.select("defs")
		.append("clipPath")
			.attr("id", "trajectoryClip")
		.append("path");

	//Create clicked frozen region element if set
	if (click) {
		var clickFreezeRegion = gSelection.append("polyline")
			.attr("class", "click freezeRegion")
			.attr("points", "0,0 0,0 0,0");
	}

	//Set on mousemove functionality
	svg.on("mousemove.freezeSelector", function(d,i) {
		FreezeTrajectory.redraw(d3.mouse(this));
	});


	//Set on click functionality if set
	if (click) {
		svg.on("click.freezeSelector", function(d,i) {
			mousePt = d3.mouse(this);
			clickFreezeRegion
				.attr("points", ox + "," + oy + " " +
								lx1 + "," + ly1 + " " +
								lx2 + "," + ly2);
			FreezeTrajectory.drawClipPath();
			//Only delete snapshots outside of cursor window
			FreezeTrajectory.cleanSnapshots([ox, oy], [lx1, ly1], [lx2, ly2], mousePt);
			//Copy-Pause points within cursor
			FreezeTrajectory.createSnapshots([ox, oy], [lx1, ly1], [lx2, ly2]);
	});
	}


	//Redraws 'flashlight' like cursor and 'freezes' targets on the inside
	FreezeTrajectory.redraw = function(mouse) {
		var mousePt;
		if (arguments.length == 0 && !accumulations) return;
		if (arguments.length > 0) {
			mousePt = [mouse[0], mouse[1]];
			
			x1 = prevMousePt[0];
			y1 = prevMousePt[1];
			x2 = mousePt[0];
			y2 = mousePt[1];

			if (i == threshold) {
				prevMousePt = pts.shift();
				pts.push(mousePt);
			} else if ( i < threshold) {
				i++;
				pts.push(mousePt);
			} else {
				pts.push(mousePt);
				prevMousePt = pts.shift();
			}
		} else {
			x1 = prevMousePt[0],
			y1 = prevMousePt[1],
			x2 = ox,
			y2 = oy;
		}

		if (!arguments.length) {
			mousePt = extMousePt;
		}

		extMousePt = mousePt;

		//Compute points to draw
		FreezeTrajectory.computeTrajectory();

		//Update location of cursor
		if (!click)
			FreezeTrajectory.drawClipPath();

		FreezeTrajectory.drawCursor();


		//Copy-Pause points within cursor
		if (!click)
			FreezeTrajectory.createSnapshots([ox, oy], [lx1, ly1], [lx2, ly2]);

		//Only delete snapshots outside of cursor window
		if (!click)
			FreezeTrajectory.cleanSnapshots([ox, oy], [lx1, ly1], [lx2, ly2], mousePt);
	};

	//Computes the points required to draw trajectory projection
	FreezeTrajectory.computeTrajectory = function() {
		//Hold origin x,y
		ox = x2;
		oy = y2;

		//Scale points to extend 'flashlight'
		var dist = distance([x1, y1], [x2, y2]);
		var length = Math.max(+svg.attr("width"),+svg.attr("length"));
		x2 = x2 + (x2 - x1) / dist * length * 2;
		y2 = y2 + (y2 - y1) / dist * length * 2;

		//Convert angle to radians
		var theta1 = angle * (Math.PI / 360),
			theta2 = -angle * (Math.PI / 360);

		//Apply rotation about origin
		lx1 = (x2 - ox) * Math.cos(theta1) - (y2 - oy) * Math.sin(theta1) + ox;
		ly1 = (x2 - ox) * Math.sin(theta1) + (y2 - oy) * Math.cos(theta1) + oy;

		lx2 = (x2 - ox) * Math.cos(theta2) - (y2 - oy) * Math.sin(theta2) + ox;
		ly2 = (x2 - ox) * Math.sin(theta2) + (y2 - oy) * Math.cos(theta2) + oy;
	};

	//Update position of freeze region
	FreezeTrajectory.drawCursor = function() {
		if (isFinite(ox + oy + lx1 + lx2 + ly1 + ly2)) {
			freezeRegion
				.attr("points", ox + "," + oy + " " +
								lx1 + "," + ly1 + " " +
								lx2 + "," + ly2);
		}
	};

	//Set clip path to be inside the trajectory
	FreezeTrajectory.drawClipPath = function() {
		if (isFinite(ox + oy + lx1 + lx2 + ly1 + ly2)) {
			clip
				.attr("d", "M " + ox + "," + oy + 
							" L " + lx1 + "," + ly1 + 
							" L " + lx2 + "," + ly2 + 
							" L " + ox + "," + oy);
		}
	};

	//Create snapshots inside of freeze region
	FreezeTrajectory.createSnapshots = function(ptA, ptB, ptC) {
		var points = d3.selectAll(targets);
		points
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy");

				var ptD = [x, y];

				if(det(ptA, ptB, ptD) <= 0 && det(ptA, ptC, ptD) >= 0 && d3.select(".i" + d[0] +".snapshot").empty()) {
					pt.attr("id", "tagged");
					gCopies.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("r", pointRadius)
						.attr("cx", x)
						.attr("cy", y);
				} else if ((det(ptA, ptB, ptD) >= 0 || det(ptA, ptC, ptD) <= 0) && d3.select(".i" + d[0] +".snapshot").empty()) {
					pt.attr("id", "untagged");
				}
			});
	};

	//Destroy snapshots outside of freeze region
	FreezeTrajectory.cleanSnapshots = function(ptA, ptB, ptC, mousePt) {
		d3.selectAll(".snapshot")
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy"),
					r = +pt.attr("r");

				var ptD = [x, y];

				var dist = +distance(mousePt, ptD);
				if((det(ptA, ptB, ptD) > 0 || det(ptA, ptC, ptD) < 0) && dist > r + r/2) {
					pt.remove();
				}
			});
	};

	//Set the class name used to obtain targets
	FreezeTrajectory.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return FreezeTrajectory;
	};

	//Sets the angle of trajectory
	FreezeTrajectory.cursorAngle = function(_) {
		if(!arguments.length) return angle;
		angle = _;
		return FreezeTrajectory;
	};

	//If accumulations is true, then build up will occur on the edge of freeze region
	FreezeTrajectory.accumulate = function(_) {
		if(!arguments.length) return accumulations;
		accumulations = _;
		return FreezeTrajectory;
	}
}

//Helper function for obtaining containment and intersection distances
function distance(ptA, ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}

//Find if point (C) is on/left/right of line formed by point (A,B)
function det(ptA, ptB, ptC) {
	return ((ptB[0] - ptA[0]) * (ptC[1] - ptA[1]) - (ptB[1] - ptA[1]) * (ptC[0] - ptA[0]));
}