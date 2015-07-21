function TrailDrawer(selection) {
	var originalName = "#tagged",
		snapshotName = ".snapshot";

	var stroke_width = 2;

	var gTrails = selection.insert("g", ".data").attr("class", "trails");

	//Used to stop trail redraw
	var end = false;

	TrailDrawer.start = function() {
		d3.timer(function() {
			TrailDrawer.redraw()
			return end;
		});
	};

	TrailDrawer.redraw = function() {
		d3.selectAll("#tagged").each(function(d, i) {
			var snap = d3.select(this);
			var snapX = +snap.attr("x");
			var snapY = +snap.attr("y");
			var snapWidth = +snap.attr("width");
			var snapHeight = +snap.attr("height");
			var cls = snap.attr("class").replace("point", "trail");
			var uniqueID = d[3];
			if (!d3.select(".i" + uniqueID + ".snapshot").empty()) {
				var tagged = d3.select(".i" + uniqueID + ".snapshot");
				var taggedX = +tagged.attr("x");
				var taggedY = +tagged.attr("y");
				var taggedWidth = +tagged.attr("width");
				var taggedHeight = +tagged.attr("height");

				if (d3.select(".i" + uniqueID + ".trail").empty()) {
					TrailDrawer.createTrail(uniqueID, cls);
				} else {
					TrailDrawer.updateTrail([snapX + snapWidth/2, snapY + snapHeight/2], [taggedX + taggedWidth/2, taggedY + taggedHeight/2], uniqueID, cls);
				}

				if (!d3.select(".i" + uniqueID + ".snapshot.target").empty()) {
					d3.select(".i" + uniqueID + ".trail").each(function(d, i) {
						//d3.select(this).attr("id", "targetTrail");
					});
				} else {
					d3.select(".i" + uniqueID + ".trail").each(function(d, i) {
						d3.select(this).attr("id", function() {
							var id = "trail";
							if (cls.includes("primary")) {
								id = "primary_trail";
							} else if (cls.includes("secondary")) {
								id = "secondary_trail";
							}
							return id;
						})
					});
				}
			}
		});

		d3.selectAll(".trail").filter(function(d,i) {
			return d3.select(".i" + d + ".snapshot").empty();
		}).remove();

	};

	TrailDrawer.createTrail = function(uniqueID, cls) {
		gTrails.append("line").datum(uniqueID)
			.attr("id", cls.replace(" ", "_"))
			.attr("class", "i" + uniqueID + " trail")
			//.attr("stroke-width", stroke_width)
			.attr("stroke-linecap", "round")
			.attr("stroke-dasharray", "5, 5")
			//NOTE: Getting rid of this functionality for experiment
			//		because it alters selection, which isn't exactly what we are studying now
			// .on("mouseover", function(d, i) {
			// 	var trail = d3.select(this);
			// 	var uniqueID = d;
			// 	var target = d3.select(".i" + uniqueID + ".snapshot");
			// 	d3.selectAll(".trail").attr("id", "trail");
			// 	d3.selectAll(snapshotName + ".target")
			// 		.attr("class", function() { return d3.select(this).attr("class").slice(0, -7); });
			//
			// 	if (target != null) {
			// 		target
			// 			.attr("class", target.attr("class") + " target");
			// 	}
			// 	trail.attr("id", "targetTrail")
			// });
	};

	TrailDrawer.destroyTrail = function(uniqueID) {
		d3.select(".i" + uniqueID + ".trail").remove();
	};

	TrailDrawer.updateTrail = function(pA, pB, uniqueID, cls) {
		d3.select(".i" + uniqueID + ".trail")
			.attr("id", function() {
				var id = "trail";
				if (d3.select(this).attr("id") == "targetTrail") {
					//id = "targetTrail";
				} else if (cls.includes("primary")) {
					id = "primary_trail";
				} else if (cls.includes("secondary")) {
					id = "secondary_trail";
				}
				return id;
			})
			.attr("x1", pA[0])
			.attr("y1", pA[1])
			.attr("x2", pB[0])
			.attr("y2", pB[1]);
	};

	TrailDrawer.setWidth = function(_) {
		stroke_width = _;
	};
}
