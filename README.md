StreamScatterPlot.js creates a scatter plot that shows data over time<br />
	-Using the mouse wheel will cause the time to increase/decrease<br />
	-Spacebar will pause the chart<br />
	-New data can easily be pushed to chart using pushDatum<br />

freeze_selectors folder contains various freeze selection methods<br />
cursor_selectors folder contains normal cursor (will actually update selection on redraws) and bubble cursor<br />
<br />
Class(.) and ID(#) names for reference in use with Javascript/CSS<br />
<br />
--------Charts--------<br />
.point //Data point on chart<br />
#StreamScatterPlotClip //clip used by scatter plot<br />
<br />
--------Cursor Selectors--------<br />
.bubble cursor //Bubble cursor region<br />
.bubble cursrMorph //Bubble cursor's morph region that envelopes targets<br />
?.target //Target obtained by cursor selector<br />
<br />
--------Freeze Selectors--------<br />
.freezeRegion //The continous freeze region overlay<br />
.click.freezeRegion //The freeze region overlay set by clicking<br />
<br />
.snapshot //'Frozen' copy of data captured by freeze region<br />
#untagged //Data that's been untagged by freeze region<br />
#tagged //Data that's been tagged by freeze region<br />
<br />
#trajectoryClip //clip used by FreezeTrajectory.js<br />
