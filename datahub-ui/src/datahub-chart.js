(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, 
            require('d3'), 
            require('./datahub-utils.js').utils, 
            require('./datahub-common.js').chart
        )
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils, root.datahub.common)
    }
}(this, function(exports, d3, utils, common) {

    /*
        TODO:
        -integrate into powerboard
        -stacked area chart
        -retained mode?
        -verify scale stack vs bar
        -chart resize
        -legend
        -legend interaction
        -line with second scale (how to match with the rest? as multiple?)
        -generator with min/max, randow walk step
    */

    var dataAdapter = function(config) {
        return {
            dataIsEmpty: !config.data || !config.data.timestamp.length,
            data: config.data || {
                barData: [],
                timestamp: [],
                stackedData: [],
                lineData: [],
                referenceData: [],
                estimatedData: [],
                thresholdData: [],
                areaData: []
            }
        }
    }

    var printer = function(config){
        console.warn(config);
    }

    var scaleX = function(config) {
        var chartWidth = config.width - config.margin.left - config.margin.right
        var dataX = config.dataIsEmpty ? 0 : config.data.timestamp
        var scaleX = d3.scaleBand().domain(dataX).rangeRound([0, chartWidth])
            .paddingInner(0.4).paddingOuter(0.2)

        var referenceScaleX = scaleX.copy().paddingInner(0.1).paddingOuter(0)
        var stripeScaleX = scaleX.copy().paddingInner(0).paddingOuter(0)
        var lineScaleX = scaleX.copy().paddingInner(1).paddingOuter(0.5)

        return {
            scaleX: scaleX,
            referenceScaleX: referenceScaleX,
            stripeScaleX: stripeScaleX,
            lineScaleX: lineScaleX,
            chartWidth: chartWidth
        }
    }

    var scaleY = function(config) {
        var chartHeight = config.height - config.margin.top - config.margin.bottom

        var maxs = []
        if(config.data.barData) {
            maxs.push(d3.max(config.data.barData.map(function(d){ return d.value })))
        }
        if(config.data.referenceData) {
            maxs.push(d3.max(config.data.referenceData.map(function(d, i){ return d.value })))
        }
        if(config.data.estimatedData) {
            maxs.push(d3.max(config.data.estimatedData.map(function(d, i){ return d.value })))
        }
        if(config.data.thresholdData) {
            maxs.push(d3.max(config.data.thresholdData.map(function(d, i){ return d.value })))
        }
        if(config.data.areaData) {
            maxs.push(d3.max(config.data.areaData.map(function(d, i){ return d.value })))
        }
        if(config.data.lineData && config.data.lineData.length) {
            var data = config.data.lineData.map(function(d, i){ return d.value })
            if(data[0].length) {
                data = d3.merge(data)
            }
            maxs.push(d3.max(data))
        }
        if(config.data.stackedData && config.data.stackedData.length) {
            var sums = config.data.stackedData.map(function(d) {
                return d3.sum(d.value)
            })
            maxs.push(d3.max(sums))
        }
        var max = d3.max(maxs)

        var scaleY = d3.scaleLinear().domain([0, max]).range([chartHeight, 0])

        return {
            scaleY: scaleY,
            chartHeight: chartHeight
        }
    }

    var stackedBarShapes = function(config) {
        if(!config.data.stackedData || !config.data.stackedData.length) {
            return {}
        }
        var keys = config.data.stackedData[0].value.map(function(d, i) {
            return 'y' + i
        })

        var data = []
        config.data.stackedData.forEach(function(d, i) {
            var datum = {x: d.timestamp}
            if(d.value && d.value.length) {
                d.value.forEach(function(dB, iB) {
                    datum['y' + iB] = dB
                })
                data.push(datum)
            }
        })

        var stackedBar = config.shapePanel.selectAll('g.stack')
            .data(d3.stack().keys(keys)(data))
        var bar = stackedBar.enter().append('g')
            .attr('class', 'stack')
            .merge(stackedBar)
            .selectAll('rect.stacked-bar')
            .data(function(d, i) {
                d.forEach(function(dB){
                    dB.index = d.index
                })
                return d
            })
        bar.enter().append('rect')
            .merge(bar)
            .attr('class', function(d){
                return 'stacked-bar layer' + d.index
            })
            .attr('x', function(d) {
                return config.scaleX(d.data.x)
            })
            .attr('y', function(d) {
                return config.scaleY(d[1])
            })
            .attr('height', function(d) {
                return config.scaleY(d[0]) - config.scaleY(d[1])
            })
            .attr('width', config.scaleX.bandwidth())
        bar.exit().remove()
        stackedBar.exit().remove()

        return {}
    }

    var barShapes = function(config) {
        var shapes = config.shapePanel.selectAll('rect.bar')
            .data(config.data.barData)
        shapes.enter().append('rect')
            .attr('class', 'bar')
            .merge(shapes)
            .attr('x', function(d, i) {
                return config.scaleX(d.timestamp) || 0
            })
            .attr('y', function(d) {
                return (config.scaleY(d.value) || 0)
            })
            .attr('width', function(d) {
                return config.scaleX.bandwidth()
            })
            .attr('height', function(d) {
                return config.chartHeight - config.scaleY(d.value) || 0
            })
        shapes.exit().remove()

        return {}
    }

    var futureShapes = function(config) {
        var shapes = config.shapePanel.selectAll('rect.future-bar')
            .data(config.data.estimatedData)
        shapes.enter().append('rect')
            .attr('class', 'future-bar')
            .merge(shapes)
            .attr('x', function(d, i) {
                return config.scaleX(d.timestamp) || 0
            })
            .attr('y', function(d) {
                return (config.scaleY(d.value) || 0)
            })
            .attr('width', function(d) {
                return config.scaleX.bandwidth()
            })
            .attr('height', function(d) {
                return config.chartHeight - config.scaleY(d.value) || 0
            })
        shapes.exit().remove()

        return {}
    }

    var stripes = function(config) {
        var timestamps = config.data.timestamp
            .filter(function(d, i){ return i%2 })
        var shapes = config.container.selectAll('rect.stripe')
            .data(timestamps)
        shapes.enter().append('rect')
            .attr('class', 'stripe')
            .merge(shapes)
            .attr('x', function(d, i) {
                return config.stripeScaleX(d) || 0
            })
            .attr('y', function(d) {
                return 0
            })
            .attr('width', function(d) {
                return config.stripeScaleX.bandwidth()
            })
            .attr('height', function(d) {
                return config.chartHeight
            })
        shapes.exit().remove()

        return {}
    }

    var referenceBarShapes = function(config) {
        if(!config.data.referenceData) {
            return {}
        }
        var shapes = config.shapePanel.selectAll('rect.reference-bar')
            .data(config.data.referenceData)
        shapes.enter().append('rect')
            .attr('class', 'reference-bar')
            .merge(shapes)
            .attr('x', function(d, i) {
                return config.referenceScaleX(d.timestamp) || 0
            })
            .attr('y', function(d) {
                return (config.scaleY(d.value) || 0)
            })
            .attr('width', function(d) {
                return config.referenceScaleX.bandwidth()
            })
            .attr('height', function(d) {
                return config.chartHeight - config.scaleY(d.value) || 0
            })
        shapes.exit().remove()

        var lines = config.shapePanel.selectAll('path.reference-top')
            .data(config.data.referenceData)
        lines.enter().append('path')
            .attr('class', 'reference-top')
            .merge(lines)
            .attr('d', function(d, i) {
                var x = config.referenceScaleX(d.timestamp) || 0
                var y = config.scaleY(d.value) || 0
                var width = config.referenceScaleX.bandwidth()
                return 'M' + [[x, y], [x + width, y]]
            })
        lines.exit().remove()

        return {}
    }

    var lineShapes = function(config) {
        if(!config.data.lineData.length) {
            return {}
        }

        var line = d3.line()
            // .defined(function(d) {
            //     return d.value != null
            // })
            .x(function(d) {
                return config.lineScaleX(d.timestamp)
            })
            .y(function(d) {
                return config.scaleY(d.value)
            })

        var data = []
        var valueLength = config.data.lineData[0].value.length
        if(typeof valueLength === 'undefined') {
            data.push(config.data.lineData)
        }
        else {
            for(var i=0; i<valueLength; i++) {
                var layer = config.data.lineData.map(function(dB){
                    return {timestamp: dB.timestamp, value: dB.value[i]}
                })
                data.push(layer)
            }
        }

        var shapes = config.shapePanel.selectAll('path.line')
            .data(data)
        shapes.enter().append('path')
            .attr('class', function(d, i) {
                return 'line layer' + i
            })
            .style('fill', 'none')
            .merge(shapes)
            .attr('d', line)
        shapes.exit().remove()

        return {}
    }

    var areaShapes = function(config) {
        if(!config.data.areaData || !config.data.areaData.length) {
            return {}
        }

        var line = d3.area()
            // .defined(function(d) {
            //     return d.value != null
            // })
            .x(function(d) {
                return config.lineScaleX(d.timestamp)
            })
            .y0(config.chartHeight)
            .y1(function(d) {
                return config.scaleY(d.value)
            })

        var data = []
        var valueLength = config.data.areaData[0].value.length
        if(typeof valueLength === 'undefined') {
            data.push(config.data.areaData)
        }
        else {
            for(var i=0; i<valueLength; i++) {
                var layer = config.data.areaData.map(function(dB){
                    return {timestamp: dB.timestamp, value: dB.value[i]}
                })
                data.push(layer)
            }
        }

        var shapes = config.shapePanel.selectAll('path.area')
            .data(data)
        shapes.enter().append('path')
            .attr('class', function(d, i) {
                return 'area layer' + i
            })
            .merge(shapes)
            .attr('d', line)
        shapes.exit().remove()

        return {}
    }

    var referenceLineShape = function(config) {
        var line = config.shapePanel.selectAll('line.reference-line')
            .data(config.data.thresholdData)
        line.enter().append('line')
            .attr('class', 'reference-line')
            .merge(line)
            .attr('x1', 0)
            .attr('y1', function(d) {
                return config.scaleY(d.value) || 0
            })
            .attr('x2', config.chartWidth)
            .attr('y2', function(d) {
                return config.scaleY(d.value) || 0
            })
            .attr('display', function(d) {
                return d ? null : 'none'
            })
        line.exit().remove()

        return {}
    }

    var multi = utils.pipeline(
        common.defaultConfig,
        dataAdapter,
        scaleX,
        scaleY,
        // // chart.axesFormatAutoconfig,
        common.axisX,
        common.axisY,
        common.svgContainer,
        stripes,
        common.shapePanel,
        areaShapes,
        referenceBarShapes,
        stackedBarShapes,
        barShapes,
        futureShapes,
        lineShapes,
        referenceLineShape,
        common.axisComponentY,
        common.message,
        common.axisComponentX,
        common.axisTitleComponentX,
        // common.axisXFormatterRotate30,
        common.axisTitleComponentY,
        common.chartTitleComponent
    )

    exports.chart = {
        multi: multi
    }

}))
