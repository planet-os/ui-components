!(function(dh, d3) {
    var template = function(config) {
        var containerNode = config.parent.querySelector('.datahub-waterfall-chart')
        if(!containerNode) {
            var template = '<div class="datahub-waterfall-chart">' +
                '<div class="chart-container">' +
                    '<svg>' +
                        '<g class="panel">' +
                            '<g class="bars"></g>' +
                            '<g class="connectors"></g>' +
                        '</g>' +
                    '</svg>' +
                '</div>' +
                '<div class="number-container"></div>' +
            '</div>'

            containerNode = dh.utils.appendHtmlToNode(template, config.parent)
        }

        var infoIsEmpty = !(config.elements && config.elements.length)
        var dataIsEmpty = !(!infoIsEmpty && config.elements[0].value)

        var container = d3.select(containerNode)
        var chartContainer = container.select('.chart-container')
        var chartWidth = config.width || chartContainer.node().clientWidth
        var chartHeight = config.height || chartContainer.node().clientHeight || 300
        var isConnected = [1, 3]
        var isNegative = [1]

        return {
            container: container,
            chartWidth: chartWidth,
            chartHeight: chartHeight,
            dataIsEmpty: dataIsEmpty,
            infoIsEmpty: infoIsEmpty,
            elements: config.elements || [],
            isConnected: isConnected,
            isNegative: isNegative
        }
    }

    var scaleX = function(config) {
        var scaleX = d3.scaleBand()
            .domain(d3.range(config.elements.length))
            .rangeRound([0, config.chartWidth])
            .paddingInner(0.4).paddingOuter(0.2)

        return {
            scaleX: scaleX
        }
    }

    var scaleY = function(config) {
        var values = config.elements.map(function(d) {
            return d.value
        })

        var scaleY = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .range([0, config.chartHeight])

        return {
            scaleY: scaleY
        }
    }

    var bars = function(config) {
        var panel = config.container.select('svg')
            .attr('width', config.chartWidth)
            .attr('height', config.chartHeight)
            .select('.panel')

        if(config.dataIsEmpty) {
            panel.select('.bars')
                .selectAll('.bar')
                .remove()
            return {}
        }
        
        var bars = panel.select('.bars')
            .selectAll('.bar')
            .data(config.elements)
        bars.enter().append('rect')
            .merge(bars)
            .attr('class', function(d, i) {
                return ['bar', d.label.toLowerCase(), d.key, 'bar' + i].join(' ')
            })
            .attr('x', function(d, i) {
                return config.scaleX(i)
            })
            .attr('y', function(d, i) {
                var isConnected = config.isConnected.indexOf(i) > -1
                if(isConnected) {
                    var prevIdx = Math.max(0, i-1)
                    var prev = config.elements[prevIdx]
                    if(config.isNegative.indexOf(i) > -1) {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value))
                    }
                    else {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value)) - config.scaleY(Math.abs(d.value))
                    }
                }
                return config.chartHeight - config.scaleY(Math.abs(d.value))
            })
            .attr('width', function(d) {
                if(d.value) {
                    return config.scaleX.bandwidth()
                }
            })
            .attr('height', function(d) {
                return config.scaleY(Math.abs(d.value))
            })
        bars.exit().remove()
        
        return {}
    }

    var connectors = function(config) {
        if(config.dataIsEmpty) {
            config.container.select('.connectors')
                .selectAll('.connector')
                .remove()
            return {}
        }

        var line = config.container.select('.connectors')
            .selectAll('.connector')
            .data(config.elements)
        line.enter().append('line')
            .attr('class', 'connector')
            .merge(line)
            .attr('x1', function(d, i) {
                return config.scaleX(i)
            })
            .attr('y1', function(d, i) {
                var isConnected = config.isConnected.indexOf(i) > -1
                if(isConnected) {
                    var prevIdx = Math.max(0, i-1)
                    var prev = config.elements[prevIdx]
                    if(config.isNegative.indexOf(i) > -1) {
                        return config.scaleY(Math.abs(d.value))
                    }
                    else {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value)) - config.scaleY(Math.abs(d.value))
                    }
                }
                return config.chartHeight - config.scaleY(Math.abs(d.value))
            })
            .attr('x2', function(d, i) {
                return config.scaleX(Math.min(i+1, config.elements.length - 1))
            })
            .attr('y2', function(d, i) {
                var isConnected = config.isConnected.indexOf(i) > -1
                if(isConnected) {
                    var prevIdx = Math.max(0, i-1)
                    var prev = config.elements[prevIdx]
                    if(config.isNegative.indexOf(i) > -1) {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value)) + config.scaleY(Math.abs(d.value))
                    }
                    else {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value)) - config.scaleY(Math.abs(d.value))
                    }
                }
                return config.chartHeight - config.scaleY(Math.abs(d.value))
            })
        line.exit().remove()

        var line = config.container.select('.connectors')
            .selectAll('.base')
            .data([0])
        line.enter().append('line')
            .attr('class', 'base')
            .merge(line)
            .attr('x1', config.scaleX(0))
            .attr('y1', config.chartHeight)
            .attr('x2', (config.scaleX(Math.max(config.elements.length - 1, 0)) + config.scaleX.bandwidth()) || 0)
            .attr('y2', config.chartHeight)
        line.exit().remove()

        return {}
    }

    var number = function(config) {
        var numbers = config.container.select('.number-container')
            .selectAll('.number')
            .data(config.elements)
        var numbersUpdate = numbers.enter().append('div')
            .merge(numbers)
            .attr('class', function(d, i) {
                return 'number number' + i
            })
        numbers.exit().remove() 

        var labels = numbersUpdate.selectAll('.label')
            .data(function(d) {
                return [d]
            })
        labels.enter().append('div')
            .attr('class', 'label')
            .merge(labels)
            .html(function(d) {
                return d.label
            })
        labels.exit().remove()

        var values = numbersUpdate.selectAll('.value')
            .data(function(d) {
                return [d]
            })
        values.enter().append('div')
            .attr('class', 'value')
            .merge(values)
            .html(function(d) {
                return typeof d.value === 'undefined' ? '<div class="error">(Data Unavailable)</div>' : Math.round(d.value)
            })
        values.exit().remove()
        
        return {}
    }

    var multi = dh.utils.pipeline(
        template,
        scaleX,
        scaleY,
        bars,
        connectors,
        number
    )

    var waterfallChart = function(config) {
        var configCache,
            events = d3.dispatch('barHover'),
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
            on: dh.utils.rebind(events),
            setConfig: setConfig,
            setData: setData,
            destroy: destroy
        }
    }

    dh.waterfallChart = waterfallChart
}(datahub, root.d3))