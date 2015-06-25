StreamScatterPlot.js creates a scatter plot that shows data over time
	-Using the mouse wheel will cause the time to increase/decrease
	-Spacebar will pause the chart
	-New data can easily be pushed to chart using pushDatum

freeze_selectors folder contains various freeze selection methods
cursor_selectors folder contains normal cursor (will actually update selection on redraws) and bubble cursor

Class(.) and ID(#) names for reference in use with Javascript/CSS

--------Charts--------
.point //Data point on chart

--------Cursor Selectors--------
.bubble cursor //Bubble cursor region
.bubble cursrMorph //Bubble cursor's morph region that envelopes targets
?.target //Target obtained by cursor selector

--------Freeze Selectors--------
.freezeRegion //The continous freeze region overlay
.click.freezeRegion //The freeze region overlay set by clicking

.snapshot //'Frozen' copy of data captured by freeze region
#untagged //Data that's been untagged by freeze region
#tagged //Data that's been tagged by freeze region

#trajectoryClip //clip used by FreezeTrajectory.js