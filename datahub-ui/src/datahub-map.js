(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('leaflet'), require('./datahub-utils.js').utils)
    } else {
        factory((root.datahub = root.datahub || {}), root.L, root.datahub.utils)
    }
}(this, function(exports, L, utils) {

    var dataGridLayer = function() {

        var colorScale = null
        var map = null
        var imageOverlay = null
        var dataCache = null
        var previousZoom = null
        var previousBounds = null

        var canvas = L.DomUtil.create('canvas', 'data-grid-layer')
        canvas.style.display = 'none'
        document.body.appendChild(canvas)

        var api = {}

        api.render = function(_data) {
            var data = _data || dataCache
            dataCache = data

            if (!data) {
                return api
            }

            var mapBounds = map.getBounds()
            var pixelOrigin = map.getPixelOrigin()
            var worldBounds = map.getPixelWorldBounds()
            var mapSize = map.getSize()
            if (pixelOrigin.y < 0) {
                mapSize.y = worldBounds.max.y - worldBounds.min.y
            }

            console.log('Start rendering...')
            console.time('render')
            var lat = data.lat
            var lon = data.lon
            var values = data.values

            canvas.width = mapSize.x
            canvas.height = mapSize.y

            var ctx = canvas.getContext('2d')

            var northIndex = Math.max(utils.bisectionReversed(lat, mapBounds.getNorth()) - 1, 0)
            var southIndex = Math.min(utils.bisectionReversed(lat, mapBounds.getSouth()) + 1, lat.length - 1)
            var westIndex = Math.max(utils.bisection(lon, mapBounds.getWest()) - 1, 0)
            var eastIndex = Math.min(utils.bisection(lon, mapBounds.getEast()) + 1, lon.length - 1)

            ctx.globalAlpha = 1

            var northWestPoint = map.latLngToContainerPoint(L.latLng(lat[northIndex], lon[Math.max(westIndex, 0)]))
            var northWestPointNextLon = map.latLngToContainerPoint(L.latLng(lat[northIndex], lon[Math.min(westIndex + 1, lon.length - 1)]))
            var nextNorthWestPointNextLat = map.latLngToContainerPoint(L.latLng(lat[northIndex + 1], lon[Math.max(westIndex, 0)]))

            var w = Math.ceil(Math.max(northWestPointNextLon.x - northWestPoint.x, 1)) + 2

            var imageData = ctx.getImageData(0, 0, mapSize.x, mapSize.y)
            var buf = new ArrayBuffer(imageData.data.length)
            var buf8 = new Uint8ClampedArray(buf)
            var data = new Uint32Array(buf)

            var colorRGB, colorInt, imgDataIndex, x, y
            var point, value, latIndex, nextLatIndex, lonIndex, nextLongIndex
            for (var i = 0; i < lat.length; i++) {
                if (i < northIndex || i >= southIndex) {
                    continue
                }
                latIndex = Math.max(i, 0)
                nextLatIndex = Math.min(latIndex + 1, lat.length - 1)

                var firstPointAtCurrentLat = map.latLngToContainerPoint(L.latLng(lat[latIndex], lon[westIndex]))
                var firstPointAtNextLat = map.latLngToContainerPoint(L.latLng(lat[nextLatIndex], lon[westIndex]))

                var h = Math.ceil(Math.max(firstPointAtNextLat.y - firstPointAtCurrentLat.y, 1) + 1)

                for (var j = 0; j < lon.length; j++) {
                    if (j >= westIndex && j < eastIndex) {

                        lonIndex = Math.max(j, 0)
                        point = map.latLngToContainerPoint(L.latLng(lat[latIndex], lon[lonIndex]))

                        if (pixelOrigin.y < 0) {
                            point.y = point.y + pixelOrigin.y
                        }

                        value = values[latIndex][lonIndex]

                        if (value !== -999 && value !== null && !isNaN(value) && i % 1 === 0 && j % 1 === 0) {

                            // colorHex = colorScale(value).substring(1)
                            // colorInt = parseInt(colorHex, 16)

                            colorRGB = utils.parseRGB(colorScale(value))

                            for (x = 0; x < w; x++) {
                                for (y = 0; y < h; y++) {
                                    imgDataIndex = (~~point.y + y - ~~(h / 2)) * mapSize.x + Math.min(Math.max(~~point.x + x - ~~(w / 2), 0), mapSize.x - 1)
                                    data[imgDataIndex] =
                                        (255 << 24) | // alpha
                                        (colorRGB[2] << 16) | // blue
                                        (colorRGB[1] << 8) | // green
                                        colorRGB[0]; // red
                                }
                            }
                        }
                    }
                }
            }

            imageData.data.set(buf8)
            ctx.putImageData(imageData, 0, 0)

            if (imageOverlay) {
                imageOverlay.removeFrom(map)
            }

            imageOverlay = L.imageOverlay(canvas.toDataURL('image/png'), mapBounds)
                .addTo(map)

            console.timeEnd('render')

            return api
        }

        api.setColorScale = function(_colorScale) {
            colorScale = _colorScale
            return api
        }

        api.setData = function(data) {
            api.render(data)
            return api
        }

        api.addTo = function(_map) {
            map = _map

            map.on('moveend', function(d) {
                // hack for removing antialisaing on img
                var imgNode = d.target._panes.overlayPane.querySelector('img')
                if (imgNode) {
                    var imgNodeStyle = imgNode.style
                    var transform3D = imgNodeStyle.transform
                    if (transform3D) {
                        var xy = transform3D.match(/\((.*)\)/)[1].split(',').slice(0, 2)
                        imgNodeStyle.transform = 'translate(' + xy + ')'
                    }
                }

                var zoom = d.target._zoom
                var hasZoomed = zoom !== previousZoom
                previousZoom = zoom

                var bounds = map.getBounds()
                var hasPanned = JSON.stringify(bounds) !== JSON.stringify(previousBounds)
                previousBounds = bounds

                if (hasZoomed || hasPanned) {
                    api.render()
                }
            })

            return api
        }

        return api
    }

    var selectorMap = function(config) {

        var selectionMap = rasterMap({
                parent: config.parent
            })
            .init()

        var events = d3.dispatch('mapCloseClick', 'rectangleDraw', 'rectangleClick', 'markerClick', 
            'markerDraw', 'geojsonClick')

        var internalMap = selectionMap._getMap()
        internalMap.zoomControl.setPosition('bottomright')

        var closeControl = L.Control.extend({
            position: 'topright',
            onAdd: function(map) {
                var container = L.DomUtil.create('a', 'map-close leaflet-bar leaflet-control leaflet-control-custom')

                container.onclick = (function(e) {
                    events.call('mapCloseClick', this, e)
                })
                return container
            }
        })
        internalMap.addControl(new closeControl())

        var drawnItems = new L.FeatureGroup()
        internalMap.addLayer(drawnItems)

        var drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems,
                edit: false,
                remove: false
            },
            draw: {
                polygon: false,
                circle: false,
                polyline: false,
                marker: {
                    icon: new L.Icon.Default(),
                    zIndexOffset: 2000,
                    repeatMode: true
                },
                rectangle: {
                    shapeOptions: {
                        fillColor: '#128DE0',
                        color: '#128DE0',
                        opacity: 0.5
                    },
                    repeatMode: true
                }
            }
        })
        internalMap.addControl(drawControl)

        internalMap.on('draw:created', function(e) {
            var layer = e.layer
            removeAllPolygons()

            var coordinates
            if (e.layerType === 'rectangle') {
                layer.addTo(drawnItems)
                    .on('click', function(e) {
                        removeAllPolygons()
                        zoomToBoundingBox()
                        events.call('rectangleClick', this, e)
                    }, this)

                events.call('rectangleDraw', this, layer.getBounds())

                zoomToBoundingBox()
            }

            if (e.layerType === 'marker') {
                var latLng = layer.getLatLng()
                addMarker(latLng)

                events.call('markerDraw', this, latLng)
            }

        }, this)

        function addMarker(latLng) {
            var marker = L.marker(latLng, {
                    interactive: true
                })
                .on('click', function(e) {
                    removeAllPolygons()
                    zoomToBoundingBox()
                    events.call('markerClick', this, e)
                }, this)
                .addTo(drawnItems)

            zoomToBoundingBox()
        }

        function removeAllPolygons() {
            drawnItems.clearLayers()
            drawControl._toolbars.draw._modes.rectangle.handler.disable()
            drawControl._toolbars.draw._modes.marker.handler.disable()
            return this
        }

        function getPolyFromCoordinates(coords) {
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords.concat([coords[0]])]
                },
                "properties": {}
            }
        }

        function addGeojson(poly, cb) {
            var geojsonLayer = L.GeoJSON.geometryToLayer(poly)
                .on('click', function(e) {
                    drawnItems.removeLayer(this)
                    if (cb) {
                        cb(this)
                    }

                    zoomToBoundingBox()
                }, this)

            geojsonLayer.addTo(drawnItems)

            return this
        }

        selectionMap.addRectangle = function(coords) {
            removeAllPolygons()

            var poly = getPolyFromCoordinates(coords)
            addGeojson(poly, function(){ 
                events.call('rectangleClick', this, arguments)
            })

            zoomToBoundingBox()
            return this
        }

        selectionMap.addPolygons = function(data) {
            removeAllPolygons()

            data.forEach(function(geojson) {
                geojson[1].id = geojson[0]
                var geojsonLayer = L.GeoJSON.geometryToLayer(geojson[1])
                    .on('click', function(e) {
                        drawnItems.removeLayer(this)
                        events.call('geojsonClick', this, geojson)

                        zoomToBoundingBox()
                    }, this)

                geojsonLayer.addTo(drawnItems)
            })

            zoomToBoundingBox()
            return this
        }

        function zoomToBoundingBox() {
            var bounds = drawnItems.getBounds()
            if (bounds._southWest) {
                internalMap.fitBounds(bounds)
            } else {
                internalMap.fitWorld()
            }
            return this
        }

        selectionMap.removeAllPolygons = removeAllPolygons
        selectionMap.zoomToBoundingBox = zoomToBoundingBox
        selectionMap.addMarker = addMarker

        return selectionMap
    }



    var rasterMap = function(_config) {

        var containerNode = L.DomUtil.create('div', 'datahub-map')
        var container = _config.parent.appendChild(containerNode)

        var config = {
            container: container,
            colorScale: _config.colorScale,
            basemapName: _config.basemapName || 'basemapDark',
            imagePath: _config.imagePath || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.2/images/',
            showLabels: !(_config.showLabels === false),
            showTooltip: !(_config.showTooltip === false)
        }

        var mapConfig = {
            maxBounds: [
                [-90, -180],
                [90, 180]
            ],
            maxZoom: 13,
            minZoom: 0,
            scrollWheelZoom: false,
            zoomSnap: 0.1,
            // zoomDelta: 1,
            attributionControl: false,
            fadeAnimation: false,
            tileLayer: {
                noWrap: true,
                continuousWorld: false
            }
        }

        utils.merge(mapConfig, _config.mapConfig)

        var events = d3.dispatch('click', 'mousemove', 'mouseenter', 'mouseleave', 
            'featureClicked', 'featureMousEnter', 'featureMousLeave', 'markerClicked')

        var states = {
            isVisible: true
        }

        var map, gridLayer, geojsonLayer, tooltipLayer, marker, gridData, cachedBBoxPolygon

        function init() {
            L.Icon.Default.imagePath = config.imagePath

            map = L.map(config.container, mapConfig)
                .on('click', function(e) { events.call('click', this, { lat: e.latlng.lat, lon: e.latlng.lng }) })
                .on('mousedown', function(e) { config.container.classList.add('grab'); })
                .on('mouseup', function(e) { config.container.classList.remove('grab'); })
                .on('mousemove', function(e) {
                    if (gridData) {
                        var latIndex = utils.bisectionReversed(gridData.lat, e.latlng.lat)
                        var lonIndex = utils.bisection(gridData.lon, e.latlng.lng)

                        // take into account that rectangles are centered around raster point
                        var previousLatIndex = Math.max(latIndex - 1, 0)
                        var deltaLat = gridData.lat[previousLatIndex] - gridData.lat[latIndex]
                        if (e.latlng.lat > gridData.lat[latIndex] + deltaLat / 2) {
                            latIndex = previousLatIndex
                        }

                        var previousLonIndex = Math.max(lonIndex - 1, 0)
                        var deltaLon = gridData.lon[lonIndex] - gridData.lon[previousLonIndex]
                        if (e.latlng.lng < gridData.lon[lonIndex] - deltaLon / 2) {
                            lonIndex = previousLonIndex
                        }

                        // check if lat-lon are in data bounds
                        var value = null
                        if (e.latlng.lat <= gridData.lat[0] && e.latlng.lat >= gridData.lat[gridData.lat.length - 1] && e.latlng.lng >= gridData.lon[0] && e.latlng.lng <= gridData.lon[gridData.lon.length - 1]) {
                            value = gridData.values[latIndex][lonIndex]
                        }

                        if (value !== null && value !== -999 && config.showTooltip) {
                            var formattedValue = L.Util.formatNum(value, 2)

                            tooltipLayer
                                .setTooltipContent(formattedValue + '')
                                .openTooltip([e.latlng.lat, e.latlng.lng])
                        } else {
                            tooltipLayer.closeTooltip()
                        }

                        events.call('mousemove', this, {
                            x: e.containerPoint.x,
                            y: e.containerPoint.y,
                            value: value,
                            lat: e.latlng.lat,
                            lon: e.latlng.lng
                        })
                    }
                })
                .on('mouseover', function(e){
                    events.call('mouseenter', this, arguments)
                })
                .on('mouseout', function(e){
                    events.call('mouseleave', this, arguments)
                })

            if (!(_config.mapConfig && _config.mapConfig.zoom)) {
                map.fitWorld()
            }

            map.createPane('labels')

            var basemaps = {}
            basemaps.basemapDark = L.tileLayer('https://api.mapbox.com/styles/v1/planetos/ciusdqjc200w12jmlg0dys640/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmV0b3MiLCJhIjoiZjZkNDE4MTE5NWNhOGYyMmZhZmNhMDQwMDg0YWMyNGUifQ.htlwo6U82iekTcpGtDR_dQ', {
                tileSize: 256,
                maxZoom: 19
            })
            basemaps.basemapLight = L.tileLayer('https://api.mapbox.com/styles/v1/planetos/civ28flwe002c2ino04a6jiqs/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmV0b3MiLCJhIjoiZjZkNDE4MTE5NWNhOGYyMmZhZmNhMDQwMDg0YWMyNGUifQ.htlwo6U82iekTcpGtDR_dQ', {
                tileSize: 256,
                maxZoom: 19
            })
            basemaps.labelLight = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                attribution: '©OpenStreetMap, ©CartoDB',
                pane: 'labels'
            })

            basemaps[config.basemapName].addTo(map)
            if (config.showLabels) {
                basemaps.labelLight.addTo(map)
            }

            gridLayer = dataGridLayer()
                .addTo(map)

            var tooltipLayer = L.featureGroup()
                .bindTooltip('')
                .addTo(map)

            return this
        }

        function renderImage(image, metadata) {
            var bbox = metadata.bbox
            var imageBounds = [
                [bbox.latMax, bbox.lonMin],
                [bbox.latMin, bbox.lonMax]
            ]
            L.imageOverlay(image, imageBounds).addTo(map)

            return this
        }

        function show() {
            config.container.style.display = 'block'
            states.isVisible = true
            return this
        }

        function hide() {
            config.container.style.display = 'none'
            states.isVisible = false
            return this
        }

        function resize() {
            map.invalidateSize()

            if (cachedBBoxPolygon) {
                zoomToPolygonBoundingBox(cachedBBoxPolygon)
            } else {
                map.fitWorld()
            }
            return this
        }

        function zoomToPolygonBoundingBox(polygon) {
            var bboxGeojsonLayer = L.geoJson(polygon)
            map.fitBounds(bboxGeojsonLayer.getBounds())
            cachedBBoxPolygon = polygon
            return this
        }

        function renderPolygon(polygon) {
            var onEachFeature = function(feature, layer) {
                layer.on({
                    click: function(e) {
                        events.call('featureClicked', this, {
                            id: e.target.feature.properties.id,
                            lat: e.target._latlng ? e.target._latlng.lat : e.latlng.lat,
                            lon: e.target._latlng ? e.target._latlng.lng : e.latlng.lng,
                            layer: e
                        })
                    },
                    mouseover: function(e, a, b) {
                        events.call('featureMousEnter', this, {
                            x: e.containerPoint.x,
                            y: e.containerPoint.y,
                            lat: e.latlng.lat,
                            lon: e.latlng.lng,
                            value: e.target.feature.properties.id
                        })
                    },
                    mouseout: function(e) {
                        events.call('featureMousLeave', this, {
                            x: e.containerPoint.x,
                            y: e.containerPoint.y,
                            lat: e.latlng.lat,
                            lon: e.latlng.lng,
                            value: e.target.feature.properties.id
                        })
                    }
                })
            }

            geojsonLayer = L.geoJson(polygon, {
                onEachFeature: onEachFeature,
                pointToLayer: function(feature, latlng) {
                    return new L.CircleMarker(latlng, {
                        radius: 4,
                        fillColor: '#05A5DE',
                        color: '#1E1E1E',
                        weight: 1,
                        opacity: 0.5,
                        fillOpacity: 0.4
                    })
                }
            }).addTo(map)

            return this
        }

        function addMarker(coordinates) {
            removeMarker()

            marker = L.marker(coordinates, {
                    interactive: true,
                    draggable: true,
                    opacity: 1
                })
                .on('click', function(e){
                    events.call('markerClicked', this, arguments)
                })
                .addTo(map)

            return this
        }

        function removeMarker() {
            if (marker) {
                marker.remove()
            }

            return this
        }

        function renderRaster(data) {
            gridData = data
            var dataSorted = data.uniqueValues.sort(function(a, b) {
                return a - b
            })
            var colorScale = config.colorScale(dataSorted)

            gridLayer
                .setColorScale(colorScale)
                .setData(data)
            return this
        }

        function hideZoomControl(bool) {
            if (bool) {
                map.addControl(map.zoomControl)
                map.doubleClickZoom.enable()
                map.boxZoom.enable()
                map.dragging.enable()
            } else {
                map.removeControl(map.zoomControl)
                map.doubleClickZoom.disable()
                map.boxZoom.disable()
                map.dragging.disable()
            }
            return this
        }

        return {
            init: init,
            show: show,
            hide: hide,
            resize: resize,
            zoomToPolygonBoundingBox: zoomToPolygonBoundingBox,
            addMarker: addMarker,
            removeMarker: removeMarker,
            renderPolygon: renderPolygon,
            renderImage: renderImage,
            renderRaster: renderRaster,
            isVisible: states.isVisible,
            hideZoomControl: hideZoomControl,
            events: events,
            _getMap: function() {
                return map
            }
        }
    }

    exports.map = {
        rasterMap: rasterMap,
        selectorMap: selectorMap
    }

}))
