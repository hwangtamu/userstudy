//Note: Initiation of this cursor after other elements will put the cursor on top of them.
function NormalCursor(selection) {
	//Variable to hold previous mouse points for dynamic data
	var prevMousePt = [0,0];

	//Name of svg element to grab for targets
	var targets = ".point"
	var tolerance = 0;

	//Set on mousemove
	var svg = selection;
	svg.on("mousemove.NormalCursor." + selection.attr("id"), function(d,i) {
		var target = NormalCursor.redraw(d3.mouse(this));
	});

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

		d3.selectAll(targets)
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx");
				var y = +pt.attr("cy");
				var r = +pt.attr("r");

				var ptA = [x, y];

				var dist = +distance(mousePt, ptA);
				if (dist < r + tolerance) {
					target = pt;
				}
			});

		d3.selectAll(targets + ".target")
			.attr("class", function() { return d3.select(this).attr("class").slice(0, -7); });

		if (target != null) {
			target
				.attr("class", target.attr("class") + " target");
		}
		
		return target;
	};

	NormalCursor.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return NormalCursor;
	};

	NormalCursor.setTolerance = function(_) {
		if(!arguments.length) return tolerance;
		tolerance = _;
		return NormalCursor;
	};
}

//Helper function for obtaining containment and intersection distances
function distance(ptA,ptB) {
	var diff = [ptB[0]-ptA[0], ptB[1]-ptA[1]];
	return Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
}