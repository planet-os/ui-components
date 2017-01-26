(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils)
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils)
    }
}(this, function(exports, d3, utils) {

    var axesFormatAutoconfig = function(config) {
        var timeFormat = d3.utcFormat('%b %e, %Y at %H:%M UTC')
        var axisXFormat = ''
        if (!config.dataIsEmpty) {
            var fixedFloat = function(d) {
                return (d % 1) ? ~~(d * 100) / 100 : d
            }
            var formatString = []
            var timeExtent = d3.extent(config.timestamps)
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
            axisXFormat = d3.utcFormat(formatString.join(' '))
        }

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

    var defaultConfig = function(config) {
        var defaultMargin = {
            top: 50,
            right: 50,
            bottom: 100,
            left: 50
        }

        return {
            margin: config.margin || defaultMargin,
            width: config.width || 600,
            height: config.height || 300
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

    var axisX = function(config) {
        var format = config.axisXFormat || '%b'
        var axisXFormat = d3.utcFormat(format) || function(d) {
            return d.toString()
        }
        var axisX = d3.axisBottom().scale(config.scaleX)
            .tickFormat(axisXFormat)

        return {
            axisX: axisX
        }
    }

    var axisY = function(config) {
        var format = config.axisYFormat || '.2s'
        var axisYFormat = d3.format(format)
        var height = config.scaleY.range()[0]
        var axisY = d3.axisLeft().scale(config.scaleY)
            .ticks(Math.max(~~(height / 30), 2))
            .tickPadding(10)
            .tickFormat(axisYFormat)
            .tickSize(-config.chartWidth)

        return {
            axisY: axisY
        }
    }

    var axisComponentX = function(config) {
        var axisX = config.container.selectAll('g.axis.x')
            .data([0])
        axisX.enter().append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + [0, config.chartHeight] + ')')
            .merge(axisX)
            .attr('display', function(d) {
                return config.dataIsEmpty ? 'none' : null
            })
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
        axisTitleXComponent.enter().append('text')
            .attr('class', 'x axis-title')
            .merge(axisTitleXComponent)
            .text(config.axisTitleX || '')
            .attr('x', config.chartWidth)
            .attr('y', config.chartHeight)
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
            .data([config.chartTitle || ''])
        axisTitleX.enter().append('text')
            .attr('class', 'chart-title')
            .merge(axisTitleX)
            .html(function(d) {
                return d
            })
            .attr('x', function(d) {
                return (config.chartWidth - d.length * 5) / 2
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

    var container = function(config) {
        var container = d3.select(config.parent)
            .selectAll('div.widget-container')
            .data([0])
        var containerUpdate = container.enter().append('div')
            .attr('class', 'widget-container')
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

    var message = function(config) {
        var message = ''
        if (config.dataIsEmpty) {
            message = 'No data available'
        } else if (config.dataIsAllNulls) {
            message = 'Values are all null'
        }

        var text = config.container.select('.message-group')
            .selectAll('text')
            .data([message])
        text.enter().append('text')
            .merge(text)
            .attr('x', (config.scaleX.range()[1] - config.scaleX.range()[0]) / 2)
            .attr('y', (config.scaleY.range()[0] - config.scaleY.range()[1]) / 2)
            .text(function(d) {
                return d
            })
            .attr('dx', function(d) {
                return -this.getBBox().width / 2
            })
        text.exit().remove()

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

    exports.common = {
        axesFormatAutoconfig: axesFormatAutoconfig,
        defaultConfig: defaultConfig,
        sortData: sortData,
        detectDataAllNulls: detectDataAllNulls,
        axisX: axisX,
        axisY: axisY,
        axisComponentX: axisComponentX,
        axisComponentY: axisComponentY,
        axisTitleComponentX: axisTitleComponentX,
        axisTitleComponentY: axisTitleComponentY,
        chartTitleComponent: chartTitleComponent,
        shapePanel: shapePanel,
        svgContainer: svgContainer,
        container: container,
        message: message,
        axisXFormatterTime: axisXFormatterTime,
        axisXFormatterTimeHour: axisXFormatterTimeHour,
        axisXFormatterRotate30: axisXFormatterRotate30,
        axisYFormatSI: axisYFormatSI
    }

}))
