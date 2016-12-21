(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils, require('./datahub-widget.js').widget)
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils, root.datahub.widget)
    }
}(this, function(exports, d3, utils, widget) {

    var numbers = function(config) {
        config.container.classed('datahub-number-group', true)

        var elements = config.container.selectAll('div.element-container')
            .data(config.elements)
        elements.enter().append('div')
            .attr('class', 'element-container')
            .merge(elements)
            .each(function(d) {
                var config = JSON.parse(JSON.stringify(d))
                config.parent = this
                widget.number(config)
            })
        elements.exit().remove()

        return {}
    }

    var numberGroup = utils.pipeline(
        widget.container,
        numbers
    )

    exports.group = {
        number: numberGroup
    }

}))
