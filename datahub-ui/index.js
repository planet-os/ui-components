var datahub = {
    palette: require('./src/datahub-palette.js').palette,
    map: require('./src/datahub-map.js').map,
    widget: require('./src/datahub-widget.js').widget,
    group: require('./src/datahub-group.js').group,
    chart: require('./src/datahub-chart.js').chart,
    tableChart: require('./src/datahub-table-chart.js').tableChart,
    verticalChart: require('./src/datahub-vertical-chart.js').verticalChart,
    waterfallChart: require('./src/datahub-waterfall-chart.js').waterfallChart,
    common: require('./src/datahub-common.js').common,
    utils: require('./src/datahub-utils.js').utils,
    data: require('./src/datahub-data.js').data
}

module.exports = datahub