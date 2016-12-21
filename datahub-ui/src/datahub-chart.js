(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils, require('./datahub-widget.js'))
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils, root.datahub.widget)
    }
}(this, function(exports, d3, utils, widget) {

    var axesFormatAutoconfig = function(_config) {
        var timeFormat = d3.utcFormat('%b %e, %Y at %H:%M UTC')

        var fixedFloat = function(d) {
            return (d % 1) ? ~~(d * 100) / 100 : d
        }
        var formatString = []
        var timeExtent = d3.extent(_config.data.timestamps)
        var min = timeExtent[0]
        var max = timeExtent[1]
        if (min.getTime() !== max.getTime() || min.getUTCMonth() !== max.getUTCMonth()) {
            formatString.push('%b %e')
        }
        if (min.getYear() !== max.getYear()) {
            formatString.push('%Y')
        }
        if (min.getYear() === max.getYear() && min.getUTCHours() !== max.getUTCHours()) {
            formatString.push('%H:%M')
        }
        var axisXFormat = d3.utcFormat(formatString.join(' '))

        return {
            axisXFormat: axisXFormat,
            axisTitleXFormat: function(d) {
                return timeFormat(d.data.x)
            },
            tooltipFormat: function(d) {
                return fixedFloat(d.data.y)
            }
        }
    }

    var mergeData = function(config) {
        var dataConverted = config.data.timestamps.map(function(d, i) {
            return {
                x: d,
                y: config.data.values[i]
            }
        })

        return {
            dataConverted: dataConverted
        }
    }

    var mergeData2D = function(config) {
        var flattened = []
        var dataConverted = config.data.values.map(function(d, i) {
            flattened = flattened.concat(d)
            return config.data.timestamps.map(function(dB, iB) {
                return {
                    x: dB,
                    y: d[iB]
                }
            })
        })

        return {
            dataConverted: dataConverted,
            flattenedData: flattened
        }
    }

    var sortData = function(config) {
        config.dataConverted.sort(function(_a, _b) {
            var a = _a.x.getTime()
            var b = _b.x.getTime()
            if (a < b) {
                return -1
            } else if (a > b) {
                return 1
            } else {
                return 0
            }
        })

        return {}
    }

    var detectDataAllNulls = function(config) {
        var allNulls = !config.flattenedData.filter(function(d) {
                return d.y != null
            })
            .length

        return {
            dataIsAllNulls: allNulls
        }
    }

    var scaleX = function(config) {
        var chartWidth = config.width - config.margin.left - config.margin.right
        var dataX = config.data.timestamps
        var scaleX = d3.scaleTime().domain(d3.extent(dataX)).range([0, chartWidth])

        return {
            scaleX: scaleX,
            chartWidth: chartWidth
        }
    }

    var scaleY = function(config) {
        var chartHeight = config.height - config.margin.top - config.margin.bottom
        var extent = d3.extent(config.flattenedData)
        var domain
        if (extent[1] === extent[0]) {
            domain = [extent[0] - 0.1, extent[1] + 1]
        } else {
            var padding = (extent[1] - extent[0]) / 10
            var paddedMin = extent[0] - padding
            domain = [paddedMin, extent[1]]
        }

        if (config.dataIsAllNulls) {
            domain = [null, null]
        }

        var scaleY = d3.scaleLinear().domain(domain).range([chartHeight, 0])

        return {
            scaleY: scaleY,
            chartHeight: chartHeight
        }
    }

    var axisX = function(config) {
        var axisXFormat = config.axisXFormat || function(d) {
            return d.toString()
        }
        var axisX = d3.axisBottom().scale(config.scaleX)
            .tickFormat(config.axisXFormat)

        return {
            axisX: axisX
        }
    }

    var axisY = function(config) {
        var axisYFormat = config.axisYFormat || d3.format('.2s')
        var height = config.scaleY.range()[0]
        var axisY = d3.axisLeft().scale(config.scaleY)
            .ticks(Math.max(~~(height / 30), 2))
            .tickPadding(10)
            .tickFormat(config.axisYFormat)
            .tickSize(-config.chartWidth)

        return {
            axisY: axisY
        }
    }

    var container = function(config) {
        var container = d3.select(config.parent)
            .selectAll('div.container')
            .data([0])
        var containerUpdate = container.enter().append('div')
            .attr('class', 'container')
            .merge(container)
            .attr('width', config.width)
            .attr('height', config.height)
        container.exit().remove()

        return {
            container: containerUpdate
        }
    }

    var svgContainer = function(config) {
        var widgetContainer = container(config).container

        var root = widgetContainer.selectAll('svg')
            .data([0])
        var rootEnter = root.enter().append('svg')
            .attr('class', 'datahub-chart')
        var panel = rootEnter.append('g')
            .attr('class', 'panel')
            .merge(root)
            .attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')')
        rootEnter.merge(root)
            .attr('width', config.width)
            .attr('height', config.height)
        root.exit().remove()

        return {
            root: root,
            container: panel
        }
    }

    var axisComponentX = function(config) {
        var axisX = config.container.selectAll('g.axis.x')
            .data([0])
        axisX.enter().append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + [0, config.chartHeight] + ')')
            .merge(axisX)
            .transition()
            .duration(0)
            .attr('transform', 'translate(' + [0, config.chartHeight] + ')')
            .call(config.axisX)
        axisX.exit().remove()

        return {}
    }

    var axisComponentY = function(config) {
        var padding = config.axisYPadding || 0
        var axisY = config.container.selectAll('g.axis.y')
            .data([0])
        axisY.enter().append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + [-padding / 2, 0] + ')')
            .merge(axisY)
            .transition()
            .call(config.axisY)
        axisY.exit().remove()

        return {}
    }

    var axisTitleComponentX = function(config) {
        var axisTitleXComponent = config.container.selectAll('text.axis-title.x')
            .data([0])
        var axisX = axisTitleXComponent.enter().append('text')
            .attr('class', 'x axis-title')
            .merge(axisTitleXComponent)
            .text(config.axisTitleX || '')
            .attr('x', config.chartWidth)
            .attr('y', config.chartHeight)
            .merge(axisTitleXComponent)
        axisTitleXComponent.exit().remove()

        return {
            axisTitleXComponent: axisX
        }
    }

    var axisTitleComponentY = function(config) {
        var axisTitleY = config.container.selectAll('text.axis-title.y')
            .data([0])
        var axisY = axisTitleY.enter().append('text')
            .attr('class', 'y axis-title')
            .merge(axisTitleY)
            .text(config.axisTitleY || '')
            .attr('x', -40)
            .attr('y', -10)
        axisTitleY.exit().remove()

        return {}
    }

    var chartTitleComponent = function(config) {
        var axisTitleX = config.container.selectAll('text.chart-title')
            .data([0])
        axisTitleX.enter().append('text')
            .attr('class', 'chart-title')
            .merge(axisTitleX)
            .text(config.chartTitle || '')
            .attr('x', function(d) {
                return (config.chartWidth - config.chartTitle.length * 5) / 2
            })
            .attr('y', -5)
        axisTitleX.exit().remove()

        return {}
    }

    var shapePanel = function(config) {
        var shapePanel = config.container.selectAll('g.shapes')
            .data([0])
        var panel = shapePanel.enter().append('g')
            .attr('class', 'shapes')
            .merge(shapePanel)
        shapePanel.exit().remove()

        return {
            shapePanel: panel
        }
    }

    var message = function(config) {
        var panel = shapePanel(config)

        var text = panel.shapePanel.selectAll('text')
            .data(config.dataIsAllNulls ? [0] : [])
        text.enter().append('text')
            .merge(text)
            .attr('x', (config.scaleX.range()[1] - config.scaleX.range()[0]) / 2)
            .attr('y', (config.scaleY.range()[0] - config.scaleY.range()[1]) / 2)
            .text('Values are all null')
            .attr('dx', function(d) {
                return -this.getBBox().width / 2
            })
        text.exit().remove()

        return {}
    }

    var lineShapes = function(config) {
        var panel = shapePanel(config)

        var line = d3.line()
            .defined(function(d) {
                return d.y != null
            })
            .x(function(d) {
                return config.scaleX(d.x)
            })
            .y(function(d) {
                return config.scaleY(d.y)
            })

        var shapes = panel.shapePanel.selectAll('path.line')
            .data(config.dataConverted)
        shapes.enter().append('path')
            .attr('class', function(d, i) {
                var className = 'line shape color-' + i
                if (config.metadata) {
                    className = className + ' ' + config.metadata[i].key
                }
                return className
            })
            .style('fill', 'none')
            .merge(shapes)
            .classed('hidden', function(d, i) {
                return config.metadata && config.metadata[i].isHidden
            })
            .attr('d', line)
        shapes.exit().remove()

        return {}
    }

    var lineCutShapes = function(config) {
        var panel = shapePanel(config)

        var dataCut = config.dataConverted.filter(function(d, i) {
            var prev = config.dataConverted[Math.max(0, i - 1)].y
            var next = config.dataConverted[Math.min(config.dataConverted.length - 1, i + 1)].y
            return d.y !== null && (prev === null || next === null)
        })

        var shapes = panel.shapePanel.selectAll('circle.cut')
            .data(dataCut)
        shapes.enter().append('circle')
            .attr('class', 'cut shape')
            .merge(shapes)
            .attr('cx', function(d) {
                return config.scaleX(d.x)
            })
            .attr('cy', function(d) {
                return config.scaleY(d.y)
            })
            .attr('r', 2)
        shapes.exit().remove()

        return {}
    }

    var axisXFormatterTime = function(config) {
        config.container.select('g.axis.x').selectAll('.tick text')
            .text(function(d) {
                return d3.timeFormat('%a')(d)
            })

        return {}
    }

    var axisXFormatterTimeHour = function(config) {
        config.container.select('g.axis.x').selectAll('.tick text')
            .text(function(d) {
                return d3.timeFormat('%x')(d)
            })

        return {}
    }

    var axisXFormatterRotate30 = function(config) {
        config.container.select('g.axis.x').selectAll('.tick text')
            .style('transform', 'rotate(30deg)')
            .style('text-anchor', 'start')

        return {}
    }

    var axisYFormatSI = function(_config) {
        config.axisY.tickFormat(d3.format('.2s'))

        return {}
    }

    var timeseriesMultilineChart = utils.pipeline(
        mergeData2D,
        axesFormatAutoconfig,
        scaleX,
        scaleY,
        axisX,
        axisY,
        widget.svgContainer,
        axisComponentY,
        lineShapes,
        lineCutShapes,
        message,
        axisComponentX,
        axisTitleComponentX,
        axisXFormatterRotate30,
        axisTitleComponentY
    )

    exports.chart = {
        timeseriesMultilineChart: timeseriesMultilineChart
    }

}))
