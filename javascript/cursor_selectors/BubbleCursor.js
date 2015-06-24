//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function BubbleCursor(selection) {
	//Variable to hold previous mouse points for dynamic data
	var prevMousePt = [0,0];

	//Name of svg element to grab for targets
	var targets = ".point"

	//Create cursor
	var svg = selection;
	var gSelection = svg.insert("g", ":first-child").attr("class", "cursor selector");

	var cursor = gSelection.append("circle")
		.attr("class","bubble cursor")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0);

	//Create cursor morph
	var cursorMorph = gSelection.append("circle")
		.attr("class","bubble cursorMorph")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",0);

	//Set on mousemove
	svg.on("mousemove.BubbleCursor." + selection.attr("id"), function(d,i) {
		var target = BubbleCursor.redraw(d3.mouse(this));
	});

	//Hide mouse when outside svg selection
	svg.on("mouseout.BubbleCursor." + selection.attr("id"), function(d, i) {
		d3.select(".cursor")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);

		d3.select(".cursorMorph")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",0);
	});

	//Draws bubble cursor
	//Requires dynamic data to call this function in it's update loop
	//Returns target obtained from bubble cursor as well
	BubbleCursor.redraw = function(mouse) {
		var points = d3.selectAll(targets);
		var target = null;
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
					target = d3.select(this);
				}
			});

		d3.selectAll(targets + ".target")
			.attr("class", function() { return d3.select(this).attr("class").slice(0, -7); });

		if (target != null) {
			target
				.attr("class", target.attr("class") + " target");
		}

		var secondMin = (currMin + 1) % points.size();
		for (var j = 0; j < Dist.length; j++) {
			if (j != currMin && IntD[j] < IntD[secondMin]) {
				secondMin = j;
			}
		}

		cursorRadius = Math.min(ConD[currMin], IntD[secondMin]);

		if (isFinite(cursorRadius) && cursorRadius > 0) {
			cursor
				.attr("cx",mousePt[0])
				.attr("cy",mousePt[1])
				.attr("r", cursorRadius);
		} else if (target == null) {
			cursor
				.attr("cx",mousePt[0])
				.attr("cy",mousePt[1])
				.attr("r", 0);
		}

		if (cursorRadius < ConD[currMin]) {
			cursorMorph
				.attr("cx", currX)
				.attr("cy", currY)
				.attr("r", (currRad + 5));
		} else {
			cursorMorph
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",0);
		}
		
		return target;
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