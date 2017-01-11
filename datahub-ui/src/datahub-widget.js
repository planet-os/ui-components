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

    var number = function(_config) {
        var configCache = {
            title: _config.title,
            value: _config.value,
            info: _config.info
        }

        var template = '<div class="datahub-number">' 
            + '<div class="title"></div>' 
            + '<div class="value"></div>' 
            + '<div class="info"></div>' 
            + '</div>'
        var parentNode = utils.appendHtmlToNode(template, _config.parent)
        var parent = d3.select(parentNode)
            .on('click', function(d) {
                events.call('click', null, configCache)
            })

        var events = d3.dispatch('click')

        setTitle(configCache.title)
        setValue(configCache.value)
        setInfo(configCache.info)

        function setTitle(text) {
            configCache.title = text || configCache.title
            parent.select('.title').html(configCache.title)
            return this
        }

        function setValue(text) {
            configCache.value = text || configCache.value
            parent.select('.value').html(configCache.value)
            return this
        }

        function setInfo(text) {
            configCache.info = text || configCache.info
            parent.select('.info').html(configCache.info)
            return this
        }

        return {
            on: utils.rebind(events),
            setTitle: setTitle,
            setValue: setValue,
            setInfo: setInfo
        }
    }

    var table = function(config) {
        var template = '<div class="datahub-table">' 
            + '<div class="header-row"></div>' 
            + '</div>'
        var parentNode = utils.appendHtmlToNode(template, config.parent)
        var parent = d3.select(parentNode)

        var configCache = {
            elements: config.elements,
            header: config.header,
            defaultSortKey: config.header ? config.header[0].key : null
        }

        renderCells(config.elements)
        renderHeader(config.header)

        function renderHeader(header) {
            if (!header) {
                return this
            } else {
                configCache.header = header
                configCache.defaultSortKey = header[0].key
            }
            var headerCells = parent.select('.header-row').selectAll('.header-cell')
                .data(header)
            var headerCellsUpdate = headerCells.enter().append('div')
                .attr('class', 'header-cell')
                .on('click', function(d, i) {
                    if (!this.classList.contains('sortable') || !configCache.elements) {
                        return
                    }
                    var that = this
                    var isAscending = false
                    headerCellsUpdate.classed('ascending', function(d) {
                        var match = that === this
                        if (match) {
                            isAscending = this.classList.contains('ascending')
                            match = !isAscending
                        }
                        return match
                    })
                    renderCells(configCache.elements, d.key, !isAscending)
                })
                .merge(headerCells)
                .classed('sortable', function(d) {
                    return d.sortable
                })
                .classed('ascending', function(d) {
                    return d.key === configCache.defaultSortKey
                })
                .html(function(d) {
                    return d.label
                })
            headerCells.exit().remove()
        }

        function renderCells(elements, _sortKey, _isAscending) {
            if (!elements || !configCache.header) {
                return this
            } else {
                configCache.elements = elements
            }

            var sortKey = _sortKey || configCache.defaultSortKey
            var isAscending = typeof _isAscending === 'undefined' ? true : _isAscending

            var sortedElements = sortElements(elements, sortKey, isAscending)
            var rows = parent.selectAll('.table-row')
                .data(sortedElements)
            var rowsUpdate = rows.enter().append('div')
                .attr('class', 'table-row')
                .merge(rows)
            rows.exit().remove()

            var cells = rowsUpdate.selectAll('.cell')
                .data(function(d) {
                    return d
                })
            cells.enter().append('div')
                .attr('class', 'cell')
                .merge(cells)
                .html(function(d) {
                    return d
                })
            cells.exit().remove()
        }

        function sortElements(data, sortBy, isAscending) {
            var sortKey = configCache.header.map(function(d) {
                    return d.key
                })
                .indexOf(sortBy)
            var sortedData = JSON.parse(JSON.stringify(data))
                .sort(function(a, b) {
                    if (a[sortKey] < b[sortKey]) return isAscending ? -1 : 1
                    if (a[sortKey] > b[sortKey]) return isAscending ? 1 : -1
                    return 0
                })
            return sortedData
        }

        return {
            setHeader: renderHeader,
            setElements: renderCells
        }
    }

    var alert = function(config) {
        var template = '<div class="datahub-alert-message">' 
            + '<div class="alert-band"></div>' 
            + '<div class="alert-message"></div>' 
            + '</div>'
        var parentNode = utils.appendHtmlToNode(template, config.parent)
        var parent = d3.select(parentNode)

        setLevel(config.level)
        setMessage(config.message)

        function setLevel(level) {
            parent.select('.alert-band').classed(level, true)
        }

        function setMessage(message) {
            parent.select('.alert-message').html(message)
        }

        return {
            setLevel: setLevel,
            setMessage: setMessage
        }
    }

    var calendar = function(config) {
        var template = '<div class="datahub-month-calendar">' 
            + ' <div class="year-selector">' 
            + '     <div class="prev-year">&lsaquo;</div>' 
            + '     <div class="selected-year"></div>' 
            + '     <div class="next-year">&rsaquo;</div>' 
            + ' </div>' 
            + ' <div class="month-selector">' 
            + ' </div>' 
            + '</div>'
        var parentNode = utils.appendHtmlToNode(template, config.parent)
        var parent = d3.select(parentNode)

        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        var configCache = {
            month: monthNames[(new Date()).getMonth()],
            year: (new Date()).getFullYear()
        }

        var events = d3.dispatch('change')

        function changeYear() {
            var dateFormats = getDateFormats()
            events.call('change', null, dateFormats)

            selectYear.text(configCache.year)
        }

        function changeMonth() {
            var dateFormats = getDateFormats()
            events.call('change', null, dateFormats)

            monthsUpdate.classed('active', function(d) {
                return d === configCache.month
            })
        }

        var selectYear = parent.select('.selected-year').text(configCache.year)
        parent.select('.prev-year').on('click', function(d) {
            configCache.year -= 1
            changeYear()
        })
        parent.select('.next-year').on('click', function(d) {
            configCache.year += 1
            changeYear()
        })

        var months = parent.select('.month-selector').selectAll('.element')
            .data(monthNames)
        var monthsUpdate = months.enter().append('div')
            .attr('class', 'element month')
            .text(function(d) {
                return d
            })
            .on('click', function(d) {
                var that = this
                monthsUpdate.classed('active', function() {
                    return that === this
                })

                configCache.month = d
                changeMonth()
            })
            .merge(months)
            .classed('active', function(d) {
                return d === configCache.month
            })

        if(config.defaultMonth && config.defaultYear) {
            setMonth(config.defaultMonth)
            setYear(config.defaultYear)
        }
        else if(config.defaultMonthNumber && config.defaultYear) {
            setMonthNumber(config.defaultMonthNumber)
            setYear(config.defaultYear)
        }
        else {
            setDate(config.defaultDate || new Date())
        }

        function getDateFormats() {
            return {
                year: configCache.year,
                month: configCache.month,
                date: getDate(),
                iso: getISODate(),
                formatted: getFormattedDate()
            }
        }

        function getDate() {
            return new Date(configCache.year, monthNames.indexOf(configCache.month))
        }

        function getFormattedDate(_format) {
            var format = _format || '%B %Y'
            return d3.timeFormat(format)(getDate())
        }

        function getISODate(_format) {
            return d3.isoFormat(getDate())
        }

        function setDate(date) {
            configCache = {
                month: monthNames[(new Date(date)).getMonth()],
                year: (new Date(date)).getFullYear()
            }
            changeYear()
            changeMonth()
        }

        function setMonth(month) {
            configCache.month = month
            changeMonth()
        }

        function setYear(year) {
            configCache.year = year
            changeYear()
        }

        function getMonthNames() {
            return monthNames
        }

        function setMonthNumber(monthNumber) {
            configCache.month = monthNames[monthNumber]
            changeMonth()
        }

        return {
            on: utils.rebind(events),
            getDateFormats: getDateFormats,
            getDate: getDate,
            getISODate: getISODate,
            getFormattedDate: getFormattedDate,
            setDate: setDate,
            setMonth: setMonth,
            setYear: setYear,
            getMonthNames: getMonthNames,
            setMonthNumber: setMonthNumber
        }
    }

    var dropdown = function(config) {
        var template = '<div class="datahub-dropdown">' 
            + ' <div class="title"></div>' 
            + ' <div class="selected-element"></div>' 
            + ' <div class="elements"></div>' 
            + '</div>'
        var parentNode = utils.appendHtmlToNode(template, config.parent)
        var parent = d3.select(parentNode)
            .on('mouseout', close)
        var elementsContainer = parent.select('.elements')
            .on('mouseover', open)
        var elementsUpdate

        var events = d3.dispatch('change')

        parent.select('.title').html(config.title)
        var selectedElement = parent.select('.selected-element')
            .on('mouseover', open)

        function setSelected(label) {
            selectedElement.html(label)
            if (elementsUpdate) {
                elementsUpdate.classed('active', function(d) {
                    return d.label === label
                })
            }
            return this
        }

        function setElements(_elements) {
            if (!_elements) {
                return this
            }
            var elements = elementsContainer.selectAll('.element')
                .data(_elements, function(d) {
                    return d.key
                })
            elementsUpdate = elements.enter().append('div')
                .attr('class', 'element')
                .on('mouseover', open)
                .on('click', function(d) {
                    if (config.ignoreClickEvents) {
                        return
                    }
                    var that = this
                    elementsUpdate.classed('active', function() {
                        return that === this
                    })

                    setSelected(d.label)
                    events.call('change', null, d)
                    close()
                })
                .merge(elements)
                .html(function(d) {
                    return d.label
                })
            elements.exit().remove()

            setSelected(config.selected || config.elements[0].label)
            return this
        }

        setElements(config.elements)

        function toggle(open) {
            elementsContainer.classed('active', open)
            return this
        }

        function open() {
            toggle(true)
            return this
        }

        function close() {
            toggle(false)
            return this
        }

        function isOpened() {
            return elementsContainer.classed('active')
        }

        return {
            on: utils.rebind(events),
            toggle: toggle,
            open: open,
            close: close,
            isOpened: isOpened,
            setElements: setElements,
            setSelected: setSelected
        }
    }

    var dropdownCalendar = function(config) {
        var events = d3.dispatch('change')

        var menu = dropdown({
            parent: config.parent,
            ignoreClickEvents: true
        })

        var monthCalendar = calendar({
                parent: config.parent.querySelector('.elements'),
                defaultDate: config.defaultDate,
                defaultMonthNumber: config.defaultMonthNumber,
                defaultYear: config.defaultYear,
                defaultMonth: config.defaultMonth
            })
            .on('change', function(d) {
                menu.setSelected(d.formatted)
                events.call('change', null, d)
            })

        menu.setSelected(monthCalendar.getFormattedDate())

        return {
            on: utils.rebind(events),
            toggle: menu.toggle,
            open: menu.open,
            close: menu.close,
            isOpened: menu.isOpened,
            setElements: menu.setElements,
            setSelected: menu.setSelected,
            getDateFormats: monthCalendar.getDateFormats,
            getDate: monthCalendar.getDate,
            getISODate: monthCalendar.getISODate,
            getFormattedDate: monthCalendar.getFormattedDate,
            setDate: monthCalendar.setDate,
            setMonth: monthCalendar.setMonth,
            setYear: monthCalendar.setYear,
            getMonthNames: monthCalendar.getMonthNames,
            setMonthNumber: monthCalendar.setMonthNumber
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

    exports.widget = {
        container: container,
        svgContainer: svgContainer,
        timeSlider: timeSlider,
        buttonGroup: buttonGroup,
        number: number,
        table: table,
        alertMessage: alert,
        monthCalendar: calendar,
        dropdown: dropdown,
        dropdownCalendar: dropdownCalendar
    }

}))
