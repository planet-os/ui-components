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
        var containerNode = config.parent.querySelector('.datahub-table-chart')
        if(!containerNode) {
            var template = '<div class="datahub-table-chart">' +
                '<div class="table-container">' +
                    '<div class="header"><div class="row"></div></div>' +
                    '<div class="content">' +
                '</div>' +
                '<div class="footer"><div class="row"></div></div>' +
                '</div>' +
                '<div class="chart-container">' +
                    '<div class="header"><div class="row"></div></div>' +
                    '<div class="content">' +
                        '<div class="rows"></div>' +
                        '<div class="chart">' +
                            '<svg>' +
                                '<g class="panel">' +
                                    '<g class="stripes"></g>' +
                                    '<g class="bars"></g>' +
                                    '<g class="axis"></g>' +
                                    '<g class="message-group"></g>' +
                                '</g>' +
                            '</svg>' +
                        '</div>' +
                    '</div>' +
                    '<div class="footer"><div class="row"></div></div>' +
                '</div>' +
            '</div>'

            containerNode = utils.appendHtmlToNode(template, config.parent)
        }

        var dataIsEmpty = !(config.elements && config.elements.length)

        var defaultMargin = {
            top: 0,
            bottom: 24,
            right: 24,
            left: 24
        }
        var margin = config.margin || defaultMargin
        var rowHeight = config.rowHeight || 48

        var container = d3.select(containerNode)
        var chartContainer = container.select('.chart-container')
        var width = chartContainer.node().clientWidth
        var chartWidth = width - margin.left - margin.right

        var height = dataIsEmpty 
            ? rowHeight
            : (config.elements.length * rowHeight) + margin.bottom
        var chartHeight = height - margin.bottom

        return {
            container: container,
            width: width,
            height: height,
            chartWidth: chartWidth,
            chartHeight: chartHeight,
            rowHeight: rowHeight,
            margin: margin,
            dataIsEmpty: dataIsEmpty
        }
    }

    var scaleX = function(config) {
        var domain = config.domain || [0, 0]

        if(!config.domain && config.elements) {
            var values = d3.merge(config.elements).filter(function(d) {
                    return d.key === config.valueKey
                        || d.key === config.referenceKey
                })
                .map(function(d) {
                    return d.value
                })
                domain = d3.extent(values)
        }

        var linearScaleX = d3.scaleLinear().domain(domain).range([0, config.chartWidth])

        return {
            scaleX: linearScaleX
        }
    }

    var axisX = function(config) {
        var axisXComponent = d3.axisBottom().scale(config.scaleX)

        var axis = config.container.select('.axis')
            .attr('transform', 'translate(' + [0, config.chartHeight] + ')')
            .attr('display', config.dataIsEmpty ? 'none' : 'block')
            .call(axisXComponent)

        return {
            axisX: axis
        }
    }

    var header = function(config) {
        var headerColumns = config.container.select('.header .row')
            .selectAll('div.column')
            .data(config.header|| [])
        headerColumns.enter().append('div')
            .merge(headerColumns)
            .attr('class', function(d) {
                return 'column ' + d.key
            })
            .html(function(d) {
                return d.label
            })
        headerColumns.exit().remove()
        
        return {}
    }

    var body = function(config) {
        var tableContentRows = config.container.select('.table-container .content')
            .selectAll('div.row')
            .data(config.elements || [])
        var tableContentRowsUpdate = tableContentRows.enter().append('div')
            .merge(tableContentRows)
            .attr('class', 'row')
        tableContentRows.exit().remove()

        var tableContentColumns = tableContentRowsUpdate.selectAll('div.column')
            .data(function(d) {
                return d
            })
        tableContentColumns.enter().append('div')
            .merge(tableContentColumns)
            .attr('class', 'column')
            .html(function(d) {
                return d.label
            })
        tableContentColumns.exit().remove()
        
        var chartContentRows = config.container.select('.chart-container .rows')
            .selectAll('div.row')
            .data(config.elements || [])
        chartContentRows.enter().append('div')
            .attr('class', 'row')
            .append('div')
            .attr('class', 'column')
        chartContentRows.exit().remove()
        
        return {}
    }

    var bars = function(config) {
        var barGroups = config.container.select('svg')
            .attr('width', config.width)
            .attr('height', config.height)
            .select('.panel')
            .attr('transform', 'translate(' + config.margin.left + ' 0)')
            .select('.bars')
            .selectAll('g.bar-group')
            .data(config.elements || [])
        var barGroupsUpdate = barGroups.enter().append('g')
            .merge(barGroups)
            .attr('class', 'bar-group')
            .attr('transform', function(d, i) {
                return 'translate(0 ' + (i * config.rowHeight) + ')'
            })
        barGroups.exit().remove()

        var referenceBars = barGroupsUpdate.selectAll('rect.reference-bar')
            .data(function(d, i) {
                var referenceElement = d.filter(function(dB) {
                    return dB.key === config.referenceKey
                })
                return [referenceElement && referenceElement[0]]
            })
        referenceBars.enter().append('rect')
            .merge(referenceBars)
            .attr('class', 'reference-bar')
            .attr('width', function(d) {
                return Math.abs(config.scaleX(d.value) - config.scaleX(0))
            })
            .attr('height', function(d) {
                return config.rowHeight / 2
            })
            .attr('x', function(d) {
                return d.value < 0 ? x = config.scaleX(d.value) : config.scaleX(0)
            })
            .attr('y', function(d) {
                return config.rowHeight / 4
            })
        referenceBars.exit().remove()

        var referenceLineWidth = 2
        var referenceLines = barGroupsUpdate.selectAll('rect.reference-line')
            .data(function(d, i) {
                var referenceElement = d.filter(function(dB) {
                    return dB.key === config.referenceKey
                })
                return [referenceElement && referenceElement[0]]
            })
        referenceLines.enter().append('rect')
            .merge(referenceLines)
            .attr('class', 'reference-line')
            .attr('display', function(d) {
                return (d.value || d.value === 0) ? 'block' : 'none'
            })
            .attr('width', referenceLineWidth)
            .attr('height', function(d) {
                return config.rowHeight / 2
            })
            .attr('x', function(d) {
                var offset = referenceLineWidth
                if(d.value > 0) {
                    offset *= -1
                }
                return config.scaleX(d.value) + offset
            })
            .attr('y', function(d) {
                return config.rowHeight / 4
            })
        referenceLines.exit().remove()

        var valueBars = barGroupsUpdate.selectAll('rect.value-bar')
            .data(function(d, i) {
                var valueElement = d.filter(function(dB) {
                    return dB.key === config.valueKey
                })
                return [valueElement && valueElement[0]]
            })
        valueBars.enter().append('rect')
            .merge(valueBars)
            .attr('class', 'value-bar')
            .attr('width', function(d) {
                return Math.abs(config.scaleX(d.value) - config.scaleX(0))
            })
            .attr('height', function(d) {
                return config.rowHeight / 4
            })
            .attr('x', function(d) {
                return d.value < 0 ? x = config.scaleX(d.value) : config.scaleX(0)
            })
            .attr('y', function(d) {
                return config.rowHeight * 3 / 8
            })
        valueBars.exit().remove()
        
        return {}
    }

    var eventsPanel = function(config) {
        var eventPanel = config.container.select('.events')
            .selectAll('rect.event-panel')
            .data([0])
        eventPanel.enter().append('rect')
            .attr('class', 'event-panel')
            .merge(eventPanel)
            .on('mousemove', function(d) {
                config.events.call('hover', null, {})
            })
        eventPanel.exit().remove()
        return {
            eventPanel: eventPanel
        }
    }

    var stripes = function(config) {
        var ticks = config.scaleX.ticks()

        var stripes = config.container.select('.stripes')
            .selectAll('rect.stripe')
            .data(ticks)
        stripes.enter().append('rect')
            .attr('class', 'stripe')
            .merge(stripes)
            .attr('x', function(d, i) {
                var previousTick = ticks[Math.max(i-1, 0)]
                var width = (config.scaleX(d) - config.scaleX(previousTick)) / 2
                return config.scaleX(d) - width
            })
            .attr('y', function(d) {
                return 0
            })
            .attr('width', function(d, i) {
                var previousTick = ticks[Math.max(i-1, 0)]
                var width = (config.scaleX(d) - config.scaleX(previousTick)) / 2
                width = Math.max(width, 0)
                return width
            })
            .attr('height', function(d) {
                return config.chartHeight
            })
        stripes.exit().remove()

        return {}
    }

    var verticalLines = function(config) {
        var ticks = config.scaleX.ticks()

        var lines = config.container.select('.stripes')
            .selectAll('line.grid')
            .data([config.scaleX.domain()[0], 0])
        lines.enter().append('line')
            .attr('class', 'grid')
            .merge(lines)
            .attr('display', config.dataIsEmpty ? 'none' : 'block')
            .attr('x1', function(d) {
                return config.scaleX(d) + 0.5
            })
            .attr('y1', 0)
            .attr('x2', function(d) {
                return config.scaleX(d) + 0.5
            })
            .attr('y2', config.chartHeight)
        lines.exit().remove()

        return {}
    }

    var message = function(config) {
        var message = ''
        if (config.dataIsEmpty) {
            message = '(Data unavailable)'
        } else if (config.dataIsAllNulls) {
            message = 'Values are all null'
        }

        var text = config.container.select('.message-group')
            .selectAll('text')
            .data([message])
        text.enter().append('text')
            .merge(text)
            .text(function(d) {
                return d
            })
            .attr('x', (config.scaleX.range()[1] - config.scaleX.range()[0]) / 2)
            .attr('y', function() {
                return config.chartHeight / 2 + this.getBBox().height / 2
            })
            .attr('dx', function(d) {
                return -this.getBBox().width / 2
            })
        text.exit().remove()

        return {}
    }

    var multi = utils.pipeline(
        template,
        header,
        body,
        scaleX,
        stripes,
        verticalLines,
        axisX,
        bars,
        common.message
    )

    var tableChart = function(config) {
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

    exports.tableChart = tableChart

}))
