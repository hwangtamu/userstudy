function TrailDrawer(selection) {
	var originalName = "#tagged",
		snapshotName = ".snapshot";

	var stroke_width = 6;

	var gTrails = selection.insert("g", ".data").attr("class", "trails");

	TrailDrawer.start = function() {
		d3.timer(function() {
			TrailDrawer.redraw()
		});
	};

	TrailDrawer.redraw = function() {
		d3.selectAll(snapshotName).each(function(d, i) {
			var snap = d3.select(this);
			var timestamp = +snap.attr("class").slice(1, -9);
			var snapX = +snap.attr("cx");
			var snapY = +snap.attr("cy");
			d3.selectAll(originalName).each(function(d, i) {
				var tagged = d3.select(this);
				var taggedX = +tagged.attr("cx");
				var taggedY = +tagged.attr("cy");
				if (d[3] == timestamp) {
					if (d3.select(".i" + timestamp + ".trail").empty()) {
						TrailDrawer.createTrail(timestamp);
					} else {
						TrailDrawer.updateTrail([snapX, snapY], [taggedX, taggedY], timestamp, "");
					}
				}
			});
		});

		d3.select(".target").each(function(d, i) {
			var snap = d3.select(this);
			var timestamp = +snap.attr("class").slice(1, -15);
			var snapX = +snap.attr("cx");
			var snapY = +snap.attr("cy");
			d3.selectAll(originalName).each(function(d, i) {
				var tagged = d3.select(this);
				var taggedX = +tagged.attr("cx");
				var taggedY = +tagged.attr("cy");
				if (d[3] == timestamp) {
					if (d3.select(".i" + timestamp + ".trail").empty()) {
						TrailDrawer.createTrail(timestamp);
					} else {
						TrailDrawer.updateTrail([snapX, snapY], [taggedX, taggedY], timestamp, "targetTrail");
					}
				}
			});
		});

		d3.selectAll("#untagged").each(function(d, i) {
			var untagged = d3.select(this);
			var timestamp = d[3];
			if (!d3.select(".i" + timestamp + ".trail").empty()) {
				d3.select(".i" + timestamp + ".trail").remove();
			}
		});
	};

	TrailDrawer.createTrail = function(timestamp) {
		gTrails.append("line")
			.attr("id", "targetTrail")
			.attr("class", "i" + timestamp + " trail")
			.attr("stroke-width", stroke_width)
			.on("mouseover", function(d, i) {
				var trail = d3.select(this);
				var timestamp = trail.attr("class").slice(1, -6);
				var target = d3.select(".i" + timestamp + ".snapshot");
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

	TrailDrawer.destroyTrail = function(timestamp) {
		d3.select(".i" + timestamp + ".trail").remove();
	};

	TrailDrawer.updateTrail = function(pA, pB, timestamp, id) {
		d3.select(".i" + timestamp + ".trail")
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
