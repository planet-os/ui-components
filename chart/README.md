# piper.js
Piper.js is a simple pipeline pattern to build charts. It's a way to modularize tiny pieces of D3 code and assemble them.

Each module uses a very simple encapsulation strategy and is self-documenting:
```javascript
// Declare a new module in the piper namespace
piper.axisX = function(_config){
	// expose what variables need to be provided
    var config = {
        scaleX: null,
        axisXFormat: '%H:%M',
        axisXTimeResolution: 'minutes',
        axisXTimeSteps: 2
    };
    // get the config values we need from the initial _config
    piper.utils.override(config, _config);

    var axisX = d3.svg.axis()
        .scale(config.scaleX)
        .orient('bottom');

    // declare what new value we expose
    return {
        axisX: axisX
    };
};
```

The modules are assembled using a simple pipeline function. Here is a typical line chart pipeline:
```javascript
var lineChart = piper.utils.pipeline(
    piper.data,
    piper.scaleX,
    piper.scaleY,
    piper.axisX,
    piper.axisY,
    piper.panelComponent,
    piper.lineShapes,
    piper.axisComponentX,
    piper.axisComponentY,
    piper.chartTitleComponent,
    piper.tooltipComponent
);
```

Switching to a bar chart is simply a matter of replacing one function:
```javascript
var lineChart = piper.utils.pipeline(
    piper.data,
    piper.scaleX,
    piper.scaleY,
    piper.axisX,
    piper.axisY,
    piper.panelComponent,
    piper.barShapes, // turn this line chart into a bar chart
    piper.axisComponentX,
    piper.axisComponentY,
    piper.chartTitleComponent,
    piper.tooltipComponent
);
```

To use the chart, simply pass a configuration object, including the data:
```javascript
var chart = lineChart({
	    container: chartContainer,
	    data: data,
	    width: 400,
	    height: 200,
	    margin: {top: 50, right: 70, bottom: 35, left: 60},
	    axisTitleX: 'Title X',
	    axisTitleY: 'Title Y'
	});
```

To update the chart, just call it again the same way. The pipeline is stateless and unidirectional. 

Here is how you expose events:
```javascript
var lineChart = piper.utils.pipeline(
    piper.data,
    ...
    piper.eventsBinder // simply add an event binder module
);
```

Which will expose some events with all the information you need:
```javascript
chart.events.mouseenter.on(function(d){ });
chart.events.mouseout.on(function(d){ });
chart.events.mousemove.on(function(d){ });
```

# Contributing
Piper.js main functions are just a few lines of code and will not change. We use the pattern in production at Planet OS for a while, and it's easily scaling to any size of projects so far. But the modules and pipelines provided here as examples are constantly changing and can be broken at anytime. The goal with piper.js is not to become a charts library, but a documentation is coming on what can be done with this simple pattern.

if you want to play with it:
npm install
npm run watch
