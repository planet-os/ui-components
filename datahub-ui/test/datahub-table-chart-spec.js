var expect = chai.expect;

describe('Vertical number chart', function() {
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

    it('should render a vertical chart with minimum requirements', function() {
        chart = datahub.verticalChart({
            parent: container
        })

        var chartContainer = container.querySelector('.chart-container')
        var numberContainer = container.querySelector('.number-container')

        expect(chartContainer).to.exist
        expect(numberContainer).to.exist
    })

    it('should render a vertical chart with data and all options', function() {
        chart = datahub.verticalChart({
            parent: container
        })

        chart.setConfig({
            title: 'Title',
            elements:[
                {key: 'approved', label: 'Approved', value: 125},
                {key: 'written', label: 'Written', value: 16},
                {key: 'remains', label: 'Remains', value: -79}
            ],
            referenceBarSize: 100,
            unit: '%'
        })

        var chartContainer = container.querySelector('.chart-container')
        var numberContainer = container.querySelector('.number-container')

        var bars = chartContainer.querySelectorAll('.bars .bar')
        var numbers = numberContainer.querySelectorAll('.number')

        expect(bars).to.have.lengthOf(3)
        expect(numbers).to.have.lengthOf(3)

    })
})