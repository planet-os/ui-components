piper.shapePanel = function(_config) {
    var config = {
        panel: null
    };
    piper.utils.override(config, _config);

    var shapePanel = config.panel.selectAll('g.shapes')
        .data([0]);
    shapePanel.enter().append('g')
        .attr({
            'class': 'shapes'
        });
    shapePanel.exit().remove();

    return { shapePanel: shapePanel };
};

piper.areaShapes = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);

    var area = d3.svg.area()
        .defined(function(d) {
            return d.y != null;
        })
        .x(function(d) {
            return config.scaleX(d.x);
        })
        .y(function(d) {
            return config.scaleY(d.y);
        })
        .y0(config.scaleY.range()[0]);

    var shapes = config.shapePanel.selectAll('path.line')
        .data([config.dataConverted]);
    shapes.enter().append('path')
        .attr({
            'class': 'line shape'
        });
    shapes.attr({
        d: area
    });
    shapes.exit().remove();

    return {};
};

piper.message = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        dataIsAllNulls: null,
        scaleX: null,
        scaleY: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);

    var text = config.shapePanel.selectAll('text')
        .data(config.dataIsAllNulls ? [0] : []);
    text.enter().append('text');
    text.attr({
            x: (config.scaleX.range()[1] - config.scaleX.range()[0]) / 2,
            y: (config.scaleY.range()[0] - config.scaleY.range()[1]) / 2
        })
        .text('Values are all null')
        .attr({
            dx: function(d){ return -this.getBBox().width / 2; }
        });
    text.exit().remove();

    return {};
};

piper.lineShapes = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);

    var line = d3.svg.line()
        .defined(function(d) {
            return d.y != null;
        })
        .x(function(d) {
            return config.scaleX(d.x);
        })
        .y(function(d) {
            return config.scaleY(d.y);
        });

    var shapes = config.shapePanel.selectAll('path.line')
        .data([config.dataConverted]);
    shapes.enter().append('path')
        .attr({
            'class': 'line shape'
        })
        .style({ fill: 'none' });
    shapes.attr({
        d: line
    });
    shapes.exit().remove();

    return {};
};

piper.barShapes = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        chartHeight: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);

    var scaleXRange = config.scaleX.range();
    var width = scaleXRange[1] - scaleXRange[0];
    var barWidth = width / (config.dataConverted.length - 1) / 2;

    var shapes = config.shapePanel.selectAll('rect.bar')
        .data(config.dataConverted);
    shapes.enter().append('rect')
        .attr({
            'class': 'bar shape'
        });
    shapes.transition().attr({
        x: function(d) {
            return config.scaleX(d.x) - barWidth / 2;
        },
        y: function(d) {
            var barY = config.scaleY(d.y);
            d.barY = (d.y > 0 && barY === config.chartHeight) ? config.chartHeight - 1 : barY;
            return d.barY;
        },
        width: function(d) {
            return barWidth;
        },
        height: function(d) {
            return config.chartHeight - d.barY;
        }
    });
    shapes.exit().remove();

    return {};
};

piper.barShapesGrouped = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        dataFlat: null,
        scaleX: null,
        scaleY: null,
        chartHeight: null,
        chartWidth: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);

    var barWidth = config.chartWidth / (config.dataFlat.length - 1) / 2;
    var groupWidth = config.chartWidth / (config.dataConverted.length - 1);

    var groups = config.shapePanel.selectAll('g.shape-group')
        .data(config.dataConverted);
    groups.enter().append('g')
        .attr({
            'class': 'shape-group'
        });
    groups.attr({
        transform: function(d, i) {
            return 'translate(' + (groupWidth * i - groupWidth / 4) + ' 0)';
        }
    });
    groups.exit().remove();

    var shapes = groups.selectAll('rect.bar')
        .data(function(d) {
            return d.y;
        });
    shapes.enter().append('rect')
        .attr({
            'class': 'bar shape'
        });
    shapes.transition().attr({
        x: function(d, i) {
            return barWidth * i;
        },
        y: function(d) {
            var barY = config.scaleY(d);
            barY = (d && d > 0 && barY === config.chartHeight) ? config.chartHeight - 1 : barY;
            return barY;
        },
        width: function(d) {
            return barWidth;
        },
        height: function(d) {
            var barY = config.scaleY(d);
            barY = (d && d > 0 && barY === config.chartHeight) ? config.chartHeight - 1 : barY;
            return config.chartHeight - barY;
        }
    });
    shapes.exit().remove();

    return {};
};

piper.endCircle = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        width: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);

    var lastDataY = config.dataConverted[config.dataConverted.length - 1];

    var shapes = config.shapePanel.selectAll('circle.end-circle')
        .data([lastDataY]);
    shapes.enter().append('circle')
        .attr({
            'class': 'end-circle shape'
        });
    shapes.attr({
        cx: function(d) {
            return config.scaleX(d.x);
        },
        cy: function(d) {
            return config.scaleY(d.y);
        },
        r: 2
    });
    shapes.exit().remove();

    return {};
};
