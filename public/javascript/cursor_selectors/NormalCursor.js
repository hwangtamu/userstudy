function NormalCursor(selection) {
	//Variable to hold previous mouse points for dynamic data
	var prevMousePt = [0,0];

	//Name of svg element to grab for targets
	var targets = ".point";

	//Used to extend radius for selecting target
	var tolerance = 0;

	//Redraw cursor on mouse move
	selection.on("mousemove.cursorSelector", function(d,i) {
		var target = NormalCursor.redraw(d3.mouse(this));
	});

	NormalCursor.destroy = function() {
		selection.on("mousemove.cursorSelector", null);
	}

	//Update position of cursor and obtain target
	NormalCursor.redraw = function(mouse) {
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

		//Find target over mouse position
		d3.selectAll(targets)
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("x");
				var y = +pt.attr("y");
				var w = +pt.attr("width");
				var h = +pt.attr("height");

				var ptA = [x, y];

				var dist = +distance(mousePt, ptA);
				if (dist < w && dist < h) {
					target = pt;
				}
			});

		//Having this line inside 'target != null' causes sticky targeting
		if (StreamScatterPlot.getTrailsAllowed() && target != null) {
			d3.selectAll(targets + ".target")
				.attr("class", function() { return d3.select(this).attr("class").slice(0, -7); });
		} else if (!StreamScatterPlot.getTrailsAllowed()){
			d3.selectAll(targets + ".target")
				.attr("class", function() { return d3.select(this).attr("class").slice(0, -7); });
		}
		//Set class of  target
		if (target != null) {
			target
				.attr("class", target.attr("class") + " target");
		}

		return target;
	};

	//Set the class name used to obtain targets
	NormalCursor.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return NormalCursor;
	};

	//Set tolerance for how close you have to be to target
	NormalCursor.setTolerance = function(_) {
		if(!arguments.length) return tolerance;
		tolerance = _;
		return NormalCursor;
	};
}

function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}
