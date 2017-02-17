var expect = chai.expect;

describe('Waterfall chart', function() {
    var container, chart;

    beforeEach(function() {
        container = document.createElement('div')
        container.id = 'datahub'
        document.body.appendChild(container);
    })

    afterEach(function() {
        document.body.removeChild(container)
        // chart.destroy()
    })

    it('should render a waterfall chart with minimum requirements', function() {
        chart = datahub.waterfallChart({
            parent: container
        })

        var chartContainer = container.querySelector('.chart-container')
        var numberContainer = container.querySelector('.number-container')

        expect(chartContainer).to.exist
        expect(numberContainer).to.exist
    })

    it('should render a waterfall chart with data and all options', function() {
        chart = datahub.waterfallChart({
            parent: container
        })

        chart.setConfig({
                elements:[
                {key: 'initial', label: 'Initial', value: 53},
                {key: 'closed', label: 'Closed', value: -30},
                {key: 'open', label: 'Open', value: 23},
                {key: 'new', label: 'New', value: 15},
                {key: 'total', label: 'Total', value: 38}
            ]
        })

        var chartContainer = container.querySelector('.chart-container')
        var numberContainer = container.querySelector('.number-container')

        var bars = chartContainer.querySelectorAll('.bars .bar')
        var connectors = chartContainer.querySelectorAll('.connectors .connector')
        var numbers = numberContainer.querySelectorAll('.number')

        expect(bars).to.have.lengthOf(5)
        expect(connectors).to.have.lengthOf(5)
        expect(numbers).to.have.lengthOf(5)
    })
})