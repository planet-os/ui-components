(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils, require('./datahub-widget.js'))
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils, root.datahub.widget)
    }
}(this, function(exports, d3, utils, widget) {

    var events = {}

    var numbers = function(config) {
        config.container.attr('class', 'datahub-number-group')



        var elements = config.container.selectAll('div')
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


    exports.layout = {
        numberGroup: numberGroup
    }

}))
