(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils)
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils)
    }
}(this, function(exports, d3, utils) {

    var events = {}

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

    var sliderScaleX = function(config) {
        var sliderWidth = config.width - config.margin.left - config.margin.right
        var extent = config.timeRange.map(function(d) {
            return new Date(d)
        })
        var scaleX = d3.scaleTime().domain(extent).range([0, sliderWidth])

        return {
            scaleX: scaleX,
            sliderWidth: sliderWidth
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

    var sliderAxisX = function(config) {
        var sliderHeight = config.height - config.margin.top - config.margin.bottom

        var axisXFormat = config.axisXFormat || d3.utcFormat('%b')
        var axisX = d3.axisBottom().scale(config.scaleX)
            .tickFormat(axisXFormat)
            .tickSize(sliderHeight - 12)

        return {
            axisX: axisX,
            sliderHeight: sliderHeight
        }
    }

    var axisY = function(config) {
        var axisYFormat = config.axisYFormat || d3.format('.2s')
        var height = config.scaleY.range()[0]
        var axisY = d3.axisLeft().scale(config.scaleY)
            .ticks(Math.max(~~(height / 30), 2))
            .tickPadding(10)
            .tickFormat(config.axisYFormat)

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

    var sliderAxisComponentX = function(config) {
        var axisX = config.container.selectAll('g.axis.x')
            .data([0])
        axisX.enter().append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + [0, config.margin.top] + ')')
            .merge(axisX)
            .transition()
            .attr('transform', 'translate(' + [0, config.margin.top] + ')')
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

    var tooltipHTMLWidget = function(tooltipNode) {
        var root = d3.select(tooltipNode)
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('display', 'none')
        var setText = function(html) {
            root.html(html)
            return this
        }
        var position = function(pos) {
            root.style('left', pos[0] + 'px')
                .style('top', pos[1] + 'px')
            return this
        }
        var show = function() {
            root.style('display', 'block')
            return this
        }
        var hide = function() {
            root.style('display', 'none')
            return this
        }
        var getRootNode = function() {
            return root.node()
        }

        return {
            setText: setText,
            setPosition: position,
            show: show,
            hide: hide,
            getRootNode: getRootNode
        }
    }

    var tooltipComponent = function(config) {
        var tooltipFormat = config.tooltipFormat || function(d) {
            return d.data.y
        }
        var axisTitleXFormat = config.axisTitleXFormat || function(d) {
            return d
        }
        var tooltipContainer = config.container.selectAll('g.hover-tooltip')
            .data([0])
        var tooltipEnter = tooltipContainer.enter().append('g')
            .classed('hover-tooltip', true)
            .style('pointer-events', 'none')
            .style('display', 'none')
        var tooltip = tooltipEnter.merge(tooltipContainer)
        var tooltipContent = tooltipEnter.append('text')
            .merge(tooltipContainer)

        tooltipContainer.exit().remove()

        config.events.mousemove.on(function(d) {
            if (config.dataIsAllNulls || d.shapePosition[1] === null) {
                return
            }
            var tooltipText = config.tooltipFormat(d)
            var axisText = config.axisTitleXFormat(d)

            tooltip.attr('transform', 'translate(' + d.shapePosition + ')')
            tooltipContent.attr('dx', 4)
                .text(tooltipText)
            config.axisTitleXComponent.text(axisText)
                .attr('transform', 'translate(' + (-axisText.length * 6) + ',-12)')
        })

        config.events.mouseenter.on(function(d) {
            if (config.dataIsAllNulls) {
                return
            }
            tooltip.style('display', 'block')
            config.axisTitleXComponent.style('pointer-events', 'none')
                .style('display', 'block')
        })
        config.events.mouseout.on(function(d) {
            tooltip.style('display', 'none')
            config.axisTitleXComponent.style('display', 'none')
        })

        return {}
    }

    var hoverCircleComponent = function(config) {
        var circleContainer = config.container.selectAll('circle.hover-circle')
            .data([0])
        circleContainer.enter().append('circle')
            .classed('hover-circle', true)
            .attr('r', 3)
            .style('pointer-events', 'none')
            .style('display', 'none')
        circleContainer.exit().remove()

        config.events.mousemove.on(function(d) {
            if (config.dataIsAllNulls || d.shapePosition[1] === null) {
                return
            }
            circleContainer.attr('transform', 'translate(' + d.shapePosition + ')')
        })

        config.events.mouseenter.on(function(d) {
            if (config.dataIsAllNulls) {
                return
            }
            circleContainer.style('display', 'block')
        })

        config.events.mouseout.on(function(d) {
            circleContainer.style('display', 'none')
        })

        return {}
    }

    var tooltipLineComponent = function(config) {
        var lineGroup = config.container.selectAll('g.line-container')
            .data([0])
        lineGroup.enter().append('g')
            .attr('class', 'line-container')
            .attr('pointer-events', 'none')
            .style('visibility', 'hidden')
            .append('line')
            .attr('class', 'tooltip-line')
        lineGroup.exit().remove()

        var tooltipLine = lineGroup.select('.tooltip-line')

        config.events.mouseenter.on(function(d) {
            if (config.dataIsAllNulls) {
                return
            }
            tooltipLine.style('visibility', 'visible')
        })

        config.events.mouseout.on(function(d) {
            tooltipLine.style('visibility', 'hidden')
        })

        config.events.mousemove.on(function(d) {
            if (config.dataIsAllNulls || d.shapePosition[1] === null) {
                return
            }
            var x = d.shapePosition[0]
            var y = d.shapePosition[1]
            tooltipLine.attr('x1', 0)
                .attr('y1', y)
                .attr('x2', x)
                .attr('y2', y)
        })

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

    var eventsBinder = function(config) {
        events.mousemove = utils.reactiveProperty()
        events.mouseenter = utils.reactiveProperty()
        events.mouseout = utils.reactiveProperty()

        var dataConvertedX = config.dataConverted.map(function(d) {
            return d.x.getTime()
        })
        var deltaX = config.scaleX(dataConvertedX[1]) - config.scaleX(dataConvertedX[0])
        var eventPanelContainer = config.container.selectAll('g.event-panel-container')
            .data([0])
        eventPanelContainer.enter().append('g')
            .attr('class', 'event-panel-container')
            .append('rect')
            .attr('class', 'event-panel')
            .style('visibility', 'hidden')
            .style('pointer-events', 'all')
            .on('mouseenter', function(d) {
                events.mouseenter({
                    mouse: d3.mouse(this)
                })
            })
            .on('mouseout', function(d) {
                events.mouseout({
                    mouse: d3.mouse(this)
                })
            })
            .on('mousemove', function(d, i) {
                var mouse = d3.mouse(this)
                var mouseFromContainer = d3.mouse(config.container.node())
                var panelBBox = this.getBoundingClientRect()
                var containerBBox = config.container.node().getBoundingClientRect()
                var absoluteOffsetLeft = containerBBox.left
                var absoluteOffsetTop = containerBBox.top
                var dateAtCursor = config.scaleX.invert(mouse[0] - deltaX / 2)
                var dataPointIndexAtCursor

                if (dataConvertedX[0] > dataConvertedX[dataConvertedX.length - 1]) {
                    dataPointIndexAtCursor = utils.bisectionReversed(dataConvertedX, dateAtCursor.getTime())
                } else {
                    dataPointIndexAtCursor = utils.bisection(dataConvertedX, dateAtCursor.getTime())
                }

                var dataPointAtCursor = config.dataConverted[dataPointIndexAtCursor]
                if (dataPointAtCursor) {
                    var xValue = dataPointAtCursor.x
                    var value = dataPointAtCursor.y
                    var x = config.scaleX(xValue)
                    var y = value !== null ? config.scaleY(value) : null
                }

                events.mousemove({
                    data: dataPointAtCursor,
                    mouse: mouse,
                    mouseFromContainer: [mouseFromContainer[0] + absoluteOffsetLeft + window.pageXOffset, mouseFromContainer[1] + absoluteOffsetTop + window.pageYOffset],
                    shapePosition: [x, y],
                    shapePositionFromContainer: [x + panelBBox.left - containerBBox.left, y + panelBBox.top - containerBBox.top]
                })
            })
            .merge(eventPanelContainer)
            .attr('width', config.chartWidth)
            .attr('height', config.chartHeight)
        eventPanelContainer.exit().remove()

        return {
            events: events
        }
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

    var legendElements = function(config) {
        var elements = config.container.selectAll('.element')
            .data(config.elements)
        var elementsEnter = elements.enter().append('div')
            .attr('class', 'element')
        elementsEnter.append('div')
            .attr('class', function(d) {
                return 'color-band ' + d.colorClass
            })
        elementsEnter.append('div')
            .attr('class', 'label')
            .merge(elements)
            .text(function(d) {
                return d.label
            })
        elementsEnter.append('div')
            .attr('class', 'unit')
            .merge(elements)
            .text(function(d) {
                return d.value + ' ' + d.unit
            })
        elements.exit().remove()

        return {}
    }

    var buttonGroupElements = function(config) {
        events.buttonClick = utils.reactiveProperty()

        var elements = config.container.selectAll('.element')
            .data(config.elements)
        var elementsAll = elements.enter().append('div')
            .attr('class', 'element')
            .classed('active', function(d) {
                return d === config.defaultElement
            })
            .on('click', function(d) {
                var that = this
                var isUnselection = false
                elementsAll.classed('active', function() {
                    isAlreadyActive = this.classList.contains('active')
                    isTarget = (that === this)
                    if (isTarget && isAlreadyActive) {
                        isUnselection = true
                    }
                    return !isAlreadyActive && isTarget
                })
                events.buttonClick(isUnselection ? null : d)
            })
            .merge(elements)
            .text(function(d) {
                return d
            })
        elements.exit().remove()

        return {
            events: events
        }
    }

    var timeSlider = function(config) {
        config.container.attr('class', 'datahub-slider')

        events.brush = utils.reactiveProperty()

        var brushX = d3.brushX()
            .extent([
                [0, 0],
                [config.sliderWidth, config.sliderHeight - 12]
            ])
            .handleSize(10)
            .on('brush', function() {
                var brushPixelExtent = d3.event.selection
                var brushExtent = {
                    start: config.scaleX.invert(brushPixelExtent[0]),
                    end: config.scaleX.invert(brushPixelExtent[1])
                }

                events.brush({
                    brushExtent: brushExtent
                })
            })

        var brush = config.container.selectAll('g.brush')
            .data([0])
        var brushMerged = brush.enter().append('g')
            .attr('class', 'brush')
            .attr('transform', 'translate(' + [0, config.margin.top] + ')')
            .merge(brush)
            .attr('transform', 'translate(' + [0, config.margin.top] + ')')
            .call(brushX)
            .call(brushX.move, config.scaleX.range())
        brush.exit().remove()

        if (config.initialTimeRange) {
            // brush.call(brushX.move, config.scaleX.range())
        }

        return {
            events: events
        }
    }

    var numberWidget = function(config) {
        config.container.attr('class', 'datahub-number')

        var elements = config.container.selectAll('div')
            .data(['title', 'value', 'info'])
        elements.enter().append('div')
            .attr('class', function(d) {
                return d
            })
            .merge(elements)
            .html(function(d) {
                return config[d]
            })
            .attr('display', function(d) {
                return config[d] ? null : 'none';
            })
        elements.exit().remove()

        return {}
    }

    var table = function(config) {
        config.container.attr('class', 'datahub-table')

        var headerRow = config.container.selectAll('div.header-row')
            .data([0])
        var headerRowAll = headerRow.enter().append('div')
            .attr('class', 'header-row')
            .merge(headerRow)
        headerRow.exit().remove()

        var headerElements = headerRowAll.selectAll('div.header-cell')
            .data(config.metadata)
        var allHeaderELements = headerElements.enter().append('div')
            .on('click', function(d, i) {
                var that = this
                var isAscending = false
                allHeaderELements.classed('ascending', function(d) {
                    var match = that === this
                    if (match) {
                        isAscending = this.classList.contains('ascending')
                        match = !isAscending
                    }
                    return match
                })

                var sortedData = sortData(config.elements, d.key, isAscending)
                renderElements(sortedData)
            })
            .merge(headerElements)
            .attr('class', function(d) {
                return 'header-cell ' + d.key
            })
            .classed('sortable', function(d) {
                return d.sortable
            })
            .html(function(d) {
                var label = d.label
                if (!label) {
                    return
                }
                if (d.units) {
                    label += ' (' + d.units + ')'
                }
                return label || ''
            })
        headerElements.exit().remove()

        function sortData(data, sortBy, isAscending) {
            var sortKey = config.metadata.map(function(d) {
                    return d.key
                })
                .indexOf(sortBy)
            var sortedData = JSON.parse(JSON.stringify(data))
                .sort(function(a, b) {
                    if (a[sortKey] < b[sortKey]) return isAscending ? 1 : -1
                    if (a[sortKey] > b[sortKey]) return isAscending ? -1 : 1;
                    return 0;
                })
            return sortedData
        }

        function renderElements(data) {
            var elements = config.container.selectAll('div.row')
                .data(data)
            var elementsEnter = elements.enter().append('div')
            var allElements = elementsEnter.merge(elements)
                .attr('class', 'row')
                .attr('display', function(d) {
                    return config[d] ? null : 'none'
                })
            var cells = allElements.selectAll('div.cell')
                .data(function(d) {
                    return d
                })
            cells.enter().append('div')
                .attr('class', 'cell')
                .merge(cells)
                .html(function(d) {
                    return d
                })
            elements.exit().remove()
        }
        var sortedData = sortData(config.elements, config.metadata[0].key, true)
        renderElements(sortedData)

        return {}
    }

    var timeseriesMultilineChart = utils.pipeline(
        mergeData2D,
        axesFormatAutoconfig,
        scaleX,
        scaleY,
        axisX,
        axisY,
        svgContainer,
        lineShapes,
        lineCutShapes,
        message,
        axisComponentX,
        axisTitleComponentX,
        axisComponentY,
        axisXFormatterRotate30,
        axisTitleComponentY
        // eventsBinder,
        // tooltipComponent,
        // hoverCircleComponent,
        // tooltipLineComponent
    )

    var legend = utils.pipeline(
        container,
        legendElements
    )

    var timeSlider = utils.pipeline(
        sliderScaleX,
        sliderAxisX,
        svgContainer,
        sliderAxisComponentX,
        timeSlider
    )

    var buttonGroup = utils.pipeline(
        container,
        buttonGroupElements
    )

    var number = utils.pipeline(
        container,
        numberWidget
    )

    var table = utils.pipeline(
        container,
        table
    )

    exports.chart = {
        timeseriesMultilineChart: timeseriesMultilineChart,
        legend: legend,
        timeSlider: timeSlider,
        buttonGroup: buttonGroup,
        events: events,
        number: number,
        table: table
    }

}))
