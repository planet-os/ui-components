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
        -chart resize
    */

    var template = function(config) {
        var containerNode = config.parent.querySelector('.widget-container')
        if(!containerNode) {
            var template = '<div class="widget-container">'
                + '<svg class="datahub-chart">'
                    + '<g class="panel">'
                        + '<g class="stripe-group"></g>'
                        + '<g class="area-group"></g>'
                        + '<g class="stacked-area-group"></g>'
                        + '<g class="reference-bar-group"></g>'
                        + '<g class="reference-line-group"></g>'                    
                        + '<g class="bar-group"></g>'
                        + '<g class="stacked-bar-group"></g>'
                        + '<g class="estimate-bar-group"></g>'
                        + '<g class="line-group"></g>'
                        + '<g class="threshold-line-group"></g>'
                        + '<g class="y axis"></g>'
                        + '<g class="x axis"></g>'
                        + '<g class="active-group"></g>'
                        + '<g class="title-container">'
                            + '<text class="y axis-title"></text>'
                            + '<text class="x axis-title"></text>'
                            + '<text class="chart-title"></text>'
                        + '</g>'
                        + '<g class="message-group"></g>'
                        + '<g class="events"></g>'
                    + '</g>'
                + '</svg>'
            + '</div>'

            containerNode = utils.appendHtmlToNode(template, config.parent)
        }
        var chartWidth = config.width - config.margin.left - config.margin.right
        var chartHeight = config.height - config.margin.top - config.margin.bottom

        var container = d3.select(containerNode)

        container.select('svg')
            .attr('width', config.width)
            .attr('height', config.height)

        container.select('.panel')
            .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')')

        container.select('.events rect')
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('opacity', 0)

        return {
            container: container,
            chartWidth: chartWidth,
            chartHeight: chartHeight
        }
    }

    var validateData = function(d, key, is2D) {
        return d[key] ? d[key].map(function(d) {
            d.timestamp = new Date(d.timestamp)
            d.value = (Array.isArray(d.value) && !is2D) ? d.value[0] : d.value

            return d
        }) : []
    }

    var validateTimestamp = function(d) {
        return d.timestamp ? d.timestamp.map(function(d) {
            return new Date(d)
        }) : []
    }

    var dataAdapter = function(config) {
        var d = config.data ||  {}

        return {
            dataIsEmpty: !d || !d.timestamp || !d.timestamp.length,
            data: {
                timestamp: validateTimestamp(d),
                stackedBarData: validateData(d, 'stackedBarData', true),
                stackedAreaData: validateData(d, 'stackedAreaData', true),
                lineData: validateData(d, 'lineData', true),
                barData: validateData(d, 'barData'),
                referenceData: validateData(d, 'referenceData'),
                estimateData: validateData(d, 'estimateData'),
                thresholdData: validateData(d, 'thresholdData'),
                areaData: validateData(d, 'areaData')
            }
        }
    }

    var printer = function(config) {
        console.warn(config);
    }

    var scaleX = function(config) {
        var dataX = config.dataIsEmpty ? 0 : config.data.timestamp
        var scaleX = d3.scaleBand().domain(dataX).rangeRound([0, config.chartWidth])
            .paddingInner(0.4).paddingOuter(0.2)
        var referenceScaleX = scaleX.copy().paddingInner(0.1).paddingOuter(0.05)
        var stripeScaleX = scaleX.copy().paddingInner(0).paddingOuter(0)
        var lineScaleX = scaleX.copy().paddingInner(1).paddingOuter(0.5)

        return {
            scaleX: scaleX,
            referenceScaleX: referenceScaleX,
            stripeScaleX: stripeScaleX,
            lineScaleX: lineScaleX
        }
    }

    var getExtent = function(d, isMin) {
        var func = isMin ? 'min' : 'max'
        if (d) {
            return d3[func](d.map(function(d) {
                return d.value
            }))
        }
        return null
    }

    var getStackExtent = function(d, isMin) {
        var func = isMin ? 'min' : 'max'
        if (d && d.length) {
            var sums = d.map(function(d) {
                return d3.sum(d.value)
            })
            return d3[func](sums)
        }
        return null
    }

    var getMultiExtent = function(d, isMin) {
        var func = isMin ? 'min' : 'max'
        if (d && d.length) {
            var data = d.map(function(d, i) {
                return d.value
            })
            if (data[0].length) {
                data = d3.merge(data)
            }
            return d3[func](data)
        }
        return null
    }

    var scaleY = function(config) {
        var maxs = []
        maxs.push(getExtent(config.data.barData))
        maxs.push(getExtent(config.data.referenceData))
        maxs.push(getExtent(config.data.estimateData))
        maxs.push(getExtent(config.data.thresholdData))
        maxs.push(getExtent(config.data.areaData))
        maxs.push(getStackExtent(config.data.stackedBarData))
        maxs.push(getStackExtent(config.data.stackedAreaData))
        maxs.push(getMultiExtent(config.data.lineData))

        var mins = []
        var isMin = true
        mins.push(getExtent(config.data.barData, isMin))
        mins.push(getExtent(config.data.referenceData, isMin))
        mins.push(getExtent(config.data.estimateData, isMin))
        mins.push(getExtent(config.data.thresholdData, isMin))
        mins.push(getExtent(config.data.areaData, isMin))
        mins.push(getStackExtent(config.data.stackedBarData, isMin))
        mins.push(getStackExtent(config.data.stackedAreaData, isMin))
        mins.push(getMultiExtent(config.data.lineData, isMin))

        var max = d3.max(maxs)
        var min
        if(config.autoScaleY) {
            min = d3.min(mins)
            var padding = (max - min) / 10
            min = Math.max(min - padding, 0)
            max += padding
        }
        else {
            min = Math.min(d3.min(mins), 0)
        }

        var scaleY = d3.scaleLinear().domain([min, max]).range([config.chartHeight, 0])

        return {
            scaleY: scaleY
        }
    }

    var findData = function(data, key, timestamp) {
        if(!timestamp) {
            return null
        }
        var index = data[key].map(function(d) {
                return d.timestamp && d.timestamp.getTime()
            })
            .indexOf(timestamp.getTime())
        if(index > -1) {
            var datum = utils.mergeAll({}, data[key][index])
            datum.value = [].concat(data[key][index].value)
            datum.id = [].concat(data[key][index].id)
            return datum
        }
        else {
            return null
        }
    }

    var findThresholdData = function(data, key, timestamp) {
        if(data[key][0]) {
            var datum = utils.mergeAll({}, data[key][0])
            datum.value = [].concat(data[key][0].value)
            datum.id = [].concat(data[key][0].id)
            return datum
        }
        else {
            return null
        }
    }

    var getValuesAtTimestamp = function(timestamp, data) {
        var values = {
            referenceData: findData(data, 'referenceData', timestamp),
            estimateData: findData(data, 'estimateData', timestamp),
            barData: findData(data, 'barData', timestamp),
            stackedBarData: findData(data, 'stackedBarData', timestamp),
            lineData: findData(data, 'lineData', timestamp),
            areaData: findData(data, 'areaData', timestamp),
            stackedAreaData: findData(data, 'stackedAreaData', timestamp),
            thresholdData: findThresholdData(data, 'thresholdData', timestamp),
        }

        return values
    }

    var eventsPanel = function(config) {
        var eventPanel = config.container.select('.events')
            .selectAll('rect.event-panel')
            .data([0])
        eventPanel.enter().append('rect')
            .attr('class', 'event-panel')
            .merge(eventPanel)
            .on('mousemove', function(d) {
                if(config.dataIsEmpty) {
                    return
                }
                var mouseX = d3.mouse(this)[0]
                var w = config.stripeScaleX.bandwidth()
                var domain = config.stripeScaleX.domain()
                var domainLength = domain.length
                var index = Math.min(~~(mouseX / w), domainLength - 1)
                var timestamp = domain[index]

                var values = getValuesAtTimestamp(timestamp, config.data)
                config.events.call('hover', null, {
                    index: index,
                    timestamp: timestamp,
                    data: values,
                    config: config,
                    event: d3.event
                })
            })
            .on('mouseout', function(d) {
                if(config.dataIsEmpty) {
                    return
                }

                config.events.call('mouseout', null, {})
            })
        eventPanel.exit().remove()
        return {
            eventPanel: eventPanel
        }
    }

    var barShapes = function(config) {
        var shapes = config.container.select('.bar-group')
            .selectAll('rect.bar')
            .data(config.data.barData)
        shapes.enter().append('rect')
            .merge(shapes)
            .attr('class', function(d) {
                return ['bar', d.id, d.className].join(' ')
            })
            .attr('x', function(d, i) {
                return config.scaleX(d.timestamp) || 0
            })
            .attr('y', function(d) {
                if(config.autoScaleY) {
                    return config.chartHeight - (config.chartHeight - Math.abs(config.scaleY(d.value)))
                }
                if(d.value >= 0){
                    return config.scaleY(0) - Math.abs(config.scaleY(d.value) - config.scaleY(0))

                }
                else {
                    return config.scaleY(0)
                }
            })
            .attr('width', function(d) {
                return config.scaleX.bandwidth()
            })
            .attr('height', function(d) {
                if(config.autoScaleY) {
                    return config.chartHeight - Math.abs(config.scaleY(d.value))
                }
                return Math.abs(config.scaleY(d.value) - config.scaleY(0))
            })
        shapes.exit().remove()

        return {}
    }

    var estimateBarShapes = function(config) {
        var shapes = config.container.select('.estimate-bar-group')
            .selectAll('rect.estimate-bar')
            .data(config.data.estimateData)
        shapes.enter().append('rect')
            .merge(shapes)
            .attr('class', function(d) {
                return ['estimate-bar', d.id, d.className].join(' ')
            })
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

    var referenceBarShapes = function(config) {
        if (!config.data.referenceData) {
            return {}
        }
        var shapes = config.container.select('.reference-bar-group')
            .selectAll('rect.reference-bar')
            .data(config.data.referenceData)
        shapes.enter().append('rect')
            .merge(shapes)
            .attr('class', function(d) {
                return ['reference-bar', d.id, d.className].join(' ')
            })
            .attr('x', function(d, i) {
                return config.referenceScaleX(d.timestamp) || 0
            })
            .attr('y', function(d) {
                 if(config.autoScaleY) {
                    return config.chartHeight - (config.chartHeight - Math.abs(config.scaleY(d.value)))
                }
                if(d.value >= 0){
                    return config.scaleY(0) - Math.abs(config.scaleY(d.value) - config.scaleY(0))
                }
                else {
                    return config.scaleY(0)
                }
            })
            .attr('width', function(d) {
                return config.referenceScaleX.bandwidth()
            })
            .attr('height', function(d) {
                if(config.autoScaleY) {
                    return config.chartHeight - Math.abs(config.scaleY(d.value))
                }
                return Math.abs(config.scaleY(d.value) - config.scaleY(0))
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

                var y = 0
                if(d.value >= 0){
                    y = config.scaleY(0) - Math.abs(config.scaleY(d.value) - config.scaleY(0))
                }
                else {
                    y = config.scaleY(0)
                }

                var width = config.referenceScaleX.bandwidth()
                return 'M' + [
                    [x, y],
                    [x + width, y]
                ]
            })
        lines.exit().remove()

        return {}
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
            var datum = utils.mergeAll({}, d)
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
                    // dB.id = dB.data.id && dB.data.id.length ? dB.data.id[d.index] : null
                })
                return d
            })
        bar.enter().append('rect')
            .attr('class', 'stacked-bar')
            .merge(bar)
            .attr('class', function(d, a, b) {
                var id = d.data.id ? d.data.id[d.index] : null
                var className = d.data.className ? d.data.className[d.index] : null
                return ['stacked-bar', 'layer' + d.index, id, className].join(' ')
            })
            .filter(function(d) {
                return !Number.isNaN(d[0]) && !Number.isNaN(d[1])
            })
            .attr('x', function(d) {
                return config.scaleX(d.data.timestamp)
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

    var lineShapes = function(config) {
        if (!config.data.lineData.length) {
            return {}
        }

        var line = d3.line()
            .defined(function(d) {
                return d.value != null
            })
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
                    return {
                        timestamp: dB.timestamp,
                        value: dB.value[i],
                        id: dB.id && dB.id[i],
                        className: dB.className && dB.className[i],
                    }
                })
                data.push(layer)
            }
        }

        var shapes = config.container.select('.line-group')
            .selectAll('path.line')
            .data(data)
        shapes.enter().append('path')
            .style('fill', 'none')
            .merge(shapes)
            .attr('class', function(d, i) {
                return ['line', 'layer' + i, d[0].id, d[0].className].join(' ')
            })
            .attr('d', line)
        shapes.exit().remove()

        return {}
    }

    var thresholdLineShape = function(config) {
        var line = config.container.select('.threshold-line-group')
            .selectAll('line.reference-line')
            .data(config.data.thresholdData)
        line.enter().append('line')
            .merge(line)
            .attr('class', function(d) {
                return ['threshold-line', d.id, d.className].join(' ')
            })
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

    var areaShapes = function(config) {
        if (!config.data.areaData || !config.data.areaData.length) {
            return {}
        }

        var areaGenerator = d3.area()
            .defined(function(d) {
                return d.value != null
            })
            .x(function(d) {
                return config.lineScaleX(d.timestamp)
            })
            .y0(config.chartHeight)
            .y1(function(d) {
                return config.scaleY(d.value)
            })

        var shapes = config.container.select('.area-group')
            .selectAll('path.area')
            .data([config.data.areaData])
        shapes.enter().append('path')
            .attr('class', function(d, i) {
                return ['area', 'layer' + i, d[0].id, d[0].className].join(' ')
            })
            .merge(shapes)
            .attr('d', areaGenerator)
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

        var areaGenerator = d3.area()
            .defined(function(d) {
                return !Number.isNaN(d[0]) && !Number.isNaN(d[1])
            })
            .x(function(d) {
                return config.lineScaleX(d.data.timestamp)
            })
            .y0(function(d) {
                return config.scaleY(d[0])
            })
            .y1(function(d) {
                return config.scaleY(d[1])
            })

        var data = []
        config.data.stackedAreaData.forEach(function(d, i) {
            var datum = utils.mergeAll({}, d)
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
                var id = d[0].data.id ? d[0].data.id[d.index] : null
                var className = d[0].data.className ? d[0].data.className[d.index] : null
                return ['stacked-area', 'layer' + d.index, id, className].join(' ')
            })
            .attr('d', areaGenerator)
        area.exit().remove()
        stackedArea.exit().remove()

        return {}
    }

    var stripes = function(config) {
        var shapes = config.container.select('.stripe-group')
            .selectAll('rect.stripe')
            .data(config.data.timestamp)
        shapes.enter().append('rect')
            .attr('class', 'stripe')
            .merge(shapes)
            .classed('even', function(d, i) {
                return i % 2
            })
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

    var active = function(config) {
        var selectedTimestamp = config.data.timestamp.filter(function(d) {
            return d.getTime() === new Date(config.activeDate).getTime()
        })

        if(config.activeDate && config.data.timestamp[0]) {
            console.log(JSON.stringify(config.data.timestamp), config.activeDate, new Date(config.activeDate).getTime(), new Date(config.activeDate).toISOString(), config.data.timestamp[0], config.data.timestamp[0].getTime(), config.data.timestamp[0].toISOString())
        }

        var shapes = config.container.select('.active-group')
            .selectAll('rect.active')
            .data(selectedTimestamp)
        shapes.enter().append('rect')
            .attr('class', 'active')
            .merge(shapes)
            .each(function(d) {
                if(config.dataIsEmpty) {
                    return
                }

                var values = getValuesAtTimestamp(d, config.data)
                config.events.call('active', null, {
                    timestamp: d,
                    data: values,
                    config: config,
                    event: d3.event
                })
            })
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

    var multi = utils.pipeline(
        common.defaultConfig,
        dataAdapter,
        // printer,
        template,
        scaleX,
        scaleY,
        eventsPanel,
        // chart.axesFormatAutoconfig,
        common.axisX,
        common.axisY,
        stripes,
        active,
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
            events = d3.dispatch('hover', 'mouseout', 'active'),
            chartCache

        var render = function() {
            chartCache = multi(configCache)
        }

        var setData = function(data) {
            var d = data ? JSON.parse(JSON.stringify(data)) : {}
            configCache = utils.mergeAll({}, configCache, {data: d})
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
