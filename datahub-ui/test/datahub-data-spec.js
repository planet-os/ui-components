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

        var delta = dataMulti.timestamp[1].getTime() - dataMulti.timestamp[0].getTime()
        var hourInMillis = 1000*60*60
        var deltaHour = delta/hourInMillis
        expect(deltaHour).to.equal(2)
    })

    it('should include start date', function() {
        var dataMulti = {
            timestamp: datahub.data.generateTimestamps(12, 1, '2016-01-01', 'month', 1),
            barData: datahub.data.generateTimeSeries(12, 1, '2016-01-01', 'month', 1)
        }

        expect(dataMulti.timestamp[0].getTime()).to.equal(new Date('2016', 0, 1).getTime())
        expect(dataMulti.timestamp[0].getTime()).to.equal(new Date(dataMulti.barData[0].timestamp).getTime())
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
