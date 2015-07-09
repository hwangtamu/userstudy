function BubbleCursor(selection) {
	//Variable to hold previous mouse points for dynamic data
	var prevMousePt = [0,0];

	//Name of svg element to grab for targets
	var targets = ".point"

	//Element containg cursor visual
	var gSelection = selection.insert("g", ":first-child").attr("class", "cursor selector");

	//Create cursor
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

	//Redraw on mouse move
	selection.on("mousemove.cursorSelector", function(d,i) {
		BubbleCursor.redraw(d3.mouse(this));
	});

	//Hide mouse when outside selection selection
	selection.on("mouseout.cursorSelector", function(d, i) {
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
	//If data is dynamic this call must be made in a loop
	//Sets target obtained from cursor as well
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

		//Find closest target
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

		//Set class of traget
		d3.selectAll(targets + ".target")
			.attr("class", function() { return d3.select(this).attr("class").slice(0, -7); });

		if (target != null) {
			target
				.attr("class", target.attr("class") + " target");
		}

		//Find second closest
		var secondMin = (currMin + 1) % points.length;
		for (var j = 0; j < Dist.length; j++) {
			if (j != currMin && IntD[j] < IntD[secondMin]) {
				secondMin = j;
			}
		}

		//Set cursor radius based on the min of the closest and second closest targets
		cursorRadius = Math.min(ConD[currMin], IntD[secondMin]);

		//Update cursor
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

		//Update cursor morph
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

	//Set the class name used to obtain targets
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
