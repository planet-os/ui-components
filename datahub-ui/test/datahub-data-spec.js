var expect = chai.expect;

describe('Data', function() {

    it('should generate valid data', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
            barData: datahub.data.generateTimeSeries(12, 1, '2016-01-01', 'month', 1)
        }

        expect(dataMulti.timestamp.length).to.equal(12)
        expect(dataMulti.barData.length).to.equal(12)
        expect(dataMulti.barData[0].timestamp).to.exist
        expect(dataMulti.barData[0].value).to.be.instanceof(Array)
    })

    it('should generate the right number of data points', function() {
        var pointCount = 2
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(pointCount, 1, '2016-01-01', 'month', 1),
            barData: datahub.data.generateTimeSeries(pointCount, 1, '2016-01-01', 'month', 1)
        }

        expect(dataMulti.timestamp.length).to.equal(pointCount)
        expect(dataMulti.barData.length).to.equal(pointCount)
    })

    it('should generate dates as iso strings', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(1, 1, '2016-01-01', 'month', 1)
        }

        expect(dataMulti.timestamp[0]).to.equal('2016-01-01T00:00:00.000Z')
    })

    it('should generate optional ids and classNames', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
            barData: datahub.data.generateTimeSeries(12, 1, '2016-01-01', 'month', 1)
        }

        expect(dataMulti.barData[0].id).to.be.instanceof(Array)
        expect(dataMulti.barData[0].className).to.be.instanceof(Array)
    })

    it('can change resolution and increment', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(2, 1, '2016-01-01', 'hour', 2),
            barData: datahub.data.generateTimeSeries(2, 1, '2016-01-01', 'hour', 2)
        }

        var delta = new Date(dataMulti.timestamp[1]).getTime() - new Date(dataMulti.timestamp[0]).getTime()
        var hourInMillis = 1000*60*60
        var deltaHour = delta/hourInMillis
        expect(deltaHour).to.equal(2)
    })

    it('should include start date', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
            barData: datahub.data.generateTimeSeries(12, 1, '2016-01-01', 'month', 1)
        }

        expect(dataMulti.timestamp[0]).to.equal('2016-01-01T00:00:00.000Z')
        expect(dataMulti.timestamp[0]).to.equal(dataMulti.barData[0].timestamp)
        expect(dataMulti.timestamp.length).to.equal(12)
    })

    it('should generate multiple layers when needed', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
            stackedBarData: datahub.data.generateTimeSeries(12, 4, '2016-01-01', 'month', 1)
        }

        expect(dataMulti.stackedBarData[0].value).to.be.instanceof(Array)
        expect(dataMulti.stackedBarData[0].value.length).to.equal(4)
    })
})
