var expect = chai.expect;

describe('Chart', function() {

    describe('Bar chart', function() {
        var container;

        beforeEach(function() {
            container = document.createElement('div')
            container.id = 'datahub'
            document.body.appendChild(container);
        })

        afterEach(function() {
            document.body.removeChild(container)
        })

        it('should initialize with a base structure with minimal configuration', function() {
            datahub.chart.multi({
                parent: container
            })

            expect(container.querySelector('.datahub-chart')).to.exist
            expect(container.querySelector('.bar-group')).to.exist
            expect(container.querySelector('.area-group')).to.exist
            expect(container.querySelector('.axis.y')).to.exist
            expect(container.querySelector('.axis.x')).to.exist
        })

        it('should use sizes from config', function() {
            datahub.chart.multi({
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
            datahub.chart.multi({
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
            datahub.chart.multi({
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
    })
})
