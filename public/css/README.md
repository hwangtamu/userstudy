## CSS References.

### Charts

```
.point //Data point on chart
//NOTE primary and secondary class are defined by JSON flag
.primary.point //Primary target
.secondary.point //Secondary target
.point.target //Targeted point
#StreamScatterPlotClip //clip used by scatter plot
```

### Cursor Selectors

```
.bubble cursor //Bubble cursor region
.bubble cursrMorph //Bubble cursor's morph region that envelopes targets
?.target //Target obtained by cursor selector
```

### Freeze Selectors

```
.freezeRegion //The continous freeze region overlay
.click.freezeRegion //The freeze region overlay set by clicking

.snapshot //'Frozen' copy of data captured by freeze region
.snapshot.target //Targeted snapshot
#untagged //Data that's been untagged by freeze region
#tagged //Data that's been tagged by freeze region

#freezeClip //clip used by freeze regions
```

### Misc

```
.trail //Optional trails on snapshots
.trail.target //Targeted trail
#targettrail //target trail
```
