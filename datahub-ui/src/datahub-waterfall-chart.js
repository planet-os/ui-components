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

            containerNode = utils.appendHtmlToNode(template, config.parent)
        }

        var dataIsEmpty = !(config.elements && config.elements.length)

        var container = d3.select(containerNode)
        var chartContainer = container.select('.chart-container')
        var chartWidth = chartContainer.node().clientWidth
        var chartHeight = chartContainer.node().clientHeight || 300
        var isConnected = ['closed', 'new']

        return {
            container: container,
            chartWidth: chartWidth,
            chartHeight: chartHeight,
            dataIsEmpty: dataIsEmpty,
            elements: config.elements || [],
            isConnected: isConnected
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
                var isConnected = config.isConnected.indexOf(d.key) > -1
                if(isConnected) {
                    var prevIdx = Math.max(0, i-1)
                    var prev = config.elements[prevIdx]
                    if(d.value < 0) {
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
                var isConnected = config.isConnected.indexOf(d.key) > -1
                if(isConnected) {
                    var prevIdx = Math.max(0, i-1)
                    var prev = config.elements[prevIdx]
                    if(d.value < 0) {
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
                var isConnected = config.isConnected.indexOf(d.key) > -1
                if(isConnected) {
                    var prevIdx = Math.max(0, i-1)
                    var prev = config.elements[prevIdx]
                    if(d.value < 0) {
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
                return Math.round(d.value)
            })
        values.exit().remove()
        
        return {}
    }

    var multi = utils.pipeline(
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

    exports.waterfallChart = waterfallChart

}))