!(function(dh, d3) {
    var template = function(config) {
        var containerNode = config.parent.querySelector('.datahub-weather-chart')
        if(!containerNode) {
            var template = '<div class="datahub-weather-chart">'
                + '<div class="chart-row topAxis">'
                    + '<div class="historical"></div>'
                    + '<div class="forecast"></div>'
                + '</div>'
                + '<div class="chart-row wind">'
                    + '<div class="historical"></div>'
                    + '<div class="forecast"></div>'
                + '</div>'
                + '<div class="chart-row windDirection">'
                    + '<div class="historical"></div>'
                    + '<div class="forecast"></div>'
                + '</div>'
                + '<div class="chart-row wave">'
                    + '<div class="historical"></div>'
                    + '<div class="forecast"></div>'
                + '</div>'
                + '<div class="chart-row tide">'
                    + '<div class="historical"></div>'
                    + '<div class="forecast"></div>'
                + '</div>'
                + '<div class="chart-row bottomAxis">'
                    + '<div class="historical"></div>'
                    + '<div class="forecast"></div>'
                + '</div>'
            + '</div>'

            containerNode = dh.utils.appendHtmlToNode(template, config.parent)
        }

        var dataIsEmpty = !config.data

        var container = d3.select(containerNode)
        var chartWidth = config.width || containerNode.clientWidth
        var chartHeight = config.height || containerNode.clientHeight || 300

        return {
            container: container,
            chartWidth: chartWidth,
            chartHeight: chartHeight,
            dataIsEmpty: dataIsEmpty
        }
    }

    var defaultConfig = function(config) {
        var historicalChartConfig = {
            tickStep: 20,
            resolution: 'minute',
            axisXFormat: '%H:%M',
            domain: [0, 50],
            chartType: 'area',
            yTicks: 3,
            height: 80,
            width: config.chartWidth / 2,
            valueFormatter: function(d, i) { return Math.round(d.value * 100) / 100 },
            hide: ['xTitle', 'yTitle', 'xAxis'], //['xTitle', 'yTitle', 'tooltip', 'xAxis', 'yAxis', 'shapes', 'xGrid', 'xTitle', 'yTitle']
            margin: { top: 10, right: 20, bottom: 10, left: 50 }
        }

        var forecastChartConfig = datahub.utils.mergeAll({}, historicalChartConfig, {
            xTicks: d3.utcHour.every(12),
            resolution: 'hour',
            hide: ['xAxis', 'yAxis', 'yTitle', 'xTitle'],
            margin: { top: 10, right: 20, bottom: 10, left: 0 }
        })

        var commonArrowsConfig = {
            hide: ['xAxis', 'yAxis', 'xTitle', 'yTitle', 'tooltipDot'],
            chartType: 'arrow',
            arrowSkip: 1,
            height: 20,
            margin: { top: 0, right: 20, bottom: 0, left: 50 }
        }

        var historicalArrowsConfig = datahub.utils.mergeAll({}, historicalChartConfig, commonArrowsConfig)

        var forecastArrowsConfig = datahub.utils.mergeAll({}, forecastChartConfig, commonArrowsConfig, {
            margin: { top: 0, right: 20, bottom: 0, left: 0 },
            arrowSkip: 6
        })

        var commonSingleAxis = {
            axisOnly: true,
            xAxisOnTop: true,
            hide: ['yAxis', 'yTitle', 'tooltip'],
            height: 20,
            margin: { top: 20, right: 20, bottom: 0, left: 50 }
        }

        var historicalTopAxis = datahub.utils.mergeAll({}, historicalChartConfig, commonSingleAxis)
        var forecastTopAxis = datahub.utils.mergeAll({}, forecastChartConfig, commonSingleAxis, {
            margin: {top: 20, right: 20, bottom: 0, left: 0 }
        })
        var historicalBottomAxis = datahub.utils.mergeAll({}, historicalChartConfig, commonSingleAxis, {
            margin: {top: 0, right: 20, bottom: 20, left: 50 },
            xAxisOnTop: false
        })
        var forecastBottomAxis = datahub.utils.mergeAll({}, forecastChartConfig, commonSingleAxis, {
            margin: {top: 0, right: 20, bottom: 20, left: 0 },
            xAxisOnTop: false
        })

        var chartConfig = {
            historical: {
                wind: historicalChartConfig,
                windDirection: historicalArrowsConfig,
                wave: historicalChartConfig,
                tide: historicalChartConfig,
                bottomAxis: historicalBottomAxis,
                topAxis: historicalTopAxis
            },
            forecast: {
                wind: forecastChartConfig,
                windDirection: forecastArrowsConfig,
                wave: forecastChartConfig,
                tide: forecastChartConfig,
                bottomAxis: forecastBottomAxis,
                topAxis: forecastTopAxis
            }
        }

        return {
            chartConfig: chartConfig
        }
    }

    var data = function(config) {
        var dataConverted = config.data

        return {
            dataConverted: dataConverted
        }
    }

    function setTimeInfo(timestamp, config) {
        var formattedDate = d3.utcFormat('%c')(timestamp)
        config.events.call('hover', null, {formattedDate: formattedDate})
    }

    function setTooltip(charts, groupKey, chartKey, timestamp, config) {
        for(var x in charts) {
            if(x === groupKey) {
                for(var y in charts[x]) {
                    if(y !== chartKey) {
                        charts[x][y].setConfig({tooltipTimestamp: timestamp})
                    }
                }
            }
            else {
                for(var y in charts[x]) {
                    charts[x][y].setConfig({tooltipTimestamp: null})
                }
            }
        }

        setTimeInfo(timestamp, config)
    }

    var charts = function(config) {
         var charts = {
            historical: {
                wind: null,
                windDirection: null,
                wave: null,
                tide: null,
                bottomAxis: null,
                topAxis: null
            },
            forecast: {
                wind: null,
                windDirection: null,
                wave: null,
                tide: null,
                bottomAxis: null,
                topAxis: null
            }
        }

        for(var x in charts) {
            for(var y in charts[x]) {
                charts[x][y] = datahub.timeseries({
                        parent: config.container.select('.' + y + ' .' + x).node()
                    })
                    .setConfig(config.chartConfig[x][y])
                    .on('hover', (function(d) {
                        var groupKey = x
                        var chartKey = y
                        return function(d){
                            setTooltip(charts, groupKey, chartKey, d[0].timestamp, config)
                        }
                    })())
                    .on('mouseout', function() {
                        var latestHistoricalTimestamp = new Date(config.dataConverted.historical.wind.data.slice(-1)[0].timestamp)
                        setTooltip(charts, 'historical', null, latestHistoricalTimestamp, config)
                    })
                if(!config.dataIsEmpty) {
                    charts[x][y].setData([config.dataConverted[x][y]])
                }
            }
        }

        return {
            charts: charts
        }
    }

    var chart = dh.utils.pipeline(
        template,
        defaultConfig,
        data,
        charts
    )

    var weatherChart = function(config) {
        var configCache,
            events = d3.dispatch('hover'),
            chartCache,
            uid = ~~(Math.random()*10000)

        var onResize = dh.utils.throttle(function() {
            configCache.width = configCache.parent.clientWidth
            render()
        }, 200)

        d3.select(window).on('resize.' + uid, onResize)

        var render = function() {
            chartCache = chart(configCache)
        }

        var setData = function(data) {
            var d = data ? JSON.parse(JSON.stringify(data)) : {}
            configCache = dh.utils.mergeAll({}, configCache, {data: d})
            render()
            return this
        }

        var setConfig = function(config) {
            configCache = dh.utils.mergeAll(configCache, config)
            render()
            return this
        }

        var init = function(config, events) {
            setConfig(dh.utils.mergeAll(config, {events: events}))
        }

        var destroy = function() {
            d3.select(window).on('resize.' + uid, null)
            configCache.parent.innerHTML = null
        }

        init(config, events)

        return {
            // on: dh.utils.rebind(events),
            setConfig: setConfig,
            setData: setData,
            destroy: destroy
        }
    }

    dh.weatherChart = weatherChart

}(datahub, root.d3))