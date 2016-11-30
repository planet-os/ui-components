(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports, require('d3'), require('./datahub-utils.js').utils)
    } else {
        factory((root.datahub = root.datahub || {}), root.d3, root.datahub.utils)
    }
}(this, function(exports, d3, utils) {

    var apiConfig = {
        currentBaseURI: 'http://data.planetos.com/',
        baseURI: 'http://api.planetos.com/v1a/',
        datasetsEndpoint: 'http://api.planetos.com/v1/datasets/',
        apiKey: '0f58fe2540fa4cf19a4aa68f290fd148'
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

    var getDatasetDetails = function(datasetName, cb) {
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

            json.uniqueValues = utils.flattenAndUniquify(json.values).uniques.sort()
            var datahubLink = apiConfig.currentBaseURI + '/datasets/' + datasetName + '?variable=' + variableName

            cb({ json: json, uri: uri, datahubLink: datahubLink })
        })

        return this
    }

    var getStations = function getStations(datasetName, cb) {
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
        getDatasetDetails: getDatasetDetails,
        getVariables: getVariables,
        getTimestamps: getTimestamps,
        getPreview: getPreview,
        getStations: getStations,
        getStationVariables: getStationVariables,
        getImage: getImage,
        getJSON: getJSON,
        apiConfig: apiConfig
    }

}))
