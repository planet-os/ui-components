(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils, require('./datahub-widget.js').widget)
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils, root.datahub.widget)
    }
}(this, function(exports, d3, utils, widget) {

    var numbers = function(config) {
        var configCache = {
            titles: [],
            values: [],
            infos: []
        }

        var numberWidgets = []

        var template = '<div class="datahub-number-group"></div>'
        var parentNode = utils.appendHtmlToNode(template, config.parent)
        var parent = d3.select(parentNode)

        setTitles(config.titles)
        setValues(config.values)
        setInfos(config.infos)

        function render() {
            var data = zip()

            var elements = parent.selectAll('div.element-container')
                .data(data)
            elements.enter().append('div')
                .attr('class', 'element-container')
                .each(function(d) {
                    numberWidgets.push(widget.number({ parent: this }))
                })
                .merge(elements)
                .each(function(d, i) {
                    numberWidgets[i].setTitle(d.title)
                    numberWidgets[i].setInfo(d.info)
                    numberWidgets[i].setValue(d.value)
                })
            elements.exit().remove()
        }

        function zip() {
            var zipped = [],
                i = 0
            while (configCache.titles[i] || configCache.values[i] || configCache.infos[i]) {
                zipped[i] = {
                    title: configCache.titles[i],
                    value: configCache.values[i],
                    info: configCache.infos[i],
                }
                i++
            }
            return zipped
        }

        function setTitles(titles) {
            configCache.titles = titles || configCache.titles || []
            render()
            return this
        }

        function setValues(values) {
            configCache.values = values || configCache.values || []
            render()
            return this
        }

        function setInfos(infos) {
            configCache.infos = infos || configCache.infos || []
            render()
            return this
        }

        return {
            setTitles: setTitles,
            setValues: setValues,
            setInfos: setInfos
        }
    }

    exports.group = {
        number: numbers
    }

}))
