function FreezeWholeScreen(selection) {
	//Name of svg element to grab for targets
	var targets = ".point"
	
	//Create cursor
	var svg = selection;
	var gCopies = svg.insert("g", ".chart").attr("class", "snapshots");
	var gSelection = svg.insert("g", ":first-child").attr("class", "freeze selector");

	//Set on click functionality if set
	svg.on("click.freezeSelector", function(d,i) {
		var mouse = d3.mouse(this);
	});


	//Update Selector
	FreezeAroundClosest.freeze = function(mouse) {

	};

	//Create snapshots inside of freeze region
	FreezeAroundClosest.createSnapshots = function(currPt, target) {

	};

	//Destroy snapshots outside of freeze region
	FreezeAroundClosest.cleanSnapshots = function(currPt) {

	};

	//Set the class name used to obtain targets
	FreezeAroundClosest.tarName = function(_) {
		if(!arguments.length) return targets;
		targets = _;
		return FreezeAroundClosest;
	};
}
