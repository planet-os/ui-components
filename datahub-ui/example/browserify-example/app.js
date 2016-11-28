var datahub = require('datahub-ui')

var rasterData = datahub.data.generateRaster()
var polygon = datahub.data.generateGeojson()

var mainMap = datahub.map.rasterMap({
        el: document.querySelector('.map'),
        colorScale: datahub.palette.equalizedSpectral,
        // colorScale: colorScales.grayscale,
        zoom: 1
    })
    .init()
    .renderRaster(rasterData)
    .addMarker([0, 0])
    .renderPolygon(polygon)
    .zoomToPolygonBoundingBox(polygon)