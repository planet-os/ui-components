var expect = chai.expect;

describe('Chart', function() {

    describe('Bar chart', function() {
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

        it('should initialize with a base structure with minimal configuration', function() {
            chart = datahub.chart.multi({
                parent: container
            })

            expect(container.querySelector('.datahub-chart')).to.exist
            expect(container.querySelector('.bar-group')).to.exist
            expect(container.querySelector('.area-group')).to.exist
            expect(container.querySelector('.axis.y')).to.exist
            expect(container.querySelector('.axis.x')).to.exist
        })

        it('should use sizes from config', function() {
            chart = datahub.chart.multi({
                parent: container,
                width: 400,
                height: 300
            })

            var datahubChart = container.querySelector('.datahub-chart')

            expect(datahubChart.clientWidth).to.equal(400)
            expect(datahubChart.clientHeight).to.equal(300)
        })

        it('should have stripes and bars when passed data', function() {
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
                barData: datahub.data.generateTimeSeries(12, 1, '2016-01-01', 'month', 1)
            }
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var stripes = container.querySelectorAll('.stripe-group rect')
            var bars = container.querySelectorAll('.bar-group rect.bar')

            expect(stripes.length).to.be.greaterThan(0)
            expect(bars.length).to.be.greaterThan(0)
        })

        it('should expose mousemove events', function(done) {
            var dataMulti = {
                timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
                barData: datahub.data.generateTimeSeries(12, 1, '2016-01-01', 'month', 1)
            }
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })
            .on('hover', function(d) {
                expect(d.index).to.exist
                expect(d.data).to.exist
                expect(d.timestamp).to.exist
                expect(d.event.clientX).to.equal(50)
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

        it('should start Y scale at 0 by default', function() {
            var dataMulti = {
                "timestamp":["2016-01-01T00:00:00.000Z","2016-02-01T00:00:00.000Z"],
                "barData":[{
                        "timestamp":"2016-01-01T00:00:00.000Z",
                        "value":[10]
                    },
                    {
                        "timestamp":"2016-02-01T00:00:00.000Z",
                        "value":[20]
                    }
                ]}
            
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti
            })

            var tick = container.querySelector('.axis.y .tick text')

            expect(parseFloat(tick.innerHTML)).to.equal(0)
        })

        it('can auto scale Y axis', function() {
            var dataMulti = {
                "timestamp":["2016-01-01T00:00:00.000Z","2016-02-01T00:00:00.000Z"],
                "barData":[{
                        "timestamp":"2016-01-01T00:00:00.000Z",
                        "value":[10]
                    },
                    {
                        "timestamp":"2016-02-01T00:00:00.000Z",
                        "value":[20]
                    }
                ]}
            
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti,
                autoScaleY: true
            })

            var ticks = container.querySelector('.axis.y')
                .querySelectorAll('.tick text')
            var tickLabels = Array.prototype.slice.call(ticks)
                .map(function(d) {
                    return parseFloat(d.innerHTML)
                })

            expect(tickLabels[0]).to.equal(10)
            expect(tickLabels[tickLabels.length - 1]).to.equal(20)
        })

        it('can reverse scales', function() {
            var dataMulti = {
                "timestamp":["2016-01-01T00:00:00.000Z","2016-02-01T00:00:00.000Z"],
                "barData":[{
                        "timestamp":"2016-01-01T00:00:00.000Z",
                        "value":[-10]
                    },
                    {
                        "timestamp":"2016-02-01T00:00:00.000Z",
                        "value":[-20]
                    }
                ]}
            
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti,
                reverseY: true
            })

            var ticks = container.querySelector('.axis.y')
                .querySelectorAll('.tick text')
            var tickLabels = Array.prototype.slice.call(ticks)
                .map(function(d) {
                    return parseFloat(d.innerHTML)
                })

            expect(tickLabels[0]).to.equal(0)
            expect(tickLabels[tickLabels.length - 1]).to.equal(-20)
        })

        it('can use the provided Y domain', function() {
            var dataMulti = {
                "timestamp":["2016-01-01T00:00:00.000Z","2016-02-01T00:00:00.000Z"],
                "barData":[{
                        "timestamp":"2016-01-01T00:00:00.000Z",
                        "value":[10]
                    },
                    {
                        "timestamp":"2016-02-01T00:00:00.000Z",
                        "value":[20]
                    }
                ]}
            
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti,
                domain: [0, 1000],
                axisYFormat: '.2'
            })

            var ticks = container.querySelector('.axis.y')
                .querySelectorAll('.tick text')
            var tickLabels = Array.prototype.slice.call(ticks)
                .map(function(d) {
                    return parseFloat(d.innerHTML)
                })

            expect(tickLabels[0]).to.equal(0)
            expect(tickLabels[tickLabels.length - 1]).to.equal(1000)
        })

        it('can use the provided X and Y formatters', function() {
            var dataMulti = {
                "timestamp":["2016-01-01T00:00:00.000Z","2016-02-01T00:00:00.000Z"],
                "barData":[{
                        "timestamp":"2016-01-01T00:00:00.000Z",
                        "value":[1000]
                    },
                    {
                        "timestamp":"2016-02-01T00:00:00.000Z",
                        "value":[2000]
                    }
                ]}
            
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti,
                axisYFormat: '.2s',
                axisXFormat: '%b'
            })

            var ticks = container.querySelector('.axis.y')
                .querySelectorAll('.tick text')
            var tickLabels = Array.prototype.slice.call(ticks)
                .map(function(d) {
                    return d.innerHTML
                })

            var xTicks = container.querySelector('.axis.x')
                .querySelectorAll('.tick text')
            var xTickLabels = Array.prototype.slice.call(xTicks)
                .map(function(d) {
                    return d.innerHTML
                })

            expect(tickLabels[tickLabels.length - 1]).to.equal('2.0k')
            expect(xTickLabels[0]).to.equal('Jan')
        })

        it('should render titles', function() {
            var dataMulti = {
                "timestamp":["2016-01-01T00:00:00.000Z","2016-02-01T00:00:00.000Z"],
                "barData":[{
                        "timestamp":"2016-01-01T00:00:00.000Z",
                        "value":[1000]
                    },
                    {
                        "timestamp":"2016-02-01T00:00:00.000Z",
                        "value":[2000]
                    }
                ]}
            
            chart = datahub.chart.multi({
                parent: container,
                data: dataMulti,
                axisTitleX: 'TitleX',
                axisTitleY: 'TitleY',
                chartTitle: 'ChartTitle'
            })

            var chartTitle = container.querySelector('.chart-title')
            var xAxisTitle = container.querySelector('.axis-title.x')
            var yAxisTitle = container.querySelector('.axis-title.y')

            expect(chartTitle.innerHTML).to.equal('ChartTitle')
            expect(xAxisTitle.innerHTML).to.equal('TitleX')
            expect(yAxisTitle.innerHTML).to.equal('TitleY')
        })
    })
})
