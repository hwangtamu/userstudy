//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function SnapshotLineCursor(svg) {
	//Variable to hold previous mouse points for dynamic data
	var prevMousePt = [0, 0];
	var ox = 0,
		oy = 0;
	var pts = [[]];
	var i = 0;
	var threshold = 10;
	var cRad = 30;
	var angle = 30;

	//Name of svg element to grab for targets
	var targets = ".point";

	//Create cursor
	var polyline = svg.append("polyline")
		.attr("points", "0,0 0,0 0,0")
		.style("fill", "lightgrey")
		.style("fill-opacity", "0.5");

	//Set on mousemove
	svg.on("mousemove", function(d,i) {
		var target = SnapshotLineCursor.draw(d3.mouse(this));
	});

	//Hide mouse when outside svg selection
	svg.on("mouseout", function(d, i) {
		polyline
			.attr("points", "0,0 0,0 0,0");
	});

	SnapshotLineCursor.draw = function(mouse) {
		var mousePt;
		if (arguments.length > 0) {
			mousePt = [mouse[0], mouse[1]];
			
			var x1 = prevMousePt[0],
				y1 = prevMousePt[1],
				x2 = mousePt[0],
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
			var x1 = prevMousePt[0],
				y1 = prevMousePt[1],
				x2 = ox,
				y2 = oy;
		}

		//Hold origin x,y
		ox = x2;
		oy = y2;

		//Scale points to extend 'flashlight'
		dist = distance([x1, y1], [x2, y2]);
		var length = Math.max(+svg.attr("width"),+svg.attr("length"));
		x2 = x2 + (x2 - x1) / dist * length;
		y2 = y2 + (y2 - y1) / dist * length;

		//Convert angle to radians
		var theta1 = angle * (Math.PI / 180),
			theta2 = -angle * (Math.PI / 180);

		//Apply rotation about origin
		var lx1 = (x2 - ox) * Math.cos(theta1) - (y2 - oy) * Math.sin(theta1) + ox,
			ly1 = (x2 - ox) * Math.sin(theta1) + (y2 - oy) * Math.cos(theta1) + oy;

		var lx2 = (x2 - ox) * Math.cos(theta2) - (y2 - oy) * Math.sin(theta2) + ox,
			ly2 = (x2 - ox) * Math.sin(theta2) + (y2 - oy) * Math.cos(theta2) + oy;

		//Update location of cursor
		if (isFinite(x2) && isFinite(y2)) {
			polyline
				.attr("points", x1 + "," + y1 + " " +
								lx1 + "," + ly1 + " " +
								lx2 + "," + ly2);
		}

		//Copy-Pause points within cursor
		var points = d3.selectAll(targets);
		points.each(function(d, i) {
			var x = +d3.select(this).attr("cx");
			var y = +d3.select(this).attr("cy");

			var ptA = [x1, y1];
			var ptB = [lx1, ly1];
			var ptC = [lx2, ly2];
			var ptD = [x, y];

			if(det(ptA, ptB, ptD) <= 0 && det(ptA, ptC, ptD) >= 0 && d3.select(".i" + d[0] +".snapshot").empty()) {
				svg.append("circle")
					.attr("class", "i" + d[0] + " snapshot")
					.attr("r", pointRadius)
					.attr("cx", x)
					.attr("cy", y);
			}
		});

		// //Only delete snapshots outside of cursor window
		d3.selectAll(".snapshot").each(function(d, i) {

			var x = +d3.select(this).attr("cx");
			var y = +d3.select(this).attr("cy");

			var ptA = [x1, y1];
			var ptB = [lx1, ly1];
			var ptC = [lx2, ly2];
			var ptD = [x, y];

			if(det(ptA, ptB, ptD) > 0 || det(ptA, ptC, ptD) < 0) {
				d3.select(this).remove();
			}
		});
	};

	SnapshotLineCursor.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return SnapshotLineCursor;
	};

	SnapshotLineCursor.cursorRadius = function(_) {
		if(!arguments.length) return cRad;
		cRad = _;
		return SnapshotLineCursor;
	};

	SnapshotLineCursor.cursorAngle = function(_) {
		if(!arguments.length) return angle;
		angle = _;
		return SnapshotLineCursor;
	};
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