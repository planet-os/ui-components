piper.events = {};

piper.eventsBinder = function(_config){
    var config = {
        container: null,
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        chartWidth: null,
        chartHeight: null
    };
    piper.utils.override(config, _config);

    var dataConvertedX = config.dataConverted.map(function(d){ return d.x; });
    var deltaX = config.scaleX(dataConvertedX[1]) - config.scaleX(dataConvertedX[0]);

    var eventPanelContainer = config.panel
        .selectAll('g.event-panel-container')
        .data([0]);

    this.dataConverted = config.dataConverted;
    var that = this;

    eventPanelContainer.enter().append('g')
        .attr({
            'class': 'event-panel-container'
        })
        .append('rect')
        .attr({
            'class': 'event-panel'
        })
        .style({
            visibility: 'hidden',
            'pointer-events': 'all'
        });

    eventPanelContainer.select('rect')
        .attr({
            width: config.chartWidth,
            height: config.chartHeight
        })
        .on('mouseenter', function(d){
            piper.events.mouseenter({mouse: d3.mouse(this)});
        })
        .on('mouseout', function(d){
            piper.events.mouseout({mouse: d3.mouse(this)});
        })
        .on('mousemove', function(d, i){
            var mouse = d3.mouse(this);
            var mouseFromContainer = d3.mouse(config.container);
            var panelBBox = this.getBoundingClientRect();
            var containerBBox = config.container.getBoundingClientRect();
            var absoluteOffsetLeft = containerBBox.left;
            var absoluteOffsetTop = containerBBox.top;

            var dateAtCursor = config.scaleX.invert(mouse[0] - deltaX / 2);
            var dataPointIndexAtCursor = d3.bisectLeft(dataConvertedX, dateAtCursor.getTime());
            var dataPointAtCursor = config.dataConverted[dataPointIndexAtCursor];
            if(dataPointAtCursor){
                var xValue = dataPointAtCursor.x;
                var value = dataPointAtCursor.y;
                var x = config.scaleX(xValue);
                var y = config.scaleY(value);
            }

            piper.events.mousemove({
                data: dataPointAtCursor, 
                mouse: mouse, 
                mouseFromContainer: [mouseFromContainer[0] + absoluteOffsetLeft + window.pageXOffset, mouseFromContainer[1] + absoluteOffsetTop + window.pageYOffset], 
                shapePosition: [x, y],
                shapePositionFromContainer: [x + panelBBox.left - containerBBox.left, y  + panelBBox.top - containerBBox.top]
            });
        });

    eventPanelContainer.exit().remove();

    return {events: piper.events};
};