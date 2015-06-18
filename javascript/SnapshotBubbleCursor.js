//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function SnapshotBubbleCursor(svg, targetName) {
	//Hold previous mouse points for dynamic data
	var prevMousePt = [0,0];
	var previousPoint;

	//Name of svg element to grab for targets
	var targets = ".point"

	//Controls radius of freeze region
	var targetRadius = 70;

	//Color for corresponding points
	defaultColor = "steelblue";
	targetColor = "springgreen";
	snapColor = "orange";

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
		var target = SnapshotBubbleCursor.redraw(d3.mouse(this));
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

	//Draws bubble cursor and handles freezing of nearby targets
	//Requires dynamic data to call this function in it's update loop
	//Returns target obtained from bubble cursor as well
	SnapshotBubbleCursor.redraw = function(mouse) {
		var points = d3.selectAll(".point, .snapshot");
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
			.style("fill", function() {
				var id = d3.select(this).attr("id");
				var color = defaultColor;
				if (id == "snap") {
					color = "orange";
				} else if (id == "tagged") {
					color = "red";
				}
				return color;
			})
			.style("stroke", function() {
				var id = d3.select(this).attr("id");
				var color = defaultColor;
				if (id == "snap") {
					color = "orange";
				} else if (id == "tagged") {
					color = "red";
				}
				return color;
			})
			.style("fill-opacity", function() {
				var id = d3.select(this).attr("id");
				var opacity = 1.0;
				if (id == "snap") {
					opacity = 0.5;
				} else if (id == "tagged") {
					opacity = 0.1;
				}
				return opacity;
			})
			.style("stroke-opacity", function() {
				var id = d3.select(this).attr("id");
				var opacity = 1.0;
				if (id == "snap") {
					opacity = 0.5;
				} else if (id == "tagged") {
					opacity = 0.1;
				}
				return opacity;
			})
			.filter(function() { return d3.select(this).attr("id") != ("tagged"); })
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

		if (point.attr("id") != "snap") {
			point
				.attr("id", "tagged")
				.each(function(d, i) {
					svg.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("id", "snap")
						.attr("cx", currX)
						.attr("cy", currY)				
						.attr("r", currRad)
						.style("fill", targetColor)
						.style("stroke", targetColor);
				});
		}
		
		point
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
		if (isFinite(IntD[secondMin])) {
			cursorRadius = Math.min(ConD[currMin], IntD[secondMin]);
		} else {
			cursorRadius = ConD[currMin];
		} 

		cursor
			.attr("cx",mousePt[0])
			.attr("cy",mousePt[1])
			.attr("r", cursorRadius);

		cursorMorph
			.attr("cx", currX)
			.attr("cy", currY)
			.attr("r", targetRadius);

		var currPt = [currX, currY];
		d3.selectAll(".point")
			.each(function(d, i) {
				var x = +d3.select(this).attr("cx"),
					y = +d3.select(this).attr("cy"),
					r = +d3.select(this).attr("r");

				var targetPt = [x, y];
				var currDist = distance(currPt,targetPt);

				var target = d3.select(this);

				//!! Need way to loosely couple original point with it's snapshot!
				if(currDist < targetRadius && d3.select(".i" + d[0] +".snapshot").empty() && target.attr("id") != "tagged") {
					target.attr("id", "tagged");
					svg.append("circle")
						.attr("class", "i" + d[0] + " snapshot")
						.attr("id", "snap")
						.attr("cx", x)
						.attr("cy", y)				
						.attr("r", r)
						.style("fill", targetColor)
						.style("stroke", targetColor);
				} else if (currDist > targetRadius) {
					target.attr("id", "untagged");
				}

			});

		d3.selectAll(".snapshot") 
			.each(function(d, i) {
				var x = +d3.select(this).attr("cx"),
					y = +d3.select(this).attr("cy");

				var targetPt = [x, y];
				var currDist = distance(currPt,targetPt);

				if (currDist > targetRadius) {
					d3.select(this).remove();
				}
			});


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