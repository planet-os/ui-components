(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils);
    } else {
        root.colorScales = factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils);
    }
}(this, function(exports, d3, utils) {

    var generateGeojson = function() {

        return {
            "type": "Feature",
            "properties": {
                "name": "",
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-170, 80],
                    [170, 80],
                    [170, -80],
                    [-170, -80],
                    [-170, 80]
                ]
            }
        }
    }

    var generateRaster = function() {
        var rasterData = {
            lon: d3.range(360).map(function(d, i) {
                return i - 180
            }),
            lat: d3.range(180).map(function(d, i) {
                return 180 - i - 90
            }),
            values: d3.range(180).map(function(d, i) {
                return d3.range(360).map(function(dB, iB) {
                    return ~~(Math.random() * 100)
                })
            })
        }
        rasterData.uniqueValues = utils.flattenAndUniquify(rasterData.values).uniques

        return rasterData
    }

    exports.data = {
        generateRaster: generateRaster,
        generateGeojson: generateGeojson
    }

}));
