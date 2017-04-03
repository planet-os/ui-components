(function(exports, global) {
    var datahub = exports = typeof exports === "object" ? exports : {};
    var root = typeof global === "object" ? global : window;
    if (typeof module === "object" && module.exports) {
        root.d3 = require("d3");
        try {
            root.colorBrewer = require("d3-scale-chromatic");
        } catch (e) {
            root.colorBrewer = null;
        }
        try {
            root.leaflet = require("leaflet");
        } catch (e) {
            root.leaflet = null;
        }
    } else {
        root.d3 = root.d3;
        root.colorBrewer = root.d3;
        root.leaflet = root.L;
    }
    !function(dh) {
        var merge = function(obj1, obj2) {
            for (var p in obj2) {
                if (obj2[p] && obj2[p].constructor == Object) {
                    if (obj1[p]) {
                        merge(obj1[p], obj2[p]);
                        continue;
                    }
                }
                obj1[p] = obj2[p];
            }
        };
        var mergeAll = function(target, varArgs) {
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
        var htmlToNode = function(htmlString, parent) {
            while (parent.lastChild) {
                parent.removeChild(parent.lastChild);
            }
            return appendHtmlToNode(htmlString, parent);
        };
        var appendHtmlToNode = function(htmlString, parent) {
            return parent.appendChild(document.importNode(new DOMParser().parseFromString(htmlString, "text/html").body.childNodes[0], true));
        };
        var once = function once(fn, context) {
            var result;
            return function() {
                if (fn) {
                    result = fn.apply(context || this, arguments);
                    fn = null;
                }
                return result;
            };
        };
        var throttle = function throttle(callback, limit) {
            var wait = false;
            var timer = null;
            return function() {
                var that = this;
                if (!wait) {
                    wait = true;
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        wait = false;
                        callback.apply(that, arguments);
                    }, limit);
                }
            };
        };
        var arrayStats = function(data, _accessor) {
            var flattened = [];
            var uniques = [];
            var values, value, i, j, min = Number.MAX_VALUE, max = Number.MIN_VALUE;
            var u = {};
            for (i = 0; i < data.length; i++) {
                values = data[i];
                for (j = 0; j < values.length; j++) {
                    value = _accessor ? _accessor(values[j]) : values[j];
                    flattened.push(value);
                    if (u.hasOwnProperty(value) || value === null) {
                        continue;
                    }
                    u[value] = 1;
                    if (value > max) {
                        max = value;
                    }
                    if (value < min) {
                        min = value;
                    }
                }
            }
            uniques = Object.keys(u).map(function(d, i) {
                return +d;
            });
            return {
                flattened: flattened,
                uniques: uniques,
                max: max,
                min: min
            };
        };
        var arrayUniques = function(data, accessor) {
            return arrayStats(data, accessor).uniques;
        };
        var arrayFlatten = function(data, accessor) {
            return arrayStats(data, accessor).flattened;
        };
        var bisection = function(array, x, isReversed) {
            var mid, low = 0, high = array.length - 1;
            while (low < high) {
                mid = low + high >> 1;
                if (isReversed && x >= array[mid] || !isReversed && x < array[mid]) {
                    high = mid;
                } else {
                    low = mid + 1;
                }
            }
            return low;
        };
        var bisectionReversed = function(array, x) {
            return bisection(array, x, true);
        };
        var findMax = function(array) {
            var max = 0, a = array.length, counter;
            for (counter = 0; counter < a; counter++) {
                if (array[counter] > max) {
                    max = array[counter];
                }
            }
            return max;
        };
        var findMin = function(array) {
            var min = Infinity, a = array.length, counter;
            for (counter = 0; counter < a; counter++) {
                if (array[counter] < min) {
                    min = array[counter];
                }
            }
            return min;
        };
        var parseRGB = function(rgb) {
            return rgb.slice(4).slice(0, -1).split(",").map(function(d, i) {
                return parseInt(d);
            });
        };
        var pipeline = function() {
            var fns = arguments;
            var that = this;
            return function(config) {
                for (var i = 0; i < fns.length; i++) {
                    var cache = fns[i].call(this, config);
                    config = that.mergeAll(config, cache);
                }
                return config;
            };
        };
        var override = function(_objA, _objB) {
            for (var x in _objB) {
                if (x in _objA) {
                    _objA[x] = _objB[x];
                }
            }
        };
        var rebind = function(target) {
            return function() {
                target.on.apply(target, arguments);
                return this;
            };
        };
        var capitalize = function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        var getExtent = function(d, isMin) {
            var func = isMin ? "min" : "max";
            if (d) {
                return d3[func](d.map(function(d) {
                    return d.value;
                }));
            }
            return null;
        };
        var getStackExtent = function(d, isMin) {
            var func = isMin ? "min" : "max";
            if (d && d.length) {
                var sums = d.map(function(d) {
                    return d3.sum(d.value);
                });
                return d3[func](sums);
            }
            return null;
        };
        var getMultiExtent = function(d, isMin) {
            var func = isMin ? "min" : "max";
            if (d && d.length) {
                var data = d.map(function(d, i) {
                    return d.value;
                });
                if (data[0].length) {
                    data = d3.merge(data);
                }
                return d3[func](data);
            }
            return null;
        };
        dh.utils = {
            merge: merge,
            mergeAll: mergeAll,
            htmlToNode: htmlToNode,
            appendHtmlToNode: appendHtmlToNode,
            once: once,
            throttle: throttle,
            arrayStats: arrayStats,
            arrayUniques: arrayUniques,
            arrayFlatten: arrayFlatten,
            bisection: bisection,
            bisectionReversed: bisectionReversed,
            findMax: findMax,
            findMin: findMin,
            parseRGB: parseRGB,
            pipeline: pipeline,
            override: override,
            rebind: rebind,
            capitalize: capitalize,
            getExtent: getExtent,
            getStackExtent: getStackExtent,
            getMultiExtent: getMultiExtent
        };
    }(datahub);
    !function(dh, d3) {
        var apiConfig = {
            currentBaseURI: "https://data.planetos.com/",
            baseURI: "https://api.planetos.com/v1a/",
            datasetsEndpoint: "https://api.planetos.com/v1/datasets/",
            apiKey: null
        };
        var setApiKey = function(apiKey) {
            apiConfig.apiKey = apiKey;
            return this;
        };
        var generateGeojson = function() {
            return {
                type: "Feature",
                properties: {
                    name: ""
                },
                geometry: {
                    type: "LineString",
                    coordinates: [ [ -170, 80 ], [ 170, 80 ], [ 170, -80 ], [ -170, -80 ], [ -170, 80 ] ]
                }
            };
        };
        var generateGeojsonPoints = function() {
            var points = generateArray(50, function(d, i) {
                return {
                    coordinates: [ Math.random() * 360 - 180, Math.random() * 180 - 90 ],
                    id: "random-point-" + i
                };
            });
            return pointsToFeatures(points);
        };
        var generateRandomString = function(len) {
            return Math.random().toString(36).substring(4, len + 4 || 8);
        };
        var pointsToFeatures = function(points) {
            return {
                type: "FeatureCollection",
                features: points.map(function(d) {
                    return {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: d.coordinates
                        },
                        properties: {
                            id: d.id
                        }
                    };
                })
            };
        };
        var getWorldVector = function(cb) {
            var geojsonUrl = "https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json";
            getJSON(geojsonUrl, function(error, json) {
                cb(json);
            });
        };
        function createDateAsUTC(date) {
            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        }
        function convertDateToUTC(date) {
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        }
        var generateRaster = function() {
            var rasterData = {
                lon: generateArray(360, function(d, i) {
                    return i - 180;
                }),
                lat: generateArray(180, function(d, i) {
                    return 180 - i - 90;
                }),
                values: generateArray(180, function(d, i) {
                    return generateArray(360, function(dB, iB) {
                        return ~~(Math.random() * 100);
                    });
                })
            };
            rasterData.uniqueValues = dh.utils.arrayUniques(rasterData.values);
            return rasterData;
        };
        var generateArray = function(n, _generationFn) {
            var generationFn = _generationFn || function(x, i) {
                return 0;
            };
            return Array.apply(null, Array(n)).map(generationFn);
        };
        var generateTimeSeries = function(_config) {
            var _config = _config || {};
            var config = {
                count: _config.count || 12,
                layerCount: _config.layerCount || 1,
                timeStart: _config.timeStart || "2016-01-01",
                timeIncrement: _config.timeIncrement || "month",
                step: _config.step || 1,
                min: _config.min || 0,
                max: _config.max || 100
            };
            var startValue = ~~(Math.random() * (config.max - config.min)) + config.min;
            var values = generateArray(config.count, function() {
                return generateArray(config.layerCount, function(d) {
                    startValue += (Math.random() * 2 - 1) * ((config.max - config.min) / 10);
                    startValue = Math.max(startValue, config.min);
                    return startValue;
                });
            });
            var timestamps = generateTimestamps(config);
            var merged = timestamps.map(function(d, i) {
                return {
                    timestamp: d,
                    value: values[i],
                    id: values[i].map(function(d) {
                        return ~~(Math.random() * 1e3);
                    }),
                    className: values[i].map(function(d) {
                        return Math.random().toString(36).substring(4, 8);
                    })
                };
            });
            return merged;
        };
        var generateTimeSeriesSplit = function(_config) {
            var _config = _config || {};
            var config = {
                count: _config.count || 12,
                layerCount: _config.layerCount || 1,
                timeStart: _config.timeStart || "2016-01-01",
                timeIncrement: _config.timeIncrement || "month",
                step: _config.step || 1,
                min: _config.min || 0,
                max: _config.max || 100
            };
            var startValue = ~~(Math.random() * (config.max - config.min)) + config.min;
            var values = generateArray(config.layerCount, function() {
                var dataset = {};
                var timestamps = generateTimestamps(config);
                dataset.data = generateArray(config.count, function(d, i) {
                    startValue += (Math.random() * 2 - 1) * ((config.max - config.min) / 10);
                    startValue = Math.max(startValue, config.min);
                    startValue = Math.min(startValue, config.max);
                    return {
                        value: startValue,
                        timestamp: timestamps[i]
                    };
                });
                dataset.metadata = {
                    id: generateRandomString(8)
                };
                return dataset;
            });
            return values;
        };
        var generateTimestamps = function(_config) {
            var _config = _config || {};
            var config = {
                count: _config.count || 12,
                layerCount: _config.layerCount || 1,
                timeStart: _config.timeStart || "2016-01-01",
                timeIncrement: _config.timeIncrement || "month",
                step: _config.step || 1,
                min: _config.min || 0,
                max: _config.max || 100
            };
            var intervalFuncName = "utc" + dh.utils.capitalize(config.timeIncrement) || "utcHour";
            var intervalFunc = d3[intervalFuncName];
            var intervalRangeFunc = d3[intervalFuncName + "s"];
            var dateStart = config.timeStart ? new Date(config.timeStart) : new Date();
            var dateEnd = intervalFunc.offset(dateStart, config.count * config.step);
            var dates = intervalRangeFunc(dateStart, dateEnd, config.step);
            var datesISOString = dates.map(function(d, i) {
                return d3.isoFormat(d);
            });
            return datesISOString;
        };
        var generateWeatherChartData = function() {
            var historicalDataConfig = {
                layerCount: 1,
                count: 10,
                timeIncrement: "minute",
                min: 0,
                max: 50
            };
            var forecastDataConfig = datahub.utils.mergeAll({}, historicalDataConfig, {
                layerCount: 1,
                count: 100,
                timeIncrement: "hour"
            });
            var generatedData = {
                historical: {
                    wind: datahub.data.generateTimeSeriesSplit(historicalDataConfig),
                    windDirection: datahub.data.generateTimeSeriesSplit(historicalDataConfig),
                    wave: datahub.data.generateTimeSeriesSplit(historicalDataConfig),
                    tide: datahub.data.generateTimeSeriesSplit(historicalDataConfig),
                    bottomAxis: datahub.data.generateTimeSeriesSplit(historicalDataConfig),
                    topAxis: datahub.data.generateTimeSeriesSplit(historicalDataConfig)
                },
                forecast: {
                    wind: datahub.data.generateTimeSeriesSplit(forecastDataConfig),
                    windDirection: datahub.data.generateTimeSeriesSplit(forecastDataConfig),
                    wave: datahub.data.generateTimeSeriesSplit(forecastDataConfig),
                    tide: datahub.data.generateTimeSeriesSplit(forecastDataConfig),
                    bottomAxis: datahub.data.generateTimeSeriesSplit(forecastDataConfig),
                    topAxis: datahub.data.generateTimeSeriesSplit(forecastDataConfig)
                }
            };
            return generatedData;
        };
        var getJSON = function(url, cb) {
            var xhr = typeof XMLHttpRequest != "undefined" ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            xhr.open("get", url, true);
            xhr.onreadystatechange = function() {
                var status;
                var data;
                if (xhr.readyState == 4) {
                    status = xhr.status;
                    if (status == 200) {
                        data = JSON.parse(xhr.responseText);
                        cb(null, data);
                    } else {
                        cb(status);
                    }
                }
            };
            xhr.send();
        };
        function verifyApiKey(apiKey) {
            if (apiKey) {
                return true;
            } else {
                throw "You need to set an API key using `datahub.data.setApiKey(API_KEY)`. You can get yours at http://data.planetos.com/";
            }
        }
        var getDatasetDetails = function(datasetName, cb) {
            verifyApiKey(apiConfig.apiKey);
            var datasetDetailsURL = apiConfig.baseURI + "/datasets/" + datasetName + "?apikey=" + apiConfig.apiKey;
            console.log("get dataset details", datasetDetailsURL);
            getJSON(datasetDetailsURL, function(error, d) {
                if (d === undefined) {
                    console.log("Can not render dataset because of API error", error);
                    return false;
                }
                var featureType = d["FeatureType"] || "timeseries";
                var dataType = featureType.toLowerCase().trim() === "grid" ? "raster" : "timeseries";
                console.log("Data type:", dataType, d["ProductType"], d["FeatureType"], d);
                cb({
                    datasetInfo: d,
                    dataType: dataType,
                    productType: d["ProductType"]
                });
            });
            return this;
        };
        var getVariables = function(datasetName, defaultVariable, cb) {
            verifyApiKey(apiConfig.apiKey);
            var uri = apiConfig.baseURI + "/datasets/" + datasetName + "/variables" + "?apikey=" + apiConfig.apiKey;
            console.log("query variables", uri);
            getJSON(uri, function(error, json) {
                var variables = json[datasetName];
                var found;
                var curatedVariable = defaultVariable;
                if (curatedVariable) {
                    found = variables.filter(function(d) {
                        return d.name === curatedVariable;
                    })[0];
                }
                var variable = found || variables[0];
                cb({
                    variables: variables,
                    defaultVariable: variable
                });
            });
            return this;
        };
        var getTimestamps = function(datasetName, variableName, cb) {
            verifyApiKey(apiConfig.apiKey);
            var uri = apiConfig.baseURI + "/datasets/" + datasetName + "/variables/" + encodeURIComponent(variableName) + "/timestamps?apikey=" + apiConfig.apiKey;
            console.log("query timestamps", uri);
            getJSON(uri, function(error, json) {
                if (error) {
                    console.log("Server error", error);
                    return;
                }
                var timestamps = json.map(function(d) {
                    return new Date(parseInt(d));
                });
                cb({
                    timestamps: timestamps
                });
            });
            return this;
        };
        var getPreview = function(datasetName, variableName, timestamp, cb) {
            verifyApiKey(apiConfig.apiKey);
            var uri = apiConfig.baseURI + "/datasets/" + datasetName + "/variables/" + encodeURIComponent(variableName);
            if (timestamp) {
                uri += "/timestamps/" + timestamp;
            }
            uri += "/sample_data";
            uri += "?apikey=" + apiConfig.apiKey;
            console.log("query dataset", uri);
            getJSON(uri, function(error, json) {
                if (error) {
                    console.log("Server error", error);
                    return;
                }
                json.values = json.values.map(function(d, i) {
                    return d.map(function(dB) {
                        if (dB === -999) {
                            return null;
                        }
                        return dB;
                    });
                });
                json.uniqueValues = dh.utils.arrayUniques(json.values).sort();
                var datahubLink = apiConfig.currentBaseURI + "/datasets/" + datasetName + "?variable=" + variableName;
                cb({
                    json: json,
                    uri: uri,
                    datahubLink: datahubLink
                });
            });
            return this;
        };
        var getStations = function getStations(datasetName, cb) {
            verifyApiKey(apiConfig.apiKey);
            var uri = apiConfig.datasetsEndpoint + datasetName + "/stations" + "?apikey=" + apiConfig.apiKey;
            console.log("get stations", uri);
            getJSON(uri, function(error, json) {
                if (error) {
                    console.log("Server error", error);
                    return;
                }
                var stations = [];
                for (var x in json.station) {
                    var station = json.station[x];
                    if (station.SpatialExtent !== undefined) {
                        stations.push({
                            id: x,
                            coordinates: station.SpatialExtent.coordinates
                        });
                    }
                }
                cb({
                    stations: stations,
                    defaultStation: stations[0]
                });
            });
            return this;
        };
        var getStationVariables = function(datasetName, stationID, variableName, isAscending, cb) {
            verifyApiKey(apiConfig.apiKey);
            var pointCount = 500;
            var uri = apiConfig.datasetsEndpoint + datasetName + "/stations/" + stationID + "?apikey=" + apiConfig.apiKey + "&verbose=true&count=" + pointCount;
            if (!isAscending) {
                uri += "&time_order=desc";
            }
            console.log("station variable", uri);
            getJSON(uri, function(error, json) {
                if (error) {
                    console.log("Server error", error);
                    return;
                }
                console.log("Point API data", json, uri);
                var variablesMetadata = {};
                var ctx = json.metadata.contexts;
                var dataVars, dataVarTmp;
                for (var x in ctx) {
                    dataVars = ctx[x].dataVariables;
                    for (var y in dataVars) {
                        dataVarTmp = dataVars[y];
                        dataVarTmp.key = y;
                        variablesMetadata[y] = dataVarTmp;
                    }
                }
                var variablesData = {};
                json.entries.forEach(function(d) {
                    for (var x in d.data) {
                        if (!variablesData[x]) {
                            variablesData[x] = {
                                values: [],
                                timestamps: []
                            };
                        }
                        variablesData[x].values.push(d.data[x]);
                        variablesData[x].timestamps.push(new Date(d.axes.time));
                    }
                });
                var variableList = [];
                for (var key in variablesMetadata) {
                    variableList.push(variablesMetadata[key]);
                }
                var datahubLink = apiConfig.currentBaseURI + "/datasets/" + datasetName + "?variable=" + variableName;
                cb({
                    datasets: variablesData,
                    variablesMetadata: variablesMetadata,
                    variables: variableList,
                    datahubLink: datahubLink,
                    variableData: variablesData[variableName],
                    variableMetadata: variablesMetadata[variableName]
                });
            });
            return this;
        };
        var getImage = function(datasetName, variableName, timestamp, width, cb) {
            verifyApiKey(apiConfig.apiKey);
            var uri = apiConfig.baseURI + "/datasets/" + datasetName + "/variables/" + encodeURIComponent(variableName);
            if (timestamp) {
                uri += "/timestamps/" + timestamp;
            }
            uri += "/image";
            uri += "?width=" + width + "&projection=mercator";
            uri += "&apikey=" + apiConfig.apiKey;
            console.log("query image", uri);
            getJSON(uri, function(error, json) {
                cb(json.img, json.metadata);
            });
            return this;
        };
        dh.data = {
            generateRaster: generateRaster,
            generateGeojson: generateGeojson,
            generateTimeSeries: generateTimeSeries,
            generateTimeSeriesSplit: generateTimeSeriesSplit,
            generateTimestamps: generateTimestamps,
            generateWeatherChartData: generateWeatherChartData,
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
        };
    }(datahub, root.d3);
    !function(dh, d3, colorBrewer) {
        var brewerSpectral = colorBrewer.schemeSpectral[11].reverse();
        var getQuantiles = function(values, levelCount) {
            var quantiles = d3.scaleQuantile().domain(values).range(d3.range(levelCount - 1)).quantiles();
            quantiles.push(d3.max(values));
            quantiles.unshift(d3.min(values));
            return quantiles;
        };
        var equalize = function(values, colorList) {
            var quantiles = getQuantiles(values, colorList.length);
            return d3.scaleLinear().domain(quantiles).range(colorList);
        };
        var slicePalette = function(palette, _sliceCount) {
            var sliceCount = _sliceCount || palette.length;
            var paletteScale = d3.scaleLinear().domain([ 0, sliceCount - 1 ]).range(palette);
            return d3.range(sliceCount).map(paletteScale);
        };
        var colorScales = {
            grayscale: function(values) {
                return d3.scaleLinear().domain(d3.extent(values)).range([ "white", "black" ]);
            },
            equalizedSpectral: function(values) {
                return equalize(values, brewerSpectral);
            },
            equalizedGrayscale: function(values) {
                return equalize(values, slicePalette([ "white", "black" ], 10));
            }
        };
        dh.palette = colorScales;
    }(datahub, root.d3, root.colorBrewer);
    !function(dh, d3) {
        var defaultConfig = function(config) {
            return {
                margin: config.margin || {
                    right: 20,
                    left: 20
                },
                unit: null,
                colorScale: config.colorScale || palette.equalizedSpectral
            };
        };
        var template = function(config) {
            var containerNode = config.parent.querySelector(".datahub-legend");
            if (!containerNode) {
                var template = '<div class="datahub-legend">' + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">' + '<g class="panel">' + '<defs><linearGradient id="legend-gradient"></linearGradient></defs>' + '<rect class="color-band" fill="url(#legend-gradient)" />' + '<g class="axis"></g>' + '<text class="unit"></text>' + "</g>" + "</svg>" + "</div>";
                containerNode = dh.utils.appendHtmlToNode(template, config.parent);
            }
            var container = d3.select(containerNode);
            var width = config.width || containerNode.offsetWidth;
            var height = config.height || containerNode.offsetHeight;
            container.select("svg").attr("width", width).attr("height", height);
            var panel = container.select(".panel").attr("transform", "translate(" + config.margin.left + ",0)");
            var legendWidth = width - config.margin.left - config.margin.right;
            return {
                container: container,
                width: width,
                height: height,
                legendWidth: legendWidth
            };
        };
        var colorScale = function(config) {
            if (!config.data) {
                return {};
            }
            var labelCount = 5;
            var legendColorScale, labelValues, colors;
            var colorScale = config.colorScale(config.data);
            labelValues = colorScale.domain();
            colors = d3.range(0, labelValues.length);
            legendColorScale = config.colorScale(colors);
            return {
                legendColorScale: legendColorScale,
                labelValues: labelValues,
                colors: colors
            };
        };
        var colorBand = function(config) {
            if (!config.data) {
                return {};
            }
            var stops = config.container.select("#legend-gradient").selectAll("stop").data(config.colors);
            stops.enter().append("stop").merge(stops).attr("offset", function(d, i) {
                return i * (100 / (config.colors.length - 1)) + "%";
            }).attr("stop-color", function(d) {
                return config.legendColorScale(d);
            });
            stops.exit().remove();
            config.container.select(".color-band").attr("width", config.legendWidth).attr("height", config.height / 2);
            return {};
        };
        var axis = function(config) {
            if (!config.data) {
                return {};
            }
            var labels = config.container.select(".axis").selectAll("text.tick-label").data(config.labelValues);
            var labelsUpdate = labels.enter().append("text").classed("tick-label", true).merge(labels).attr("x", function(d, i) {
                return i * (config.legendWidth / (config.labelValues.length - 1));
            }).attr("y", config.height * .7).attr("dy", "0.5em").text(function(d) {
                return d.toPrecision(3);
            });
            labels.exit().remove();
            labelsUpdate.attr("dx", function(d, i) {
                return -(this.getBBox().width / 2);
            });
            var ticks = config.container.select(".axis").selectAll("line.tick-line").data(config.labelValues);
            var ticksUpdate = ticks.enter().append("line").classed("tick-line", true).merge(ticks).attr("x1", function(d, i) {
                return i * (config.legendWidth / (config.labelValues.length - 1));
            }).attr("y1", config.height / 2).attr("x2", function(d, i) {
                return i * (config.legendWidth / (config.labelValues.length - 1));
            }).attr("y2", config.height * .55);
            ticks.exit().remove();
            ticksUpdate.attr("dx", function(d, i) {
                return -(this.getBBox().width / 2);
            });
            if (config.unit) {
                config.container.select(".unit").attr("y", config.height * .95).text(config.unit);
            }
            return {};
        };
        var sliceDomain = function(values, sliceCount) {
            var extent = d3.extent(values);
            var stepWidth = (extent[1] - extent[0]) / sliceCount;
            return d3.range(sliceCount).map(function(d, i) {
                return extent[0] + i * stepWidth;
            });
        };
        var legendPipeline = dh.utils.pipeline(defaultConfig, template, colorScale, colorBand, axis);
        var colorLegend = function(config) {
            var configCache, chartCache, uid = ~~(Math.random() * 1e4);
            var onResize = dh.utils.throttle(function() {
                configCache.width = configCache.parent.clientWidth;
                render();
            }, 200);
            d3.select(window).on("resize." + uid, onResize);
            var render = function() {
                chartCache = legendPipeline(configCache);
            };
            var setData = function(data) {
                var d = data ? JSON.parse(JSON.stringify(data)) : {};
                configCache = dh.utils.mergeAll({}, configCache);
                configCache.data = d;
                render();
                return this;
            };
            var setConfig = function(config) {
                configCache = dh.utils.mergeAll(configCache, config);
                render();
                return this;
            };
            var init = function(config) {
                setConfig(dh.utils.mergeAll({}, config));
            };
            var destroy = function() {
                d3.select(window).on("resize." + uid, null);
                configCache.parent.innerHTML = null;
            };
            init(config);
            return {
                setConfig: setConfig,
                render: render,
                setData: setData,
                destroy: destroy
            };
        };
        dh.colorLegend = colorLegend;
    }(datahub, root.d3);
    !function(dh, d3, L) {
        var dataGridLayer = function() {
            var colorScale = null;
            var map = null;
            var imageOverlay = null;
            var dataCache = null;
            var previousZoom = null;
            var previousBounds = null;
            var canvas = L.DomUtil.create("canvas", "data-grid-layer");
            canvas.style.display = "none";
            document.body.appendChild(canvas);
            var api = {};
            api.render = function(_data) {
                var data = _data || dataCache;
                dataCache = data;
                if (!data) {
                    return api;
                }
                var mapBounds = map.getBounds();
                var pixelOrigin = map.getPixelOrigin();
                var worldBounds = map.getPixelWorldBounds();
                var mapSize = map.getSize();
                var mapSizeY = mapSize.y;
                if (map._zoom < mapSize.y / 512) {
                    mapSizeY = worldBounds.max.y - worldBounds.min.y;
                }
                console.log("Start rendering...");
                console.time("render");
                var lat = data.lat;
                var lon = data.lon;
                var values = data.values;
                canvas.width = mapSize.x;
                canvas.height = mapSizeY;
                var ctx = canvas.getContext("2d");
                var northIndex = Math.max(dh.utils.bisectionReversed(lat, mapBounds.getNorth()) - 1, 0);
                var southIndex = Math.min(dh.utils.bisectionReversed(lat, mapBounds.getSouth()), lat.length - 1);
                var westIndex = Math.max(dh.utils.bisection(lon, mapBounds.getWest()) - 1, 0);
                var eastIndex = Math.min(dh.utils.bisection(lon, mapBounds.getEast()) + 1, lon.length - 1);
                var northWestPoint = map.latLngToContainerPoint([ lat[northIndex], lon[Math.max(westIndex, 0)] ]);
                var northWestPointNextLon = map.latLngToContainerPoint([ lat[northIndex], lon[Math.min(westIndex + 1, lon.length - 1)] ]);
                var w = Math.ceil(Math.max(northWestPointNextLon.x - northWestPoint.x, 1)) + 2;
                var imageData = ctx.getImageData(0, 0, mapSize.x, mapSizeY);
                var buf = new ArrayBuffer(imageData.data.length);
                var buf8 = new Uint8ClampedArray(buf);
                var data = new Uint32Array(buf);
                var colorRGB, colorInt, imgDataIndex, x, y;
                var point, value, latIndex, nextLatIndex, lonIndex, nextLongIndex;
                for (var i = 0; i < lat.length; i++) {
                    if (i < northIndex || i > southIndex) {
                        continue;
                    }
                    latIndex = Math.max(i, 0);
                    nextLatIndex = Math.min(latIndex + 1, lat.length - 1);
                    var firstPointAtCurrentLat = map.latLngToContainerPoint([ lat[latIndex], lon[westIndex] ]);
                    var firstPointAtNextLat = map.latLngToContainerPoint([ lat[nextLatIndex], lon[westIndex] ]);
                    var h = Math.ceil(Math.max(firstPointAtNextLat.y - firstPointAtCurrentLat.y, 1) + 1);
                    for (var j = 0; j < lon.length; j++) {
                        if (j >= westIndex && j < eastIndex) {
                            lonIndex = Math.max(j, 0);
                            point = map.latLngToContainerPoint([ lat[latIndex], lon[lonIndex] ]);
                            if (map._zoom < mapSize.y / 512) {
                                point.y = point.y + pixelOrigin.y - map._getMapPanePos().y;
                            }
                            value = values[latIndex][lonIndex];
                            if (value !== -999 && value !== null && !isNaN(value) && i % 1 === 0 && j % 1 === 0) {
                                colorRGB = dh.utils.parseRGB(colorScale(value));
                                for (x = 0; x < w; x++) {
                                    for (y = 0; y < h; y++) {
                                        imgDataIndex = (~~point.y + y - ~~(h / 2)) * mapSize.x + Math.min(Math.max(~~point.x + x - ~~(w / 2), 0), mapSize.x - 1);
                                        data[imgDataIndex] = 255 << 24 | colorRGB[2] << 16 | colorRGB[1] << 8 | colorRGB[0];
                                    }
                                }
                            }
                        }
                    }
                }
                imageData.data.set(buf8);
                ctx.putImageData(imageData, 0, 0);
                if (imageOverlay) {
                    imageOverlay.removeFrom(map);
                }
                imageOverlay = L.imageOverlay(canvas.toDataURL("image/png"), mapBounds).addTo(map);
                imageOverlay.setOpacity(.8);
                console.timeEnd("render");
                return api;
            };
            api.setColorScale = function(_colorScale) {
                colorScale = _colorScale;
                return api;
            };
            api.setData = function(data) {
                api.render(data);
                return api;
            };
            api.addTo = function(_map) {
                map = _map;
                map.on("moveend", function(d) {
                    var imgNode = d.target._panes.overlayPane.querySelector("img");
                    if (imgNode) {
                        var imgNodeStyle = imgNode.style;
                        var transform3D = imgNodeStyle.transform;
                        if (transform3D) {
                            var xy = transform3D.match(/\((.*)\)/)[1].split(",").slice(0, 2);
                            imgNodeStyle.transform = "translate(" + xy + ")";
                        }
                    }
                    var zoom = d.target._zoom;
                    var hasZoomed = zoom !== previousZoom;
                    previousZoom = zoom;
                    var bounds = map.getBounds();
                    var hasPanned = JSON.stringify(bounds) !== JSON.stringify(previousBounds);
                    previousBounds = bounds;
                    if (hasZoomed || hasPanned) {
                        api.render();
                    }
                });
                return api;
            };
            return api;
        };
        var selectorMap = function(config) {
            var selectionMap = rasterMap({
                parent: config.parent
            }).init();
            var events = d3.dispatch("mapCloseClick", "rectangleDraw", "rectangleClick", "markerClick", "markerDraw", "geojsonClick");
            var internalMap = selectionMap._getMap();
            internalMap.zoomControl.setPosition("bottomright");
            var closeControl = L.Control.extend({
                position: "topright",
                onAdd: function(map) {
                    var container = L.DomUtil.create("a", "map-close leaflet-bar leaflet-control leaflet-control-custom");
                    container.onclick = function(e) {
                        events.call("mapCloseClick", this, e);
                    };
                    return container;
                }
            });
            internalMap.addControl(new closeControl());
            var drawnItems = new L.FeatureGroup();
            internalMap.addLayer(drawnItems);
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
                        zIndexOffset: 2e3,
                        repeatMode: true
                    },
                    rectangle: {
                        shapeOptions: {
                            fillColor: "#128DE0",
                            color: "#128DE0",
                            opacity: .5
                        },
                        repeatMode: true
                    }
                }
            });
            internalMap.addControl(drawControl);
            internalMap.on("draw:created", function(e) {
                var layer = e.layer;
                removeAllPolygons();
                var coordinates;
                if (e.layerType === "rectangle") {
                    layer.addTo(drawnItems).on("click", function(e) {
                        removeAllPolygons();
                        zoomToBoundingBox();
                        events.call("rectangleClick", this, e);
                    }, this);
                    events.call("rectangleDraw", this, layer.getBounds());
                    zoomToBoundingBox();
                }
                if (e.layerType === "marker") {
                    var latLng = layer.getLatLng();
                    addMarker(latLng);
                    events.call("markerDraw", this, latLng);
                }
            }, this);
            function addMarker(latLng) {
                var marker = L.marker(latLng, {
                    interactive: true
                }).on("click", function(e) {
                    removeAllPolygons();
                    zoomToBoundingBox();
                    events.call("markerClick", this, e);
                }, this).addTo(drawnItems);
                zoomToBoundingBox();
            }
            function removeAllPolygons() {
                drawnItems.clearLayers();
                drawControl._toolbars.draw._modes.rectangle.handler.disable();
                drawControl._toolbars.draw._modes.marker.handler.disable();
                return this;
            }
            function getPolyFromCoordinates(coords) {
                return {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [ coords.concat([ coords[0] ]) ]
                    },
                    properties: {}
                };
            }
            function addGeojson(poly, cb) {
                var geojsonLayer = L.GeoJSON.geometryToLayer(poly).on("click", function(e) {
                    drawnItems.removeLayer(this);
                    if (cb) {
                        cb(this);
                    }
                    zoomToBoundingBox();
                }, this);
                geojsonLayer.addTo(drawnItems);
                return this;
            }
            selectionMap.addRectangle = function(coords) {
                removeAllPolygons();
                var poly = getPolyFromCoordinates(coords);
                addGeojson(poly, function() {
                    events.call("rectangleClick", this, arguments);
                });
                zoomToBoundingBox();
                return this;
            };
            selectionMap.addPolygons = function(data) {
                removeAllPolygons();
                data.forEach(function(geojson) {
                    geojson[1].id = geojson[0];
                    var geojsonLayer = L.GeoJSON.geometryToLayer(geojson[1]).on("click", function(e) {
                        drawnItems.removeLayer(this);
                        events.call("geojsonClick", this, geojson);
                        zoomToBoundingBox();
                    }, this);
                    geojsonLayer.addTo(drawnItems);
                });
                zoomToBoundingBox();
                return this;
            };
            function zoomToBoundingBox() {
                var bounds = drawnItems.getBounds();
                if (bounds._southWest) {
                    internalMap.fitBounds(bounds);
                } else {
                    internalMap.fitWorld();
                }
                return this;
            }
            selectionMap.removeAllPolygons = removeAllPolygons;
            selectionMap.zoomToBoundingBox = zoomToBoundingBox;
            selectionMap.addMarker = addMarker;
            return selectionMap;
        };
        var rasterMap = function(_config) {
            var containerNode = L.DomUtil.create("div", "datahub-map");
            var container = _config.parent.appendChild(containerNode);
            var config = {
                container: container,
                colorScale: _config.colorScale,
                basemapName: _config.basemapName || "basemapDark",
                imagePath: _config.imagePath || "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.2/images/",
                showLabels: !(_config.showLabels === false),
                showTooltip: !(_config.showTooltip === false),
                polygonTooltipFunc: _config.polygonTooltipFunc
            };
            var mapConfig = {
                maxBounds: [ [ -90, -180 ], [ 90, 180 ] ],
                maxZoom: 13,
                minZoom: 1,
                scrollWheelZoom: false,
                zoomSnap: 0,
                zoomDelta: .5,
                attributionControl: false,
                fadeAnimation: false,
                tileLayer: {
                    noWrap: true,
                    continuousWorld: false
                }
            };
            dh.utils.merge(mapConfig, _config.mapConfig);
            var events = d3.dispatch("click", "mousemove", "mouseenter", "mouseleave", "featureClick", "featureMousEnter", "featureMousLeave", "markerClick");
            var states = {
                isVisible: true
            };
            var map, gridLayer, geojsonLayer, tooltipLayer, marker, gridData, cachedBBoxPolygon;
            function init() {
                L.Icon.Default.imagePath = config.imagePath;
                map = L.map(config.container, mapConfig).on("click", function(e) {
                    events.call("click", this, {
                        lat: e.latlng.lat,
                        lon: e.latlng.lng
                    });
                }).on("mousedown", function(e) {
                    config.container.classList.add("grab");
                }).on("mouseup", function(e) {
                    config.container.classList.remove("grab");
                }).on("mousemove", function(e) {
                    if (gridData) {
                        var latIndex = dh.utils.bisectionReversed(gridData.lat, e.latlng.lat);
                        var lonIndex = dh.utils.bisection(gridData.lon, e.latlng.lng);
                        var previousLatIndex = Math.max(latIndex - 1, 0);
                        var deltaLat = gridData.lat[previousLatIndex] - gridData.lat[latIndex];
                        if (e.latlng.lat > gridData.lat[latIndex] + deltaLat / 2) {
                            latIndex = previousLatIndex;
                        }
                        var previousLonIndex = Math.max(lonIndex - 1, 0);
                        var deltaLon = gridData.lon[lonIndex] - gridData.lon[previousLonIndex];
                        if (e.latlng.lng < gridData.lon[lonIndex] - deltaLon / 2) {
                            lonIndex = previousLonIndex;
                        }
                        var value = null;
                        if (e.latlng.lat <= gridData.lat[0] && e.latlng.lat >= gridData.lat[gridData.lat.length - 1] && e.latlng.lng >= gridData.lon[0] && e.latlng.lng <= gridData.lon[gridData.lon.length - 1]) {
                            value = gridData.values[latIndex][lonIndex];
                        }
                        if (value !== null && value !== -999 && config.showTooltip) {
                            var formattedValue = L.Util.formatNum(value, 2);
                            tooltipLayer.setTooltipContent(formattedValue + "").openTooltip([ e.latlng.lat, e.latlng.lng ]);
                        } else {
                            tooltipLayer.closeTooltip();
                        }
                        events.call("mousemove", this, {
                            x: e.containerPoint.x,
                            y: e.containerPoint.y,
                            value: value,
                            lat: e.latlng.lat,
                            lon: e.latlng.lng
                        });
                    }
                }).on("mouseover", function(e) {
                    events.call("mouseenter", this, arguments);
                }).on("mouseout", function(e) {
                    events.call("mouseleave", this, arguments);
                });
                if (!(_config.mapConfig && _config.mapConfig.zoom)) {
                    map.fitWorld();
                }
                map.createPane("labels");
                var basemaps = {};
                basemaps.basemapDark = L.tileLayer("https://api.mapbox.com/styles/v1/planetos/ciusdqjc200w12jmlg0dys640/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmV0b3MiLCJhIjoiZjZkNDE4MTE5NWNhOGYyMmZhZmNhMDQwMDg0YWMyNGUifQ.htlwo6U82iekTcpGtDR_dQ", {
                    tileSize: 256,
                    maxZoom: 19
                });
                basemaps.basemapLight = L.tileLayer("https://api.mapbox.com/styles/v1/planetos/civ28flwe002c2ino04a6jiqs/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmV0b3MiLCJhIjoiZjZkNDE4MTE5NWNhOGYyMmZhZmNhMDQwMDg0YWMyNGUifQ.htlwo6U82iekTcpGtDR_dQ", {
                    tileSize: 256,
                    maxZoom: 19
                });
                basemaps.labelLight = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", {
                    attribution: "©OpenStreetMap, ©CartoDB",
                    pane: "labels"
                });
                basemaps[config.basemapName].addTo(map);
                if (config.showLabels) {
                    basemaps.labelLight.addTo(map);
                }
                gridLayer = dataGridLayer().addTo(map);
                var tooltipLayer = L.featureGroup().bindTooltip("").addTo(map);
                return this;
            }
            function renderImage(image, metadata) {
                var bbox = metadata.bbox;
                var imageBounds = [ [ bbox.latMax, bbox.lonMin ], [ bbox.latMin, bbox.lonMax ] ];
                L.imageOverlay(image, imageBounds).addTo(map);
                return this;
            }
            function show() {
                config.container.style.display = "block";
                states.isVisible = true;
                return this;
            }
            function hide() {
                config.container.style.display = "none";
                states.isVisible = false;
                return this;
            }
            function resize() {
                map.invalidateSize();
                if (cachedBBoxPolygon) {
                    zoomToPolygonBoundingBox(cachedBBoxPolygon);
                } else {
                    map.fitWorld();
                }
                return this;
            }
            function zoomToPolygonBoundingBox(polygon) {
                var bboxGeojsonLayer = L.geoJson(polygon);
                map.fitBounds(bboxGeojsonLayer.getBounds());
                cachedBBoxPolygon = polygon;
                return this;
            }
            function renderPolygon(polygon) {
                var onEachFeature = function(feature, layer) {
                    layer.on({
                        click: function(e) {
                            events.call("featureClick", this, {
                                id: e.target.feature.properties.id,
                                lat: e.target._latlng ? e.target._latlng.lat : e.latlng.lat,
                                lon: e.target._latlng ? e.target._latlng.lng : e.latlng.lng,
                                layer: e
                            });
                        },
                        mouseover: function(e, a, b) {
                            events.call("featureMousEnter", this, {
                                x: e.containerPoint.x,
                                y: e.containerPoint.y,
                                lat: e.latlng.lat,
                                lon: e.latlng.lng,
                                value: e.target.feature.properties.id
                            });
                        },
                        mouseout: function(e) {
                            events.call("featureMousLeave", this, {
                                x: e.containerPoint.x,
                                y: e.containerPoint.y,
                                lat: e.latlng.lat,
                                lon: e.latlng.lng,
                                value: e.target.feature.properties.id
                            });
                        }
                    });
                };
                geojsonLayer = L.geoJson(polygon, {
                    onEachFeature: onEachFeature,
                    pointToLayer: function(feature, latlng) {
                        return new L.CircleMarker(latlng, {
                            radius: 4,
                            fillColor: "#05A5DE",
                            color: "#1E1E1E",
                            weight: 1,
                            opacity: .5,
                            fillOpacity: .4
                        });
                    }
                }).addTo(map);
                if (config.polygonTooltipFunc) {
                    geojsonLayer.bindTooltip(config.polygonTooltipFunc);
                }
                return this;
            }
            function addMarker(coordinates) {
                removeMarker();
                marker = L.marker(coordinates, {
                    interactive: true,
                    draggable: true,
                    opacity: 1
                }).on("click", function(e) {
                    events.call("markerClick", this, arguments);
                }).addTo(map);
                return this;
            }
            function removeMarker() {
                if (marker) {
                    marker.remove();
                }
                return this;
            }
            function renderRaster(data) {
                gridData = data;
                var dataSorted = data.uniqueValues.sort(function(a, b) {
                    return a - b;
                });
                var colorScale = config.colorScale(dataSorted);
                gridLayer.setColorScale(colorScale).setData(data);
                return this;
            }
            function hideZoomControl(bool) {
                if (bool) {
                    map.addControl(map.zoomControl);
                    map.doubleClickZoom.enable();
                    map.boxZoom.enable();
                    map.dragging.enable();
                } else {
                    map.removeControl(map.zoomControl);
                    map.doubleClickZoom.disable();
                    map.boxZoom.disable();
                    map.dragging.disable();
                }
                return this;
            }
            function renderVectorMap() {
                datahub.data.getWorldVector(function(geojson) {
                    renderPolygon(geojson);
                });
                return this;
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
                renderVectorMap: renderVectorMap,
                isVisible: states.isVisible,
                hideZoomControl: hideZoomControl,
                on: dh.utils.rebind(events),
                _getMap: function() {
                    return map;
                }
            };
        };
        dh.map = {
            rasterMap: rasterMap,
            selectorMap: selectorMap
        };
    }(datahub, root.d3, root.leaflet);
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    }
    global["datahub"] = exports;
})({}, function() {
    return this;
}());