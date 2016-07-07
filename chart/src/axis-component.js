piper.panelComponent = function(_config){
    var config = {
        container: null,
        width: null,
        height: null,
        margin: null
    };
    piper.utils.override(config, _config);

    piper.events = {
        mousemove: piper.utils.reactiveProperty(),
        mouseenter: piper.utils.reactiveProperty(),
        mouseout: piper.utils.reactiveProperty()
    };

    var root = d3.select(config.container)
        .selectAll('svg')
        .data([0]);
    root.enter().append('svg')
        .attr({
            'class': 'piper-chart'
        })
        .append('g')
        .attr({
            'class': 'panel'
        });
    root.attr({
        width: config.width,
        height: config.height
    });
    root.exit().remove();

    var panel = root.select('g.panel')
        .attr({
            transform: 'translate(' + config.margin.left + ',' + config.margin.top + ')'
        });

    return {
        root: root,
        panel: panel
    };
};

piper.axisComponentX = function(_config){
    var config = {
        axisX: null,
        chartHeight: null,
        panel: null
    };
    piper.utils.override(config, _config);

    var axisX = config.panel.selectAll('g.axis.x')
        .data([0]);
    axisX.enter().append('g')
        .attr({
            'class': 'x axis',
            transform: 'translate(' + [0, config.chartHeight] + ')'
        });
    axisX.transition().attr({
            transform: 'translate(' + [0, config.chartHeight] + ')'
        })
        .call(config.axisX);
    axisX.exit().remove();

    return {};
};

piper.axisComponentY = function(_config){
    var config = {
        axisY: null,
        panel: null,
        axisYPadding: null
    };
    piper.utils.override(config, _config);

    var padding = config.axisYPadding || 0;
    var axisY = config.panel.selectAll('g.axis.y')
        .data([0]);
    axisY.enter().append('g')
        .attr({
            'class': 'y axis',
            transform: 'translate(' + [-padding /2, 0] + ')'
        });
    axisY.transition().call(config.axisY);
    axisY.exit().remove();

    return {};
};

piper.axisTitleComponentX = function(_config){
    var config = {
        panel: null,
        axisTitleX: null,
        chartHeight: null,
        chartWidth: null
    };
    piper.utils.override(config, _config);

    var axisTitleX = config.panel.selectAll('text.axis-title.x')
        .data([0]);
    axisTitleX.enter().append('text')
        .attr({
            'class': 'x axis-title'
        });
    axisTitleX.text(config.axisTitleX || '')
        .attr({
            x: config.chartWidth,
            y: config.chartHeight
        });
    axisTitleX.exit().remove();

    return {};
};

piper.axisTitleComponentY = function(_config){
    var config = {
        panel: null,
        axisTitleY: null
    };
    piper.utils.override(config, _config);

    var axisTitleY = config.panel.selectAll('text.axis-title.y')
        .data([0]);
    axisTitleY.enter().append('text')
        .attr({
            'class': 'y axis-title'
        });
    axisTitleY.text(config.axisTitleY || '')
        .attr({
            x: -40,
            y: -10
        });
    axisTitleY.exit().remove();

    return {};
};

piper.chartTitleComponent = function(_config){
    var config = {
        panel: null,
        chartTitle: null,
        chartWidth: null
    };
    piper.utils.override(config, _config);

    var axisTitleX = config.panel.selectAll('text.chart-title')
        .data([0]);
    axisTitleX.enter().append('text')
        .attr({
            'class': 'chart-title'
        });
    axisTitleX.text(config.chartTitle || '')
        .attr({
            x: function(d){ return (config.chartWidth - config.chartTitle.length * 5) / 2; },
            y: -5
        });
    axisTitleX.exit().remove();

    return {};
};