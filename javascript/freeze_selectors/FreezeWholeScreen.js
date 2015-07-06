function FreezeWholeScreen(selection) {
	//Name of svg element to grab for targets
	var targets = ".point"

	//Create cursor
	var svg = selection;
	var gCopies = svg.insert("g", ".chart").attr("class", "snapshots");
	var gSelection = svg.insert("g", ":first-child").attr("class", "freeze selector");

	//Set activator for freeze
	d3.select("body")
		.on("keydown.freezeSelector", function() {
			if (d3.event.shiftKey) {
				FreezeWholeScreen.freeze()
			}
		});


	//Update Selector
	FreezeWholeScreen.freeze = function() {
		FreezeWholeScreen.cleanSnapshots();
		FreezeWholeScreen.createSnapshots();
	};

	//Create snapshots inside of freeze region
	FreezeWholeScreen.createSnapshots = function() {
		var points = d3.selectAll(targets);
		points
			.each(function(d, i) {
				var pt = d3.select(this);
				var x = +pt.attr("cx"),
					y = +pt.attr("cy"),
					r = +pt.attr("r");

				pt.attr("id", "tagged");

				gCopies.append("circle")
					.attr("class", "i" + d[3] + " snapshot")
					.attr("r", r)
					.attr("cx", x)
					.attr("cy", y);
			});
	};

	//Destroy snapshots outside of freeze region
	FreezeWholeScreen.cleanSnapshots = function(currPt) {
		d3.selectAll(targets).attr("id", "untagged");
		d3.selectAll(".snapshot").remove();
	};

	//Set the class name used to obtain targets
	FreezeWholeScreen.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return FreezeWholeScreen;
	};
}
