piper.axisX = function(_config){
    var config = {
        scaleX: null,
        axisXFormat: function(d){ return d.toString(); }
    };
    piper.utils.override(config, _config);

    var axisX = d3.svg.axis()
        .scale(config.scaleX)
        .orient("bottom")
        .tickFormat(config.axisXFormat);

    return {
        axisX: axisX
    };
};

piper.axisY = function(_config){
    var config = {
        scaleY: null
    };
    piper.utils.override(config, _config);

    var height = config.scaleY.range()[0];

    var axisY = d3.svg.axis()
        .scale(config.scaleY)
        .orient('left')
        .ticks(Math.max(~~(height / 30), 2), '.s3')
        .tickPadding(10);

    return {
        axisY: axisY
    };
};