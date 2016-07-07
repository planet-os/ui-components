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
