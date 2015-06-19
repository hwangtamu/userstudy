//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function SnapshotCursor(selection) {
	//Hold previous mouse point for dynamic data
	var prevMousePt = [0, 0];

	//Name of svg element to grab for targets
	var targets = ".point";

	//Cursor radius
	var cRad = 10 * 10;

	//Controls accumulation behavior near freeze region
	var accumulations = true;

	//Create cursor
	var svg = selection;
	var gCopies = svg.insert("g", ".chart").attr("class", "copies");
	var gSelection = svg.insert("g", ":first-child").attr("class", "selection");
	var cursor = gSelection.append("circle")
		.attr("class","cursor")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", cRad)
		.style("fill","lightgray")
		.style("fill-opacity","0.5");

	//Set on mousemove
	svg.on("mousemove.SnapshotCursor." + selection.attr("id"), function(d,i) {
		cursor
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",cRad);
		var target = SnapshotCursor.redraw(d3.mouse(this));
	});

	//Hide mouse when outside svg selection
	// svg.on("mouseout.SnapshotCursor." + selection.attr("id"), function(d, i) {
	// 	cursor
	// 		.attr("cx",0)
	// 		.attr("cy",0)
	// 		.attr("r",0);
	// 	prevMousePt = [-cRad ,-cRad];
	// });

	SnapshotCursor.redraw = function(mouse) {
		var mousePt;
		var target = null,
			targetTrail;
		if (!arguments.length && !accumulations){
			return;
		} else if (!arguments.length) {
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

		points
			.style("fill-opacity", function() { return d3.select(this).attr("id") == "tagged" ? 0.5 : 1.0; })
			.style("stroke-opacity", function() { return d3.select(this).attr("id") == "tagged" ? 0.5 : 1.0; })
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy"),
					r = +pt.attr("r");

				var targetPt = [x, y];
				var currDist = distance(mousePt,targetPt);

				if (currDist < cRad && d3.select(".i" + d[0] + ".snapshot").empty()) {
					pt.attr("id", "tagged");
					gCopies.append("polyline")
						.attr("class", "i" + d[0] + " trail")
						.attr("stroke-width", r / 2)
						.attr("points", x + "," + y)
						.datum([x, y]);

					gCopies.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("r", pointRadius)
						.attr("cx", x)
						.attr("cy", y);
				} else if (currDist < cRad && !d3.select(".i" + d[0] + ".trail").empty()) {
					var trail = d3.select(".i" + d[0] + ".trail");

					trail
						.attr("points", function(d) {
							return x + "," + y + " " + d[0] + "," + d[1];
						})
						.attr("stroke", "orange");
				} else if (currDist > cRad) {
					pt.attr("id", "untagged");
				}
			});

		//Only delete snapshots outside of cursor window
		var closest = Infinity;
		d3.selectAll(".snapshot")
			.style("fill", "orange")
			.style("stroke", "orange")
			.each(function(d, i) {
				var pt = d3.select(this)
				var x = +pt.attr("cx"),
					y = +pt.attr("cy");

				var targetPt = [x, y];
				var currDist = distance(mousePt,targetPt);
				var pt = pt;

				var trailid = pt.attr("class");
				trailid = trailid.slice(0, -9);
				trailid = "." + trailid + ".trail";
				var trail = d3.select(trailid);

				if (currDist > cRad) {
					trail.remove();
					pt.remove();
				} else if (currDist < closest) {
					target = pt;
					targetTrail = trail;
					closest = currDist;
				}
			});

		d3.selectAll(".trail").attr("stroke", "orange");

		if (target != null) {
			target
				.style("fill", "springgreen")
				.style("stroke", "springgreen");
			targetTrail.attr("stroke", "springgreen");
		}

		return target;
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

	SnapshotCursor.accumulate = function(_) {
		if(!arguments.length) return accumulations;
		accumulations = _;
		return SnapshotCursor;
	}
}

//Helper function for obtaining containment and intersection distances
function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}