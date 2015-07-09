function FreezeWholeScreen(selection) {
	//Name of svg element to grab for targets
	var targets = ".point"

	//Element that contains the 'snapshots' of frozen data
	var gCopies = selection.insert("g", ".chart").attr("class", "snapshots");

	//Freeze when user hits shift
	d3.select("body")
		.on("keydown.freezeSelector", function() {
			if (d3.event.shiftKey) {
				FreezeWholeScreen.freeze()
			}
		});

	//Freezes all the data points currently shown
	FreezeWholeScreen.freeze = function() {
		FreezeWholeScreen.cleanSnapshots();
		FreezeWholeScreen.createSnapshots();
	};

	//Create snapshots of data points inside the freeze region
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

	//Destroy all snapshots
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
