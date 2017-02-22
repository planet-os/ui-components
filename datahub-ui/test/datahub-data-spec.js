var expect = chai.expect;

describe('Data', function() {

    it('should generate valid data with default config', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(),
            barData: datahub.data.generateTimeSeries()
        }

        expect(dataMulti.timestamp.length).to.equal(12)
        expect(dataMulti.barData.length).to.equal(12)
        expect(dataMulti.barData[0].timestamp).to.exist
        expect(dataMulti.barData[0].value).to.be.instanceof(Array)
    })

    it('should generate the right number of data points', function() {
        var pointCount = 2
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps({count: pointCount}),
            barData: datahub.data.generateTimeSeries({count: pointCount})
        }

        expect(dataMulti.timestamp.length).to.equal(pointCount)
        expect(dataMulti.barData.length).to.equal(pointCount)
    })

    it('should generate dates as iso strings', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps()
        }

        expect(dataMulti.timestamp[0]).to.equal('2016-01-01T00:00:00.000Z')
    })

    it('should generate optional ids and classNames', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(),
            barData: datahub.data.generateTimeSeries()
        }

        expect(dataMulti.barData[0].id).to.be.instanceof(Array)
        expect(dataMulti.barData[0].className).to.be.instanceof(Array)
    })

    it('can change resolution and increment', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps({count: 2, step: 2, timeIncrement: 'hour'}),
            barData: datahub.data.generateTimeSeries({count: 2, step: 2, timeIncrement: 'hour'})
        }

        var delta = new Date(dataMulti.timestamp[1]).getTime() - new Date(dataMulti.timestamp[0]).getTime()
        var hourInMillis = 1000*60*60
        var deltaHour = delta/hourInMillis
        expect(deltaHour).to.equal(2)
    })

    it('should generate data between min and max', function() {
        var min = 1000
        var max = 10000
        var data = datahub.data.generateTimeSeries({count: 10, min: min, max: max})
        var values = data.map(function(d) {
            return d.value[0]
        })

        expect(d3.min(values)).to.be.at.least(min)
        expect(d3.max(values)).to.be.at.most(max)
    })

    it('should include start date', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(),
            barData: datahub.data.generateTimeSeries()
        }

        expect(dataMulti.timestamp[0]).to.equal('2016-01-01T00:00:00.000Z')
        expect(dataMulti.timestamp[0]).to.equal(dataMulti.barData[0].timestamp)
        expect(dataMulti.timestamp.length).to.equal(12)
    })

    it('should generate multiple layers when needed', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(),
            stackedBarData: datahub.data.generateTimeSeries({count: 12, layerCount: 4})
        }

        expect(dataMulti.stackedBarData[0].value).to.be.instanceof(Array)
        expect(dataMulti.stackedBarData[0].value.length).to.equal(4)
    })
})
