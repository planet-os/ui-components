(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils)
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils)
    }
}(this, function(exports, d3, utils) {

    var events = {}

    var numberGroup = function(config) {
        config.container.attr('class', 'datahub-number')

        var elements = config.container.selectAll('div')
            .data(['title', 'value', 'info'])
        elements.enter().append('div')
            .attr('class', function(d) {
                return d
            })
            .merge(elements)
            .html(function(d) {
                return config[d]
            })
            .attr('display', function(d) {
                return config[d] ? null : 'none';
            })
        elements.exit().remove()

        return {}
    }

    var numberGroup = utils.pipeline(
        container,
        table
    )


    exports.layout = {
        numberGroup
    }

}))
