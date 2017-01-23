(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports,
            require('d3'),
            require('./datahub-utils.js').utils,
            require('./datahub-common.js').common
        )
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils, root.datahub.common)
    }
}(this, function(exports, d3, utils, common) {

    /*
        TODO:
        -retained mode?
        -verify scale stack vs bar
        -chart resize
        -legend
        -legend interaction
        -line with second scale (how to match with the rest? as multiple?)
    */

    var template = function(config) {
        var containerNode = config.parent.querySelector('.widget-container')
        if(!containerNode) {
            var template = '<div class="widget-container">'
                + '<svg class="datahub-chart">'
                    + '<g class="panel">'
                        + '<g class="stripe-group"></g>'
                        + '<g class="reference-bar-group"></g>'
                        + '<g class="reference-line-group"></g>'                    
                        + '<g class="bar-group"></g>'
                        + '<g class="stacked-bar-group"></g>'
                        + '<g class="estimate-bar-group"></g>'
                        + '<g class="line-group"></g>'
                        + '<g class="area-group"></g>'
                        + '<g class="stacked-area-group"></g>'
                        + '<g class="threshold-line-group"></g>'
                        + '<g class="y axis"></g>'
                        + '<g class="x axis"></g>'
                        + '<g class="title-container">'
                            + '<text class="y axis-title"></text>'
                            + '<text class="x axis-title"></text>'
                            + '<text class="chart-title"></text>'
                        + '</g>'
                        + '<g class="message-group"></g>'
                    + '</g>'
                + '</svg>'
            + '</div>'

            containerNode = utils.appendHtmlToNode(template, config.parent)
        }
        var container = d3.select(containerNode)

        container.select('svg')
            .attr('width', config.width)
            .attr('height', config.height)

        container.select('.panel')
            .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')')

        return {
            container: container
        }
    }

    var dataAdapter = function(config) {
        var d = config.data || {}
        return {
            dataIsEmpty: !d || !d.timestamp || !d.timestamp.length,
            data:  {
                barData: d.barData || [],
                timestamp: d.timestamp || [],
                stackedBarData: d.stackedBarData || [],
                lineData: d.lineData || [],
                referenceData: d.referenceData || [],
                estimateData: d.estimateData || [],
                thresholdData: d.thresholdData || [],
                areaData: d.areaData || []
            }
        }
    }

    var printer = function(config) {
        console.warn(config);
    }

    var scaleX = function(config) {
        var chartWidth = config.width - config.margin.left - config.margin.right
        var dataX = config.dataIsEmpty ? 0 : config.data.timestamp
        var scaleX = d3.scaleBand().domain(dataX).rangeRound([0, chartWidth])
            .paddingInner(0.4).paddingOuter(0.2)

        var referenceScaleX = scaleX.copy().paddingInner(0.1).paddingOuter(0)
        var stripeScaleX = scaleX.copy().paddingInner(0).paddingOuter(0)
        var lineScaleX = scaleX.copy().paddingInner(1).paddingOuter(0.5)

        return {
            scaleX: scaleX,
            referenceScaleX: referenceScaleX,
            stripeScaleX: stripeScaleX,
            lineScaleX: lineScaleX,
            chartWidth: chartWidth
        }
    }

    var scaleY = function(config) {
        var chartHeight = config.height - config.margin.top - config.margin.bottom

        var maxs = []
        if (config.data.barData) {
            maxs.push(d3.max(config.data.barData.map(function(d) {
                return d.value
            })))
        }
        if (config.data.referenceData) {
            maxs.push(d3.max(config.data.referenceData.map(function(d, i) {
                return d.value
            })))
        }
        if (config.data.estimateData) {
            maxs.push(d3.max(config.data.estimateData.map(function(d, i) {
                return d.value
            })))
        }
        if (config.data.thresholdData) {
            maxs.push(d3.max(config.data.thresholdData.map(function(d, i) {
                return d.value
            })))
        }
        if (config.data.areaData) {
            maxs.push(d3.max(config.data.areaData.map(function(d, i) {
                return d.value
            })))
        }
        if (config.data.lineData && config.data.lineData.length) {
            var data = config.data.lineData.map(function(d, i) {
                return d.value
            })
            if (data[0].length) {
                data = d3.merge(data)
            }
            maxs.push(d3.max(data))
        }
        if (config.data.stackedBarData && config.data.stackedBarData.length) {
            var sums = config.data.stackedBarData.map(function(d) {
                return d3.sum(d.value)
            })
            maxs.push(d3.max(sums))
        }
        if (config.data.stackedAreaData && config.data.stackedAreaData.length) {
            var sums = config.data.stackedAreaData.map(function(d) {
                return d3.sum(d.value)
            })
            maxs.push(d3.max(sums))
        }
        var max = d3.max(maxs)

        var scaleY = d3.scaleLinear().domain([0, max]).range([chartHeight, 0])

        return {
            scaleY: scaleY,
            chartHeight: chartHeight
        }
    }

    var findData = function(data, key, timestamp) {
        var index = utils.bisection(data[key].map(function(d, i) { return d.timestamp}), timestamp) - 1
        return index > -1 ? data[key][index].value : null
    }

    var getValuesAtTimestamp = function(timestamp, data) {
        var values = {
            referenceData: findData(data, 'referenceData', timestamp),
            estimateData: findData(data, 'estimateData', timestamp),
            barData: findData(data, 'barData', timestamp),
            areaData: findData(data, 'areaData', timestamp),
            thresholdData: findData(data, 'areaData', timestamp),
        }
        return values
    }

    var stackedBarShapes = function(config) {
        if (!config.data.stackedBarData || !config.data.stackedBarData.length) {
            return {}
        }
        var keys = config.data.stackedBarData[0].value.map(function(d, i) {
            return 'y' + i
        })

        var data = []
        config.data.stackedBarData.forEach(function(d, i) {
            var datum = { x: d.timestamp }
            if (d.value && d.value.length) {
                d.value.forEach(function(dB, iB) {
                    datum['y' + iB] = dB
                })
                data.push(datum)
            }
        })

        var stackedBar = config.container.select('.stacked-bar-group')
            .selectAll('g.stack')
            .data(d3.stack().keys(keys)(data))
        var bar = stackedBar.enter().append('g')
            .attr('class', 'stack')
            .merge(stackedBar)
            .selectAll('rect.stacked-bar')
            .data(function(d, i) {
                d.forEach(function(dB) {
                    dB.index = d.index
                })
                return d
            })
        bar.enter().append('rect')
            .on('mouseover', function(d) {
                config.events.call('stackedBarHover', null, {
                    timestamp: d.data.x,
                    value: d.data['y'+d.index],
                    config: config,
                    event: d3.event
                })

                var timestamp = d.data.x
                var values = getValuesAtTimestamp(timestamp, config.data)

                config.events.call('hover', null, {
                    timestamp: d.data.x,
                    value: d.data['y'+d.index],
                    config: config,
                    event: d3.event
                })
            })
            .merge(bar)
            .attr('class', function(d) {
                return 'stacked-bar layer' + d.index
            })
            .attr('x', function(d) {
                return config.scaleX(d.data.x)
            })
            .attr('y', function(d) {
                return config.scaleY(d[1])
            })
            .attr('height', function(d) {
                return config.scaleY(d[0]) - config.scaleY(d[1])
            })
            .attr('width', config.scaleX.bandwidth())
        bar.exit().remove()
        stackedBar.exit().remove()

        return {}
    }

    var barShapes = function(config) {
        var shapes = config.container.select('.bar-group')
            .selectAll('rect.bar')
            .data(config.data.barData)
        shapes.enter().append('rect')
            .attr('class', 'bar')
            .on('mouseover', function(d) {
                config.events.call('barHover', null, {
                    timestamp: d.timestamp,
                    value: d.value,
                    config: config,
                    event: d3.event
                })
            })
            .merge(shapes)
            .attr('x', function(d, i) {
                return config.scaleX(d.timestamp) || 0
            })
            .attr('y', function(d) {
                return (config.scaleY(d.value) || 0)
            })
            .attr('width', function(d) {
                return config.scaleX.bandwidth()
            })
            .attr('height', function(d) {
                return config.chartHeight - config.scaleY(d.value) || 0
            })
        shapes.exit().remove()

        return {}
    }

    var estimateBarShapes = function(config) {
        var shapes = config.container.select('.estimate-bar-group')
            .selectAll('rect.estimate-bar')
            .data(config.data.estimateData)
        shapes.enter().append('rect')
            .attr('class', 'estimate-bar')
            .on('mouseover', function(d) {
                config.events.call('estimateBarHover', null, {
                    timestamp: d.timestamp,
                    value: d.value,
                    config: config,
                    event: d3.event
                })
            })
            .merge(shapes)
            .attr('x', function(d, i) {
                return config.scaleX(d.timestamp) || 0
            })
            .attr('y', function(d) {
                return (config.scaleY(d.value) || 0)
            })
            .attr('width', function(d) {
                return config.scaleX.bandwidth()
            })
            .attr('height', function(d) {
                return config.chartHeight - config.scaleY(d.value) || 0
            })
        shapes.exit().remove()

        return {}
    }

    var stripes = function(config) {
        var timestamps = config.data.timestamp
            .filter(function(d, i) {
                return i % 2
            })
        var shapes = config.container.select('.stripe-group')
            .selectAll('rect.stripe')
            .data(timestamps)
        shapes.enter().append('rect')
            .attr('class', 'stripe')
            .merge(shapes)
            .attr('x', function(d, i) {
                return config.stripeScaleX(d) || 0
            })
            .attr('y', function(d) {
                return 0
            })
            .attr('width', function(d) {
                return config.stripeScaleX.bandwidth()
            })
            .attr('height', function(d) {
                return config.chartHeight
            })
        shapes.exit().remove()

        return {}
    }

    var referenceBarShapes = function(config) {
        if (!config.data.referenceData) {
            return {}
        }
        var shapes = config.container.select('.reference-bar-group')
            .selectAll('rect.reference-bar')
            .data(config.data.referenceData)
        shapes.enter().append('rect')
            .attr('class', 'reference-bar')
            .on('mouseover', function(d) {
                config.events.call('referenceBarHover', null, {
                    timestamp: d.timestamp,
                    value: d.value,
                    config: config,
                    event: d3.event
                })
            })
            .merge(shapes)
            .attr('x', function(d, i) {
                return config.referenceScaleX(d.timestamp) || 0
            })
            .attr('y', function(d) {
                return (config.scaleY(d.value) || 0)
            })
            .attr('width', function(d) {
                return config.referenceScaleX.bandwidth()
            })
            .attr('height', function(d) {
                return config.chartHeight - config.scaleY(d.value) || 0
            })
        shapes.exit().remove()

        var lines = config.container.select('.reference-line-group')
            .selectAll('path.reference-top')
            .data(config.data.referenceData)
        lines.enter().append('path')
            .attr('class', 'reference-top')
            .merge(lines)
            .attr('d', function(d, i) {
                var x = config.referenceScaleX(d.timestamp) || 0
                var y = config.scaleY(d.value) || 0
                var width = config.referenceScaleX.bandwidth()
                return 'M' + [
                    [x, y],
                    [x + width, y]
                ]
            })
        lines.exit().remove()

        return {}
    }

    var lineShapes = function(config) {
        if (!config.data.lineData.length) {
            return {}
        }

        var line = d3.line()
            // .defined(function(d) {
            //     return d.value != null
            // })
            .x(function(d) {
                return config.lineScaleX(d.timestamp)
            })
            .y(function(d) {
                return config.scaleY(d.value)
            })

        var data = []
        var valueLength = config.data.lineData[0].value.length
        if (typeof valueLength === 'undefined') {
            data.push(config.data.lineData)
        } else {
            for (var i = 0; i < valueLength; i++) {
                var layer = config.data.lineData.map(function(dB) {
                    return { timestamp: dB.timestamp, value: dB.value[i] }
                })
                data.push(layer)
            }
        }

        var shapes = config.container.select('.line-group')
            .selectAll('path.line')
            .data(data)
        shapes.enter().append('path')
            .attr('class', function(d, i) {
                return 'line layer' + i
            })
            .style('fill', 'none')
            .merge(shapes)
            .attr('d', line)
        shapes.exit().remove()

        return {}
    }

    var areaShapes = function(config) {
        if (!config.data.areaData || !config.data.areaData.length) {
            return {}
        }

        var line = d3.area()
            // .defined(function(d) {
            //     return d.value != null
            // })
            .x(function(d) {
                return config.lineScaleX(d.timestamp)
            })
            .y0(config.chartHeight)
            .y1(function(d) {
                return config.scaleY(d.value)
            })

        var data = []
        var valueLength = config.data.areaData[0].value.length
        if (typeof valueLength === 'undefined') {
            data.push(config.data.areaData)
        } else {
            for (var i = 0; i < valueLength; i++) {
                var layer = config.data.areaData.map(function(dB) {
                    return { timestamp: dB.timestamp, value: dB.value[i] }
                })
                data.push(layer)
            }
        }

        var shapes = config.container.select('.area-group')
            .selectAll('path.area')
            .data(data)
        shapes.enter().append('path')
            .attr('class', function(d, i) {
                return 'area layer' + i
            })
            .merge(shapes)
            .attr('d', line)
        shapes.exit().remove()

        return {}
    }

    var stackedAreaShapes = function(config) {
        if (!config.data.stackedAreaData || !config.data.stackedAreaData.length) {
            return {}
        }
        var keys = config.data.stackedAreaData[0].value.map(function(d, i) {
            return 'y' + i
        })

        var area = d3.area()
            // .defined(function(d) {
            //     return d.value != null
            // })
            .x(function(d) {
                return config.lineScaleX(d.data.x)
            })
            .y0(function(d) {
                return config.scaleY(d[0])
            })
            .y1(function(d) {
                return config.scaleY(d[1])
            })

        var data = []
        config.data.stackedAreaData.forEach(function(d, i) {
            var datum = { x: d.timestamp }
            if (d.value && d.value.length) {
                d.value.forEach(function(dB, iB) {
                    datum['y' + iB] = dB
                })
                data.push(datum)
            }
        })

        var stackedArea = config.container.select('.stacked-area-group')
            .selectAll('g.stack-area')
            .data(d3.stack().keys(keys)(data))
        var area = stackedArea.enter().append('g')
            .attr('class', 'stack-area')
            .merge(stackedArea)
            .selectAll('path.stacked-area')
            .data(function(d, i) {
                d.forEach(function(dB) {
                    dB.index = d.index
                })
                return [d]
            })
        area.enter().append('path')
            .merge(area)
            .attr('class', function(d) {
                return 'stacked-area layer' + d.index
            })
            .attr('d', function(d, i) {
                return area(d, i)
            })
        area.exit().remove()
        stackedArea.exit().remove()

        return {}
    }

    var thresholdLineShape = function(config) {
        var line = config.container.select('.threshold-line-group')
            .selectAll('line.reference-line')
            .data(config.data.thresholdData)
        line.enter().append('line')
            .attr('class', 'reference-line')
            .on('mouseover', function(d) {
                config.events.call('thresholdLineHover', null, {
                    timestamp: d.timestamp,
                    value: d.value,
                    config: config,
                    event: d3.event
                })
            })
            .merge(line)
            .attr('x1', 0)
            .attr('y1', function(d) {
                return config.scaleY(d.value) || 0
            })
            .attr('x2', config.chartWidth)
            .attr('y2', function(d) {
                return config.scaleY(d.value) || 0
            })
            .attr('display', function(d) {
                return d ? null : 'none'
            })
        line.exit().remove()

        return {}
    }

    var multi = utils.pipeline(
        common.defaultConfig,
        dataAdapter,
        scaleX,
        scaleY,
        // chart.axesFormatAutoconfig,
        common.axisX,
        common.axisY,
        template,
        stripes,
        areaShapes,
        referenceBarShapes,
        stackedBarShapes,
        stackedAreaShapes,
        barShapes,
        estimateBarShapes,
        lineShapes,
        thresholdLineShape,
        common.axisComponentY,
        common.message,
        common.axisComponentX,
        common.axisTitleComponentX,
        // common.axisXFormatterRotate30,
        common.axisTitleComponentY,
        common.chartTitleComponent
    )

    var multiChart = function(config) {
        var configCache,
            events = d3.dispatch(
                'barHover', 
                'estimateBarHover', 
                'referenceBarHover',
                'stackedBarHover',
                'thresholdLineHover',
                'hover'),
            chartCache

        var render = function() {
            chartCache = multi(configCache)
        }

        var setData = function(data) {
            configCache = utils.mergeAll(configCache, {data: data})
            render()
            return this
        }

        var setConfig = function(config) {
            configCache = utils.mergeAll(configCache, config)
            render()
            return this
        }

        var init = function(config, events) {
            setConfig(utils.mergeAll(config, {events: events}))
        }

        init(config, events)

        return {
            on: utils.rebind(events),
            setConfig: setConfig,
            setData: setData
        }
    }

    exports.chart = {
        multi: multiChart
    }

}))
