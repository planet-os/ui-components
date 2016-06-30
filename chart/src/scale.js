piper.scaleX = function(_config){
    var config = {
        dataConverted: null,
        margin: null,
        width: null,
        scaleType: null
    };
    piper.utils.override(config, _config);

    var chartWidth = config.width - config.margin.left - config.margin.right;
    var dataX = config.dataConverted.map(function(d){ return d.x; });

    var scaleX = d3.scale.linear()
        .domain(d3.extent(dataX))
        .range([0, chartWidth]);

    return {
        scaleX: scaleX,
        chartWidth: chartWidth
    };
};

piper.scaleXTime = function(_config){
    var config = {
        dataConverted: null,
        margin: null,
        width: null,
        scaleType: null
    };
    piper.utils.override(config, _config);

    var chartWidth = config.width - config.margin.left - config.margin.right;
    var dataX = config.dataConverted.map(function(d){ return d.x; });

    var scaleX = d3.time.scale()
        .domain(d3.extent(dataX))
        .range([0, chartWidth]);

    return {
        scaleX: scaleX,
        chartWidth: chartWidth
    };
};

piper.scaleY = function(_config){
    var config = {
        dataConverted: null,
        margin: null,
        height: null
    };
    piper.utils.override(config, _config);

    var chartHeight = config.height - config.margin.top - config.margin.bottom;
    var dataY = config.dataConverted.map(function(d){ return d.y; });

    var scaleY = d3.scale.linear()
        .domain(d3.extent(dataY))
        .range([chartHeight, 0]);

    return {
        scaleY: scaleY,
        chartHeight: chartHeight
    };
};

piper.scaleYGrouped = function(_config){
    var config = {
        dataConverted: null,
        margin: null,
        height: null
    };
    piper.utils.override(config, _config);

    var chartHeight = config.height - config.margin.top - config.margin.bottom;
    var dataY = config.dataConverted.map(function(d){ return d.y; });

    var scaleY = d3.scale.linear()
        .domain(d3.extent(d3.merge(dataY)))
        .range([chartHeight, 0]);

    return {
        scaleY: scaleY,
        chartHeight: chartHeight
    };
};

piper.scaleYFrom0 = function(_config){
    var config = {
        dataConverted: null,
        margin: null,
        height: null
    };
    piper.utils.override(config, _config);

    var chartHeight = config.height - config.margin.top - config.margin.bottom;
    var dataY = config.dataConverted.map(function(d){ return d.y; });

    var scaleY = d3.scale.linear()
        .domain([0, d3.max(dataY)])
        .range([chartHeight, 0]);

    return {
        scaleY: scaleY,
        chartHeight: chartHeight
    };
};

piper.scaleYFrom0Padded = function(_config){
    var config = {
        dataConverted: null,
        margin: null,
        height: null
    };
    piper.utils.override(config, _config);

    var chartHeight = config.height - config.margin.top - config.margin.bottom;
    var dataY = config.dataConverted.map(function(d){ return d.y; });
    var valueMax = d3.max(dataY);
    var topPadding = 1 - (valueMax - d3.min(dataY)) / valueMax;
    var valuePadded = valueMax + valueMax * topPadding;

    var scaleY = d3.scale.linear()
        .domain([0, valuePadded])
        .range([chartHeight, 0]);

    return {
        scaleY: scaleY,
        chartHeight: chartHeight
    };
};

piper.scaleYExtent = function(_config){
    var config = {
        extentY: null,
        scaleY: null
    };
    piper.utils.override(config, _config);

    config.scaleY.domain(config.extentY);

    return {};
};