piper.thresholdLine = function(_config) {
    var config = {
        panel: null,
        scaleY: null,
        margin: null,
        chartWidth: null,
        thresholdY: null
    };
    piper.utils.override(config, _config);

    if (typeof config.thresholdY !== 'number') {
        return {};
    }

    var scaledThresholdY = config.scaleY(config.thresholdY);
    var path = 'M' + [
        [0, scaledThresholdY],
        [config.chartWidth + 6, scaledThresholdY]
    ].join('L');

    var shapes = config.panel.selectAll('path.threshold')
        .data([0]);
    shapes.enter().append('path')
        .attr({
            'class': 'threshold shape'
        })
        .style({ fill: 'none' });
    shapes.attr({
        d: path
    });
    shapes.exit().remove();

    return {};
};

piper.thresholdLineLabel = function(_config) {
    var config = {
        panel: null,
        scaleY: null,
        margin: null,
        chartWidth: null,
        thresholdY: null,
        thresholdYLabel: null
    };
    piper.utils.override(config, _config);

    if (!config.thresholdYLabel) {
        return {};
    }

    var scaledThresholdY = config.scaleY(config.thresholdY);
    var path = 'M' + [
        [0, scaledThresholdY],
        [config.chartWidth + 6, scaledThresholdY]
    ].join('L');

    var text = config.panel.selectAll('text.threshold-label')
        .data([0]);
    text.enter().append('text')
        .attr({
            'class': 'threshold-label',
            x: config.chartWidth + 8,
            y: scaledThresholdY + 2
        });
    text.text(config.thresholdYLabel);
    text.exit().remove();

    return {};
};

piper.verticalLine = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        chartHeight: null,
        margin: null,
        verticalLineX: null,
        verticalLineValue: null
    };
    piper.utils.override(config, _config);

    var scaledverticalLineX = config.scaleX(config.verticalLineX);
    var path = 'M' + [
        [scaledverticalLineX, 0],
        [scaledverticalLineX, config.chartHeight]
    ].join('L');

    var shapes = config.panel.selectAll('path.vertical-line')
        .data([0]);
    shapes.enter().append('path')
        .attr({
            'class': 'vertical-line shape'
        });
    shapes.attr({
        d: path
    });
    shapes.exit().remove();

    var label = config.panel.selectAll('text.vertical-line-label')
        .data([0]);
    label.enter().append('text')
        .attr({
            'class': 'vertical-line-label'
        });
    label.attr({
            x: scaledverticalLineX + 2,
            y: config.chartHeight + config.margin.top + config.margin.bottom / 4
        })
        .text(config.verticalLineValue);
    shapes.exit().remove();

    return {};
};

piper.tooltipComponent = function(_config) {
    var config = {
        container: null,
        panel: null,
        dataConverted: null,
        dataIsAllNulls: null,
        scaleX: null,
        scaleY: null,
        events: null,
        chartWidth: null,
        chartHeight: null
    };
    piper.utils.override(config, _config);
    piper.utils.override(config, piper.eventsBinder(config));

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
        container: null,
        panel: null,
        dataConverted: null,
        dataIsAllNulls: null,
        scaleX: null,
        scaleY: null,
        events: null,
        chartWidth: null,
        chartHeight: null
    };
    piper.utils.override(config, _config);
    piper.utils.override(config, piper.eventsBinder(config));

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
        container: null,
        panel: null,
        dataConverted: null,
        dataIsAllNulls: null,
        scaleX: null,
        scaleY: null,
        events: null,
        chartWidth: null,
        chartHeight: null
    };
    piper.utils.override(config, _config);
    piper.utils.override(config, piper.eventsBinder(config));

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
