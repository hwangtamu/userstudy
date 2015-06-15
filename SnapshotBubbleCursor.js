//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function SnapshotBubbleCursor(svg, targetName) {
	//Variable to hold previous mouse points for dynamic data
	var prevMousePt = [0,0];
	var previousPoint;

	//Name of svg element to grab for targets
	var targets = ".point"

	var targetRadius = 60;

	defaultColor = "steelblue";
	targetColor = "springgreen";

	//Create cursor
	var cursor = svg.append("circle")
		.attr("class","cursor")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0)
		.style("fill","lightgray")
		.style("fill-opacity","0.5");

	//Create cursor morph
	var cursorMorph = svg.append("circle")
		.attr("class","cursorMorph")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0)
		.style("fill","lightgray")
		.style("fill-opacity","0.5");

	//Set on mousemove
	svg.on("mousemove", function(d,i) {
		var target = SnapshotBubbleCursor.draw(d3.mouse(this));
	});

	//Hide mouse when outside svg selection
	svg.on("mouseout", function(d, i) {
		cursor
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);

		cursorMorph
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);
	});

	//Draws bubble cursor, handles both static and dynamic data
	//Requires dynamic data to call this function in it's update loop
	//Returns target obtain from bubble cursor as well
	SnapshotBubbleCursor.draw = function(mouse) {
		var points = d3.selectAll(targets + ", .snapshot");
		var point;
		var mousePt;

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
			.style("fill", defaultColor)
			.style("stroke", defaultColor)
			.filter(function() { return d3.select(this).attr("id") != "tagged"; })
			.each(function(d, i) {
				var x = +d3.select(this).attr("cx"),
					y = +d3.select(this).attr("cy"),
					r = +d3.select(this).attr("r");
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
					point = d3.select(this);
				}
			});

		point
			.attr("id", "tagged")
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
		cursorRadius = Math.min(ConD[currMin], IntD[secondMin]);
		cursor
			.attr("cx",mousePt[0])
			.attr("cy",mousePt[1])
			.attr("r", cursorRadius);

		currPt = [currX, currY];
		points.each(function(d, i) {
			var x = +d3.select(this).attr("cx"),
				y = +d3.select(this).attr("cy");

			var targetPt = [x, y];
			var currDist = distance(currPt,targetPt);	

			if (currDist < targetRadius) {
				svg.append("circle")
					.attr("class", "snapshot")
					.attr("r", currRad)
					.attr("cx", x)
					.attr("cy", y);
			}
		});

		//Only delete snapshots outside of cursor window
		d3.selectAll(".snapshot").each(function(d, i) {

			var x = +d3.select(this).attr("cx"),
				y = +d3.select(this).attr("cy");

			var targetPt = [x, y];
			var currDist = distance(currPt,targetPt);

			if (currDist > targetRadius) {
				d3.select(this).remove();
			}
		});

		//Resize / apply morph if applicable


		return point;
	};

	SnapshotBubbleCursor.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return SnapshotBubbleCursor;
	};
}

//Helper function for obtaining containment and intersection distances
function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}