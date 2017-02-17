var expect = chai.expect;

describe('Table chart', function() {
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

    it('should render a table chart with minimum requirements', function() {
        chart = datahub.tableChart({
            parent: container
        })

        var tableContainer = container.querySelector('.table-container')
        var chartContainer = container.querySelector('.chart-container')

        expect(tableContainer).to.exist
        expect(chartContainer).to.exist
    })

    it('should render a table chart with data and all options', function() {
        chart = datahub.tableChart({
            parent: container
        })

        chart.setConfig({
            header: [
                {key: 'name', label: 'Name'},
                {key: 'actual', label: ['Actual', '2nd']}
            ],
            elements: [
                [
                    {key: 'name', value: 'Spain', label: 'Spain' },
                    {key: 'actual', value: -20, label: -20 }
                ],
                [
                    {key: 'name', value: 'germany', label: 'Germany' },
                    {key: 'actual', value: 10, label: 10 }
                ]
            ],
            valueKey: 'actual',
            referenceKey: 'actual',
            domain: [-40, 160],
            sortFunc: function(a, b) {
                return a - b
            }
        })

        var tableContainer = container.querySelector('.table-container')
        var chartContainer = container.querySelector('.chart-container')

        var header = tableContainer.querySelectorAll('.header .column')
        var bars = chartContainer.querySelectorAll('.content .bars .bar-group')

        expect(header).to.have.lengthOf(2)
        expect(bars).to.have.lengthOf(2)

    })
})