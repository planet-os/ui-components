import { default as utils } from './datahub-utils.js'
import { default as palette } from './datahub-palette.js'
import d3 from 'd3'

var defaultConfig = function(config) {
    return {
        margin: config.margin || {right: 20, left: 20},
        unit: null,
        colorScale: config.colorScale || palette.equalizedSpectral
    }
}

var template = function(config) {
    var containerNode = config.parent.querySelector('.datahub-legend')
    if(!containerNode) {
        var template = '<div class="datahub-legend">' +
            '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '<g class="panel">' +
                    '<defs><linearGradient id="legend-gradient"></linearGradient></defs>' +
                    '<rect class="color-band" fill="url(#legend-gradient)" />' +
                    '<g class="axis"></g>' +
                    '<text class="unit"></text>' +
                '</g>' +
            '</svg>' +
        '</div>'

        containerNode = utils.appendHtmlToNode(template, config.parent)
    }

    var container = d3.select(containerNode)
    var width = config.width || containerNode.offsetWidth
    var height = config.height || containerNode.offsetHeight

    container.select('svg')
        .attr('width', width)
        .attr('height', height)

    var panel = container.select('.panel')
        .attr('transform', 'translate(' + config.margin.left + ',0)')

    var legendWidth = width - config.margin.left - config.margin.right

    return {
        container: container,
        width: width,
        height: height,
        legendWidth: legendWidth
    }
}

var colorScale = function(config) {
    if(!config.data) {
        return {}
    }
    var labelCount = 5

    var legendColorScale, labelValues, colors
    var colorScale = config.colorScale(config.data)
    labelValues  = colorScale.domain()
    colors = d3.range(0, labelValues.length)
    legendColorScale = config.colorScale(colors)
    
    return {
        legendColorScale: legendColorScale,
        labelValues: labelValues,
        colors: colors
    }
}

var colorBand = function(config) {
    if(!config.data) {
        return {}
    }
    var stops = config.container.select('#legend-gradient')
        .selectAll('stop')
        .data(config.colors)
    stops.enter().append('stop')
        .merge(stops)
        .attr('offset', function(d, i){ return i*(100/(config.colors.length-1)) + '%' })
        .attr('stop-color', function(d){ return config.legendColorScale(d) })
    stops.exit().remove()

    config.container.select('.color-band')
        .attr('width', config.legendWidth)
        .attr('height', config.height / 2)

    return {}
}

var axis = function(config) {
    if(!config.data) {
        return {}
    }
    var labels = config.container.select('.axis')
        .selectAll('text.tick-label')
        .data(config.labelValues)
    var labelsUpdate = labels.enter().append('text').classed('tick-label', true)
        .merge(labels)
        .attr('x', function(d, i){ return i*(config.legendWidth/(config.labelValues.length-1)) })
        .attr('y', config.height * 0.7)
        .attr('dy', '0.5em')
        .text(function(d){ return d.toPrecision(3) })
    labels.exit().remove()

    labelsUpdate.attr('dx', function(d, i){ return -(this.getBBox().width / 2) })

    var ticks = config.container.select('.axis')
        .selectAll('line.tick-line')
        .data(config.labelValues)
    var ticksUpdate = ticks.enter().append('line').classed('tick-line', true)
        .merge(ticks)
        .attr('x1', function(d, i){ return i*(config.legendWidth/(config.labelValues.length-1)) })
        .attr('y1', config.height / 2)
        .attr('x2', function(d, i){ return i*(config.legendWidth/(config.labelValues.length-1)) })
        .attr('y2', config.height * 0.55)
    ticks.exit().remove()

    ticksUpdate.attr('dx', function(d, i){ return -(this.getBBox().width / 2) })

    if(config.unit){
        config.container.select('.unit')
            .attr('y', config.height * 0.95)
            .text(config.unit)
    }

    return {}
}

var sliceDomain = function(values, sliceCount){
    var extent = d3.extent(values)
    var stepWidth = (extent[1] - extent[0]) / sliceCount
    return d3.range(sliceCount).map(function(d, i){ return extent[0] + i * stepWidth })
}

var legendPipeline = utils.pipeline(
    defaultConfig,
    template,
    colorScale,
    colorBand,
    axis
)

var colorLegend = function(config) {
    var configCache,
        chartCache,
        uid = ~~(Math.random()*10000)

    var onResize = utils.throttle(function() {
        configCache.width = configCache.parent.clientWidth
        render()
    }, 200)

    d3.select(window).on('resize.' + uid, onResize)

    var render = function() {
        chartCache = legendPipeline(configCache)
    }

    var setData = function(data) {
        var d = data ? JSON.parse(JSON.stringify(data)) : {}
        configCache = utils.mergeAll({}, configCache)
        configCache.data = d
        render()
        return this
    }

    var setConfig = function(config) {
        configCache = utils.mergeAll(configCache, config)
        render()
        return this
    }

    var init = function(config) {
        setConfig(utils.mergeAll({}, config))
    }

    var destroy = function() {
        d3.select(window).on('resize.' + uid, null)
        configCache.parent.innerHTML = null
    }

    init(config)

    return {
        setConfig: setConfig,
        render: render,
        setData: setData,
        destroy: destroy
    }
}

export default colorLegend