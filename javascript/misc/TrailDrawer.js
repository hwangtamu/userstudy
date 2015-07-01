function TrailDrawer(selection) {
	var originalName = "#tagged",
		snapshotName = ".snapshot";

	var stroke_width = 3;

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
				if (d[0] == timestamp) {
					if (d3.select(".i" + timestamp + ".trail").empty()) {
						gTrails.append("line")
							.attr("id", "")
							.attr("class", "i" + timestamp + " trail")
							.attr("stroke-width", stroke_width);
					} else {
						d3.select(".i" + timestamp + ".trail")
							.attr("id", "")
							.attr("x1", snapX)
							.attr("y1", snapY)
							.attr("x2", taggedX)
							.attr("y2", taggedY);
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
				if (d[0] == timestamp) {
					if (d3.select(".i" + timestamp + ".trail").empty()) {
						gTrails.append("line")
							.attr("id", "targetTrail")
							.attr("class", "i" + timestamp + " trail")
							.attr("stroke-width", stroke_width);
					} else {
						d3.select(".i" + timestamp + ".trail")
							.attr("id", "targetTrail")
							.attr("x1", snapX)
							.attr("y1", snapY)
							.attr("x2", taggedX)
							.attr("y2", taggedY);
					}
				}
			});
		});

		d3.selectAll("#untagged").each(function(d, i) {
			var untagged = d3.select(this);
			var timestamp = d[0];
			if (!d3.select(".i" + timestamp + ".trail").empty()) {
				d3.select(".i" + timestamp + ".trail").remove();
			}
		});
	};

	TrailDrawer.destroyTrail = function(point_timestamp) {
		d3.select(".i" + point_timestamp + ".trail").remove();
	};

	TrailDrawer.setWidth = function(_) {
		stroke_width = _;
	};
}