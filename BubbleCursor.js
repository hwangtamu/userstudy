//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function BubbleCursor(svg, targetName) {
	//Variable to hold previous mouse points for dynamic data
	var prevMousePt = [0,0];

	//Default variables for cursor
	var defaultColor = "steelblue";
	var targetColor = "springgreen";

	//Name of svg element to grab for targets
	var targets = ".point"

	//Create cursor
	svg.append("circle")
		.attr("class","cursor")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0)
		.style("fill","lightgray")
		.style("fill-opacity","0.5");

	//Create cursor morph
	svg.append("circle")
		.attr("class","cursorMorph")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0)
		.style("fill","lightgray")
		.style("fill-opacity","0.5");

	//Set on mousemove
	svg.on("mousemove", function(d,i) {
		var target = BubbleCursor.draw(d3.mouse(this));
	});

	//Hide mouse when outside svg selection
	svg.on("mouseout", function(d, i) {
		d3.select(".cursor")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);

		d3.select(".cursorMorph")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);
	});

	//Draws bubble cursor, handles both static and dynamic data
	//Requires dynamic data to call this function in it's update loop
	//Returns target obtain from bubble cursor as well
	BubbleCursor.draw = function(mouse) {
		var points = d3.selectAll(targets);
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

		points
			.style("fill", defaultColor)
			.style("stroke", defaultColor)
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
			.style("fill", targetColor)
			.style("stroke", targetColor);

		var secondMin = (currMin + 1) % points.size();
		for (var j = 0; j < Dist.length; j++) {
			if (j != currMin && IntD[j] < IntD[secondMin]) {
				secondMin = j;
			}
		}

		cursorRadius = Math.min(ConD[currMin], IntD[secondMin]);
		svg.select(".cursor")
			.attr("cx",mousePt[0])
			.attr("cy",mousePt[1])
			.attr("r", cursorRadius);

		if (cursorRadius < ConD[currMin]) {
			svg.select(".cursorMorph")
				.attr("cx", currX)
				.attr("cy", currY)
				.attr("r", (currRad + 5));
		} else {
			svg.select(".cursorMorph")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",0);
		}

		return point;
	};

	BubbleCursor.tarColor = function(_) {
		if(!arguments.length) return targetColor;
		targetColor = _;
		return BubbleCursor;
	};

	BubbleCursor.defaultColor = function(_) {
		if(!arguments.length) return defaultColor;
		defaultColor = _;
		return BubbleCursor;
	};

	BubbleCursor.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return BubbleCursor;
	};
}

//Helper function for obtaining containment and intersection distances
function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}