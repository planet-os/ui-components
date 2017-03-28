!(function(dh, d3) {
    var template = function(config) {
        var containerNode = config.parent.querySelector('.datahub-timeseries-chart')
        if(!containerNode) {
            var template = '<div class="datahub-timeseries-chart">'
                + '<div class="number"></div>'
                + '<div class="chart">'
                    + '<svg>'
                        + '<g class="panel">'
                            + '<g class="shapes"></g>'
                            + '<g class="grid x"></g>'
                            + '<g class="axis x"></g>'
                            + '<g class="axis y"></g>'
                            + '<g class="axis-title x"><text></text></g>'
                            + '<g class="axis-title y"><text></text></g>'
                            + '<g class="reference"></g>'
                        + '</g>'
                        + '<g class="tooltip"><line></line></g>'
                        + '<g class="events"><rect class="event-panel"></rect></g>'
                    + '</svg>'
                + '</div>'
            + '</div>'

            containerNode = dh.utils.appendHtmlToNode(template, config.parent)
        }

        var dataIsEmpty = !(config.data)

        var container = d3.select(containerNode)
        var width = config.width || config.parent.clientWidth
        var height = config.height || config.parent.clientHeight

        var chartWidth = width - config.margin.left - config.margin.right
        var chartHeight = height - config.margin.top - config.margin.bottom

        container.select('svg')
            .attr('width', width)
            .attr('height', height)

        container.select('.panel')
            .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')')

        container.select('.events rect')
            .attr('width', width)
            .attr('height', height)
            .attr('opacity', 0)

        return {
            container: container,
            width: width,
            height: height,
            chartWidth: chartWidth,
            chartHeight: chartHeight
        }
    }

    var defaultConfig = function(config) {
        var defaultMargin = {
            top: 0,
            right: 0,
            bottom: 10,
            left: 10
        }

        return {
            margin: config.margin || defaultMargin,
            hide: config.hide || [],
            chartType: config.chartType || 'line'
        }
    }

    var data = function(config){
        var dataConverted = config.data || []

        var values = []
        var timestamps = []
        dataConverted.forEach(function(d) {
            d.data.forEach(function(dB, iB, arr) {
                arr[iB].timestamp = new Date(dB.timestamp)
                values.push(dB.value)
                timestamps.push(arr[iB].timestamp)
            })
        })

        return {
            dataConverted: dataConverted,
            dataValues: values,
            dataTimestamps: timestamps,
            dataIsEmpty: !dataConverted.length
        }
    }

    var scaleX = function(config){
        if(config.dataIsEmpty) {
            return {}
        }

        var scaleX = d3.scaleTime()
            .domain(d3.extent(config.dataTimestamps))
            .range([0, config.chartWidth])

        return {
            scaleX: scaleX
        }
    }

    var scaleY = function(config){
        if(config.dataIsEmpty) {
            return {}
        }

        var min, max
        if(config.domain) {
            min = config.domain[0]
            max = config.domain[1]
        }
        else {
            min = d3.min(config.dataValues)
            max = d3.max(config.dataValues)
            if(typeof config.reference === 'number'){
                max = Math.max(config.reference, max)
                min = Math.min(config.reference, min)
            }

            if(min === max) {
                min -= min / 20
                max += max / 10
            }
        }

        var scaleY = d3.scaleLinear()
            .domain([min, max])
            .range([config.chartHeight, 0])

        return {
            scaleY: scaleY
        }
    }

    var axisX = function(config){
        if(config.dataIsEmpty) {
            return {}
        }

        var resolution = config.axisXTimeResolution || 'minute'
        var intervalFuncName = 'utc' + dh.utils.capitalize(resolution)

        var timeResolution = d3[intervalFuncName]
        var axisFunc = config.xAxisOnTop ? 'axisTop' : 'axisBottom'
        var axisX = d3[axisFunc]()
            .scale(config.scaleX)
            .ticks(config.xTicks || null)
            .tickFormat(d3.utcFormat(config.axisXFormat || '%H:%M'))

        return {
            axisX: axisX
        }
    }

    var axisY = function(config){
        if(config.dataIsEmpty) {
            return {}
        }

        var axisY = d3.axisLeft()
            .scale(config.scaleY)
            .ticks(config.yTicks || 6, 's')
            .tickPadding(10)

        return {
            axisY: axisY
        }
    }

    var axisComponentX = function(config){
        if(config.dataIsEmpty || config.hide.indexOf('xAxis') > -1) {
            return {}
        }

        var axisX = config.container.select('.axis.x')
            .attr('transform', 'translate(' + [0, config.chartHeight] + ')')
            .call(config.axisX)

        return {}
    }

    var axisComponentY = function(config){
        if(config.dataIsEmpty || config.hide.indexOf('yAxis') > -1 || config.axisOnly) {
            return {}
        }

        var axisY = config.container.select('.axis.y')
            .call(config.axisY)

        return {}
    }

    var gridX = function(config){
        if(config.dataIsEmpty || config.hide.indexOf('xGrid') > -1 || config.axisOnly) {
            return {}
        }

        var axisX = config.container.select('.grid.x')
            .attr('transform', 'translate(' + [0, config.chartHeight] + ')')
            .call(config.axisX.tickSize(-config.chartHeight).tickFormat(''))

        return {}
    }

    var lineShapes = function(config) {
        if (config.dataIsEmpty || config.axisOnly 
            || (config.chartType !== 'line' && config.chartType !== 'area')) {
            config.container.select('.line-group')
                .selectAll('path.line')
                .remove()
            return {}
        }

        var chartType = config.chartType || 'line'

        var lineGenerator
        if(chartType === 'area') {
            lineGenerator = d3.area()
                .defined(function(d) {
                    return d.value != null
                })
                .x(function(d) {
                    return config.scaleX(d.timestamp)
                })
                .y0(function(d) {
                    return config.scaleY(0)
                })
                .y1(function(d) {
                    return config.scaleY(d.value)
                })
        }
        else {
            lineGenerator = d3.line()
                .defined(function(d) {
                    return d.value != null
                })
                .x(function(d) {
                    return config.scaleX(d.timestamp)
                })
                .y(function(d) {
                    return config.scaleY(d.value)
                })
        }

        var shapeGroups = config.container.select('.shapes')
            .selectAll('.shape-group')
            .data(config.dataConverted)
        var shapes = shapeGroups.enter().append('g')
            .attr('class', 'shape-group')
            .merge(shapeGroups)
            .selectAll('path.shape')
            .data(function(d, i) {
                d.layer = i
                return [d]
            })
        shapes.enter().append('path')
            .merge(shapes)
            .attr('class', function(d, i, a, b) {
                return ['shape', d.metadata.id, 'layer' + d.layer, chartType].join(' ')
            })
            .attr('d', function(d) {
                return lineGenerator(d.data)
            })
        shapes.exit().remove()
        shapeGroups.exit().remove()

        return {}
    }

    var stepShapes = function(config) {
        if (config.dataIsEmpty || config.axisOnly 
            || (config.chartType !== 'step')) {
            config.container.select('.step-group')
                .selectAll('path.shape')
                .remove()
            return {}
        }

        var id = config.dataConverted[0].metadata.id
        var range = config.stepRange || 3

        var line = []
        var lineData = config.dataConverted[0].data
        lineData.forEach(function(d, i) {
            var prevIdx = Math.max(i - 1, 0)
            line.push([config.scaleX(d.timestamp), config.scaleY(lineData[prevIdx].value)])
            line.push([config.scaleX(d.timestamp), config.scaleY(d.value)])
            
        })
        var areaHigh = []
        var areaLow = []
        var areaData = config.dataConverted[0].data
        areaData.forEach(function(d, i) {
            var prevIdx = Math.max(i - 1, 0)
            areaHigh.push([config.scaleX(d.timestamp), config.scaleY(lineData[prevIdx].value + range)])
            areaHigh.push([config.scaleX(d.timestamp), config.scaleY(d.value + range)])

            areaLow.push([config.scaleX(d.timestamp), config.scaleY(lineData[prevIdx].value - range)])
            areaLow.push([config.scaleX(d.timestamp), config.scaleY(d.value - range)])
        })
        var area = areaHigh.concat(areaLow.reverse())

        var lineGenerator = d3.line()
            .defined(function(d) {
                return d.value != null
            })
            .x(function(d) {
                return config.scaleX(d.timestamp)
            })
            .y(function(d) {
                return config.scaleY(d.value)
            })

        var shapeGroups = config.container.select('.shapes')
            .selectAll('.step-group')
            .data([line, area])
        var shapes = shapeGroups.enter().append('g')
            .attr('class', 'step-group')
            .merge(shapeGroups)
            .selectAll('path.shape')
            .data(function(d, i) { 
                d.layer = i
                return [d]
            })
        shapes.enter().append('path')
            .merge(shapes)
            .attr('class', function(d, i, a, b) {
                return ['shape', id, 'layer' + d.layer, config.chartType].join(' ')
            })
            .attr('d', function(d, i) {
                // return 'M' + d.join() + (d.layer === 1 ? 'Z' : '')
                return 'M' + d.join()
            })
        shapes.exit().remove()
        shapeGroups.exit().remove()

        return {}
    }

    var arrowShapes = function(config) {
        if (config.dataIsEmpty || config.axisOnly || config.chartType !== 'arrow') {
            config.container.select('.shapes')
                .selectAll('path.arrow')
                .remove()
            return {}
        }

        var arrowPath = 'M6 0L12 10L8 10L8 24L4 24L4 10L0 10Z';
        var arrows = config.container.select('.shapes')
            .selectAll('path.arrow')
            .data(config.dataConverted[0].data.filter(function(d, i) {
                var skip = config.arrowSkip || 3
                return i % skip === 0;
            }))

        arrows.enter().append('path')
            .attr('class', function(d) {
                return 'arrow';
            })
            .merge(arrows)
            .attr('d', arrowPath)
            .attr('transform', function(d) {
                // console.log(d.value)
                return 'translate(' + config.scaleX(d.timestamp) + ', 0) scale(0.5) rotate(' + d.value + ', 6, 12)';
            });

        arrows.exit().remove();

        return {}
    }

    var reference = function(config){
        if(config.dataIsEmpty 
            || typeof config.reference !== 'number') {
            config.container.selectAll('path.reference')
                .remove()
            return {}
        }

        var scaledY = config.scaleY(config.reference)
        var path = 'M' + [
            [0, scaledY], 
            [config.chartWidth, scaledY]
        ].join('L')

        var shapes = config.container.select('.reference')
            .selectAll('path')
            .data([0])
        shapes.enter().append('path')
            .attr('class', 'reference')
            .style('fill', 'none')
            .merge(shapes)
            .attr('d', path)
        shapes.exit().remove()

        return {}
    }

    function getHoverInfo(config, timestamp) {
        var dataUnderCursor = []
        config.dataConverted.forEach(function(d, i) {
            var bisector = d3.bisector(function(dB, x) {
                    return dB.timestamp.getTime() - x.getTime()
                })
                .left
            var found = bisector(d.data, timestamp)

            var d1 = d.data[Math.min(found, d.data.length - 1)]
            var d0 = d.data[Math.max(found - 1, 0)]
            var datum = (timestamp - d0.timestamp > d1.timestamp - timestamp) ? d1 : d0
            
            var posX = Math.round(config.scaleX(datum.timestamp))
            var posY = Math.round(config.scaleY(datum.value))
            var eventData = {event: d3.event, posX: posX, posY: posY}
            datum = dh.utils.mergeAll({}, datum, d.metadata, eventData)
            dataUnderCursor.push(datum)
        })

        return dataUnderCursor
    }

    var eventsPanel = function(config) {
        var eventPanel = config.container.select('.events .event-panel')
            .on('mousemove touchstart', function(d) {
                if(config.dataIsEmpty) {
                    return
                }
                var mouseX = d3.mouse(this)[0] - config.margin.left
                var mouseTimestamp = config.scaleX.invert(mouseX)
                var dataUnderCursor = getHoverInfo(config, mouseTimestamp)

                config.events.call('hover', null, dataUnderCursor)
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

    function setTooltip(config, d) {
        var x = d[0].posX + config.margin.left
        config.container.select('.tooltip line')
            .attr('y1', 0)
            .attr('y2', config.height)
            .attr('x1', x)
            .attr('x2', x)
            .attr('display', 'block')

        if(config.hide.indexOf('tooltipDot') > -1) {
            config.container.select('.tooltip')
                .selectAll('circle.dot')
                .remove()
            return
        }
        var circles = config.container.select('.tooltip')
            .selectAll('circle.dot')
            .data(d)
        circles.enter().append('circle')
            .merge(circles)
            .attr('display', 'block')
            .attr('class', function(dB, dI) {
                return ['dot', dB.id, 'layer' + dI].join(' ')
            })
            .attr('cx', function(dB) {
                return dB.posX + config.margin.left
            })
            .attr('cy', function(dB) {
                return dB.posY + config.margin.top
            })
            .attr('r', 2)
        circles.exit().remove()
    }

    function hideTooltip(config) {
        config.container.select('.tooltip line')
            .attr('display', 'none')
        config.container.select('.tooltip circle')
            .attr('display', 'none')
    }

    var tooltipComponent = function(config){
        if(typeof config.tooltipTimestamp !== 'undefined') {
            if(config.tooltipTimestamp === null) {
                hideTooltip(config)
                config.events.call('tooltipChange', null, {})
            }
            else {
                var dataUnderCursor = getHoverInfo(config, config.tooltipTimestamp)
                setTooltip(config, dataUnderCursor)
                config.events.call('tooltipChange', null, {timestamp: dataUnderCursor[0].timestamp})
            }
        }
        if (config.dataIsEmpty || config.axisOnly || config.hide.indexOf('tooltip') > -1) {
            return {}
        }
        
        config.events.on('hover.tooltip', function(d) {
            setTooltip(config, d)
        })
    }

    var xAxisTitle = function(config){
        if (config.dataIsEmpty || config.axisOnly || config.hide.indexOf('xTitle') > -1) {
            return {}
        }
        var xTitleFormat = config.xTitleFormat || d3.utcFormat('%c')
        var titleContainer = config.container.select('.axis-title.x')
        var title = titleContainer.select('text')

        config.events.on('hover.title', function(d) {
            var timestamp = d[0].timestamp

            titleContainer.attr('transform', 'translate(' + [
                config.chartWidth,
                config.chartHeight
            ] + ')')

            title.text(xTitleFormat(timestamp))
                .attr('dy', -8)
                .attr('text-anchor', 'end')
        })

        return {}
    }

    var yAxisTitle = function(config){
        if (config.axisOnly || config.hide.indexOf('yTitle') > -1) {
            return {}
        }
        config.container.select('.axis-title.y text')
            .text(config.yAxisTitle || '')
            .attr('dx', '0.5em')
            .attr('dy', '1em')

        return {}
    }

    // var singleAxisComponentX = function(config){
    //     // var config = {
    //     //     axisX: null,
    //     //     panel: null
    //     // }

    //     var axisX = config.panel.selectAll('g.axis.x.single')
    //         .data([0])
    //     axisX.enter().append('g')
    //         .attr({
    //             'class': 'x axis single'
    //         })
    //     axisX.call(config.axisX)
    //     axisX.exit().remove()

    //     return {}
    // }

    // var barShapes = function(config){
    //     // var config = {
    //     //     panel: null,
    //     //     dataConverted: null,
    //     //     scaleX: null,
    //     //     scaleY: null,
    //     //     chartHeight: null
    //     // }

    //     var dataY = config.dataConverted.map(function(d){ return d.y })

    //     var scaleXRange = config.scaleX.range()
    //     var width = scaleXRange[1] - scaleXRange[0]
    //     var barWidth = width / (config.dataConverted.length - 1) / 2

    //     var shapes = config.panel.selectAll('rect.bar')
    //         .data(config.dataConverted)
    //     shapes.enter().append('rect')
    //         .attr({
    //             'class': function(d){ return 'bar shape ' + d.className }
    //         })
    //     shapes.attr({
    //         x: function(d){ return config.scaleX(d.x) - barWidth / 2 },
    //         y: function(d){ return config.scaleY(d.y) },
    //         width: function(d){ return barWidth },
    //         height: function(d){ return config.chartHeight - config.scaleY(d.y) }
    //     })
    //     shapes.exit().remove()

    //     return {}
    // }

    // var axisXFormatter = function(config){
    //     // var config = {
    //     //     panel: null,
    //     //     dataConverted: null
    //     // }

    //     config.panel.select('g.axis.x.single')
    //         .selectAll('.tick:first-child text')
    //         .text(function(d){
    //             return d3.time.format('%a')(d)
    //         })

    //     return {}
    // }

    var lineChart = dh.utils.pipeline(
        defaultConfig,
        template,
        data,
        scaleX,
        scaleY,
        axisX,
        axisY,
        axisComponentX,
        gridX,
        lineShapes,
        arrowShapes,
        stepShapes,
        // dh.common.printer,
        // areaShapes,
        axisComponentY,
        reference,
        eventsPanel,
        tooltipComponent,
        xAxisTitle,
        yAxisTitle
    )

    var timeseries = function(config) {
        var configCache,
            events = d3.dispatch('hover', 'click', 'mouseout', 'tooltipChange'),
            chartCache,
            uid = ~~(Math.random()*10000)

        var onResize = dh.utils.throttle(function() {
            configCache.width = configCache.parent.clientWidth
            render()
        }, 200)

        d3.select(window).on('resize.' + uid, onResize)

        var render = function() {
            chartCache = lineChart(configCache)
        }

        var setData = function(data) {
            var d = data ? JSON.parse(JSON.stringify(data)) : {}
            configCache = dh.utils.mergeAll({}, configCache, {data: d})
            render()
            return this
        }

        var setConfig = function(config) {
            configCache = dh.utils.mergeAll({}, configCache, config)
            render()
            return this
        }

        var init = function(config, events) {
            setConfig(dh.utils.mergeAll({}, config, {events: events}))
        }

        var destroy = function() {
            d3.select(window).on('resize.' + uid, null)
            configCache.parent.innerHTML = null
        }

        init(config, events)

        return {
            on: dh.utils.rebind(events),
            setConfig: setConfig,
            setData: setData,
            destroy: destroy
        }
    }

    dh.timeseries = timeseries

}(datahub, root.d3))