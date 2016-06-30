piper.axisXFormatterTime = function(_config){
    var config = {
        panel: null,
        dataConverted: null
    };
    piper.utils.override(config, _config);

    config.panel.select('g.axis.x')
        .selectAll('.tick text')
        .text(function(d){
            return d3.time.format('%a')(d);
        });

    return {};
};

piper.axisXFormatterTimeHour = function(_config){
    var config = {
        panel: null
    };
    piper.utils.override(config, _config);

    config.panel.select('g.axis.x')
        .selectAll('.tick text')
        .text(function(d){
            return d3.time.format('%x')(d);
        });

    return {};
};

piper.axisXFormatterRotate30 = function(_config){
    var config = {
        panel: null
    };
    piper.utils.override(config, _config);

    config.panel.select('g.axis.x')
        .selectAll('.tick text')
        .style({
            transform: 'rotate(30deg)',
            'text-anchor': 'start'
        });

    return {};
};

piper.axisYFormatSI = function(_config){
    var config = {
        axisY: null
    };
    piper.utils.override(config, _config);

    config.axisY.tickFormat(d3.format('.2s'));

    return {};
};