!(function(dh, d3) {
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
                        + '<g class="dot-group"></g>'
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
                        + '<g class="events"><rect class="event-panel"></rect></g>'
                    + '</g>'
                + '</svg>'
            + '</div>'

            containerNode = dh.utils.appendHtmlToNode(template, config.parent)
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

    var scaleX = function(config) {
        var dataX = config.dataIsEmpty ? 0 : config.data.timestamp
        var scaleX = d3.scaleBand().domain(dataX).range([0, config.chartWidth])
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

    var scaleY = function(config) {
        var maxs = []
        maxs.push(dh.utils.getExtent(config.data.barData))
        maxs.push(dh.utils.getExtent(config.data.referenceData))
        maxs.push(dh.utils.getExtent(config.data.estimateData))
        maxs.push(dh.utils.getExtent(config.data.thresholdData))
        maxs.push(dh.utils.getExtent(config.data.areaData))
        maxs.push(dh.utils.getStackExtent(config.data.stackedBarData))
        maxs.push(dh.utils.getStackExtent(config.data.stackedAreaData))
        maxs.push(dh.utils.getMultiExtent(config.data.lineData))

        var mins = []
        var isMin = true
        mins.push(dh.utils.getExtent(config.data.barData, isMin))
        mins.push(dh.utils.getExtent(config.data.referenceData, isMin))
        mins.push(dh.utils.getExtent(config.data.estimateData, isMin))
        mins.push(dh.utils.getExtent(config.data.thresholdData, isMin))
        mins.push(dh.utils.getExtent(config.data.areaData, isMin))
        mins.push(dh.utils.getStackExtent(config.data.stackedBarData, isMin))
        mins.push(dh.utils.getStackExtent(config.data.stackedAreaData, isMin))
        mins.push(dh.utils.getMultiExtent(config.data.lineData, isMin))

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
            max = Math.max(max, 0)
        }

        var domain = [min, max]
        if(config.domain) {
            domain = config.domain
        }
        else {
            domain
        }
        if(config.reverseY) {
            domain = [domain[1], domain[0]]
        }

        var scaleY = d3.scaleLinear().domain(domain).range([config.chartHeight, 0])

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
            var datum = dh.utils.mergeAll({}, data[key][index])
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
            var datum = dh.utils.mergeAll({}, data[key][0])
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
        var eventPanel = config.container.select('.events .event-panel')
            .on('mousemove touchstart', function(d) {
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
                config.events.call('mouseout', null, {})
            })
            .on('click', function(d) {
                config.events.call('click', null, {event: d3.event})
            })

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
                if(d.value >= 0 || config.reverseY){
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
                if(d.value >= 0 || config.reverseY){
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
                if(d.value >= 0 || config.reverseY){
                    y = config.scaleY(0) - Math.abs(config.scaleY(d.value) - config.scaleY(0))
                }
                else {
                    y = config.scaleY(0) + Math.abs(config.scaleY(d.value) - config.scaleY(0))
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
            config.container.select('.stacked-bar-group')
                .selectAll('g.stack')
                .remove()
            return {}
        }

        var keys = config.data.stackedBarData[0].value.map(function(d, i) {
            return 'y' + i
        })

        var data = []
        config.data.stackedBarData.forEach(function(d, i) {
            var datum = dh.utils.mergeAll({}, d)
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
            config.container.select('.line-group')
                .selectAll('path.line')
                .remove()
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

    var dotShapes = function(config) {
        if (!config.data.lineData.length) {
            config.container.select('.dot-group')
                .selectAll('.dot-layer')
                .remove()
            return {}
        }

        var data = config.data.lineData
        var dataCut = []
        var valueLength = data[0].value.length
        for (var i = 0; i < valueLength; i++) {
            var layer = []
            data.forEach(function(dB, iB) {
                var prevIdx = Math.max(0, iB - 1)
                var nextIdx = Math.min(data.length - 1, iB + 1)
                var currentIdx = iB
                var prev = data[prevIdx].value[i]
                var next = data[nextIdx].value[i]
                var current = dB.value[i]

                if((current !== null && (prev === null || next === null))
                    || (currentIdx === prevIdx && currentIdx === nextIdx)) {
                    layer.push({
                        value: current,
                        timestamp: dB.timestamp,
                        layer: i
                    })
                }
            })
            dataCut.push(layer)
        }

        var dotLayers = config.container.select('.dot-group')
            .selectAll('.dot-layer')
            .data(dataCut)
        var dotLayersUpdate = dotLayers.enter().append('g')
            .merge(dotLayers)
            .attr('class', 'dot-layer')
        dotLayers.exit().remove()

        var shapes = dotLayersUpdate.selectAll('.dot')
            .data(function(d, i) {
                return d
            })
        shapes.enter().append('circle')
            .merge(shapes)
            .attr('class', function(d, i, a) {
                // return ['dot', 'layer' + i, d[0].id, d[0].className].join(' ')
                return ['dot', 'layer' + d.layer].join(' ')
            })
            .attr('cx', function(d) {
                return config.lineScaleX(d.timestamp);
            })
            .attr('cy', function(d) {
                return config.scaleY(d.value)
            })
            .attr('r', 2)
        shapes.exit().remove()

        return {}
    }

    var thresholdLineShape = function(config) {
        var line = config.container.select('.threshold-line-group')
            .selectAll('line.threshold-line')
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
            config.container.select('.area-group')
                .selectAll('path.area')
                .remove()
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
            config.container.select('.stacked-area-group')
                .selectAll('g.stack-area')
                .remove()
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
            var datum = dh.utils.mergeAll({}, d)
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
        if(config.showStripes === false) {
            config.container.select('.stripe-group')
                .selectAll('rect.stripe').remove()
            return {}
        }
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
        // if config.activeDate is the date Object use it straight, if it's text convert to date object
        var activeTs = !config.activeDate || (config.activeDate.getTime === undefined)
                ? new Date(config.activeDate).getTime()
                : config.activeDate.getTime()

        var selectedTimestamp = config.data.timestamp.filter(function(d) {
            return d.getTime() === activeTs
        })

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

    var multi = dh.utils.pipeline(
        dh.common.defaultConfig,
        dataAdapter,
        // dh.common.printer,
        template,
        scaleX,
        scaleY,
        eventsPanel,
        // chart.axesFormatAutoconfig,
        dh.common.axisX,
        dh.common.axisY,
        stripes,
        active,
        areaShapes,
        referenceBarShapes,
        stackedBarShapes,
        stackedAreaShapes,
        barShapes,
        estimateBarShapes,
        lineShapes,
        dotShapes,
        thresholdLineShape,
        dh.common.axisComponentY,
        dh.common.labelsRewriterY,
        dh.common.message,
        dh.common.axisComponentX,
        dh.common.axisTitleComponentX,
        // dh.common.axisXFormatterRotate30,
        dh.common.axisTitleComponentY,
        dh.common.chartTitleComponent
    )

    /**
     * A configurable line/bar/area chart.
     * @namespace multiChart
     * @name multiChart
     * @param {object} config The initial configuration can be passed on init or later using multiChart.setConfig.
     * @param {object} config.parent The parent DOM element.
     * @param {object} [config.data] Data can be passed on init or later using multichart.setData.
     * @param {number} [config.width=parent.innerWidth] External width of the chart.
     * @param {number} [config.height=parent.innerHeight] External height of the chart.
     * @param {object} [config.margin={top:50, right:50, bottom:100, left:50}] Margins around the chart panel.
     * @param {string} [config.axisXFormat='%b'] Label x labels format, as passed to d3.utcFormat.
     * @param {string} [config.axisTitleX] X axis title.
     * @param {string} [config.axisTitleY] Y axis title.
     * @param {string} [config.chartTitle] Chart title.
     * @param {boolean} [config.reverseY] Reverse the Y axis so higher values are on the bottom.
     * @param {boolean} [config.autoScaleY] Auto range the scale from y data instead of clamping min to zero or negative.
     * @param {Array.<number>} [config.domain] [min, max] domain of the y scale, defaults to data extent.
     * @param {function} [config.labelsRewriterY] Y axis label rewriting function. Receives (label, index) and has to return a string or a DOM string.
     * @returns {object} A multichart instance.
     * @example
     * datahub.multiChart({
     *     parent: document.querySelector('.chart'),
     *     data: {
     *         timestamp: datahub.data.generateTimestamps(),
     *         barData: datahub.data.generateTimeSeries()
     *     }
     * })
     */

    var multiChart = function(config) {
        var configCache,
            events = d3.dispatch('hover', 'click', 'mouseout', 'active'),
            chartCache,
            uid = ~~(Math.random()*10000)

        var onResize = dh.utils.throttle(function() {
            configCache.width = configCache.parent.clientWidth
            render()
        }, 200)

        d3.select(window).on('resize.' + uid, onResize)

        var render = function() {
            chartCache = multi(configCache)
        }

        /**
         * Set the data.
         * @name setData
         * @param {object} data A data object.
         * @returns {object} The multiChart instance.
         * @memberof multiChart
         * @instance
         * @example
         * datahub.multiChart({
         *     parent: document.querySelector('.chart'),
         * })
         * .setData({
         *     timestamp: datahub.data.generateTimestamps(),
         *     barData: datahub.data.generateTimeSeries()
         * })
         */
        var setData = function(data) {
            var d = data ? JSON.parse(JSON.stringify(data)) : {}
            configCache = dh.utils.mergeAll({}, configCache)
            configCache.data = d
            render()
            return this
        }

        /**
         * Set the config after its instantiation.
         * @name setConfig
         * @param {object} config The same config format as on init.
         * @returns {object} The multiChart instance.
         * @memberof multiChart
         * @instance
         * @example
         * datahub.multiChart({
         *     parent: document.querySelector('.chart'),
         * })
         * .setConfig({
         *     width: 100
         * })
         */
        var setConfig = function(config) {
            configCache = dh.utils.mergeAll(configCache, config)
            render()
            return this
        }

        var init = function(config, events) {
            setConfig(dh.utils.mergeAll(config, {events: events}))
        }

        /**
         * Destroys DOM elements and unbind events.
         * @name destroy
         * @memberof multiChart
         * @instance
         * @example
         * var chart = datahub.multiChart({
         *     parent: document.querySelector('.chart'),
         * })
         * chart.destroy()
         */
        var destroy = function() {
            d3.select(window).on('resize.' + uid, null)
            configCache.parent.innerHTML = null
        }

        init(config, events)

        /**
         * Events binder.
         * @function on
         * @param {string} eventName The name of the event: 'hover', 'click', 'mouseout', 'active'
         * @param {function} callback The callback for this event
         * @memberof multiChart
         * @instance
         * @example
         * datahub.multiChart({
         *     parent: document.querySelector('.chart'),
         * })
         * .on('hover', function(e) {
         *     console.log(e.index, e.timestamp, e.data, e.config, e.event)
         * })
         */
        return {
            on: dh.utils.rebind(events),
            setConfig: setConfig,
            setData: setData,
            destroy: destroy
        }
    }

    dh.multiChart = multiChart

}(datahub, root.d3))