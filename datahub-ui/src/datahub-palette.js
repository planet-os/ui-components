!(function(dh, d3, colorBrewer) {
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

    var sliceDomain = function(values, sliceCount){
        var stepWidth = (d3.max(values) - d3.min(values)) / sliceCount;
        return d3.range(sliceCount).map(function(d, i){ return d3.min(values) + i * stepWidth; });
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
        },
        reversedBrewerSpectral: function(values){
            if(d3.min(values) >= 0){
                return d3.scaleLinear().domain(sliceDomain(values, brewerSpectral.length)).range(brewerSpectral.slice().reverse());
            }
            var negative = sliceDomain(values.filter(function(d){ return d<=0; }), brewerSpectral.length / 2 - 1);
            var positive = sliceDomain(values.filter(function(d){ return d>0; }), brewerSpectral.length / 2 - 1);
            var domainValues = negative.concat([0]).concat(positive);
            var colorScale = brewerSpectral.slice().reverse();
            return d3.scaleLinear().domain(domainValues).range(colorScale);
        }
    }

    dh.palette = colorScales
}(datahub, root.d3, root.colorBrewer))