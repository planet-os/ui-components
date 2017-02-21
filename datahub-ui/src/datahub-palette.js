(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('d3-scale-chromatic'))
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.d3)
    }
}(this, function(exports, d3, colorBrewer) {

    var brewerSpectral = colorBrewer.schemeSpectral[11].reverse()

    var getQuantiles = function(values, levelCount) {
        var quantiles = d3.scaleQuantile().domain(values).range(d3.range(levelCount - 1)).quantiles()
        quantiles.push(d3.max(values))
        quantiles.unshift(d3.min(values))
        return quantiles
    }

    var equalize = function(values, colorList) {
        var quantiles = getQuantiles(values, colorList.length)
        return d3.scaleLinear().domain(quantiles).range(colorList)
    }

    var slicePalette = function(palette, _sliceCount) {
        var sliceCount = _sliceCount || palette.length
        var paletteScale = d3.scaleLinear().domain([0, sliceCount - 1]).range(palette)
        return d3.range(sliceCount).map(paletteScale)
    }

    var colorScales = {
        grayscale: function(values) {
            return d3.scaleLinear().domain(d3.extent(values)).range(['white', 'black'])
        },
        equalizedSpectral: function(values) {
            return equalize(values, brewerSpectral)
        },
        equalizedGrayscale: function(values) {
            return equalize(values, slicePalette(['white', 'black'], 10))
        }
    }

    exports.palette = colorScales

}))
