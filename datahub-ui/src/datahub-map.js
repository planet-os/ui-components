!(function (dh, d3, L) {
    var dataGridLayer = function () {

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

        api.render = function (_data) {
            var data = _data || dataCache
            dataCache = data

            if (!data) {
                return api
            }

            var mapBounds = map.getBounds()
            var pixelOrigin = map.getPixelOrigin()
            var worldBounds = map.getPixelWorldBounds()
            var mapSize = map.getSize()
            var mapSizeY = mapSize.y

            // when map is smaller than viewport
            if (map._zoom < mapSize.y / 512) {
                mapSizeY = worldBounds.max.y - worldBounds.min.y
            }

            console.log('Start rendering...')
            console.time('render')
            var lat = data.lat
            var lon = data.lon
            var values = data.values

            canvas.width = mapSize.x
            canvas.height = mapSizeY

            var ctx = canvas.getContext('2d')

            var northIndex = Math.max(dh.utils.bisectionReversed(lat, mapBounds.getNorth()) - 1, 0)
            var southIndex = Math.min(dh.utils.bisectionReversed(lat, mapBounds.getSouth()), lat.length - 1)
            var westIndex = Math.max(dh.utils.bisection(lon, mapBounds.getWest()) - 1, 0)
            var eastIndex = Math.min(dh.utils.bisection(lon, mapBounds.getEast()) + 1, lon.length - 1)

            var northWestPoint = map.latLngToContainerPoint([lat[northIndex], lon[Math.max(westIndex, 0)]])
            var northWestPointNextLon = map.latLngToContainerPoint([lat[northIndex], lon[Math.min(westIndex + 1, lon.length - 1)]])

            var w = Math.ceil(Math.max(northWestPointNextLon.x - northWestPoint.x, 1)) + 2

            var imageData = ctx.getImageData(0, 0, mapSize.x, mapSizeY)
            var buf = new ArrayBuffer(imageData.data.length)
            var buf8 = new Uint8ClampedArray(buf)
            var data = new Uint32Array(buf)

            var colorRGB, colorInt, imgDataIndex, x, y
            var point, value, latIndex, nextLatIndex, lonIndex, nextLongIndex
            for (var i = 0; i < lat.length; i++) {
                if (i < northIndex || i > southIndex) {
                    continue
                }
                latIndex = Math.max(i, 0)
                nextLatIndex = Math.min(latIndex + 1, lat.length - 1)

                var firstPointAtCurrentLat = map.latLngToContainerPoint([lat[latIndex], lon[westIndex]])
                var firstPointAtNextLat = map.latLngToContainerPoint([lat[nextLatIndex], lon[westIndex]])

                var h = Math.ceil(Math.max(firstPointAtNextLat.y - firstPointAtCurrentLat.y, 1) + 1)

                for (var j = 0; j < lon.length; j++) {
                    if (j >= westIndex && j < eastIndex) {

                        lonIndex = Math.max(j, 0)
                        point = map.latLngToContainerPoint([lat[latIndex], lon[lonIndex]])

                        if (map._zoom < mapSize.y / 512) {
                            point.y = point.y + pixelOrigin.y - map._getMapPanePos().y
                        }


                        value = values[latIndex][lonIndex]

                        if (value !== -999 && value !== null && !isNaN(value) && i % 1 === 0 && j % 1 === 0) {

                            // colorHex = colorScale(value).substring(1)
                            // colorInt = parseInt(colorHex, 16)

                            colorRGB = dh.utils.parseRGB(colorScale(value))

                            for (x = 0; x < w; x++) {
                                for (y = 0; y < h; y++) {
                                    imgDataIndex = (~~point.y + y - ~~(h / 2)) * mapSize.x + Math.min(Math.max(~~point.x + x - ~~(w / 2), 0), mapSize.x - 1)
                                    data[imgDataIndex] =
                                        (255 << 24) | // alpha
                                        (colorRGB[2] << 16) | // blue
                                        (colorRGB[1] << 8) | // green
                                        colorRGB[0] // red
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

            imageOverlay.setOpacity(0.8)

            console.timeEnd('render')

            return api
        }

        api.setColorScale = function (_colorScale) {
            colorScale = _colorScale
            return api
        }

        api.setData = function (data) {
            api.render(data)
            return api
        }

        api.addTo = function (_map) {
            map = _map

            map.on('moveend', function (d) {
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

    /**
     * An extension of rasterMap for vectors and interactive selection. See {@link #rasterMap}.
     * @namespace selectorMap
     * @name selectorMap
     * @param {object} config The initial configuration.
     * @param {object} [config.disableAutoZoom=false] Prevent the map to autozoom to vectors bbox.
     * @returns {object} A selectorMap instance.
     * @example
     * datahub.map.selectorMap({
     *     parent: document.querySelector('.map')
     * })
     */
    var selectorMap = function (config) {

        var selectionMap = rasterMap(config)
            .init()

        var events = d3.dispatch('mapCloseClick', 'rectangleDraw', 'rectangleClick', 'markerClick',
            'markerDraw', 'geojsonClick')

        var internalMap = selectionMap._getMap()
        internalMap.zoomControl.setPosition('bottomright')

        var closeControl = L.Control.extend({
            position: 'topright',
            onAdd: function (map) {
                var container = L.DomUtil.create('a', 'map-close leaflet-bar leaflet-control leaflet-control-custom')

                container.onclick = (function (e) {
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

        internalMap.on('draw:created', function (e) {
            var layer = e.layer
            removeAllPolygons()

            if (e.layerType === 'rectangle') {
                layer.addTo(drawnItems)
                    .on('click', function (e) {
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
            L.marker(latLng, {
                interactive: true
            })
                .on('click', function (e) {
                    removeAllPolygons()
                    zoomToBoundingBox()
                    events.call('markerClick', this, e)
                }, this)
                .addTo(drawnItems)

            zoomToBoundingBox()
        }

        /**
         * Remove all polygons.
         * @name removeAllPolygons
         * @memberof selectorMap
         * @instance
         */
        function removeAllPolygons() {
            drawnItems.clearLayers()
            drawControl._toolbars.draw._modes.rectangle.handler.disable()
            drawControl._toolbars.draw._modes.marker.handler.disable()
            return this
        }

        function getFeatureFromCoordinates(coords) {
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords.concat([coords[0]])]
                },
                "properties": {}
            }
        }

        function getPolyFeatureFromPoly(poly) {
            return {
                "type": "Feature",
                "geometry": {
                    "type": poly.type,
                    "coordinates": poly.coordinates
                },
                "properties": {}
            }
        }

        function addGeojson(poly, cb) {
            var geojsonLayer = L.GeoJSON.geometryToLayer(poly)
                .on('click', function (e) {
                    drawnItems.removeLayer(this)
                    if (cb) {
                        cb(this)
                    }

                    zoomToBoundingBox()
                }, this)

            geojsonLayer.addTo(drawnItems)

            return this
        }

        /**
         * Add a rectangle vector.
         * @name addRectangle
         * @memberof selectorMap
         * @instance
         */
        selectionMap.addRectangle = function (coords) {
            removeAllPolygons()

            var poly = getFeatureFromCoordinates(coords)

            addGeojson(poly, function () {
                events.call('rectangleClick', this, arguments)
            })

            zoomToBoundingBox()
            return this
        }

        /**
         * Add multiple polygons.
         * @name addPolygons
         * @param {Array.<object>} data An array of geojson.
         * @memberof selectorMap
         * @instance
         */
        selectionMap.addPolygons = function (data) {
            removeAllPolygons()

            data.forEach(function (geojson) {
                geojson[1].id = geojson[0]
                var poly = getPolyFeatureFromPoly(geojson[1])

                addGeojson(poly, function () {
                    events.call('geojsonClick', this, geojson)
                })
            })

            zoomToBoundingBox()
            return this
        }

        /**
         * Zoom to vectors bbox.
         * @name zoomToBoundingBox
         * @memberof selectorMap
         * @instance
         */
        function zoomToBoundingBox() {
            if (config.disableAutoZoom) {
                return this
            }
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

        /**
         * Events binder.
         * @function on
         * @param {string} eventName The name of the event: 'mapCloseClick', 'rectangleDraw', 'rectangleClick', 'markerClick',
         'markerDraw', 'geojsonClick'
         * @param {function} callback The callback for this event
         * @memberof selectorMap
         * @instance
         */
        selectionMap.on = dh.utils.rebind(events)

        return selectionMap
    }

    /**
     * A map with a raster layer.
     * @namespace rasterMap
     * @name rasterMap
     * @param {object} config The initial configuration.
     * @param {object} config.parent The parent DOM element.
     * @param {object} config.colorScale The colorScale to use for raster, one of datahub.palette.
     * @param {string} config.basemapName The name of the basemap: 'basemapDark', 'basemapLight'.
     * @param {boolean} config.clusterMarkers Should markers be clustered
     * @param {boolean} [config.showLabels=true] Show the map label layer.
     * @param {boolean} [config.showTooltip=true] Show tooltips when hovering raster.
     * @param {function} [config.polygonTooltipFunc] The function to format vector tooltip, has passed to L.geoJson.bindTooltip().
     * @param {function} [config.mapConfig] Overrides Leaflet map config, as passed to L.map().
     * @returns {object} A rasterMap instance.
     * @example
     * datahub.map.rasterMap({
     *     parent: document.querySelector('.map'),
     *     colorScale: datahub.palette.equalizedSpectral,
     *     showLabels: false,
     *     mapConfig: {
     *         zoomControl: false
     *     }
     * })
     * .init()
     */
    var rasterMap = function (_config) {

        var containerNode = L.DomUtil.create('div', 'datahub-map')
        var container = _config.parent.appendChild(containerNode)

        var config = {
            container: container,
            colorScale: _config.colorScale,
            clusterMarkers: _config.clusterMarkers,
            basemapName: _config.basemapName || 'basemapDark',
            imagePath: _config.imagePath || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.2/images/',
            showLabels: !(_config.showLabels === false),
            showTooltip: !(_config.showTooltip === false),
            polygonTooltipFunc: _config.polygonTooltipFunc
        }

        var mapConfig = {
            maxBounds: [
                [-90, -180],
                [90, 180]
            ],
            maxZoom: 13,
            minZoom: 1,
            scrollWheelZoom: false,
            zoomSnap: 0,
            zoomDelta: 0.5,
            attributionControl: false,
            fadeAnimation: false,
            tileLayer: {
                noWrap: true,
                continuousWorld: false
            }
        }

        dh.utils.merge(mapConfig, _config.mapConfig)

        var events = d3.dispatch('click', 'mousemove', 'mouseenter', 'mouseleave',
            'featureClick', 'featureMousEnter', 'featureMousLeave', 'markerClick')

        var states = {
            isVisible: true
        }

        var map, gridLayer, geojsonLayer, tooltipLayer, marker, gridData, cachedBBoxPolygon


        function intelligentRound(value, sigDigits) {

            var absVal = Math.abs(value);

            if (absVal === 0) {
                return 0;
            } else if (absVal < 1) {
                return Number.parseFloat(value).toPrecision(sigDigits)
            } else {
                return L.Util.formatNum(value, sigDigits);
            }
        }

        /**
         * Initialize the map.
         * @name init
         * @memberof rasterMap
         * @instance
         * @example
         * datahub.map.rasterMap({
         *     parent: document.querySelector('.map')
         * })
         * .init()
         */
        function init() {
            L.Icon.Default.imagePath = config.imagePath

            map = L.map(config.container, mapConfig)
                .on('click', function (e) { events.call('click', this, { lat: e.latlng.lat, lon: e.latlng.lng }) })
                .on('mousedown', function (e) { config.container.classList.add('grab') })
                .on('mouseup', function (e) { config.container.classList.remove('grab') })
                .on('mousemove', function (e) {
                    if (gridData) {
                        var latIndex = dh.utils.bisectionReversed(gridData.lat, e.latlng.lat)
                        var lonIndex = dh.utils.bisection(gridData.lon, e.latlng.lng)

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
                            var formattedValue = intelligentRound(value, 2);

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
                .on('mouseover', function (e) {
                    events.call('mouseenter', this, arguments)
                })
                .on('mouseout', function (e) {
                    events.call('mouseleave', this, arguments)
                })

            if (!(_config.mapConfig && _config.mapConfig.zoom)) {
                map.fitWorld()
            }

            map.createPane('labels')

            var basemaps = {}
            basemaps.basemapDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
                attribution: '©OpenStreetMap, ©CartoDB',
                tileSize: 256,
                maxZoom: 19
            })
            basemaps.basemapLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
                attribution: '©OpenStreetMap, ©CartoDB',
                tileSize: 256,
                maxZoom: 19
            })
            basemaps.labelLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
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

        /**
         * Render an image on the map.
         * @name renderImage
         * @param {object} image The url of the image to overlay, as passed to L.imageOverlay.
         * @param {object} metadata Should contains a bbox array for L.imageOverlay(image, bbox).
         * @memberof rasterMap
         * @instance
         * @example
         * datahub.map.rasterMap({
         *     parent: document.querySelector('.map')
         * })
         * .init()
         * .renderImage('https://upload.wikimedia.org/wikipedia/commons/a/af/Tux.png',
         *      {bbox: {latMin: 0, latMax: 10, lonMin: 0, lonMax: 10}})
         */
        function renderImage(image, metadata) {
            var bbox = metadata.bbox
            var imageBounds = [
                [bbox.latMax, bbox.lonMin],
                [bbox.latMin, bbox.lonMax]
            ]
            L.imageOverlay(image, imageBounds).addTo(map)

            return this
        }

        /**
         * Make the map visible.
         * @name show
         * @memberof rasterMap
         * @instance
         * @example
         * datahub.map.rasterMap({
         *     parent: document.querySelector('.map')
         * })
         * .init()
         * .show()
         */
        function show() {
            config.container.style.display = 'block'
            states.isVisible = true
            return this
        }

        /**
         * Make the map invisible.
         * @name hide
         * @memberof rasterMap
         * @instance
         * @example
         * datahub.map.rasterMap({
         *     parent: document.querySelector('.map')
         * })
         * .init()
         * .hide()
         */
        function hide() {
            config.container.style.display = 'none'
            states.isVisible = false
            return this
        }

        /**
         * Reset the size to fit the container.
         * @name resize
         * @memberof rasterMap
         * @instance
         * @example
         * datahub.map.rasterMap({
         *     parent: document.querySelector('.map')
         * })
         * .init()
         * .resize()
         */
        function resize() {
            map.invalidateSize()

            if (cachedBBoxPolygon) {
                zoomToPolygonBoundingBox(cachedBBoxPolygon)
            } else {
                map.fitWorld()
            }
            return this
        }

        /**
         * Zoom to fit a polygon.
         * @name zoomToPolygonBoundingBox
         * @param {object} polygon A valid geojson.
         * @memberof rasterMap
         * @instance
         */
        function zoomToPolygonBoundingBox(polygon) {
            var bboxGeojsonLayer = L.geoJson(polygon)
            map.fitBounds(bboxGeojsonLayer.getBounds())
            cachedBBoxPolygon = polygon

            return this
        }

        /**
         * Add a polygon.
         * @name renderPolygon
         * @param {object} polygon A valid geojson.
         * @memberof rasterMap
         * @instance
         */
        function renderPolygon(polygon) {
            var onEachFeature = function (feature, layer) {
                layer.on({
                    click: function (e) {
                        events.call('featureClick', this, {
                            id: e.target.feature.properties.id,
                            lat: e.target._latlng ? e.target._latlng.lat : e.latlng.lat,
                            lon: e.target._latlng ? e.target._latlng.lng : e.latlng.lng,
                            layer: e
                        })
                    },
                    mouseover: function (e, a, b) {
                        events.call('featureMousEnter', this, {
                            x: e.containerPoint.x,
                            y: e.containerPoint.y,
                            lat: e.latlng.lat,
                            lon: e.latlng.lng,
                            value: e.target.feature.properties.id
                        })
                    },
                    mouseout: function (e) {
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
                pointToLayer: function (feature, latlng) {
                    return new L.CircleMarker(latlng, {
                        radius: 4,
                        fillColor: '#05A5DE',
                        color: '#1E1E1E',
                        weight: 1,
                        opacity: 0.5,
                        fillOpacity: 0.4
                    })
                }
            });

            if (config.polygonTooltipFunc) {
                geojsonLayer.bindTooltip(config.polygonTooltipFunc);
            }

            if (config.clusterMarkers) {
                var markers = L.markerClusterGroup({ chunkedLoading: true, showCoverageOnHover: false });
                markers.addLayer(geojsonLayer);
                map.addLayer(markers);
            } else {
                map.addLayer(geojsonLayer);
            }

            return this
        }

        /**
         * Add a marker.
         * @name addMarker
         * @param {object} coordinates Marker coordinates.
         * @memberof rasterMap
         * @instance
         */
        function addMarker(coordinates) {
            removeMarker()

            marker = L.marker(coordinates, {
                interactive: true,
                draggable: true,
                opacity: 1
            })
                .on('click', function (e) {
                    events.call('markerClick', this, arguments)
                })
                .addTo(map)

            return this
        }

        /**
         * Remove all markers.
         * @name addMarker
         * @memberof rasterMap
         * @instance
         */
        function removeMarker() {
            if (marker) {
                marker.remove()
            }

            return this
        }

        /**
         * Render a raster layer from data.
         * @name addMarker
         * @param {object} data The grid data.
         * @memberof rasterMap
         * @instance
         */
        function renderRaster(data) {
            gridData = data
            var dataSorted = data.uniqueValues.sort(function (a, b) {
                return a - b
            })
            var colorScale = config.colorScale(dataSorted)

            gridLayer
                .setColorScale(colorScale)
                .setData(data)
            return this
        }

        /**
         * Hide all zoom controls.
         * @name hideZoomControl
         * @param {boolean=true} showIt Show the controls or not.
         * @memberof rasterMap
         * @instance
         */
        function hideZoomControl(showIt) {
            if (showIt) {
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

        /**
         * Show a preset vector world map.
         * @name renderVectorMap
         * @memberof rasterMap
         * @instance
         */
        function renderVectorMap() {
            datahub.data.getWorldVector(function (geojson) {
                renderPolygon(geojson)
            })

            return this
        }

        /**
         * Events binder.
         * @function on
         * @param {string} eventName The name of the event: 'click', 'mousemove', 'mouseenter', 'mouseleave',
         'featureClick', 'featureMousEnter', 'featureMousLeave', 'markerClick'
         * @param {function} callback The callback for this event
         * @memberof rasterMap
         * @instance
         * @example
         * datahub.map.rasterMap({
         *     parent: document.querySelector('.map')
         * })
         * .init()
         * .on('markerClick', function(e) {
         *     console.log(e)
         * })
         */
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
            renderVectorMap: renderVectorMap,
            isVisible: states.isVisible,
            hideZoomControl: hideZoomControl,
            on: dh.utils.rebind(events),
            _getMap: function () {
                return map
            }
        }
    }

    dh.map = {
        rasterMap: rasterMap,
        selectorMap: selectorMap
    }
}(datahub, root.d3, root.leaflet))
