!(function(dh, d3) {
    var template = function(config) {
        var containerNode = config.parent.querySelector('.datahub-vertical-chart')
        if(!containerNode) {
            var template = '<div class="datahub-vertical-chart">' +
                '<div class="header"></div>' +
                '<div class="chart-container">' +
                    '<div class="chart-wrapper">' +
                        '<svg>' +
                            '<g class="panel">' +
                                '<g class="reference-bars"></g>' +
                                '<g class="bars"></g>' +
                                '<g class="axis"></g>' +
                            '</g>' +
                        '</svg>' +
                    '</div>' +
                '</div>' +
                '<div class="number-container"></div>' +
            '</div>'

            containerNode = dh.utils.appendHtmlToNode(template, config.parent)
        }

        var dataIsEmpty = !(config.elements && config.elements.length)

        var container = d3.select(containerNode)
        var chartContainer = container.select('.chart-container')
        var chartWidth = chartContainer.node().clientWidth

        var rowHeight = 26

        var chartHeight = dataIsEmpty 
            ? 0
            : (config.elements.length * rowHeight)

        return {
            container: container,
            chartWidth: chartWidth,
            chartHeight: chartHeight,
            rowHeight: rowHeight,
            dataIsEmpty: dataIsEmpty,
            refernceValue: 100
        }
    }

    var scaleX = function(config) {
        var linearScaleX = d3.scaleLinear().domain([0, 100]).range([0, config.referenceBarSize])

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
        config.container.select('.header').html(config.title)
        
        return {}
    }

    var number = function(config) {
        var numbers = config.container.select('.number-container')
            .selectAll('.number')
            .data(config.elements || [])
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
                return Math.round(d.value) + ' ' + config.unit
            })
        values.exit().remove()
        
        return {}
    }

    var bars = function(config) {
        var panel = config.container.select('svg')
            .attr('width', config.chartWidth)
            .attr('height', config.chartHeight)
            .select('.panel')

        var rowH = config.rowHeight
        var referenceBarH = rowH - 2
        var barH = referenceBarH /2
        
        var bars = panel.select('.bars')
            .selectAll('.bar')
            .data(config.elements || [])
        bars.enter().append('rect')
            .merge(bars)
            .attr('class', function(d, i) {
                return ['bar', d.label.toLowerCase(), 'bar' + i].join(' ')
            })
            .attr('x', function(d) {
                var width = config.scaleX(d.value)
                if(width < 0) {
                    return config.chartWidth / 2 - Math.abs(width)
                }
                return config.chartWidth / 2
            })
            .attr('y', function(d, i) {
                return rowH * i + (rowH - barH) / 2
            })
            .attr('width', function(d) {
                if(d.value) {
                    return Math.abs(config.scaleX(d.value))
                }
            })
            .attr('height', barH)
        bars.exit().remove()

        var referenceBars = panel.select('.reference-bars')
            .selectAll('.bar')
            .data(config.elements || [])
        referenceBars.enter().append('rect')
            .attr('class', 'bar')
            .merge(referenceBars)
            .attr('x', config.chartWidth / 2)
            .attr('y', function(d, i) {
                return rowH * i + (rowH - referenceBarH) / 2
            })
            .attr('width', function(d, i) {
                return config.referenceBarSize
            })
            .attr('height', referenceBarH)
        referenceBars.exit().remove()

        var referenceLines = panel.select('.reference-bars')
            .selectAll('.line')
            .data(config.elements || [])
        referenceLines.enter().append('line')
            .attr('class', 'line')
            .merge(referenceLines)
            .attr('x1', config.chartWidth / 2 + config.referenceBarSize)
            .attr('y1', function(d, i) {
                return rowH * i + (rowH - referenceBarH) / 2
            })
            .attr('x2', config.chartWidth / 2 + config.referenceBarSize)
            .attr('y2', function(d, i) {
                return rowH * i + (rowH - referenceBarH) / 2 + referenceBarH
            })
        referenceLines.exit().remove()
        
        return {}
    }

    var verticalLines = function(config) {
        var line = config.container.select('.axis')
            .selectAll('.vertical')
            .data([0])
        line.enter().append('line')
            .attr('class', 'vertical')
            .merge(line)
            .attr('x1', config.chartWidth / 2)
            .attr('y1', 0)
            .attr('x2', config.chartWidth / 2)
            .attr('y2', config.chartHeight)
        line.exit().remove()

        return {}
    }

    var multi = dh.utils.pipeline(
        template,
        header,
        number,
        scaleX,
        verticalLines,
        bars
    )

    /**
     * A vertical positive/negative bar chart with reference bar.
     * @namespace verticalChart
     * @name verticalChart
     * @param {object} config The initial configuration can be passed on init or later using verticalChart.setConfig.
     * @param {object} config.parent The parent DOM element.
     * @param {Array.<object>} config.elements Data in the form {key, label, value}.
     * @param {number} config.referenceBarSize The size of the reference bar in px.
     * @param {string} config.title The chart title.
     * @param {string} config.unit The axis unit.
     * @returns {object} A verticalChart instance.
     * @example
     * datahub.verticalChart({
     *     parent: document.querySelector('.vertical-chart')
     *     title: 'Title',
     *     elements:[
     *         {key: 'approved', label: 'Approved', value: 125},
     *         {key: 'written', label: 'Written', value: 16},
     *         {key: 'remains', label: 'Remains', value: -79}
     *     ],
     *     referenceBarSize: 100,
     *     unit: '%'
     * })
     */
    var verticalChart = function(config) {
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

        /**
         * Set the config after its instantiation.
         * @name setConfig
         * @param {object} config The same config format as on init.
         * @returns {object} The verticalChart instance.
         * @memberof verticalChart
         * @instance
         * @example
         * datahub.verticalChart({
         *     parent: document.querySelector('.vertical-chart')
         * })
         * .setConfig({
         *     title: 'Title',
         *     elements:[
         *         {key: 'approved', label: 'Approved', value: 125},
         *         {key: 'written', label: 'Written', value: 16},
         *         {key: 'remains', label: 'Remains', value: -79}
         *     ],
         *     referenceBarSize: 100,
         *     unit: '%'
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
         * @memberof verticalChart
         * @instance
         * @example
         * var chart = datahub.verticalChart({
         *     parent: document.querySelector('.chart'),
         * })
         * chart.destroy()
         */
        var destroy = function() {
            d3.select(window).on('resize.' + uid, null)
            configCache.parent.innerHTML = null
        }

        init(config, events)

        return {
            on: dh.utils.rebind(events),
            setConfig: setConfig,
            destroy: destroy
        }
    }

    dh.verticalChart = verticalChart
}(datahub, root.d3))