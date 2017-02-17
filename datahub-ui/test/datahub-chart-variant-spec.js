var expect = chai.expect;

describe('Chart variants', function() {

    describe('Stacked Bar chart', function() {
        var container, chart;

        beforeEach(function() {
            container = document.createElement('div')
            container.id = 'datahub'
            document.body.appendChild(container);
        })

        afterEach(function() {
            document.body.removeChild(container)
            chart.destroy()
        })

        it('should render a stacked bar chart', function() {
            var layerCount = 3
            var stackCount = 2
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(2, 1, '2016-01-01', 'month', 1),
                stackedBarData: datahub.data.generateTimeSeries(stackCount, layerCount, '2016-01-01', 'month', 1)
            }

            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var stackBars = container.querySelectorAll('.stacked-bar-group .stack')

            expect(stackBars).to.have.length.above(0)
        })

        it('should render the right number of stacks and of layers', function() {
            var layerCount = 3
            var stackCount = 2
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(2, 1, '2016-01-01', 'month', 1),
                stackedBarData: datahub.data.generateTimeSeries(stackCount, layerCount, '2016-01-01', 'month', 1)
            }

            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var stackBars = container.querySelectorAll('.stacked-bar-group .stack')
            var stacks = container.querySelector('.stacked-bar-group .stack')
                .querySelectorAll('rect')

            expect(stackBars).to.have.lengthOf(layerCount) 
            expect(stacks).to.have.lengthOf(stackCount) 
        })

        it('should provide the right data to mousemove events', function(done) {
            var layerCount = 3
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
                stackedBarData: datahub.data.generateTimeSeries(12, layerCount, '2016-01-01', 'month', 1)
            }
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })
            .on('hover', function(d) {
                expect(d.data.stackedBarData.value).to.have.lengthOf(layerCount)
                done()
            })

            var eventsPanel = container.querySelector('.event-panel')
            var event = new MouseEvent('mousemove', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: 50,
                clientY: 100
            })
            eventsPanel.dispatchEvent(event)
        })
    })

    describe('Line and area chart', function() {
        var container, chart;

        beforeEach(function() {
            container = document.createElement('div')
            container.id = 'datahub'
            document.body.appendChild(container);
        })

        afterEach(function() {
            document.body.removeChild(container)
            chart.destroy()
        })

        it('should render an area chart', function() {
            var pointCount = 12
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(pointCount, 1, '2016-01-01', 'month', 1),
                areaData: datahub.data.generateTimeSeries(pointCount, 1, '2016-01-01', 'month', 1)
            }

            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var areaPath = container.querySelector('.area-group path')

            expect(areaPath.getTotalLength()).to.be.above(0)
        })

        it('should render the right number of layers on stacked area chart', function() {
            var layerCount = 3
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(2, 1, '2016-01-01', 'month', 1),
                stackedAreaData: datahub.data.generateTimeSeries(2, layerCount, '2016-01-01', 'month', 1)
            }

            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var areaPath = container.querySelectorAll('.stacked-area-group .stacked-area')

            expect(areaPath).to.have.lengthOf(layerCount) 
        })

        it('should show gaps with dots on line chart', function() {
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
                lineData: datahub.data.generateTimeSeries(12, 3, '2016-01-01', 'month', 1)
            }

            dataMulti.lineData.forEach(function(d) {
                d.value =  d.value.map(function(dB, iB) {
                    return !!Math.round(Math.random()*3) ? dB : null
                })
            })

            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var linePath = container.querySelectorAll('.dot-group .dot')

            expect(linePath).to.have.length.above(0) 
        })
    })

    describe('Other charts', function() {
        var container, chart;

        beforeEach(function() {
            container = document.createElement('div')
            container.id = 'datahub'
            document.body.appendChild(container);
        })

        afterEach(function() {
            document.body.removeChild(container)
            chart.destroy()
        })

        it('should render various bar chart variants', function() {
            var pointCount = 12
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(pointCount, 1, '2016-01-01', 'month', 1),
                estimateData: datahub.data.generateTimeSeries(pointCount, 1, '2016-09-01', 'month', 1),
                referenceData: datahub.data.generateTimeSeries(pointCount, 1, '2016-01-01', 'month', 1)
            }

            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var reference = container.querySelectorAll('.reference-bar-group .reference-bar')
            var estimate = container.querySelectorAll('.estimate-bar-group .estimate-bar')

            expect(reference).to.have.lengthOf(pointCount)
            expect(estimate).to.have.lengthOf(pointCount)
        })

        it('should render ine chart variants', function() {
            var pointCount = 12
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(pointCount, 1, '2016-01-01', 'month', 1),
                thresholdData: datahub.data.generateTimeSeries(1, 1, '2016-01-01', 'month', 12)
            }

            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var thresholdLine = container.querySelector('.threshold-line-group .threshold-line')

            expect(thresholdLine).to.exist
        })
    })
})
