//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function SnapshotCursor(svg) {
	//Variable to hold previous mouse points for dynamic data
	var prevMousePt = [0, 0];

	//Name of svg element to grab for targets
	var targets = ".point";

	//default cursor radius
	var cRad = 80;

	//Create cursor
	var cursor = svg.append("circle")
		.attr("class","cursor")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", cRad)
		.style("fill","lightgray")
		.style("fill-opacity","0.5");

	//Set on mousemove
	svg.on("mousemove", function(d,i) {
		cursor
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",cRad);
		var target = SnapshotCursor.draw(d3.mouse(this));
	});

	//Hide mouse when outside svg selection
	svg.on("mouseout", function(d, i) {
		cursor
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);
		prevMousePt = [-cRad ,-cRad];
	});

	SnapshotCursor.draw = function(mouse) {
		var mousePt;
		if (!arguments.length){
			mousePt = prevMousePt;
		} else {
			mousePt = [mouse[0], mouse[1]];
		}
		prevMousePt = mousePt;

		//Update location of cursor
		cursor
			.attr("cx", mousePt[0])
			.attr("cy", mousePt[1]);

		//Copy-Pause points within cursor
		var points = d3.selectAll(targets);

		points.each(function(d, i) {
			var x = +d3.select(this).attr("cx"),
				y = +d3.select(this).attr("cy");

			var targetPt = [x, y];
			var currDist = distance(mousePt,targetPt);

			if (currDist < cRad && d3.select(".i" + d[0] +".snapshot").empty()) {

				svg.append("circle")
					.attr("class", "i" + d[0] + " snapshot")
					.attr("r", pointRadius)
					.attr("cx", x)
					.attr("cy", y);
			}
		});

		//Only delete snapshots outside of cursor window
		d3.selectAll(".snapshot").each(function(d, i) {

			var x = +d3.select(this).attr("cx"),
				y = +d3.select(this).attr("cy");

			var targetPt = [x, y];
			var currDist = distance(mousePt,targetPt);

			if (currDist > cRad) {
				d3.select(this).remove();
			}
		});
	};

	SnapshotCursor.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return SnapshotCursor;
	};

	SnapshotCursor.cursorRadius = function(_) {
		if(!arguments.length) return cRad;
		cRad = _;
		return SnapshotCursor;
	};
}

//Helper function for obtaining containment and intersection distances
function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}