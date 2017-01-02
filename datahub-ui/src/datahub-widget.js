(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils)
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils)
    }
}(this, function(exports, d3, utils) {

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

    var buttonGroupElements = function(config) {
        config.container.classed('datahub-button-group', true)

        var events = d3.dispatch('click')

        var elements = config.container.selectAll('.element')
            .data(config.elements)
        var elementsAll = elements.enter().append('div')
            .on('click', function(d) {
                var that = this
                var isUnselection = false
                elementsAll.classed('active', function() {
                    isAlreadyActive = this.classList.contains('active')
                    isTarget = (that === this)
                    if (isTarget && isAlreadyActive && config.isTogglable !== false) {
                        isUnselection = true
                    }
                    if (config.isExclusive) {
                        return (!isAlreadyActive || (isAlreadyActive && config.isTogglable === false)) && isTarget
                    } else {
                        return isTarget ? !isAlreadyActive : isAlreadyActive
                    }
                })
                events.call('click', null, { selected: isUnselection ? null : d })
            })
            .merge(elements)
            .attr('class', function(d) {
                return 'element ' + (d.className || '')
            })
            .classed('active', function(d) {
                return d.key === config.defaultElementKey
            })
            .html(function(d) {
                return d.label
            })
        elements.exit().remove()

        return {
            events: events
        }
    }

    var timeSlider = function(config) {
        config.container.classed('datahub-slider', true)

        var events = d3.dispatch('brush')

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

                events.call('brush', null, {
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
        config.container.classed('datahub-number', true)

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
                return config[d] ? null : 'none'
            })
        elements.exit().remove()

        return {}
    }

    var table = function(config) {
        config.container.classed('datahub-table', true)

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
                    if (a[sortKey] > b[sortKey]) return isAscending ? -1 : 1
                    return 0
                })
            return sortedData
        }

        function renderElements(data) {
            var elements = config.container.selectAll('div.table-row')
                .data(data)
            var elementsEnter = elements.enter().append('div')
            var allElements = elementsEnter.merge(elements)
                .attr('class', 'table-row')
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

    var alert = function(config) {
        config.container.classed('datahub-alert-message', true)

        var elements = config.container.selectAll('div.alert-band')
            .data([0])
        var elementsEnter = elements.enter()
        elementsEnter.append('div')
            .attr('class', 'alert-band ' + config.level)
        elementsEnter.append('div')
            .attr('class', 'alert-message')
            .merge(elements)
            .html(function(d) {
                return config.message
            })
        elements.exit().remove()

        return {}
    }

    var calendar = function(config) {
        config.container.classed('datahub-month-calendar', true)

        var events = d3.dispatch('change')

        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        var state = {
            year: config.defaultYear || (new Date()).getFullYear(),
            month: config.defaultMonthNumber || monthNames[(new Date()).getMonth() - 1]
        }

        function setDate() {
            selectedYear.text(state.year)
            events.call('change', null, state)
        }

        var elements = config.container.selectAll('div.calendar')
            .data([0])
        var elementsEnter = elements.enter()
        elements.exit().remove()

        var yearSelector = elementsEnter.append('div')
            .attr('class', 'year-selector')

        yearSelector.append('div')
            .attr('class', 'year-shifter')
            .text('<')
            .on('click', function(d) {
                state.year = parseInt(selectedYear.text()) - 1
                setDate()
            })
        var selectedYear = yearSelector.append('div')
            .attr('class', 'selected-year')
        yearSelector.append('div')
            .attr('class', 'year-shifter')
            .text('>')
            .on('click', function(d) {
                state.year = parseInt(selectedYear.text()) + 1
                setDate()
            })

        var months = elementsEnter.append('div')
            .attr('class', 'date-selector')

        var buttonConfig = {
            elements: monthNames.map(function(d) {
                return { key: d, label: d, className: 'month' }
            }),
            container: months,
            isExclusive: true,
            defaultElementKey: state.month,
            isTogglable: false
        }

        var monthButtons = buttonGroupElements(buttonConfig)
        monthButtons.events.on('click', function(d) {
            state.month = d.selected.key
            setDate()
        })

        setDate()

        var getDate = function() {
            return new Date(state.year, monthNames.indexOf(state.month))
        }

        var getFormattedDate = function(_format) {
            var format = _format || '%B %Y'
            return d3.timeFormat(format)(getDate())
        }

        return {
            events: events,
            getDate: getDate,
            getFormattedDate: getFormattedDate
        }
    }

    var dropdownWidget = function(config) {
        config.container.classed('datahub-dropdown', true)
        var defaultElement = config.defaultElement || config.elements[0]

        var events = d3.dispatch('change')

        var dropdownContainer = config.container.selectAll('div.dropdown')
            .data([0])
        var dropdownUpdate = dropdownContainer.enter().append('div')
            .attr('class', 'dropdown')
            .merge(dropdownContainer)
        dropdownContainer.exit().remove()

        var title = dropdownUpdate.selectAll('.title')
            .data([config.title])
        title.enter().append('div')
            .attr('class', 'title')
            .merge(title)
            .html(function(d){ return d; })
        title.exit().remove()

        var selectedElement = dropdownUpdate.selectAll('.selected-element')
            .data([defaultElement.label])
        var selectedElementUpdate = selectedElement.enter().append('div')
            .attr('class', 'selected-element')
            .on('click', function(d){
                toggle()
            })
            .merge(selectedElement)
            .html(function(d){ return d; })
        selectedElement.exit().remove()

        var elements = dropdownUpdate.selectAll('.elements')
            .data([0])
        var elementUpdate = elements.enter().append('div')
            .attr('class', 'elements')
            .merge(elements)
        elements.exit().remove()

        var buttonConfig = {
            container: elementUpdate,
            elements: config.elements,
            isExclusive: true,
            defaultElementKey: defaultElement.key,
            isTogglable: false
        }

        var elementButtons = buttonGroupElements(buttonConfig)
        elementButtons.events.on('click', function(d) {
            if(!config.ignoreClickEvents) {
                selectedElementUpdate.html(d.selected.label)
                events.call('change', null, { selected: d.selected })
                close()
            }
        })

        var toggle = function(open){
            elementUpdate.node().classList.toggle('active', open)
            return this
        }

        var open = function(){
            toggle(true)
            return this
        }

        var close = function(){
            toggle(false)
            return this
        }

        return {
            events: events,
            toggle: toggle, 
            open: open,
            close: close
        }
    }

    var dropdownCalendarWidget = function(config) {
        config.container.classed('datahub-dropdown-calendar', true)

        var events = d3.dispatch('change')

        dropdownWidget({
            container: config.container,
            elements: [{
                className: 'calendar-element'
            }],
            ignoreClickEvents: true
        })

        var selectedElement = config.container.select('.selected-element')
        
        var monthCalendar = calendar({
            container: config.container.select('.calendar-element'),
            defaultDate: (new Date()).toString(),
        })

        selectedElement.text(monthCalendar.getFormattedDate())

        monthCalendar.events.on('change', function(d){
            selectedElement.text(monthCalendar.getFormattedDate())
            events.call('change', null, {
                formattedDate: monthCalendar.getFormattedDate()
            })
        })
        
        return {
            events: events
        }
    }

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

    var alertMessage = utils.pipeline(
        container,
        alert
    )

    var monthCalendar = utils.pipeline(
        container,
        calendar
    )

    var dropdown = utils.pipeline(
        container,
        dropdownWidget
    )

    var dropdownCalendar = utils.pipeline(
        container,
        dropdownCalendarWidget
    )

    exports.widget = {
        container: container,
        svgContainer: svgContainer,
        timeSlider: timeSlider,
        buttonGroup: buttonGroup,
        number: number,
        table: table,
        alertMessage: alertMessage,
        monthCalendar: monthCalendar,
        dropdown: dropdown,
        dropdownCalendar: dropdownCalendar
    }

}))
