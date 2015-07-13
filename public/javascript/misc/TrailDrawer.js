function TrailDrawer(selection) {
	var originalName = "#tagged",
		snapshotName = ".snapshot";

	var stroke_width = 6;

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
		d3.selectAll(snapshotName).each(function(d, i) {
			var snap = d3.select(this);
			var snapX = +snap.attr("x");
			var snapY = +snap.attr("y");
			var snapWidth = +snap.attr("width");
			var snapHeight = +snap.attr("height");
			console.log(snap.attr("class"));
			var uniqueID = snap.attr("class").slice(0, -9).replace(" ", "."); //Slice snapshot off and fix spaces
			d3.selectAll(originalName).each(function(d, i) {
				var tagged = d3.select(this);
				var taggedX = +tagged.attr("x");
				var taggedY = +tagged.attr("y");
				var taggedWidth = +tagged.attr("width");
				var taggedHeight = +tagged.attr("height");
				if (uniqueID.includes(d[3])) {
					if (d3.select("." + uniqueID + ".trail").empty()) {
						console.log("created", uniqueID);
						TrailDrawer.createTrail(uniqueID);
					} else {
						console.log("updated", uniqueID);
						TrailDrawer.updateTrail([snapX + snapWidth/2, snapY + snapHeight/2], [taggedX + taggedWidth/2, taggedY + taggedHeight/2], uniqueID, "");
					}
				}
			});
		});

		// d3.select(".target").each(function(d, i) {
		// 	var snap = d3.select(this);
		// 	var uniqueID = +snap.attr("class").slice(1, -15);
		// 	var snapX = +snap.attr("x");
		// 	var snapY = +snap.attr("y");
		// 	var snapWidth = +snap.attr("width");
		// 	var snapHeight = +snap.attr("height");
		//
		// 	//Find targets matching trail
		// 	d3.selectAll(originalName).each(function(d, i) {
		// 		var tagged = d3.select(this);
		// 		var taggedX = +tagged.attr("x");
		// 		var taggedY = +tagged.attr("y");
		// 		var taggedWidth = +tagged.attr("width");
		// 		var taggedHeight = +tagged.attr("height");
		// 		if (d[3] == uniqueID) {
		// 			if (d3.select("." + uniqueID + ".trail").empty()) {
		// 				TrailDrawer.createTrail(uniqueID);
		// 			} else {
		// 				TrailDrawer.updateTrail([snapX + snapWidth/2, snapY + snapHeight/2], [taggedX + taggedWidth/2, taggedY + taggedHeight/2], uniqueID, "targetTrail");
		// 			}
		// 		}
		// 	});
		// });

		d3.selectAll("#untagged").each(function(d, i) {
			var untagged = d3.select(this);
			var uniqueID = untagged.attr("class").slice(0, -9).replace(" ", ".");;
			if (!d3.select("." + uniqueID + "trail").empty()) {
				d3.select("." + uniqueID + "trail").remove();
			}
		});
	};

	TrailDrawer.createTrail = function(uniqueID) {
		gTrails.append("line")
			.attr("id", "targetTrail")
			.attr("class", uniqueID.replace(".", " ") + " trail")
			.attr("stroke-width", stroke_width)
			.on("mouseover", function(d, i) {
				var trail = d3.select(this);
				var uniqueID = trail.attr("class").slice(1, -6);
				var target = d3.select("." + uniqueID + ".snapshot");
				d3.selectAll(snapshotName + ".target")
					.attr("class", function() { return d3.select(this).attr("class").slice(0, -7); });

				if (target != null) {
					target
						.attr("class", target.attr("class") + " target");
				}
			})
			.on("mouseout", function(d, i) {
				d3.select("#targetTrail").attr("id", "");
			})
	};

	TrailDrawer.destroyTrail = function(uniqueID) {
	//	d3.select("." + uniqueID + ".trail").remove();
	};

	TrailDrawer.updateTrail = function(pA, pB, uniqueID, id) {
		console.log("Updating", uniqueID);
		d3.select("." + uniqueID + ".trail")
			.attr("id", id)
			.attr("x1", pA[0])
			.attr("y1", pA[1])
			.attr("x2", pB[0])
			.attr("y2", pB[1]);
	};

	TrailDrawer.setWidth = function(_) {
		stroke_width = _;
	};
}
