function FreezeTrajectory(selection, manualFreeze) {
	//Hold previous mouse points for dynamic data
	var prevMousePt = [0, 0];
	var extMousePt = [0, 0];

	//Store previous mouse point positions
	var pts = [[]];

	//Store values of points used creating trajectory visual
	var ox = 0, oy = 0
		lx1 = 0, ly1 = 0,
		lx2 = 0, ly2 = 0,
		x1 = 0, y1 = 0,
		x2 = 0, y2 = 0;

	//Name of svg element to grab for targets
	var targets = ".point";

	//Controls the 'tail' of cursor
	var i = 0;
	var j = 0;
	var threshold = 6;

	//Angle of 'flashlight'
	var angle = 50;

	//Controls accumulation behavior near freeze region
	var accumulations = false;
	//If manual is true then freeze will only happen on shift
	var manualFrz = (typeof manualFreeze === 'undefined') ? false : manualFreeze;

	//Element that contains the 'snapshots' of frozen data
	var gCopies = selection.insert("g", ".chart").attr("class", "snapshots");

	//Element that contains the freeze region
	var gSelection = selection.insert("g", ":first-child").attr("class", "freeze selector");

	//Create freeze region visual
	var freezeRegion = gSelection.append("polyline")
		.attr("class", "freezeRegion")
		.attr("points", "0,0 0,0 0,0");

	//Create clipping for freeze region
	var clip = selection.select("defs")
		.append("clipPath")
			.attr("id", "freezeClip")
		.append("path");

	//Create manual freeze region visual if applicable
	if (manualFrz) {
		var manualFreezeRegion = gSelection.append("polyline")
			.attr("class", "manual freezeRegion")
			.attr("points", "0,0 0,0 0,0");
	}

	//Redraw freeze region on mousemove
	selection.on("mousemove.freezeSelector", function(d,i) {
		FreezeTrajectory.redraw(d3.mouse(this));
	});

	//Set activator for manual freeze (shift key)
	if (manualFrz) {
		d3.select("body")
			.on("keydown.freezeSelector", function() {
				mousePt = d3.mouse(this);
				if (d3.event.shiftKey) {
					//Update location of manual freeze region
					manualFreezeRegion
						.attr("points", ox + "," + oy + " " +
										lx1 + "," + ly1 + " " +
										lx2 + "," + ly2);

					//Update location of its clip
					FreezeTrajectory.drawClipPath();

					//Clean and untag current snapshots
					d3.selectAll(targets).attr("id", "untagged");
					d3.selectAll(".snapshot").remove();
					FreezeTrajectory.cleanSnapshots([ox, oy], [lx1, ly1], [lx2, ly2], mousePt);

					//Create new snapshots inside freeze region
					FreezeTrajectory.createSnapshots([ox, oy], [lx1, ly1], [lx2, ly2]);
				} else if (d3.event.keyCode == 67) {
					manualFreezeRegion
						.attr("points", 0 + "," + 0 + " " +
														0 + "," + 0 + " " +
														0 + "," + 0);
					d3.selectAll(targets).attr("id", "untagged");
					d3.selectAll(".snapshot").remove();
					FreezeTrajectory.cleanSnapshots([ox, oy], [lx1, ly1], [lx2, ly2], mousePt);
				}
			});
	}


	//Redraws 'flashlight' like cursor and 'freezes' targets on the inside
	FreezeTrajectory.redraw = function(mouse) {
		var mousePt;
		if (arguments.length === 0 && !accumulations) return;
		if (arguments.length > 0) {
			mousePt = [mouse[0], mouse[1]];

			x1 = prevMousePt[0];
			y1 = prevMousePt[1];
			x2 = mousePt[0];
			y2 = mousePt[1];

			//Store previous mouse points and interpolate line over those points
			if (i === threshold && j % 4 === 0) {
				j = 0;
				pts.push(mousePt);
				prevMousePt = catmullRomSpline2D(pts, 0.5);
				// prevMousePt = pts.shift();
				pts.shift();
			} else if (i < threshold && j % 4 === 0) {
				i++;
				pts.push(mousePt);
			}

			j++;

			if (pts.length < threshold) {
				prevMousePt = mousePt;
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

		//Update location of freeze region
		FreezeTrajectory.drawCursor();

		//Update location of its clip
		if (!manualFrz)
			FreezeTrajectory.drawClipPath();

		//Freeze points within cursor by creating snapshots
		if (!manualFrz)
			FreezeTrajectory.createSnapshots([ox, oy], [lx1, ly1], [lx2, ly2]);

		//Delete snapshots outside of freeze region
		if (!manualFrz)
			FreezeTrajectory.cleanSnapshots([ox, oy], [lx1, ly1], [lx2, ly2], mousePt);
	};

	//Computes the points required to draw trajectory projection
	FreezeTrajectory.computeTrajectory = function() {
		//Hold origin x,y
		ox = x2;
		oy = y2;

		//Scale points to extend 'flashlight'
		var dist = distance([x1, y1], [x2, y2]);
		var width = +selection.style("width").slice(0, -2);
		var height = +selection.style("height").slice(0, -2);
		var length = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
		x2 = x2 + (x2 - x1) / dist * length;
		y2 = y2 + (y2 - y1) / dist * length;

		var ratio = Math.pow((1 + Math.sqrt(5) / 2), 4);
		ox = ox + (ox - x1) / dist * -(length/ratio);
		oy = oy + (oy - y1) / dist * -(length/ratio);

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

	//Set clip path of freeze region
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
				var x = +pt.attr("x"),
						y = +pt.attr("y"),
						w = +pt.attr("width"),
						h = +pt.attr("height"),
						rx = +pt.attr("rx"),
						ry = +pt.attr("ry"),
						fill = pt.attr("fill");

				var ptD = [x, y];

				if(det(ptA, ptB, ptD) <= 0 && det(ptA, ptC, ptD) >= 0 && d3.select(".i" + d[3] +".snapshot").empty()) {
					pt.attr("id", "tagged");
					gCopies.append("rect").datum(d[3])
						.attr("class", d[2].replace("point", "") + "i" + d[3] + " snapshot")
						.attr("width", w)
						.attr("height", h)
						.attr("x", x)
						.attr("y", y)
						.attr("rx", rx)
						.attr("ry", ry)
						.attr("fill", fill);
				} else if ((det(ptA, ptB, ptD) >= 0 || det(ptA, ptC, ptD) <= 0) && d3.select(".i" + d[3] +".snapshot").empty()) {
					pt.attr("id", "untagged");
				}
			});
	};

	//Destroy snapshots outside of freeze region
	FreezeTrajectory.cleanSnapshots = function(ptA, ptB, ptC, mousePt) {
		d3.selectAll(".snapshot")
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("x"),
						y = +pt.attr("y");

				var ptD = [x, y];

				var dist = +distance(mousePt, ptD);
				if((det(ptA, ptB, ptD) > 0 || det(ptA, ptC, ptD) < 0)) {
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
	};
}

//Interpolate points based on a catmull rom spline
function catmullRomSpline2D(arr, t) {
	p0 = arr[0];
	p1 = arr[1];
	p2 = arr[2];
	p3 = arr[3];
	var x = q(p0[0], p1[0], p2[0], p3[0], t);
	var y = q(p0[1], p1[1], p2[1], p3[1], t);
	return [x, y];
}

function  q(p0, p1, p2, p3, t) {
    return 0.5 * ((2 * p1) +
                  (p2 - p0) * t +
                  (2*p0 - 5*p1 + 4*p2 - p3) * t * t +
                  (3*p1 -p0 - 3 * p2 + p3) * t * t * t);
}

function distance(ptA, ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}

//Simple determinant function
function det(ptA, ptB, ptC) {
	return ((ptB[0] - ptA[0]) * (ptC[1] - ptA[1]) - (ptB[1] - ptA[1]) * (ptC[0] - ptA[0]));
}
