(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('./datahub-utils.js').utils, require('d3'))
    } else {
        factory((root.datahub = root.datahub || {}), root.datahub.utils, root.d3)
    }
}(this, function(exports, utils, d3) {

    var apiConfig = {
        currentBaseURI: 'https://data.planetos.com/',
        baseURI: 'https://api.planetos.com/v1a/',
        datasetsEndpoint: 'https://api.planetos.com/v1/datasets/',
        apiKey: null
    }

    var setApiKey = function(apiKey) {
        apiConfig.apiKey = apiKey

        return this
    }

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

    var generateGeojsonPoints = function() {
        var points = generateArray(50, function(d, i) {
            return {
                coordinates: [Math.random() * 360 - 180, Math.random() * 180 - 90],
                id: 'random-point-' + i
            }
        })

        return pointsToFeatures(points)
    }

    var pointsToFeatures = function(points) {

        return {
            "type": "FeatureCollection",
            "features": points.map(function(d) {
                return {
                    "type": "Feature",
                    "geometry": { "type": "Point", "coordinates": d.coordinates },
                    "properties": { id: d.id }
                }
            })
        }
    }

    var getWorldVector = function(cb) {
        var geojsonUrl = 'https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json'

        getJSON(geojsonUrl, function(error, json) {
            cb(json)
        })
    }

    var generateRaster = function() {
        var rasterData = {
            lon: generateArray(360, function(d, i) {
                return i - 180
            }),
            lat: generateArray(180, function(d, i) {
                return 180 - i - 90
            }),
            values: generateArray(180, function(d, i) {
                return generateArray(360, function(dB, iB) {
                    return ~~(Math.random() * 100)
                })
            })
        }
        rasterData.uniqueValues = utils.arrayUniques(rasterData.values)

        return rasterData
    }

    var generateArray = function(n, _generationFn) {
        var generationFn = _generationFn || function(x, i) {
            return 0
        }

        return Array.apply(null, Array(n)).map(generationFn)
    }

    var generateTimeSeries = function(n, _layerCount, _timeStart, _timeIncrement, _step) {
        var layerCount = _layerCount || 1
        var startValue = ~~(Math.random() * 100)
        var values = generateArray(n, function() {
            return generateArray(layerCount, function(d) {
                startValue += (Math.random() * 2 - 1) * 10
                startValue = Math.max(startValue, 0)
                return startValue
            })
        })

        var timestamps = generateTimestamps(n, _layerCount, _timeStart, _timeIncrement, _step)

        var merged = timestamps.map(function(d, i) {
            return {
                timestamp: d3.isoFormat(d),
                value: values[i],
                id: values[i].map(function(d) { return ~~(Math.random()*1000) }),
                className: values[i].map(function(d) { return Math.random().toString(36).substring(4, 8) })
            }
        })

        return merged
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    var generateTimestamps = function(_n, _layerCount, _timeStart, _timeIncrement, _step) {
        var timeIncrement = _timeIncrement || 'hour'
        var intervalFuncName = 'time' + capitalize(timeIncrement) || 'timeHour'
        var step = _step || 3
        var n = _n || 36
        var intervalFunc = d3[intervalFuncName]
        var intervalRangeFunc = d3[intervalFuncName + 's']
        var dateStart = _timeStart ? new Date(_timeStart) : new Date()
        var dateEnd = intervalFunc.offset(dateStart, n * step)

        return intervalRangeFunc(dateStart, dateEnd, step)
    }

    var getJSON = function(url, cb) {
        var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP')
        xhr.open('get', url, true)
        xhr.onreadystatechange = function() {
            var status
            var data
            if (xhr.readyState == 4) {
                status = xhr.status
                if (status == 200) {
                    data = JSON.parse(xhr.responseText)
                    cb(null, data)
                } else {
                    cb(status)
                }
            }
        }
        xhr.send()
    }

    function verifyApiKey(apiKey) {
        if (apiKey) {
            return true
        } else {
            throw 'You need to set an API key using `datahub.data.setApiKey(API_KEY)`. You can get yours at http://data.planetos.com/'
        }
    }

    var getDatasetDetails = function(datasetName, cb) {
        verifyApiKey(apiConfig.apiKey)
        var datasetDetailsURL = apiConfig.baseURI + '/datasets/' + datasetName + '?apikey=' + apiConfig.apiKey

        console.log('get dataset details', datasetDetailsURL)

        getJSON(datasetDetailsURL, function(error, d) {
            if (d === undefined) {
                console.log('Can not render dataset because of API error', error)
                return false
            }

            var featureType = d['FeatureType'] || 'timeseries'
            var dataType = featureType.toLowerCase().trim() === 'grid' ? 'raster' : 'timeseries'
            console.log('Data type:', dataType, d['ProductType'], d['FeatureType'], d)

            cb({ datasetInfo: d, dataType: dataType, productType: d['ProductType'] })
        })

        return this
    }

    var getVariables = function(datasetName, defaultVariable, cb) {
        verifyApiKey(apiConfig.apiKey)
        var uri = apiConfig.baseURI + '/datasets/' + datasetName + '/variables' + '?apikey=' + apiConfig.apiKey
        console.log('query variables', uri)

        getJSON(uri, function(error, json) {
            var variables = json[datasetName]
            var found
            var curatedVariable = defaultVariable
            if (curatedVariable) {
                found = variables.filter(function(d) {
                    return d.name === curatedVariable
                })[0]
            }
            var variable = found || variables[0]

            cb({ variables: variables, defaultVariable: variable })
        })

        return this
    }

    var getTimestamps = function(datasetName, variableName, cb) {
        verifyApiKey(apiConfig.apiKey)
        var uri = apiConfig.baseURI + '/datasets/' + datasetName + '/variables/' + encodeURIComponent(variableName) + '/timestamps?apikey=' + apiConfig.apiKey
        console.log('query timestamps', uri)

        getJSON(uri, function(error, json) {
            if (error) {
                console.log('Server error', error)
                return
            }
            var timestamps = json.map(function(d) {
                return new Date(parseInt(d))
            })

            cb({ timestamps: timestamps })
        })

        return this
    }

    var getPreview = function(datasetName, variableName, timestamp, cb) {
        verifyApiKey(apiConfig.apiKey)
        var uri = apiConfig.baseURI + '/datasets/' + datasetName + '/variables/' + encodeURIComponent(variableName)
        if (timestamp) {
            uri += '/timestamps/' + timestamp
        }

        uri += '/sample_data'
        uri += '?apikey=' + apiConfig.apiKey

        console.log('query dataset', uri)

        getJSON(uri, function(error, json) {
            if (error) {
                console.log('Server error', error)
                return
            }
            json.values = json.values.map(function(d, i) {
                return d.map(function(dB) {
                    if (dB === -999) {
                        return null
                    }
                    return dB
                })
            })

            json.uniqueValues = utils.arrayUniques(json.values).sort()
            var datahubLink = apiConfig.currentBaseURI + '/datasets/' + datasetName + '?variable=' + variableName

            cb({ json: json, uri: uri, datahubLink: datahubLink })
        })

        return this
    }

    var getStations = function getStations(datasetName, cb) {
        verifyApiKey(apiConfig.apiKey)
        var uri = apiConfig.datasetsEndpoint + datasetName + '/stations' + '?apikey=' + apiConfig.apiKey

        console.log('get stations', uri)

        getJSON(uri, function(error, json) {
            if (error) {
                console.log('Server error', error)
                return
            }

            var stations = []
            for (var x in json.station) {
                var station = json.station[x]
                if (station.SpatialExtent !== undefined) {
                    stations.push({
                        id: x,
                        coordinates: station.SpatialExtent.coordinates
                    })
                }
            }

            cb({ stations: stations, defaultStation: stations[0] })
        })

        return this
    }

    var getStationVariables = function(datasetName, stationID, variableName, isAscending, cb) {
        verifyApiKey(apiConfig.apiKey)
        var pointCount = 500
        var uri = apiConfig.datasetsEndpoint + datasetName + '/stations/' + stationID + '?apikey=' + apiConfig.apiKey + '&verbose=true&count=' + pointCount
        if (!isAscending) {
            uri += '&time_order=desc'
        }

        console.log('station variable', uri)

        getJSON(uri, function(error, json) {
            if (error) {
                console.log('Server error', error)
                return
            }

            console.log('Point API data', json, uri)

            var variablesMetadata = {}
            var ctx = json.metadata.contexts
            var dataVars, dataVarTmp
            for (var x in ctx) {
                dataVars = ctx[x].dataVariables
                for (var y in dataVars) {
                    dataVarTmp = dataVars[y]
                    dataVarTmp.key = y
                    variablesMetadata[y] = dataVarTmp
                }
            }

            var variablesData = {}
            json.entries.forEach(function(d) {
                for (var x in d.data) {
                    if (!variablesData[x]) {
                        variablesData[x] = { values: [], timestamps: [] }
                    }
                    variablesData[x].values.push(d.data[x])
                    variablesData[x].timestamps.push(new Date(d.axes.time))
                }
            })

            var variableList = []
            for (var key in variablesMetadata) {
                variableList.push(variablesMetadata[key])
            }

            var datahubLink = apiConfig.currentBaseURI + '/datasets/' + datasetName + '?variable=' + variableName

            cb({
                datasets: variablesData,
                variablesMetadata: variablesMetadata,
                variables: variableList,
                datahubLink: datahubLink,
                variableData: variablesData[variableName],
                variableMetadata: variablesMetadata[variableName]
            })
        })

        return this
    }

    var getImage = function(datasetName, variableName, timestamp, width, cb) {
        verifyApiKey(apiConfig.apiKey)
        var uri = apiConfig.baseURI + '/datasets/' + datasetName + '/variables/' + encodeURIComponent(variableName)
        if (timestamp) {
            uri += '/timestamps/' + timestamp
        }

        uri += '/image'
        uri += '?width=' + width + '&projection=mercator'
        uri += '&apikey=' + apiConfig.apiKey

        console.log('query image', uri)

        getJSON(uri, function(error, json) {
            cb(json.img, json.metadata)
        })

        return this
    }

    exports.data = {
        generateRaster: generateRaster,
        generateGeojson: generateGeojson,
        generateTimeSeries: generateTimeSeries,
        generateTimestamps: generateTimestamps,
        getDatasetDetails: getDatasetDetails,
        getVariables: getVariables,
        getTimestamps: getTimestamps,
        getPreview: getPreview,
        getStations: getStations,
        getStationVariables: getStationVariables,
        getImage: getImage,
        getJSON: getJSON,
        apiConfig: apiConfig,
        pointsToFeatures: pointsToFeatures,
        generateGeojsonPoints: generateGeojsonPoints,
        getWorldVector: getWorldVector,
        setApiKey: setApiKey
    }

}))
