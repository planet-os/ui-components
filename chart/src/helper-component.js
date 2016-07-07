piper.tooltipComponent = function(_config) {
    var config = {
        panel: null,
        dataIsAllNulls: null,
        events: null
    };
    piper.utils.override(config, _config);

    var tooltipContainer = config.panel
        .selectAll('g.hover-tooltip')
        .data([0]);
    tooltipContainer.enter().append('g').classed('hover-tooltip', true)
        .attr({
            r: 4
        })
        .style({
            'pointer-events': 'none',
            display: 'none'
        })
        .append('text');
    tooltipContainer.exit().remove();

    config.events.mousemove.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        tooltipContainer.attr({
                transform: 'translate(' + d.shapePosition + ')'
            })
            .select('text').text(d.data.y);
    });
    config.events.mouseenter.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        tooltipContainer.style({
            display: 'block'
        });
    });
    config.events.mouseout.on(function(d) {
        tooltipContainer.style({
            display: 'none'
        });
    });

    return {};
};

piper.hoverCircleComponent = function(_config) {
    var config = {
        panel: null,
        dataIsAllNulls: null,
        events: null
    };
    piper.utils.override(config, _config);

    var circleContainer = config.panel
        .selectAll('circle.hover-circle')
        .data([0]);
    circleContainer.enter().append('circle').classed('hover-circle', true)
        .attr({
            r: 3
        })
        .style({
            'pointer-events': 'none',
            display: 'none'
        });
    circleContainer.exit().remove();

    config.events.mousemove.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        circleContainer.attr({
            transform: 'translate(' + d.shapePosition + ')'
        });
    });
    config.events.mouseenter.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        circleContainer.style({
            display: 'block'
        });
    });
    config.events.mouseout.on(function(d) {
        circleContainer.style({
            display: 'none'
        });
    });

    return {};
};

piper.tooltipLineComponent = function(_config) {
    var config = {
        panel: null,
        dataIsAllNulls: null,
        events: null
    };
    piper.utils.override(config, _config);

    var lineGroup = config.panel
        .selectAll('g.line-container')
        .data([0]);
    lineGroup.enter().append('g')
        .attr({
            'class': 'line-container',
            'pointer-events': 'none'
        })
        .style({ visibility: 'hidden' })
        .append('line')
        .attr({
            'class': 'tooltip-line'
        });
    lineGroup.exit().remove();

    var tooltipLine = lineGroup.select('.tooltip-line');

    config.events.mouseenter.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        tooltipLine.style({ visibility: 'visible' });
    });
    config.events.mouseout.on(function(d) {
        tooltipLine.style({ visibility: 'hidden' });
    });
    config.events.mousemove.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        var x = d.shapePosition[0];
        var y = d.shapePosition[1];
        tooltipLine.attr({
            x1: 0,
            y1: y,
            x2: x,
            y2: y
        });
    });

    return {};
};
