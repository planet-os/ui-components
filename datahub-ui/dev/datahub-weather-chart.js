!(function(dh, d3) {
    var template = function(config) {
        var containerNode = config.parent.querySelector('.datahub-weather-chart')
        if(!containerNode) {
            var template = '<div class="datahub-weather-chart">' +
                '<svg>' +
                    '<g class="panel">' +
                        '<g class="axis x"></g>' +
                        '<g class="chart1"></g>' +
                        '<g class="chart2"></g>' +
                        '<g class="chart3"></g>' +
                        '<g class="chart4"></g>' +
                        '<g class="axis x"></g>' +
                    '</g>' +
                '</svg>' +
            '</div>'

            containerNode = dh.utils.appendHtmlToNode(template, config.parent)
        }

        var infoIsEmpty = !(config.elements && config.elements.length)
        var dataIsEmpty = !(!infoIsEmpty && config.elements[0].value)

        var container = d3.select(containerNode)
        var chartWidth = config.width || containerNode.clientWidth
        var chartHeight = config.height || containerNode.clientHeight || 300
        var isConnected = [1, 3]
        var isNegative = [1]

        return {
            container: container,
            chartWidth: chartWidth,
            chartHeight: chartHeight,
            dataIsEmpty: dataIsEmpty
        }
    }

    // var data = function(_config){
    //     // var config = {
    //     //     data: null
    //     // }

    //     var scaleType = config.data[0].timestamp ? 'time' : 'linear'

    //     var dataConverted = config.data.map(function(d, i){
    //         return {
    //             x: d.timestamp ? d.timestamp : i,
    //             y: d.value !== undefined ? d.value : d,
    //             className: d.status
    //         }
    //     })

    //     return {
    //         dataConverted: dataConverted,
    //         scaleType: scaleType
    //     }
    // }

    // var barChartAutoConfig = function(_config){
    //     return {
    //         axisYPadding: 20
    //     }
    // }

    // var scaleX = function(_config){
    //     // var config = {
    //     //     dataConverted: null,
    //     //     margin: null,
    //     //     width: null,
    //     //     scaleType: null
    //     // }

    //     var chartWidth = config.width - config.margin.left - config.margin.right
    //     var dataX = config.dataConverted.map(function(d){ return d.x })

    //     var scale = config.scaleType === 'time' ? d3.time.scale : d3.scale.linear
    //     var scaleX = scale()
    //         .domain(d3.extent(dataX))
    //         .range([0, chartWidth])

    //     return {
    //         scaleX: scaleX,
    //         chartWidth: chartWidth
    //     }
    // }

    // var scaleY = function(_config){
    //     // var config = {
    //     //     dataConverted: null,
    //     //     margin: null,
    //     //     height: null,
    //     //     thresholdY: null
    //     // }

    //     var chartHeight = config.height - config.margin.top - config.margin.bottom
    //     var dataY = config.dataConverted.map(function(d){ return d.y })
    //     var scaleMin = d3.min(dataY) - (d3.max(dataY) - d3.min(dataY)) / 2

    //     var max = d3.max(dataY)
    //     if(typeof config.thresholdY === 'number' && config.thresholdY > max){
    //         max = config.thresholdY
    //     }

    //     if(scaleMin === max) {
    //         scaleMin -= scaleMin / 20
    //         max += max / 10
    //     }

    //     var scaleY = d3.scale.linear()
    //         .domain([scaleMin, max])
    //         .range([chartHeight, 0])

    //     return {
    //         scaleY: scaleY,
    //         chartHeight: chartHeight
    //     }
    // }

    // var axisX = function(_config){
    //     // var config = {
    //     //     scaleX: null,
    //     //     axisXFormat: '%H:%M',
    //     //     axisXTimeResolution: 'minutes',
    //     //     axisXTimeSteps: 2
    //     // }

    //     var timeResolution = d3.time[config.axisXTimeResolution] || d3.time.minutes
    //     var axisX = d3.svg.axis()
    //         .scale(config.scaleX)
    //         .ticks(timeResolution, config.axisXTimeSteps)
    //         .tickFormat(d3.time.format(config.axisXFormat || '%H:%M'))
    //         .orient('bottom')

    //     return {
    //         axisX: axisX
    //     }
    // }

    // var axisY = function(_config){
    //     // var config = {
    //     //     scaleY: null,
    //     //     chartWidth: null,
    //     //     margin: null,
    //     //     axisYPadding: 0
    //     // }

    //     var axisY = d3.svg.axis()
    //         .scale(config.scaleY)
    //         .orient('left')
    //         .tickSize(-config.chartWidth - config.axisYPadding)
    //         .ticks(6, 's')
    //         .tickPadding(10)

    //     return {
    //         axisY: axisY
    //     }
    // }

    // var panelComponent = function(_config){
    //     // var config = {
    //     //     container: null,
    //     //     width: null,
    //     //     height: null,
    //     //     margin: null
    //     // }

    //     var root = d3.select(config.container)
    //         .selectAll('svg')
    //         .data([0])
    //     root.enter().append('svg')
    //         .attr({
    //             'class': 'piper-chart'
    //         })
    //         .append('g')
    //         .attr({
    //             'class': 'panel'
    //         })
    //     root.attr({
    //         width: config.width,
    //         height: config.height
    //     })
    //     root.exit().remove()

    //     var panel = root.select('g.panel')
    //         .attr({
    //             transform: 'translate(' + config.margin.left + ',' + config.margin.top + ')'
    //         })

    //     return {
    //         root: root,
    //         panel: panel
    //     }
    // }

    // var axisComponentX = function(_config){
    //     // var config = {
    //     //     axisX: null,
    //     //     chartHeight: null,
    //     //     panel: null
    //     // }

    //     var axisX = config.panel.selectAll('g.axis.x')
    //         .data([0])
    //     axisX.enter().append('g')
    //         .attr({
    //             'class': 'x axis'
    //         })
    //     axisX.attr({
    //             transform: 'translate(' + [0, config.chartHeight] + ')'
    //         })
    //         .call(config.axisX)
    //     axisX.exit().remove()

    //     return {}
    // }

    // var singleAxisComponentX = function(_config){
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

    // var axisComponentY = function(_config){
    //     // var config = {
    //     //     axisY: null,
    //     //     panel: null,
    //     //     axisYPadding: null
    //     // }

    //     var padding = config.axisYPadding || 0
    //     var axisY = config.panel.selectAll('g.axis.y')
    //         .data([0])
    //     axisY.enter().append('g')
    //         .attr({
    //             'class': 'y axis',
    //             transform: 'translate(' + [-padding /2, 0] + ')'
    //         })
    //     axisY.call(config.axisY)
    //     axisY.exit().remove()

    //     return {}
    // }

    // var axisTitleComponentY = function(_config){
    //     // var config = {
    //     //     panel: null,
    //     //     axisTitleY: null,
    //     //     chartWidth: null,
    //     //     chartHeight: null,
    //     //     margin: null,
    //     //     position: null
    //     // }

    //     var positionY = config.position === 'bottom' ? config.chartHeight + config.margin.top + config.margin.bottom / 4 : -10
    //     var positionX = config.position === 'bottom' ? function(){ return -10 } : function(){return config.chartWidth / 2 - this.getBBox().width / 2 + 10}

    //     var axisTitleY = config.panel.selectAll('text.axis-title.y')
    //             .data([0])
    //         axisTitleY.enter().append('text')
    //             .attr({
    //                 'class': 'y axis-title'
    //             })
    //         axisTitleY.text(config.axisTitleY || '')
    //             .attr({
    //                 x: positionX,
    //                 y: positionY
    //             })
    //     axisTitleY.exit().remove()

    //     return {}
    // }

    // var axisTitleBottomComponentY = function(_config){
    //     // var config = {
    //     //     panel: null,
    //     //     axisTitleY: null,
    //     //     chartHeight: null,
    //     //     margin: null,
    //     //     position: 'bottom'
    //     // }

    //     return axisTitleComponentY(config)
    // }

    // var areaShapes = function(_config){
    //     // var config = {
    //     //     panel: null,
    //     //     dataConverted: null,
    //     //     scaleX: null,
    //     //     scaleY: null
    //     // }

    //     var dataY = config.dataConverted.map(function(d){ return d.y })

    //     var area = d3.svg.area()
    //         .defined(function(d) { return d.y != null })
    //         .x(function(d){ return config.scaleX(d.x) })
    //         .y(function(d){ return config.scaleY(d.y) })
    //         .y0(config.scaleY.range()[0])

    //     var shapes = config.panel.selectAll('path.line')
    //         .data([config.dataConverted])
    //     shapes.enter().append('path')
    //         .attr({
    //             'class': 'line shape'
    //         })
    //     shapes.attr({
    //         d: area
    //     })
    //     shapes.exit().remove()

    //     return {}
    // }

    // var lineShapes = function(_config){
    //     // var config = {
    //     //     panel: null,
    //     //     dataConverted: null,
    //     //     scaleX: null,
    //     //     scaleY: null
    //     // }

    //     var dataY = config.dataConverted.map(function(d){ return d.y })

    //     var line = d3.svg.line()
    //         .defined(function(d) { return d.y != null })
    //         .x(function(d){ return config.scaleX(d.x) })
    //         .y(function(d){ return config.scaleY(d.y) })

    //     var shapes = config.panel.selectAll('path.line')
    //         .data([config.dataConverted])
    //     shapes.enter().append('path')
    //         .attr({
    //             'class': 'line shape'
    //         })
    //         .style({fill: 'none'})
    //     shapes.attr({
    //         d: line
    //     })
    //     shapes.exit().remove()

    //     return {}
    // }

    // var barShapes = function(_config){
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

    // var tresholdLine = function(_config){
    //     // var config = {
    //     //     panel: null,
    //     //     dataConverted: null,
    //     //     scaleX: null,
    //     //     scaleY: null,
    //     //     margin: null,
    //     //     chartWidth: null,
    //     //     thresholdY: null
    //     // }

    //     if(typeof config.thresholdY !== 'number'){
    //         return {}
    //     }

    //     var scaledThresholdY = config.scaleY(config.thresholdY)
    //     var path = 'M' + [[config.margin.left, scaledThresholdY], [config.chartWidth, scaledThresholdY]].join('L')

    //     var shapes = config.panel.selectAll('path.treshold')
    //         .data([0])
    //     shapes.enter().append('path')
    //         .attr({
    //             'class': 'treshold shape'
    //         })
    //         .style({fill: 'none'})
    //     shapes.attr({
    //         d: path
    //     })
    //     shapes.exit().remove()

    //     return {}
    // }

    // // var verticalLine = function(_config){
    // //     var config = {
    // //         panel: null,
    // //         dataConverted: null,
    // //         scaleX: null,
    // //         scaleY: null,
    // //         chartHeight: null,
    // //         margin: null,
    // //         verticalLineX: null,
    // //         verticalLineValue: null
    // //     }

    //     var scaledverticalLineX = config.scaleX(config.verticalLineX)
    //     var path = 'M' + [[scaledverticalLineX, 0], [scaledverticalLineX, config.chartHeight]].join('L')

    //     var shapes = config.panel.selectAll('path.vertical-line')
    //         .data([0])
    //     shapes.enter().append('path')
    //         .attr({
    //             'class': 'vertical-line shape'
    //         })
    //     shapes.attr({
    //         d: path
    //     })
    //     shapes.exit().remove()

    //     var label = config.panel.selectAll('text.vertical-line-label')
    //         .data([0])
    //     label.enter().append('text')
    //         .attr({
    //             'class': 'vertical-line-label'
    //         })
    //     label.attr({
    //         x: scaledverticalLineX + 2,
    //         y: config.chartHeight + config.margin.top + config.margin.bottom / 4
    //     })
    //     .text(config.verticalLineValue)
    //     shapes.exit().remove()

    //     return {}
    // }

    // var endCircle = function(_config){
    //     // var config = {
    //     //     panel: null,
    //     //     dataConverted: null,
    //     //     scaleX: null,
    //     //     scaleY: null,
    //     //     width: null
    //     // }

    //     var lastDataY = config.dataConverted[config.dataConverted.length-1]

    //     var shapes = config.panel.selectAll('circle.end-circle')
    //         .data([lastDataY])
    //     shapes.enter().append('circle')
    //         .attr({
    //             'class': 'end-circle shape'
    //         })
    //     shapes.attr({
    //         cx: function(d){ return config.scaleX(d.x) },
    //         cy: function(d){ return config.scaleY(d.y) },
    //         r: 2
    //     })
    //     shapes.exit().remove()

    //     return {}
    // }

    // var axisXFormatter = function(_config){
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

    // var eventCatchingLayer = function(_config){
    //     // var config = {
    //     //     panel: null,
    //     //     chartWidth: null,
    //     //     chartHeight: null,
    //     // }

    //     var eventPanelContainer = config.panel
    //         .selectAll('g.event-panel-container')
    //         .data([0])
    //     eventPanelContainer.enter().append('g')
    //         .attr({
    //             'class': 'event-panel-container'
    //         })
    //         .append('rect')
    //         .attr({
    //             'class': 'event-panel'
    //         })
    //     eventPanelContainer.exit().remove()

    //     var eventPanel = eventPanelContainer.select('.event-panel')
    //         .attr({
    //             width: config.chartWidth,
    //             height: config.chartHeight
    //         })
    //         .style({
    //             visibility: 'hidden',
    //             'pointer-events': 'all'
    //         })

    //     return {eventPanel: eventPanel}
    // }

    // var tooltipComponent = function(_config){
    //     // var config = {
    //     //     panel: null,
    //     //     dataConverted: null,
    //     //     scaleX: null,
    //     //     scaleY: null,
    //     //     eventPanel: null,
    //     //     chartWidth: null,
    //     //     chartHeight: null,
    //     //     axisXFormat: null
    //     // }

    //     var newConfig = eventCatchingLayer(config)
    //     dh.utils.override(config, newConfig)

    //     var dataConvertedX = config.dataConverted.map(function(d){ return d.x })
    //     var deltaX = config.scaleX(dataConvertedX[1]) - config.scaleX(dataConvertedX[0])

    //     var tooltipGroup = config.panel
    //         .selectAll('g.tooltip-container')
    //         .data([0])
    //     tooltipGroup.enter().append('g')
    //         .attr({
    //             'class': 'tooltip-container',
    //             'pointer-events': 'none'
    //         })
    //         .style({visibility: 'hidden'})
    //         .append('circle')
    //         .attr({
    //             'class': 'tooltip-circle',
    //             r: 3
    //         })
    //     tooltipGroup.exit().remove()

    //     var valueGroup = config.panel
    //         .selectAll('g.value-container')
    //         .data([0])
    //     valueGroup.enter().append('g')
    //         .attr({
    //             'class': 'value-container',
    //             'pointer-events': 'none'
    //         })
    //         .style({visibility: 'hidden'})
    //         .append('text')
    //         .attr({
    //             'class': 'value-label',
    //             dy: -4
    //         })
    //     valueGroup.exit().remove()

    //     var dateGroup = config.panel
    //         .selectAll('g.date-container')
    //         .data([0])
    //     dateGroup.enter().append('g')
    //         .attr({
    //             'class': 'date-container',
    //             'pointer-events': 'none'
    //         })
    //         .style({visibility: 'hidden'})
    //         .append('text')
    //         .attr({
    //             'class': 'date-label',
    //             'text-anchor': 'end',
    //             dy: -4,
    //             dx: -4
    //         })
    //     dateGroup.attr({transform: 'translate(' + [config.chartWidth, config.chartHeight] + ')'})
    //     dateGroup.exit().remove()

    //     var lineGroup = config.panel
    //         .selectAll('g.line-container')
    //         .data([0])
    //     lineGroup.enter().append('g')
    //         .attr({
    //             'class': 'line-container',
    //             'pointer-events': 'none'
    //         })
    //         .style({visibility: 'hidden'})
    //         .append('line')
    //         .attr({
    //             'class': 'tooltip-line'
    //         })
    //     lineGroup.exit().remove()

    //     var valueLabel = valueGroup.select('.value-label')
    //     var dateLabel = dateGroup.select('.date-label')
    //     var tooltipCircle = tooltipGroup.select('.tooltip-circle')
    //     var tooltipLine = lineGroup.select('.tooltip-line')

    //     config.eventPanel
    //         .on('mouseenter', function(d){
    //             tooltipGroup.style({visibility: 'visible'})
    //             valueGroup.style({visibility: 'visible'})
    //             dateGroup.style({visibility: 'visible'})
    //             tooltipLine.style({visibility: 'visible'})
    //         })
    //         .on('mouseout', function(d){
    //             tooltipGroup.style({visibility: 'hidden'})
    //             valueGroup.style({visibility: 'hidden'})
    //             dateGroup.style({visibility: 'hidden'})
    //             tooltipLine.style({visibility: 'hidden'})
    //         })
    //         .on('mousemove', function(d){
    //             var mouse = d3.mouse(this)
    //             var dateAtCursor = config.scaleX.invert(mouse[0] - deltaX / 2)
    //             var dataPointIndexAtCursor = d3.bisectLeft(dataConvertedX, dateAtCursor)
    //             var dataPointAtCursor = config.dataConverted[dataPointIndexAtCursor]
    //             if(dataPointAtCursor){
    //                 var date = dataPointAtCursor.x
    //                 var value = dataPointAtCursor.y
    //                 var x = config.scaleX(date)
    //                 var y = config.scaleY(value)
    //                 tooltipGroup.attr({transform: 'translate(' + [x, y] + ')'})
    //                 valueGroup.attr({transform: 'translate(' + [0, y] + ')'})
    //                 valueLabel.text(d3.format('.2s')(value))
    //                 dateLabel.text(d3.time.format('%H:%M:%S')(date))
    //                 tooltipLine.attr({
    //                     x1: 0,
    //                     y1: y,
    //                     x2: x,
    //                     y2: y
    //                 })
    //             }
    //     })

    //     return {}
    // }

    var lineChart = dh.utils.pipeline(
        template
        // data,
        // scaleX,
        // scaleY,
        // axisX,
        // axisY,
        // panelComponent,
        // axisComponentX,
        // axisTitleComponentY,
        // areaShapes,
        // axisComponentY,
        // tooltipComponent
    )

    var weatherChart = function(config) {
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
            chartCache = lineChart(configCache)
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

    dh.weatherChart = weatherChart

}(datahub, root.d3))