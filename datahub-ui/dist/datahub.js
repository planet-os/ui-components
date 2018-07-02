(function(exports) {
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
            // Object.assign shim from
            // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
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
        var svgToNode = function(svgString, svg) {
            var parentElement = svg.parentNode;
            var emptySvg = svg.cloneNode(false);
            parentElement.removeChild(svg);
            parentElement.appendChild(emptySvg);
            return appendSvgToNode(svgString, emptySvg);
        };
        var appendSvgToNode = function(svgString, parent) {
            return parent.appendChild(document.importNode(new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + svgString + "</svg>", "application/xml").documentElement.firstChild, true));
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
                    //callback.apply(this, arguments)
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
            svgToNode: svgToNode,
            appendSvgToNode: appendSvgToNode,
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
        var axesFormatAutoconfig = function(config) {
            var timeFormat = d3.utcFormat("%b %e, %Y at %H:%M UTC");
            var axisXFormat = "";
            if (!config.dataIsEmpty) {
                var fixedFloat = function(d) {
                    return d % 1 ? ~~(d * 100) / 100 : d;
                };
                var formatString = [];
                var timeExtent = d3.extent(config.timestamps);
                var min = timeExtent[0];
                var max = timeExtent[1];
                if (min.getTime() !== max.getTime() || min.getUTCMonth() !== max.getUTCMonth()) {
                    formatString.push("%b %e");
                }
                if (min.getYear() !== max.getYear()) {
                    formatString.push("%Y");
                }
                if (min.getYear() === max.getYear() && min.getUTCHours() !== max.getUTCHours()) {
                    formatString.push("%H:%M");
                }
                axisXFormat = d3.utcFormat(formatString.join(" "));
            }
            return {
                axisXFormat: axisXFormat,
                axisTitleXFormat: function(d) {
                    return timeFormat(d.data.x);
                },
                tooltipFormat: function(d) {
                    return fixedFloat(d.data.y);
                }
            };
        };
        var defaultConfig = function(config) {
            var defaultMargin = {
                top: 50,
                right: 50,
                bottom: 100,
                left: 50
            };
            return {
                margin: config.margin || defaultMargin,
                width: config.width || 600,
                height: config.height || 300
            };
        };
        var sortData = function(config) {
            config.dataConverted.sort(function(_a, _b) {
                var a = _a.x.getTime();
                var b = _b.x.getTime();
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return {};
        };
        var detectDataAllNulls = function(config) {
            var allNulls = !config.flattenedData.filter(function(d) {
                return d.y != null;
            }).length;
            return {
                dataIsAllNulls: allNulls
            };
        };
        var axisX = function(config) {
            var format = config.axisXFormat || "%b";
            var axisXFormat = d3.utcFormat(format) || function(d) {
                return d.toString();
            };
            var axisX = d3.axisBottom().scale(config.scaleX).tickFormat(axisXFormat);
            return {
                axisX: axisX
            };
        };
        var axisY = function(config) {
            var format = config.axisYFormat || ".2s";
            var axisYFormat = d3.format(format);
            var height = config.scaleY.range()[0];
            var axisY = d3.axisLeft().scale(config.scaleY).ticks(Math.max(~~(height / 30), 2)).tickPadding(10).tickFormat(axisYFormat).tickSize(-config.chartWidth);
            return {
                axisY: axisY
            };
        };
        var axisComponentX = function(config) {
            var axisX = config.container.selectAll("g.axis.x").data([ 0 ]);
            var axis = axisX.enter().append("g").attr("class", "x axis").attr("transform", "translate(" + [ 0, config.chartHeight ] + ")").merge(axisX).attr("display", function(d) {
                return config.dataIsEmpty ? "none" : null;
            }).attr("transform", "translate(" + [ 0, config.chartHeight ] + ")");
            axis.call(config.axisX);
            axisX.exit().remove();
            var labelsW = [];
            var texts = axis.selectAll(".tick").select("text").each(function(d, i) {
                var w = this.getBBox().width;
                if (w) {
                    labelsW.push(w);
                }
            });
            var skipCount = Math.floor(d3.max(labelsW) / config.stripeScaleX.bandwidth());
            if (skipCount) {
                axis.selectAll(".tick text").attr("display", function(d, i) {
                    return !!(i % (skipCount + 1)) ? "none" : "block";
                });
            }
            return {};
        };
        var axisComponentY = function(config) {
            var padding = config.axisYPadding || 0;
            var axisY = config.container.selectAll("g.axis.y").data([ 0 ]);
            axisY.enter().append("g").attr("class", "y axis").attr("transform", "translate(" + [ -padding / 2, 0 ] + ")").merge(axisY).call(config.axisY).attr("text-anchor", "start").selectAll("text").attr("dx", -config.margin.left + 10);
            axisY.exit().remove();
            return {};
        };
        var axisTitleComponentX = function(config) {
            var axisTitleXComponent = config.container.selectAll("text.axis-title.x").data([ 0 ]);
            axisTitleXComponent.enter().append("text").attr("class", "x axis-title").merge(axisTitleXComponent).text(config.axisTitleX || "").attr("x", config.chartWidth).attr("y", config.chartHeight);
            axisTitleXComponent.exit().remove();
            return {
                axisTitleXComponent: axisX
            };
        };
        var axisTitleComponentY = function(config) {
            var axisTitleY = config.container.selectAll("text.axis-title.y").data([ 0 ]);
            var axisY = axisTitleY.enter().append("text").attr("class", "y axis-title").merge(axisTitleY).text(config.axisTitleY || "").attr("x", -config.margin.left).attr("y", -10).attr("text-anchor", "start");
            axisTitleY.exit().remove();
            return {};
        };
        var chartTitleComponent = function(config) {
            var axisTitleX = config.container.selectAll("text.chart-title").data([ config.chartTitle || "" ]);
            axisTitleX.enter().append("text").attr("class", "chart-title").merge(axisTitleX).html(function(d) {
                return d;
            }).attr("x", function(d) {
                return (config.chartWidth - d.length * 5) / 2;
            }).attr("y", -5);
            axisTitleX.exit().remove();
            return {};
        };
        var shapePanel = function(config) {
            var shapePanel = config.container.selectAll("g.shapes").data([ 0 ]);
            var panel = shapePanel.enter().append("g").attr("class", "shapes").merge(shapePanel);
            shapePanel.exit().remove();
            return {
                shapePanel: panel
            };
        };
        var container = function(config) {
            var container = d3.select(config.parent).selectAll("div.widget-container").data([ 0 ]);
            var containerUpdate = container.enter().append("div").attr("class", "widget-container").merge(container).attr("width", config.width).attr("height", config.height);
            container.exit().remove();
            return {
                container: containerUpdate
            };
        };
        var svgContainer = function(config) {
            var widgetContainer = container(config).container;
            var root = widgetContainer.selectAll("svg").data([ 0 ]);
            var rootEnter = root.enter().append("svg").attr("class", "datahub-chart");
            var panel = rootEnter.append("g").attr("class", "panel").merge(root).attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")");
            rootEnter.merge(root).attr("width", config.width).attr("height", config.height);
            root.exit().remove();
            return {
                root: root,
                container: panel
            };
        };
        var message = function(config) {
            var message = "";
            if (config.dataIsEmpty) {
                message = "(Data Unavailable)";
            } else if (config.dataIsAllNulls) {
                message = "Values are all null";
            }
            var text = config.container.select(".message-group").selectAll("text").data([ message ]);
            text.enter().append("text").merge(text).attr("x", function() {
                return config.width / 2 - this.getBBox().width / 2;
            }).attr("y", function() {
                return config.height / 2 - this.getBBox().height / 2 - 30;
            }).text(function(d) {
                return d;
            });
            text.exit().remove();
            return {};
        };
        var axisXFormatterTime = function(config) {
            config.container.select("g.axis.x").selectAll(".tick text").text(function(d) {
                return d3.timeFormat("%a")(d);
            });
            return {};
        };
        var axisXFormatterTimeHour = function(config) {
            config.container.select("g.axis.x").selectAll(".tick text").text(function(d) {
                return d3.timeFormat("%x")(d);
            });
            return {};
        };
        var axisXFormatterRotate30 = function(config) {
            config.container.select("g.axis.x").selectAll(".tick text").style("transform", "rotate(30deg)").style("text-anchor", "start");
            return {};
        };
        var axisYFormatSI = function(_config) {
            config.axisY.tickFormat(d3.format(".2s"));
            return {};
        };
        var labelsRewriterY = function(config) {
            if (!config.labelsRewriterY) {
                return {};
            }
            config.container.selectAll("g.axis.y").selectAll("text").each(function(d, i) {
                datahub.utils.svgToNode(config.labelsRewriterY(d, i, config), this);
            });
            return {};
        };
        var printer = function(config) {
            console.warn(config);
        };
        dh.common = {
            axesFormatAutoconfig: axesFormatAutoconfig,
            defaultConfig: defaultConfig,
            sortData: sortData,
            detectDataAllNulls: detectDataAllNulls,
            axisX: axisX,
            axisY: axisY,
            axisComponentX: axisComponentX,
            axisComponentY: axisComponentY,
            axisTitleComponentX: axisTitleComponentX,
            axisTitleComponentY: axisTitleComponentY,
            chartTitleComponent: chartTitleComponent,
            shapePanel: shapePanel,
            svgContainer: svgContainer,
            container: container,
            message: message,
            axisXFormatterTime: axisXFormatterTime,
            axisXFormatterTimeHour: axisXFormatterTimeHour,
            axisXFormatterRotate30: axisXFormatterRotate30,
            axisYFormatSI: axisYFormatSI,
            labelsRewriterY: labelsRewriterY,
            printer: printer
        };
    }(datahub, root.d3);
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
        var setApiConfig = function(_apiConfig) {
            apiConfig = datahub.utils.mergeAll(apiConfig, _apiConfig);
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
                    wind: datahub.data.generateTimeSeriesSplit(historicalDataConfig)[0],
                    windDirection: datahub.data.generateTimeSeriesSplit(historicalDataConfig)[0],
                    wave: datahub.data.generateTimeSeriesSplit(historicalDataConfig)[0],
                    tide: datahub.data.generateTimeSeriesSplit(historicalDataConfig)[0],
                    bottomAxis: datahub.data.generateTimeSeriesSplit(historicalDataConfig)[0],
                    topAxis: datahub.data.generateTimeSeriesSplit(historicalDataConfig)[0]
                },
                forecast: {
                    wind: datahub.data.generateTimeSeriesSplit(forecastDataConfig)[0],
                    windDirection: datahub.data.generateTimeSeriesSplit(forecastDataConfig)[0],
                    wave: datahub.data.generateTimeSeriesSplit(forecastDataConfig)[0],
                    tide: datahub.data.generateTimeSeriesSplit(forecastDataConfig)[0],
                    bottomAxis: datahub.data.generateTimeSeriesSplit(forecastDataConfig)[0],
                    topAxis: datahub.data.generateTimeSeriesSplit(forecastDataConfig)[0]
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
                var timeVariableIDs = [];
                var ctx = json.metadata.contexts;
                var dataVars, dataVarTmp;
                for (var x in ctx) {
                    dataVars = ctx[x].dataVariables;
                    if (ctx[x].axes && Object.keys(ctx[x].axes)) {
                        var axes = Object.keys(ctx[x].axes).map(function(d, i) {
                            return d.toLowerCase().trim();
                        });
                        if (axes.indexOf("time") > -1) {
                            timeVariableIDs = timeVariableIDs.concat(Object.keys(dataVars));
                        }
                    }
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
                    variableMetadata: variablesMetadata[variableName],
                    timeVariableIDs: timeVariableIDs
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
            setApiKey: setApiKey,
            setApiConfig: setApiConfig
        };
    }(datahub, root.d3);
    !function(dh, d3) {
        var sliderScaleX = function(config) {
            var sliderWidth = config.width - config.margin.left - config.margin.right;
            var extent = config.timeRange.map(function(d) {
                return new Date(d);
            });
            var scaleX = d3.scaleTime().domain(extent).range([ 0, sliderWidth ]);
            return {
                scaleX: scaleX,
                sliderWidth: sliderWidth
            };
        };
        var sliderAxisX = function(config) {
            var sliderHeight = config.height - config.margin.top - config.margin.bottom;
            var axisXFormat = config.axisXFormat || d3.utcFormat("%b");
            var axisX = d3.axisBottom().scale(config.scaleX).tickFormat(axisXFormat).tickSize(sliderHeight - 12);
            return {
                axisX: axisX,
                sliderHeight: sliderHeight
            };
        };
        var sliderAxisComponentX = function(config) {
            var axisX = config.container.selectAll("g.axis.x").data([ 0 ]);
            axisX.enter().append("g").attr("class", "x axis").attr("transform", "translate(" + [ 0, config.margin.top ] + ")").merge(axisX).transition().attr("transform", "translate(" + [ 0, config.margin.top ] + ")").call(config.axisX);
            axisX.exit().remove();
            return {};
        };
        var tooltipHTMLWidget = function(tooltipNode) {
            var root = d3.select(tooltipNode).style("position", "absolute").style("pointer-events", "none").style("display", "none");
            var setText = function(html) {
                root.html(html);
                return this;
            };
            var position = function(pos) {
                root.style("left", pos[0] + "px").style("top", pos[1] + "px");
                return this;
            };
            var show = function() {
                root.style("display", "block");
                return this;
            };
            var hide = function() {
                root.style("display", "none");
                return this;
            };
            var getRootNode = function() {
                return root.node();
            };
            return {
                setText: setText,
                setPosition: position,
                show: show,
                hide: hide,
                getRootNode: getRootNode
            };
        };
        var buttonGroupElements = function(config) {
            config.container.classed("datahub-button-group", true);
            var events = d3.dispatch("click");
            var elements = config.container.selectAll(".element").data(config.elements);
            var elementsAll = elements.enter().append("div").on("click", function(d) {
                var that = this;
                var isUnselection = false;
                elementsAll.classed("active", function() {
                    isAlreadyActive = this.classList.contains("active");
                    isTarget = that === this;
                    if (isTarget && isAlreadyActive && config.isTogglable !== false) {
                        isUnselection = true;
                    }
                    if (config.isExclusive) {
                        return (!isAlreadyActive || isAlreadyActive && config.isTogglable === false) && isTarget;
                    } else {
                        return isTarget ? !isAlreadyActive : isAlreadyActive;
                    }
                });
                events.call("click", null, {
                    selected: isUnselection ? null : d
                });
            }).merge(elements).attr("class", function(d) {
                return "element " + (d.className || "");
            }).classed("active", function(d) {
                return d.key === config.defaultElementKey;
            }).html(function(d) {
                return d.label;
            });
            elements.exit().remove();
            return {
                events: events
            };
        };
        var timeSlider = function(config) {
            config.container.classed("datahub-slider", true);
            var events = d3.dispatch("brush");
            var brushX = d3.brushX().extent([ [ 0, 0 ], [ config.sliderWidth, config.sliderHeight - 12 ] ]).handleSize(10).on("brush", function() {
                var brushPixelExtent = d3.event.selection;
                var brushExtent = {
                    start: config.scaleX.invert(brushPixelExtent[0]),
                    end: config.scaleX.invert(brushPixelExtent[1])
                };
                events.call("brush", null, {
                    brushExtent: brushExtent
                });
            });
            var brush = config.container.selectAll("g.brush").data([ 0 ]);
            var brushMerged = brush.enter().append("g").attr("class", "brush").attr("transform", "translate(" + [ 0, config.margin.top ] + ")").merge(brush).attr("transform", "translate(" + [ 0, config.margin.top ] + ")").call(brushX).call(brushX.move, config.scaleX.range());
            brush.exit().remove();
            if (config.initialTimeRange) {
                // brush.call(brushX.move, config.scaleX.range())
            }
            return {
                events: events
            };
        };
        var number = function(_config) {
            var configCache = {
                title: _config.title,
                value: _config.value,
                info: _config.info
            };
            var template = '<div class="datahub-number">' + '<div class="title"></div>' + '<div class="value"></div>' + '<div class="info"></div>' + "</div>";
            var parentNode = dh.utils.appendHtmlToNode(template, _config.parent);
            var parent = d3.select(parentNode).on("click", function(d) {
                events.call("click", null, configCache);
            });
            var events = d3.dispatch("click");
            setTitle(configCache.title);
            setValue(configCache.value);
            setInfo(configCache.info);
            function setTitle(text) {
                configCache.title = text || configCache.title;
                parent.select(".title").html(configCache.title);
                return this;
            }
            function setValue(text) {
                configCache.value = text || configCache.value;
                parent.select(".value").html(configCache.value);
                return this;
            }
            function setInfo(text) {
                configCache.info = text || configCache.info;
                parent.select(".info").html(configCache.info);
                return this;
            }
            return {
                on: dh.utils.rebind(events),
                setTitle: setTitle,
                setValue: setValue,
                setInfo: setInfo
            };
        };
        var table = function(config) {
            var template = '<div class="datahub-table">' + '<div class="header-row"></div>' + "</div>";
            var parentNode = dh.utils.appendHtmlToNode(template, config.parent);
            var parent = d3.select(parentNode);
            var configCache = {
                elements: config.elements,
                header: config.header,
                defaultSortKey: config.header ? config.header[0].key : null
            };
            renderCells(config.elements);
            renderHeader(config.header);
            function renderHeader(header) {
                if (!header) {
                    return this;
                } else {
                    configCache.header = header;
                    configCache.defaultSortKey = header[0].key;
                }
                var headerCells = parent.select(".header-row").selectAll(".header-cell").data(header);
                var headerCellsUpdate = headerCells.enter().append("div").attr("class", "header-cell").on("click", function(d, i) {
                    if (!this.classList.contains("sortable") || !configCache.elements) {
                        return;
                    }
                    var that = this;
                    var isAscending = false;
                    headerCellsUpdate.classed("ascending", function(d) {
                        var match = that === this;
                        if (match) {
                            isAscending = this.classList.contains("ascending");
                            match = !isAscending;
                        }
                        return match;
                    });
                    renderCells(configCache.elements, d.key, !isAscending);
                }).merge(headerCells).classed("sortable", function(d) {
                    return d.sortable;
                }).classed("ascending", function(d) {
                    return d.key === configCache.defaultSortKey;
                }).html(function(d) {
                    return d.label;
                });
                headerCells.exit().remove();
            }
            function renderCells(elements, _sortKey, _isAscending) {
                if (!elements || !configCache.header) {
                    return this;
                } else {
                    configCache.elements = elements;
                }
                var sortKey = _sortKey || configCache.defaultSortKey;
                var isAscending = typeof _isAscending === "undefined" ? true : _isAscending;
                var sortedElements = sortElements(elements, sortKey, isAscending);
                var rows = parent.selectAll(".table-row").data(sortedElements);
                var rowsUpdate = rows.enter().append("div").attr("class", "table-row").merge(rows);
                rows.exit().remove();
                var cells = rowsUpdate.selectAll(".cell").data(function(d) {
                    return d;
                });
                cells.enter().append("div").attr("class", "cell").merge(cells).html(function(d) {
                    return d;
                });
                cells.exit().remove();
            }
            function sortElements(data, sortBy, isAscending) {
                var sortKey = configCache.header.map(function(d) {
                    return d.key;
                }).indexOf(sortBy);
                var sortedData = JSON.parse(JSON.stringify(data)).sort(function(a, b) {
                    if (a[sortKey] < b[sortKey]) return isAscending ? -1 : 1;
                    if (a[sortKey] > b[sortKey]) return isAscending ? 1 : -1;
                    return 0;
                });
                return sortedData;
            }
            return {
                setHeader: renderHeader,
                setElements: renderCells
            };
        };
        var alert = function(config) {
            var template = '<div class="datahub-alert-message">' + '<div class="alert-band"></div>' + '<div class="alert-message"></div>' + "</div>";
            var parentNode = dh.utils.appendHtmlToNode(template, config.parent);
            var parent = d3.select(parentNode);
            setLevel(config.level);
            setMessage(config.message);
            function setLevel(level) {
                parent.select(".alert-band").classed(level, true);
            }
            function setMessage(message) {
                parent.select(".alert-message").html(message);
            }
            return {
                setLevel: setLevel,
                setMessage: setMessage
            };
        };
        var calendar = function(config) {
            var template = '<div class="datahub-month-calendar">' + ' <div class="year-selector">' + '     <div class="prev-year">&lsaquo;</div>' + '     <div class="selected-year"></div>' + '     <div class="next-year">&rsaquo;</div>' + " </div>" + ' <div class="month-selector">' + " </div>" + "</div>";
            var parentNode = dh.utils.appendHtmlToNode(template, config.parent);
            var parent = d3.select(parentNode);
            var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
            var configCache = {
                month: monthNames[new Date().getMonth()],
                year: new Date().getFullYear()
            };
            var events = d3.dispatch("change", "update");
            function changeYear() {
                selectYear.text(configCache.year);
                sendUpdateEvent();
            }
            function changeMonth() {
                monthsUpdate.classed("active", function(d) {
                    return d === configCache.month;
                });
                sendUpdateEvent();
            }
            function sendChangeEvent() {
                events.call("change", null, getDateFormats());
                sendUpdateEvent();
            }
            function sendUpdateEvent() {
                events.call("update", null, getDateFormats());
            }
            var selectYear = parent.select(".selected-year").text(configCache.year);
            parent.select(".prev-year").on("click", function(d) {
                configCache.year -= 1;
                changeYear();
                sendChangeEvent();
            });
            parent.select(".next-year").on("click", function(d) {
                configCache.year += 1;
                changeYear();
                sendChangeEvent();
            });
            var months = parent.select(".month-selector").selectAll(".element").data(monthNames);
            var monthsUpdate = months.enter().append("div").attr("class", "element month").text(function(d) {
                return d;
            }).on("click", function(d) {
                var that = this;
                monthsUpdate.classed("active", function() {
                    return that === this;
                });
                configCache.month = d;
                changeMonth();
                sendChangeEvent();
            }).merge(months).classed("active", function(d) {
                return d === configCache.month;
            });
            if (config.defaultMonth && config.defaultYear) {
                setMonth(config.defaultMonth);
                setYear(config.defaultYear);
            } else if (config.defaultMonthNumber && config.defaultYear) {
                setMonthNumber(config.defaultMonthNumber);
                setYear(config.defaultYear);
            } else {
                setDate(config.defaultDate || new Date());
            }
            sendChangeEvent();
            function getDateFormats() {
                return {
                    year: configCache.year,
                    month: configCache.month,
                    date: getDate(),
                    iso: getISODate(),
                    formatted: getFormattedDate()
                };
            }
            function getDate() {
                return new Date(configCache.year, monthNames.indexOf(configCache.month));
            }
            function getFormattedDate(_format) {
                var format = _format || "%B %Y";
                return d3.timeFormat(format)(getDate());
            }
            function getISODate(_format) {
                return d3.isoFormat(getDate());
            }
            function setDate(date) {
                configCache = {
                    month: monthNames[new Date(date).getMonth()],
                    year: new Date(date).getFullYear()
                };
                changeYear();
                changeMonth();
                return this;
            }
            function setMonth(month) {
                configCache.month = month;
                changeMonth();
                return this;
            }
            function setYear(year) {
                configCache.year = year;
                changeYear();
                return this;
            }
            function getMonthNames() {
                return monthNames;
            }
            function setMonthNumber(monthNumber) {
                configCache.month = monthNames[monthNumber];
                changeMonth();
                return this;
            }
            function destroy() {
                config.parent.innerHTML = null;
            }
            return {
                on: dh.utils.rebind(events),
                getDateFormats: getDateFormats,
                getDate: getDate,
                getISODate: getISODate,
                getFormattedDate: getFormattedDate,
                setDate: setDate,
                setMonth: setMonth,
                setYear: setYear,
                getMonthNames: getMonthNames,
                setMonthNumber: setMonthNumber,
                destroy: destroy
            };
        };
        var dropdown = function(config) {
            var template = '<div class="datahub-dropdown">' + ' <div class="top">' + '     <div class="title"></div>' + '     <div class="selected-element"></div>' + " </div>" + ' <div class="elements"></div>' + "</div>";
            var parentNode = dh.utils.appendHtmlToNode(template, config.parent);
            var parent = d3.select(parentNode);
            var elementsContainer = parent.select(".elements");
            var elementsUpdate;
            var events = d3.dispatch("change");
            parent.select(".title").html(config.title);
            var selectedElement = parent.on("mouseover", function() {
                var isTouchDevice = "ontouchstart" in document.documentElement;
                var isOpen = elementsContainer.classed("active");
                if (!isOpen && !isTouchDevice) {
                    open();
                }
            }).on("mouseout", function() {
                var isOpen = elementsContainer.classed("active");
                var isTouchDevice = "ontouchstart" in document.documentElement;
                if (isOpen && !isTouchDevice) {
                    close();
                }
            }).select(".top").on("click", function() {
                var isOpen = elementsContainer.classed("active");
                if (isOpen) {
                    close();
                } else {
                    open();
                }
            }).select(".selected-element");
            function setSelected(label) {
                selectedElement.html(label);
                if (elementsUpdate) {
                    elementsUpdate.classed("active", function(d) {
                        return d.label === label;
                    });
                }
                return this;
            }
            function setElements(_elements) {
                if (!_elements) {
                    return this;
                }
                var elements = elementsContainer.selectAll(".element").data(_elements, function(d) {
                    return d.key;
                });
                elementsUpdate = elements.enter().append("div").attr("class", "element").on("mouseover", open).on("click", function(d) {
                    if (config.ignoreClickEvents) {
                        return;
                    }
                    var that = this;
                    elementsUpdate.classed("active", function() {
                        return that === this;
                    });
                    setSelected(d.label);
                    events.call("change", null, d);
                    close();
                }).merge(elements).html(function(d) {
                    return d.label;
                });
                elements.exit().remove();
                setSelected(config.selected || config.elements[0].label);
                return this;
            }
            setElements(config.elements);
            function toggle(open) {
                elementsContainer.classed("active", open);
                return this;
            }
            function open() {
                toggle(true);
                return this;
            }
            function close() {
                toggle(false);
                return this;
            }
            function isOpened() {
                return elementsContainer.classed("active");
            }
            return {
                on: dh.utils.rebind(events),
                toggle: toggle,
                open: open,
                close: close,
                isOpened: isOpened,
                setElements: setElements,
                setSelected: setSelected
            };
        };
        var dropdownCalendar = function(config) {
            var events = d3.dispatch("change");
            var menu = dropdown({
                parent: config.parent,
                ignoreClickEvents: true
            });
            var monthCalendar = calendar({
                parent: config.parent.querySelector(".elements"),
                defaultDate: config.defaultDate,
                defaultMonthNumber: config.defaultMonthNumber,
                defaultYear: config.defaultYear,
                defaultMonth: config.defaultMonth
            }).on("change", function(d) {
                events.call("change", null, d);
            }).on("update", function(d) {
                menu.setSelected(d.formatted);
            });
            menu.setSelected(monthCalendar.getFormattedDate());
            return {
                on: dh.utils.rebind(events),
                toggle: menu.toggle,
                open: menu.open,
                close: menu.close,
                isOpened: menu.isOpened,
                setElements: menu.setElements,
                setSelected: menu.setSelected,
                getDateFormats: monthCalendar.getDateFormats,
                getDate: monthCalendar.getDate,
                getISODate: monthCalendar.getISODate,
                getFormattedDate: monthCalendar.getFormattedDate,
                setDate: monthCalendar.setDate,
                setMonth: monthCalendar.setMonth,
                setYear: monthCalendar.setYear,
                getMonthNames: monthCalendar.getMonthNames,
                setMonthNumber: monthCalendar.setMonthNumber
            };
        };
        var timeSlider = dh.utils.pipeline(sliderScaleX, sliderAxisX, dh.common.svgContainer, sliderAxisComponentX, timeSlider);
        var buttonGroup = dh.utils.pipeline(dh.common.container, buttonGroupElements);
        dh.widget = {
            timeSlider: timeSlider,
            buttonGroup: buttonGroup,
            number: number,
            table: table,
            alertMessage: alert,
            monthCalendar: calendar,
            dropdown: dropdown,
            dropdownCalendar: dropdownCalendar
        };
    }(datahub, root.d3);
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
        var sliceDomain = function(values, sliceCount) {
            var stepWidth = (d3.max(values) - d3.min(values)) / sliceCount;
            return d3.range(sliceCount).map(function(d, i) {
                return d3.min(values) + i * stepWidth;
            });
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
            },
            reversedBrewerSpectral: function(values) {
                if (d3.min(values) >= 0) {
                    return d3.scaleLinear().domain(sliceDomain(values, brewerSpectral.length)).range(brewerSpectral.slice().reverse());
                }
                var negative = sliceDomain(values.filter(function(d) {
                    return d <= 0;
                }), brewerSpectral.length / 2 - 1);
                var positive = sliceDomain(values.filter(function(d) {
                    return d > 0;
                }), brewerSpectral.length / 2 - 1);
                var domainValues = negative.concat([ 0 ]).concat(positive);
                var colorScale = brewerSpectral.slice().reverse();
                return d3.scaleLinear().domain(domainValues).range(colorScale);
            }
        };
        dh.palette = colorScales;
    }(datahub, root.d3, root.colorBrewer);
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
                // when map is smaller than viewport
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
                                // colorHex = colorScale(value).substring(1)
                                // colorInt = parseInt(colorHex, 16)
                                colorRGB = dh.utils.parseRGB(colorScale(value));
                                for (x = 0; x < w; x++) {
                                    for (y = 0; y < h; y++) {
                                        imgDataIndex = (~~point.y + y - ~~(h / 2)) * mapSize.x + Math.min(Math.max(~~point.x + x - ~~(w / 2), 0), mapSize.x - 1);
                                        data[imgDataIndex] = 255 << 24 | // alpha
                                        colorRGB[2] << 16 | // blue
                                        colorRGB[1] << 8 | // green
                                        colorRGB[0];
 // red
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
                    // hack for removing antialisaing on img
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
     */;
        var selectorMap = function(config) {
            var selectionMap = rasterMap(config).init();
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
                L.marker(latLng, {
                    interactive: true
                }).on("click", function(e) {
                    removeAllPolygons();
                    zoomToBoundingBox();
                    events.call("markerClick", this, e);
                }, this).addTo(drawnItems);
                zoomToBoundingBox();
            }
            /**
         * Remove all polygons.
         * @name removeAllPolygons
         * @memberof selectorMap
         * @instance
         */            function removeAllPolygons() {
                drawnItems.clearLayers();
                drawControl._toolbars.draw._modes.rectangle.handler.disable();
                drawControl._toolbars.draw._modes.marker.handler.disable();
                return this;
            }
            function getFeatureFromCoordinates(coords) {
                return {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [ coords.concat([ coords[0] ]) ]
                    },
                    properties: {}
                };
            }
            function getPolyFeatureFromPoly(poly) {
                return {
                    type: "Feature",
                    geometry: {
                        type: poly.type,
                        coordinates: poly.coordinates
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
            /**
         * Add a rectangle vector.
         * @name addRectangle
         * @memberof selectorMap
         * @instance
         */            selectionMap.addRectangle = function(coords) {
                removeAllPolygons();
                var poly = getFeatureFromCoordinates(coords);
                addGeojson(poly, function() {
                    events.call("rectangleClick", this, arguments);
                });
                zoomToBoundingBox();
                return this;
            }
            /**
         * Add multiple polygons.
         * @name addPolygons
         * @param {Array.<object>} data An array of geojson.
         * @memberof selectorMap
         * @instance
         */;
            selectionMap.addPolygons = function(data) {
                removeAllPolygons();
                data.forEach(function(geojson) {
                    geojson[1].id = geojson[0];
                    var poly = getPolyFeatureFromPoly(geojson[1]);
                    addGeojson(poly, function() {
                        events.call("geojsonClick", this, geojson);
                    });
                });
                zoomToBoundingBox();
                return this;
            }
            /**
         * Zoom to vectors bbox.
         * @name zoomToBoundingBox
         * @memberof selectorMap
         * @instance
         */;
            function zoomToBoundingBox() {
                if (config.disableAutoZoom) {
                    return this;
                }
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
            selectionMap.addMarker = addMarker
            /**
         * Events binder.
         * @function on
         * @param {string} eventName The name of the event: 'mapCloseClick', 'rectangleDraw', 'rectangleClick', 'markerClick',
         'markerDraw', 'geojsonClick'
         * @param {function} callback The callback for this event
         * @memberof selectorMap
         * @instance
         */;
            selectionMap.on = dh.utils.rebind(events);
            return selectionMap;
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
     */;
        var rasterMap = function(_config) {
            var containerNode = L.DomUtil.create("div", "datahub-map");
            var container = _config.parent.appendChild(containerNode);
            var config = {
                container: container,
                colorScale: _config.colorScale,
                clusterMarkers: _config.clusterMarkers,
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
            function intelligentRound(value, sigDigits) {
                var absVal = Math.abs(value);
                if (absVal === 0) {
                    return 0;
                } else if (absVal < 1) {
                    return Number.parseFloat(value).toPrecision(sigDigits);
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
         */            function init() {
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
                        // take into account that rectangles are centered around raster point
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
                        // check if lat-lon are in data bounds
                                                var value = null;
                        if (e.latlng.lat <= gridData.lat[0] && e.latlng.lat >= gridData.lat[gridData.lat.length - 1] && e.latlng.lng >= gridData.lon[0] && e.latlng.lng <= gridData.lon[gridData.lon.length - 1]) {
                            value = gridData.values[latIndex][lonIndex];
                        }
                        if (value !== null && value !== -999 && config.showTooltip) {
                            var formattedValue = intelligentRound(value, 2);
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
                basemaps.basemapDark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png", {
                    attribution: "©OpenStreetMap, ©CartoDB",
                    tileSize: 256,
                    maxZoom: 19
                });
                basemaps.basemapLight = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
                    attribution: "©OpenStreetMap, ©CartoDB",
                    tileSize: 256,
                    maxZoom: 19
                });
                basemaps.labelLight = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", {
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
         */            function renderImage(image, metadata) {
                var bbox = metadata.bbox;
                var imageBounds = [ [ bbox.latMax, bbox.lonMin ], [ bbox.latMin, bbox.lonMax ] ];
                L.imageOverlay(image, imageBounds).addTo(map);
                return this;
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
         */            function show() {
                config.container.style.display = "block";
                states.isVisible = true;
                return this;
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
         */            function hide() {
                config.container.style.display = "none";
                states.isVisible = false;
                return this;
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
         */            function resize() {
                map.invalidateSize();
                if (cachedBBoxPolygon) {
                    zoomToPolygonBoundingBox(cachedBBoxPolygon);
                } else {
                    map.fitWorld();
                }
                return this;
            }
            /**
         * Zoom to fit a polygon.
         * @name zoomToPolygonBoundingBox
         * @param {object} polygon A valid geojson.
         * @memberof rasterMap
         * @instance
         */            function zoomToPolygonBoundingBox(polygon) {
                var bboxGeojsonLayer = L.geoJson(polygon);
                map.fitBounds(bboxGeojsonLayer.getBounds());
                cachedBBoxPolygon = polygon;
                return this;
            }
            /**
         * Add a polygon.
         * @name renderPolygon
         * @param {object} polygon A valid geojson.
         * @memberof rasterMap
         * @instance
         */            function renderPolygon(polygon) {
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
                });
                if (config.polygonTooltipFunc) {
                    geojsonLayer.bindTooltip(config.polygonTooltipFunc);
                }
                if (config.clusterMarkers) {
                    var markers = L.markerClusterGroup({
                        chunkedLoading: true,
                        showCoverageOnHover: false
                    });
                    markers.addLayer(geojsonLayer);
                    map.addLayer(markers);
                } else {
                    map.addLayer(geojsonLayer);
                }
                return this;
            }
            /**
         * Add a marker.
         * @name addMarker
         * @param {object} coordinates Marker coordinates.
         * @memberof rasterMap
         * @instance
         */            function addMarker(coordinates) {
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
            /**
         * Remove all markers.
         * @name addMarker
         * @memberof rasterMap
         * @instance
         */            function removeMarker() {
                if (marker) {
                    marker.remove();
                }
                return this;
            }
            /**
         * Render a raster layer from data.
         * @name addMarker
         * @param {object} data The grid data.
         * @memberof rasterMap
         * @instance
         */            function renderRaster(data) {
                gridData = data;
                var dataSorted = data.uniqueValues.sort(function(a, b) {
                    return a - b;
                });
                var colorScale = config.colorScale(dataSorted);
                gridLayer.setColorScale(colorScale).setData(data);
                return this;
            }
            /**
         * Hide all zoom controls.
         * @name hideZoomControl
         * @param {boolean=true} showIt Show the controls or not.
         * @memberof rasterMap
         * @instance
         */            function hideZoomControl(showIt) {
                if (showIt) {
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
            /**
         * Show a preset vector world map.
         * @name renderVectorMap
         * @memberof rasterMap
         * @instance
         */            function renderVectorMap() {
                datahub.data.getWorldVector(function(geojson) {
                    renderPolygon(geojson);
                });
                return this;
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
         */            return {
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
    !function(dh, d3) {
        var template = function(config) {
            var containerNode = config.parent.querySelector(".widget-container");
            if (!containerNode) {
                var template = '<div class="widget-container">' + '<svg class="datahub-chart">' + '<g class="panel">' + '<g class="stripe-group"></g>' + '<g class="area-group"></g>' + '<g class="stacked-area-group"></g>' + '<g class="reference-bar-group"></g>' + '<g class="reference-line-group"></g>' + '<g class="bar-group"></g>' + '<g class="stacked-bar-group"></g>' + '<g class="estimate-bar-group"></g>' + '<g class="line-group"></g>' + '<g class="dot-group"></g>' + '<g class="threshold-line-group"></g>' + '<g class="y axis"></g>' + '<g class="x axis"></g>' + '<g class="active-group"></g>' + '<g class="title-container">' + '<text class="y axis-title"></text>' + '<text class="x axis-title"></text>' + '<text class="chart-title"></text>' + "</g>" + '<g class="message-group"></g>' + '<g class="events"><rect class="event-panel"></rect></g>' + "</g>" + "</svg>" + "</div>";
                containerNode = dh.utils.appendHtmlToNode(template, config.parent);
            }
            var chartWidth = config.width - config.margin.left - config.margin.right;
            var chartHeight = config.height - config.margin.top - config.margin.bottom;
            var container = d3.select(containerNode);
            container.select("svg").attr("width", config.width).attr("height", config.height);
            container.select(".panel").attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")");
            container.select(".events rect").attr("width", chartWidth).attr("height", chartHeight).attr("opacity", 0);
            return {
                container: container,
                chartWidth: chartWidth,
                chartHeight: chartHeight
            };
        };
        var validateData = function(d, key, is2D) {
            return d[key] ? d[key].map(function(d) {
                d.timestamp = new Date(d.timestamp);
                d.value = Array.isArray(d.value) && !is2D ? d.value[0] : d.value;
                return d;
            }) : [];
        };
        var validateTimestamp = function(d) {
            return d.timestamp ? d.timestamp.map(function(d) {
                return new Date(d);
            }) : [];
        };
        var dataAdapter = function(config) {
            var d = config.data || {};
            return {
                dataIsEmpty: !d || !d.timestamp || !d.timestamp.length,
                data: {
                    timestamp: validateTimestamp(d),
                    stackedBarData: validateData(d, "stackedBarData", true),
                    stackedAreaData: validateData(d, "stackedAreaData", true),
                    lineData: validateData(d, "lineData", true),
                    barData: validateData(d, "barData"),
                    referenceData: validateData(d, "referenceData"),
                    estimateData: validateData(d, "estimateData"),
                    thresholdData: validateData(d, "thresholdData"),
                    areaData: validateData(d, "areaData")
                }
            };
        };
        var scaleX = function(config) {
            var dataX = config.dataIsEmpty ? 0 : config.data.timestamp;
            var scaleX = d3.scaleBand().domain(dataX).range([ 0, config.chartWidth ]).paddingInner(.4).paddingOuter(.2);
            var referenceScaleX = scaleX.copy().paddingInner(.1).paddingOuter(.05);
            var stripeScaleX = scaleX.copy().paddingInner(0).paddingOuter(0);
            var lineScaleX = scaleX.copy().paddingInner(1).paddingOuter(.5);
            return {
                scaleX: scaleX,
                referenceScaleX: referenceScaleX,
                stripeScaleX: stripeScaleX,
                lineScaleX: lineScaleX
            };
        };
        var scaleY = function(config) {
            var maxs = [];
            maxs.push(dh.utils.getExtent(config.data.barData));
            maxs.push(dh.utils.getExtent(config.data.referenceData));
            maxs.push(dh.utils.getExtent(config.data.estimateData));
            maxs.push(dh.utils.getExtent(config.data.thresholdData));
            maxs.push(dh.utils.getExtent(config.data.areaData));
            maxs.push(dh.utils.getStackExtent(config.data.stackedBarData));
            maxs.push(dh.utils.getStackExtent(config.data.stackedAreaData));
            maxs.push(dh.utils.getMultiExtent(config.data.lineData));
            var mins = [];
            var isMin = true;
            mins.push(dh.utils.getExtent(config.data.barData, isMin));
            mins.push(dh.utils.getExtent(config.data.referenceData, isMin));
            mins.push(dh.utils.getExtent(config.data.estimateData, isMin));
            mins.push(dh.utils.getExtent(config.data.thresholdData, isMin));
            mins.push(dh.utils.getExtent(config.data.areaData, isMin));
            mins.push(dh.utils.getStackExtent(config.data.stackedBarData, isMin));
            mins.push(dh.utils.getStackExtent(config.data.stackedAreaData, isMin));
            mins.push(dh.utils.getMultiExtent(config.data.lineData, isMin));
            var max = d3.max(maxs);
            var min;
            if (config.autoScaleY) {
                min = d3.min(mins);
                var padding = (max - min) / 10;
                min = Math.max(min - padding, 0);
                max += padding;
            } else {
                min = Math.min(d3.min(mins), 0);
                max = Math.max(max, 0);
            }
            var domain = [ min, max ];
            if (config.domain) {
                domain = config.domain;
            } else {
                domain;
            }
            if (config.reverseY) {
                domain = [ domain[1], domain[0] ];
            }
            var scaleY = d3.scaleLinear().domain(domain).range([ config.chartHeight, 0 ]);
            return {
                scaleY: scaleY
            };
        };
        var findData = function(data, key, timestamp) {
            if (!timestamp) {
                return null;
            }
            var index = data[key].map(function(d) {
                return d.timestamp && d.timestamp.getTime();
            }).indexOf(timestamp.getTime());
            if (index > -1) {
                var datum = dh.utils.mergeAll({}, data[key][index]);
                datum.value = [].concat(data[key][index].value);
                datum.id = [].concat(data[key][index].id);
                return datum;
            } else {
                return null;
            }
        };
        var findThresholdData = function(data, key, timestamp) {
            if (data[key][0]) {
                var datum = dh.utils.mergeAll({}, data[key][0]);
                datum.value = [].concat(data[key][0].value);
                datum.id = [].concat(data[key][0].id);
                return datum;
            } else {
                return null;
            }
        };
        var getValuesAtTimestamp = function(timestamp, data) {
            var values = {
                referenceData: findData(data, "referenceData", timestamp),
                estimateData: findData(data, "estimateData", timestamp),
                barData: findData(data, "barData", timestamp),
                stackedBarData: findData(data, "stackedBarData", timestamp),
                lineData: findData(data, "lineData", timestamp),
                areaData: findData(data, "areaData", timestamp),
                stackedAreaData: findData(data, "stackedAreaData", timestamp),
                thresholdData: findThresholdData(data, "thresholdData", timestamp)
            };
            return values;
        };
        var eventsPanel = function(config) {
            var eventPanel = config.container.select(".events .event-panel").on("mousemove touchstart", function(d) {
                if (config.dataIsEmpty) {
                    return;
                }
                var mouseX = d3.mouse(this)[0];
                var w = config.stripeScaleX.bandwidth();
                var domain = config.stripeScaleX.domain();
                var domainLength = domain.length;
                var index = Math.min(~~(mouseX / w), domainLength - 1);
                var timestamp = domain[index];
                var values = getValuesAtTimestamp(timestamp, config.data);
                config.events.call("hover", null, {
                    index: index,
                    timestamp: timestamp,
                    data: values,
                    config: config,
                    event: d3.event
                });
            }, {
                passive: true
            }).on("mouseout", function(d) {
                config.events.call("mouseout", null, {});
            }).on("click", function(d) {
                config.events.call("click", null, {
                    event: d3.event
                });
            });
            return {
                eventPanel: eventPanel
            };
        };
        var barShapes = function(config) {
            var shapes = config.container.select(".bar-group").selectAll("rect.bar").data(config.data.barData);
            shapes.enter().append("rect").merge(shapes).attr("class", function(d) {
                return [ "bar", d.id, d.className ].join(" ");
            }).attr("x", function(d, i) {
                return config.scaleX(d.timestamp) || 0;
            }).attr("y", function(d) {
                if (config.autoScaleY) {
                    return config.chartHeight - (config.chartHeight - Math.abs(config.scaleY(d.value)));
                }
                if (d.value >= 0 || config.reverseY) {
                    return config.scaleY(0) - Math.abs(config.scaleY(d.value) - config.scaleY(0));
                } else {
                    return config.scaleY(0);
                }
            }).attr("width", function(d) {
                return config.scaleX.bandwidth();
            }).attr("height", function(d) {
                if (config.autoScaleY) {
                    return config.chartHeight - Math.abs(config.scaleY(d.value));
                }
                return Math.abs(config.scaleY(d.value) - config.scaleY(0));
            });
            shapes.exit().remove();
            return {};
        };
        var estimateBarShapes = function(config) {
            var shapes = config.container.select(".estimate-bar-group").selectAll("rect.estimate-bar").data(config.data.estimateData);
            shapes.enter().append("rect").merge(shapes).attr("class", function(d) {
                return [ "estimate-bar", d.id, d.className ].join(" ");
            }).attr("x", function(d, i) {
                return config.scaleX(d.timestamp) || 0;
            }).attr("y", function(d) {
                return config.scaleY(d.value) || 0;
            }).attr("width", function(d) {
                return config.scaleX.bandwidth();
            }).attr("height", function(d) {
                return config.chartHeight - config.scaleY(d.value) || 0;
            });
            shapes.exit().remove();
            return {};
        };
        var referenceBarShapes = function(config) {
            var shapes = config.container.select(".reference-bar-group").selectAll("rect.reference-bar").data(config.data.referenceData);
            shapes.enter().append("rect").merge(shapes).attr("class", function(d) {
                return [ "reference-bar", d.id, d.className ].join(" ");
            }).attr("x", function(d, i) {
                return config.referenceScaleX(d.timestamp) || 0;
            }).attr("y", function(d) {
                if (config.autoScaleY) {
                    return config.chartHeight - (config.chartHeight - Math.abs(config.scaleY(d.value)));
                }
                if (d.value >= 0 || config.reverseY) {
                    return config.scaleY(0) - Math.abs(config.scaleY(d.value) - config.scaleY(0));
                } else {
                    return config.scaleY(0);
                }
            }).attr("width", function(d) {
                return config.referenceScaleX.bandwidth();
            }).attr("height", function(d) {
                if (config.autoScaleY) {
                    return config.chartHeight - Math.abs(config.scaleY(d.value));
                }
                return Math.abs(config.scaleY(d.value) - config.scaleY(0));
            });
            shapes.exit().remove();
            var lines = config.container.select(".reference-line-group").selectAll("path.reference-top").data(config.data.referenceData);
            lines.enter().append("path").attr("class", "reference-top").merge(lines).attr("d", function(d, i) {
                var x = config.referenceScaleX(d.timestamp) || 0;
                var y = 0;
                if (d.value >= 0 || config.reverseY) {
                    y = config.scaleY(0) - Math.abs(config.scaleY(d.value) - config.scaleY(0));
                } else {
                    y = config.scaleY(0) + Math.abs(config.scaleY(d.value) - config.scaleY(0));
                }
                var width = config.referenceScaleX.bandwidth();
                return "M" + [ [ x, y ], [ x + width, y ] ];
            });
            lines.exit().remove();
            return {};
        };
        var stackedBarShapes = function(config) {
            if (!config.data.stackedBarData || !config.data.stackedBarData.length) {
                config.container.select(".stacked-bar-group").selectAll("g.stack").remove();
                return {};
            }
            var keys = config.data.stackedBarData[0].value.map(function(d, i) {
                return "y" + i;
            });
            var data = [];
            config.data.stackedBarData.forEach(function(d, i) {
                var datum = dh.utils.mergeAll({}, d);
                if (d.value && d.value.length) {
                    d.value.forEach(function(dB, iB) {
                        datum["y" + iB] = dB;
                    });
                    data.push(datum);
                }
            });
            var stackedBar = config.container.select(".stacked-bar-group").selectAll("g.stack").data(d3.stack().keys(keys)(data));
            var bar = stackedBar.enter().append("g").attr("class", "stack").merge(stackedBar).selectAll("rect.stacked-bar").data(function(d, i) {
                d.forEach(function(dB) {
                    dB.index = d.index;
                    // dB.id = dB.data.id && dB.data.id.length ? dB.data.id[d.index] : null
                                });
                return d;
            });
            bar.enter().append("rect").attr("class", "stacked-bar").merge(bar).attr("class", function(d, a, b) {
                var id = d.data.id ? d.data.id[d.index] : null;
                var className = d.data.className ? d.data.className[d.index] : null;
                return [ "stacked-bar", "layer" + d.index, id, className ].join(" ");
            }).filter(function(d) {
                return !Number.isNaN(d[0]) && !Number.isNaN(d[1]);
            }).attr("x", function(d) {
                return config.scaleX(d.data.timestamp);
            }).attr("y", function(d) {
                return config.scaleY(d[1]);
            }).attr("height", function(d) {
                return config.scaleY(d[0]) - config.scaleY(d[1]);
            }).attr("width", config.scaleX.bandwidth());
            bar.exit().remove();
            stackedBar.exit().remove();
            return {};
        };
        var lineShapes = function(config) {
            if (!config.data.lineData.length) {
                config.container.select(".line-group").selectAll("path.line").remove();
                return {};
            }
            var line = d3.line().defined(function(d) {
                return d.value != null;
            }).x(function(d) {
                return config.lineScaleX(d.timestamp);
            }).y(function(d) {
                return config.scaleY(d.value);
            });
            var data = [];
            var valueLength = config.data.lineData[0].value.length;
            if (typeof valueLength === "undefined") {
                data.push(config.data.lineData);
            } else {
                for (var i = 0; i < valueLength; i++) {
                    var layer = config.data.lineData.map(function(dB) {
                        return {
                            timestamp: dB.timestamp,
                            value: dB.value[i],
                            id: dB.id && dB.id[i],
                            className: dB.className && dB.className[i]
                        };
                    });
                    data.push(layer);
                }
            }
            var shapes = config.container.select(".line-group").selectAll("path.line").data(data);
            shapes.enter().append("path").style("fill", "none").merge(shapes).attr("class", function(d, i) {
                return [ "line", "layer" + i, d[0].id, d[0].className ].join(" ");
            }).attr("d", line);
            shapes.exit().remove();
            return {};
        };
        var dotShapes = function(config) {
            if (!config.data.lineData.length) {
                config.container.select(".dot-group").selectAll(".dot-layer").remove();
                return {};
            }
            var data = config.data.lineData;
            var dataCut = [];
            var valueLength = data[0].value.length;
            for (var i = 0; i < valueLength; i++) {
                var layer = [];
                data.forEach(function(dB, iB) {
                    var prevIdx = Math.max(0, iB - 1);
                    var nextIdx = Math.min(data.length - 1, iB + 1);
                    var currentIdx = iB;
                    var prev = data[prevIdx].value[i];
                    var next = data[nextIdx].value[i];
                    var current = dB.value[i];
                    if (current !== null && (prev === null || next === null) || currentIdx === prevIdx && currentIdx === nextIdx) {
                        layer.push({
                            value: current,
                            timestamp: dB.timestamp,
                            layer: i
                        });
                    }
                });
                dataCut.push(layer);
            }
            var dotLayers = config.container.select(".dot-group").selectAll(".dot-layer").data(dataCut);
            var dotLayersUpdate = dotLayers.enter().append("g").merge(dotLayers).attr("class", "dot-layer");
            dotLayers.exit().remove();
            var shapes = dotLayersUpdate.selectAll(".dot").data(function(d, i) {
                return d;
            });
            shapes.enter().append("circle").merge(shapes).attr("class", function(d, i, a) {
                // return ['dot', 'layer' + i, d[0].id, d[0].className].join(' ')
                return [ "dot", "layer" + d.layer ].join(" ");
            }).attr("cx", function(d) {
                return config.lineScaleX(d.timestamp);
            }).attr("cy", function(d) {
                return config.scaleY(d.value);
            }).attr("r", 2);
            shapes.exit().remove();
            return {};
        };
        var thresholdLineShape = function(config) {
            var line = config.container.select(".threshold-line-group").selectAll("line.threshold-line").data(config.data.thresholdData);
            line.enter().append("line").merge(line).attr("class", function(d) {
                return [ "threshold-line", d.id, d.className ].join(" ");
            }).attr("x1", 0).attr("y1", function(d) {
                return config.scaleY(d.value) || 0;
            }).attr("x2", config.chartWidth).attr("y2", function(d) {
                return config.scaleY(d.value) || 0;
            }).attr("display", function(d) {
                return d ? null : "none";
            });
            line.exit().remove();
            return {};
        };
        var areaShapes = function(config) {
            if (!config.data.areaData || !config.data.areaData.length) {
                config.container.select(".area-group").selectAll("path.area").remove();
                return {};
            }
            var areaGenerator = d3.area().defined(function(d) {
                return d.value != null;
            }).x(function(d) {
                return config.lineScaleX(d.timestamp);
            }).y0(config.chartHeight).y1(function(d) {
                return config.scaleY(d.value);
            });
            var shapes = config.container.select(".area-group").selectAll("path.area").data([ config.data.areaData ]);
            shapes.enter().append("path").attr("class", function(d, i) {
                return [ "area", "layer" + i, d[0].id, d[0].className ].join(" ");
            }).merge(shapes).attr("d", areaGenerator);
            shapes.exit().remove();
            return {};
        };
        var stackedAreaShapes = function(config) {
            if (!config.data.stackedAreaData || !config.data.stackedAreaData.length) {
                config.container.select(".stacked-area-group").selectAll("g.stack-area").remove();
                return {};
            }
            var keys = config.data.stackedAreaData[0].value.map(function(d, i) {
                return "y" + i;
            });
            var areaGenerator = d3.area().defined(function(d) {
                return !Number.isNaN(d[0]) && !Number.isNaN(d[1]);
            }).x(function(d) {
                return config.lineScaleX(d.data.timestamp);
            }).y0(function(d) {
                return config.scaleY(d[0]);
            }).y1(function(d) {
                return config.scaleY(d[1]);
            });
            var data = [];
            config.data.stackedAreaData.forEach(function(d, i) {
                var datum = dh.utils.mergeAll({}, d);
                if (d.value && d.value.length) {
                    d.value.forEach(function(dB, iB) {
                        datum["y" + iB] = dB;
                    });
                    data.push(datum);
                }
            });
            var stackedArea = config.container.select(".stacked-area-group").selectAll("g.stack-area").data(d3.stack().keys(keys)(data));
            var area = stackedArea.enter().append("g").attr("class", "stack-area").merge(stackedArea).selectAll("path.stacked-area").data(function(d, i) {
                d.forEach(function(dB) {
                    dB.index = d.index;
                });
                return [ d ];
            });
            area.enter().append("path").merge(area).attr("class", function(d) {
                var id = d[0].data.id ? d[0].data.id[d.index] : null;
                var className = d[0].data.className ? d[0].data.className[d.index] : null;
                return [ "stacked-area", "layer" + d.index, id, className ].join(" ");
            }).attr("d", areaGenerator);
            area.exit().remove();
            stackedArea.exit().remove();
            return {};
        };
        var stripes = function(config) {
            if (config.showStripes === false) {
                config.container.select(".stripe-group").selectAll("rect.stripe").remove();
                return {};
            }
            var shapes = config.container.select(".stripe-group").selectAll("rect.stripe").data(config.data.timestamp);
            shapes.enter().append("rect").attr("class", "stripe").merge(shapes).classed("even", function(d, i) {
                return i % 2;
            }).attr("x", function(d, i) {
                return config.stripeScaleX(d) || 0;
            }).attr("y", function(d) {
                return 0;
            }).attr("width", function(d) {
                return config.stripeScaleX.bandwidth();
            }).attr("height", function(d) {
                return config.chartHeight;
            });
            shapes.exit().remove();
            return {};
        };
        var active = function(config) {
            // if config.activeDate is the date Object use it straight, if it's text convert to date object
            var activeTs = !config.activeDate || config.activeDate.getTime === undefined ? new Date(config.activeDate).getTime() : config.activeDate.getTime();
            var selectedTimestamp = config.data.timestamp.filter(function(d) {
                return d.getTime() === activeTs;
            });
            var shapes = config.container.select(".active-group").selectAll("rect.active").data(selectedTimestamp);
            shapes.enter().append("rect").attr("class", "active").merge(shapes).each(function(d) {
                if (config.dataIsEmpty) {
                    return;
                }
                var values = getValuesAtTimestamp(d, config.data);
                config.events.call("active", null, {
                    timestamp: d,
                    data: values,
                    config: config,
                    event: d3.event
                });
            }).attr("x", function(d, i) {
                return config.stripeScaleX(d) || 0;
            }).attr("y", function(d) {
                return 0;
            }).attr("width", function(d) {
                return config.stripeScaleX.bandwidth();
            }).attr("height", function(d) {
                return config.chartHeight;
            });
            shapes.exit().remove();
            return {};
        };
        var multi = dh.utils.pipeline(dh.common.defaultConfig, dataAdapter, 
        // dh.common.printer,
        template, scaleX, scaleY, eventsPanel, 
        // chart.axesFormatAutoconfig,
        dh.common.axisX, dh.common.axisY, stripes, active, areaShapes, referenceBarShapes, stackedBarShapes, stackedAreaShapes, barShapes, estimateBarShapes, lineShapes, dotShapes, thresholdLineShape, dh.common.axisComponentY, dh.common.labelsRewriterY, dh.common.message, dh.common.axisComponentX, dh.common.axisTitleComponentX, 
        // dh.common.axisXFormatterRotate30,
        dh.common.axisTitleComponentY, dh.common.chartTitleComponent);
        /**
   * A configurable line/bar/area chart.
   * @namespace multiChart
   * @name multiChart
   * @param {object} config The initial configuration can be passed on init or later using multiChart.setConfig.
   * @param {object} config.parent The parent DOM element.
   * @param {object} [config.data] Data can be passed on init or later using multichart.setData.
   * @param {number} [config.width=parent.innerWidth] External width of the chart.
   * @param {number} [config.height=parent.innerHeight] External height of the chart.
   * @param {object} [config.margin={top:50, right:50, bottom:100, left:50}] Margins around the chart panel.
   * @param {string} [config.axisXFormat='%b'] Label x labels format, as passed to d3.utcFormat.
   * @param {string} [config.axisTitleX] X axis title.
   * @param {string} [config.axisTitleY] Y axis title.
   * @param {string} [config.chartTitle] Chart title.
   * @param {boolean} [config.reverseY] Reverse the Y axis so higher values are on the bottom.
   * @param {boolean} [config.autoScaleY] Auto range the scale from y data instead of clamping min to zero or negative.
   * @param {Array.<number>} [config.domain] [min, max] domain of the y scale, defaults to data extent.
   * @param {function} [config.labelsRewriterY] Y axis label rewriting function. Receives (label, index) and has to return a string or a DOM string.
   * @returns {object} A multichart instance.
   * @example
   * datahub.multiChart({
   *     parent: document.querySelector('.chart'),
   *     data: {
   *         timestamp: datahub.data.generateTimestamps(),
   *         barData: datahub.data.generateTimeSeries()
   *     }
   * })
   */        var multiChart = function(config) {
            var configCache, events = d3.dispatch("hover", "click", "mouseout", "active"), chartCache, uid = ~~(Math.random() * 1e4);
            var onResize = dh.utils.throttle(function() {
                configCache.width = configCache.parent.clientWidth;
                render();
            }, 200);
            d3.select(window).on("resize." + uid, onResize);
            var render = function() {
                chartCache = multi(configCache);
            };
            /**
     * Set the data.
     * @name setData
     * @param {object} data A data object.
     * @returns {object} The multiChart instance.
     * @memberof multiChart
     * @instance
     * @example
     * datahub.multiChart({
     *     parent: document.querySelector('.chart'),
     * })
     * .setData({
     *     timestamp: datahub.data.generateTimestamps(),
     *     barData: datahub.data.generateTimeSeries()
     * })
     */            var setData = function(data) {
                var d = data ? JSON.parse(JSON.stringify(data)) : {};
                configCache = dh.utils.mergeAll({}, configCache);
                configCache.data = d;
                render();
                return this;
            };
            /**
     * Set the config after its instantiation.
     * @name setConfig
     * @param {object} config The same config format as on init.
     * @returns {object} The multiChart instance.
     * @memberof multiChart
     * @instance
     * @example
     * datahub.multiChart({
     *     parent: document.querySelector('.chart'),
     * })
     * .setConfig({
     *     width: 100
     * })
     */            var setConfig = function(config) {
                configCache = dh.utils.mergeAll(configCache, config);
                render();
                return this;
            };
            var init = function(config, events) {
                setConfig(dh.utils.mergeAll(config, {
                    events: events
                }));
            };
            /**
     * Destroys DOM elements and unbind events.
     * @name destroy
     * @memberof multiChart
     * @instance
     * @example
     * var chart = datahub.multiChart({
     *     parent: document.querySelector('.chart'),
     * })
     * chart.destroy()
     */            var destroy = function() {
                d3.select(window).on("resize." + uid, null);
                configCache.parent.innerHTML = null;
            };
            init(config, events);
            /**
     * Events binder.
     * @function on
     * @param {string} eventName The name of the event: 'hover', 'click', 'mouseout', 'active'
     * @param {function} callback The callback for this event
     * @memberof multiChart
     * @instance
     * @example
     * datahub.multiChart({
     *     parent: document.querySelector('.chart'),
     * })
     * .on('hover', function(e) {
     *     console.log(e.index, e.timestamp, e.data, e.config, e.event)
     * })
     */            return {
                on: dh.utils.rebind(events),
                setConfig: setConfig,
                setData: setData,
                destroy: destroy
            };
        };
        dh.multiChart = multiChart;
    }(datahub, root.d3);
    !function(dh, d3) {
        var template = function(config) {
            var containerNode = config.parent.querySelector(".datahub-table-chart");
            if (!containerNode) {
                var template = '<div class="datahub-table-chart">' + '<div class="table-container">' + '<div class="header"><div class="row"></div></div>' + '<div class="content">' + "</div>" + '<div class="footer"><div class="row"></div></div>' + "</div>" + '<div class="chart-container">' + '<div class="header"><div class="row"></div></div>' + '<div class="content">' + '<div class="rows"></div>' + '<div class="chart">' + "<svg>" + '<g class="panel">' + '<g class="stripes"></g>' + '<g class="bars"></g>' + '<g class="axis"></g>' + '<g class="message-group"></g>' + "</g>" + "</svg>" + "</div>" + "</div>" + '<div class="footer"><div class="row"></div></div>' + "</div>" + "</div>";
                containerNode = dh.utils.appendHtmlToNode(template, config.parent);
            }
            var dataIsEmpty = !(config.elements && config.elements.length);
            var defaultMargin = {
                top: 0,
                bottom: 24,
                right: 24,
                left: 24
            };
            var margin = config.margin || defaultMargin;
            var rowHeight = config.rowHeight || 48;
            var container = d3.select(containerNode);
            var chartContainer = container.select(".chart-container");
            var width = chartContainer.node().clientWidth;
            var chartWidth = width - margin.left - margin.right;
            var height = dataIsEmpty ? rowHeight : config.elements.length * rowHeight + margin.bottom;
            var chartHeight = height - margin.bottom;
            return {
                container: container,
                width: width,
                height: height,
                chartWidth: chartWidth,
                chartHeight: chartHeight,
                rowHeight: rowHeight,
                margin: margin,
                dataIsEmpty: dataIsEmpty
            };
        };
        var sort = function(config) {
            if (config.elements) {
                var cloned = config.elements.slice();
                var sorted = cloned.sort(config.sortFunc);
                return {
                    elements: sorted
                };
            }
            return {};
        };
        var scaleX = function(config) {
            var domain = config.domain || [ 0, 0 ];
            if (!config.domain && config.elements) {
                var values = d3.merge(config.elements).filter(function(d) {
                    return d.key === config.valueKey || d.key === config.referenceKey;
                }).map(function(d) {
                    return d.value;
                });
                domain = values.length ? d3.extent(values) : [ 0, 0 ];
            }
            domain[0] = Math.min(domain[0], 0);
            var largest = Math.max(Math.abs(domain[0]), Math.abs(domain[1]));
            domain = [ -largest, largest ];
            var linearScaleX = d3.scaleLinear().domain(domain).range([ 0, config.chartWidth ]);
            return {
                scaleX: linearScaleX
            };
        };
        var axisX = function(config) {
            var axisXFormat = config.axisXFormat || ".2s";
            var axisXComponent = d3.axisBottom().scale(config.scaleX).tickFormat(d3.format(axisXFormat));
            var axis = config.container.select(".axis").attr("transform", "translate(" + [ 0, config.chartHeight ] + ")").attr("display", config.dataIsEmpty ? "none" : "block").call(axisXComponent);
            return {
                axisX: axis
            };
        };
        var header = function(config) {
            var headerColumns = config.container.select(".header .row").selectAll("div.column").data(config.header || []);
            headerColumns.enter().append("div").merge(headerColumns).attr("class", function(d) {
                return "column " + d.key;
            }).html(function(d) {
                if (Array.isArray(d.label)) {
                    var lines = d.label.map(function(dB, iB) {
                        return "<div>" + dB + "</div>";
                    }).join("");
                    return '<div class="multiline">' + lines + "</div>";
                }
                return d.label;
            });
            headerColumns.exit().remove();
            return {};
        };
        var body = function(config) {
            var tableContentRows = config.container.select(".table-container .content").selectAll("div.row").data(config.elements || []);
            var tableContentRowsUpdate = tableContentRows.enter().append("div").merge(tableContentRows).attr("class", "row");
            tableContentRows.exit().remove();
            var tableContentColumns = tableContentRowsUpdate.selectAll("div.column").data(function(d) {
                return d;
            });
            tableContentColumns.enter().append("div").merge(tableContentColumns).attr("class", "column").html(function(d) {
                if (typeof d.label === "number") {
                    var defaultFormat = function(d) {
                        return Math.floor(d * 100) / 100;
                    };
                    var format = config.valueFormat || defaultFormat;
                    return format(d.label);
                } else if (Array.isArray(d.label)) {
                    var lines = d.label.map(function(dB, iB) {
                        return "<div>" + dB + "</div>";
                    }).join("");
                    return '<div class="multiline">' + lines + "</div>";
                } else if (d.label === null || typeof d.label === "undefined") {
                    return config.emptyPlaceholder || "";
                } else {
                    return d.label;
                }
            });
            tableContentColumns.exit().remove();
            var chartContentRows = config.container.select(".chart-container .rows").selectAll("div.row").data(config.elements || []);
            chartContentRows.enter().append("div").attr("class", "row").append("div").attr("class", "column");
            chartContentRows.exit().remove();
            return {};
        };
        var bars = function(config) {
            var barGroups = config.container.select("svg").attr("width", config.width).attr("height", config.height).select(".panel").attr("transform", "translate(" + config.margin.left + " 0)").select(".bars").selectAll("g.bar-group").data(config.elements || []);
            var barGroupsUpdate = barGroups.enter().append("g").merge(barGroups).attr("class", "bar-group").attr("transform", function(d, i) {
                return "translate(0 " + i * config.rowHeight + ")";
            });
            barGroups.exit().remove();
            var referenceBars = barGroupsUpdate.selectAll("rect.reference-bar").data(function(d, i) {
                var referenceElement = d.filter(function(dB) {
                    return dB.key === config.referenceKey;
                });
                return [ referenceElement && referenceElement[0] ];
            });
            referenceBars.enter().append("rect").merge(referenceBars).attr("class", "reference-bar").attr("width", function(d) {
                return Math.abs(config.scaleX(d.value) - config.scaleX(0));
            }).attr("height", function(d) {
                return config.rowHeight / 2;
            }).attr("x", function(d) {
                return d.value < 0 ? config.scaleX(d.value) : config.scaleX(0);
            }).attr("y", function(d) {
                return config.rowHeight / 4;
            });
            referenceBars.exit().remove();
            var referenceLineWidth = 2;
            var referenceLines = barGroupsUpdate.selectAll("rect.reference-line").data(function(d, i) {
                var referenceElement = d.filter(function(dB) {
                    return dB.key === config.referenceKey;
                });
                return [ referenceElement && referenceElement[0] ];
            });
            referenceLines.enter().append("rect").merge(referenceLines).attr("class", "reference-line").attr("display", function(d) {
                return d.value || d.value === 0 ? "block" : "none";
            }).attr("width", referenceLineWidth).attr("height", function(d) {
                return config.rowHeight / 2;
            }).attr("x", function(d) {
                var offset = referenceLineWidth;
                if (d.value > 0) {
                    offset *= -1;
                }
                return config.scaleX(d.value) + offset;
            }).attr("y", function(d) {
                return config.rowHeight / 4;
            });
            referenceLines.exit().remove();
            var valueBars = barGroupsUpdate.selectAll("rect.value-bar").data(function(d, i) {
                var valueElement = d.filter(function(dB) {
                    return dB.key === config.valueKey;
                });
                return [ valueElement && valueElement[0] ];
            });
            valueBars.enter().append("rect").merge(valueBars).attr("class", "value-bar").attr("width", function(d) {
                return Math.abs(config.scaleX(d.value) - config.scaleX(0));
            }).attr("height", function(d) {
                return config.rowHeight / 4;
            }).attr("x", function(d) {
                return d.value < 0 ? config.scaleX(d.value) : config.scaleX(0);
            }).attr("y", function(d) {
                return config.rowHeight * 3 / 8;
            });
            valueBars.exit().remove();
            return {};
        };
        var eventsPanel = function(config) {
            config.container.on("click", function() {
                config.events.call("click", null, {
                    event: d3.event
                });
            });
            // var eventPanel = config.container.select('.events')
            //     .selectAll('rect.event-panel')
            //     .data([0])
            // eventPanel.enter().append('rect')
            //     .attr('class', 'event-panel')
            //     .merge(eventPanel)
            //     .on('mousemove', function(d) {
            //         config.events.call('barHover', null, {})
            //         console.log(111)
            //     })
            // eventPanel.exit().remove()
                        return {};
        };
        var stripes = function(config) {
            var ticks = config.scaleX.ticks();
            var stripes = config.container.select(".stripes").selectAll("rect.stripe").data(ticks);
            stripes.enter().append("rect").attr("class", "stripe").merge(stripes).attr("x", function(d, i) {
                var previousTick = ticks[Math.max(i - 1, 0)];
                var width = (config.scaleX(d) - config.scaleX(previousTick)) / 2;
                return config.scaleX(d) - width;
            }).attr("y", function(d) {
                return 0;
            }).attr("width", function(d, i) {
                var previousTick = ticks[Math.max(i - 1, 0)];
                var width = (config.scaleX(d) - config.scaleX(previousTick)) / 2;
                width = Math.max(width, 0);
                return width;
            }).attr("height", function(d) {
                return config.chartHeight;
            });
            stripes.exit().remove();
            return {};
        };
        var verticalLines = function(config) {
            var ticks = config.scaleX.ticks();
            var lines = config.container.select(".stripes").selectAll("line.grid").data([ 0 ]);
            lines.enter().append("line").attr("class", "grid").merge(lines).attr("display", config.dataIsEmpty ? "none" : "block").attr("x1", function(d) {
                return config.scaleX(0) + .5;
            }).attr("y1", 0).attr("x2", function(d) {
                return config.scaleX(0) + .5;
            }).attr("y2", config.chartHeight);
            lines.exit().remove();
            return {};
        };
        var message = function(config) {
            var message = "";
            if (config.dataIsEmpty) {
                message = "(Data unavailable)";
            } else if (config.dataIsAllNulls) {
                message = "Values are all null";
            }
            var text = config.container.select(".message-group").selectAll("text").data([ message ]);
            text.enter().append("text").merge(text).text(function(d) {
                return d;
            }).attr("x", (config.scaleX.range()[1] - config.scaleX.range()[0]) / 2).attr("y", function() {
                return config.chartHeight / 2 + this.getBBox().height / 2;
            }).attr("dx", function(d) {
                return -this.getBBox().width / 2;
            });
            text.exit().remove();
            return {};
        };
        var labelsRewriterX = function(config) {
            if (!config.labelsRewriterX) {
                return {};
            }
            config.container.selectAll(".axis").selectAll("text").html(function(d, i) {
                return config.labelsRewriterX(d, i, config);
            });
            return {};
        };
        var multi = dh.utils.pipeline(template, sort, header, body, scaleX, eventsPanel, stripes, verticalLines, axisX, labelsRewriterX, bars);
        var tableChart = function(config) {
            var configCache, events = d3.dispatch("click"), chartCache, uid = ~~(Math.random() * 1e4);
            var onResize = dh.utils.throttle(function() {
                configCache.width = configCache.parent.clientWidth;
                render();
            }, 200);
            d3.select(window).on("resize." + uid, onResize);
            var render = function() {
                chartCache = multi(configCache);
            };
            var setData = function(data) {
                var d = data ? JSON.parse(JSON.stringify(data)) : {};
                configCache = dh.utils.mergeAll({}, configCache, {
                    data: d
                });
                render();
                return this;
            };
            var setConfig = function(config) {
                configCache = dh.utils.mergeAll(configCache, config);
                render();
                return this;
            };
            var init = function(config, events) {
                setConfig(dh.utils.mergeAll(config, {
                    events: events
                }));
            };
            var destroy = function() {
                d3.select(window).on("resize." + uid, null);
                configCache.parent.innerHTML = null;
            };
            init(config, events);
            return {
                on: dh.utils.rebind(events),
                setConfig: setConfig,
                setData: setData,
                destroy: destroy
            };
        };
        dh.tableChart = tableChart;
    }(datahub, root.d3);
    !function(dh, d3) {
        var template = function(config) {
            var containerNode = config.parent.querySelector(".datahub-timeseries-chart");
            if (!containerNode) {
                var template = '<div class="datahub-timeseries-chart">' + '<div class="number-group"></div>' + '<div class="chart-group">' + "<svg>" + '<g class="panel">' + '<g class="grid x"></g>' + '<g class="shapes"></g>' + '<g class="axis x"></g>' + '<g class="axis y"></g>' + '<g class="axis-title x"><text></text></g>' + '<g class="axis-title y"><text></text></g>' + '<g class="reference"></g>' + "</g>" + '<g class="tooltip"><line></line></g>' + '<g class="message-group"></g>' + '<g class="events"><rect class="event-panel"></rect></g>' + "</svg>" + "</div>" + "</div>";
                containerNode = dh.utils.appendHtmlToNode(template, config.parent);
            }
            var container = d3.select(containerNode);
            var width = config.width || config.parent.clientWidth;
            var height = config.height || config.parent.clientHeight;
            var chartWidth = width - config.margin.left - config.margin.right;
            var chartHeight = height - config.margin.top - config.margin.bottom;
            container.select("svg").attr("width", width).attr("height", height);
            container.select(".panel").attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")");
            container.select(".events rect").attr("width", width).attr("height", height).attr("opacity", 0);
            return {
                container: container,
                width: width,
                height: height,
                chartWidth: chartWidth,
                chartHeight: chartHeight
            };
        };
        var defaultConfig = function(config) {
            var defaultMargin = {
                top: 0,
                right: 0,
                bottom: 10,
                left: 10
            };
            return {
                margin: config.margin || defaultMargin,
                hide: config.hide || [],
                chartType: config.chartType || "line"
            };
        };
        var normalizeTime = function(d) {
            d = typeof d === "object" ? d.toString() : d;
            var i = d.indexOf("+");
            if (i === -1) return d;
            var offset = d.slice(i);
            return d.slice(0, i) + offset.slice(0, 3) + ":" + offset.slice(3);
        };
        var data = function(config) {
            var dataConverted = config.data || [];
            var values = [];
            var timestamps = [];
            dataConverted.forEach(function(d) {
                d.data.forEach(function(dB, iB, arr) {
                    arr[iB].timestamp = new Date(normalizeTime(dB.timestamp));
                    values.push(dB.value);
                    timestamps.push(arr[iB].timestamp);
                });
            });
            var dataIsAllNulls = !!values.length && !values.filter(function(d) {
                return d !== null;
            }).length;
            return {
                dataConverted: dataConverted,
                dataValues: values,
                dataTimestamps: timestamps,
                dataIsEmpty: !dataConverted.length,
                dataIsAllNulls: dataIsAllNulls
            };
        };
        var scaleX = function(config) {
            if (config.dataIsEmpty) {
                return {};
            }
            var scaleX = d3.scaleTime().domain(d3.extent(config.dataTimestamps)).range([ 0, config.chartWidth ]);
            return {
                scaleX: scaleX
            };
        };
        var scaleY = function(config) {
            if (config.dataIsEmpty) {
                return {};
            }
            var min, max;
            if (config.domain) {
                min = config.domain[0];
                max = config.domain[1];
            } else {
                min = d3.min(config.dataValues);
                max = d3.max(config.dataValues);
                if (typeof config.reference === "number") {
                    max = Math.max(config.reference, max);
                    min = Math.min(config.reference, min);
                }
                if (min === max) {
                    min -= min / 20;
                    max += max / 10;
                }
            }
            var scaleY = d3.scaleLinear().domain([ min, max ]).range([ config.chartHeight, 0 ]);
            return {
                scaleY: scaleY
            };
        };
        var axisX = function(config) {
            if (config.dataIsEmpty) {
                return {};
            }
            var axisXFormat;
            if (config.axisXFormat instanceof Function) {
                axisXFormat = config.axisXFormat;
            } else {
                axisXFormat = d3.utcFormat(config.axisXFormat || "%H:%M");
            }
            var axisFunc = config.xAxisOnTop ? "axisTop" : "axisBottom";
            var axisX = d3[axisFunc]().scale(config.scaleX).ticks(config.xTicks || null).tickFormat(axisXFormat);
            return {
                axisX: axisX
            };
        };
        var axisY = function(config) {
            if (config.dataIsEmpty) {
                return {};
            }
            var axisY = d3.axisLeft().scale(config.scaleY).ticks(config.yTicks || 6).tickFormat(function(d) {
                if (config.axisYFormat) {
                    return d3.format(config.axisYFormat)(d);
                } else if (d < 1) {
                    return d3.format(".2")(d);
                } else {
                    return d3.format(".2s")(d);
                }
            }).tickPadding(10);
            return {
                axisY: axisY
            };
        };
        var axisComponentX = function(config) {
            if (config.dataIsEmpty || config.hide.indexOf("xAxis") > -1) {
                return {};
            }
            var axisX = config.container.select(".axis.x").attr("transform", "translate(" + [ 0, config.chartHeight ] + ")").call(config.axisX);
            return {};
        };
        var axisComponentY = function(config) {
            if (config.dataIsEmpty || config.hide.indexOf("yAxis") > -1 || config.axisOnly) {
                return {};
            }
            var axisY = config.container.select(".axis.y").call(config.axisY);
            return {};
        };
        var gridX = function(config) {
            if (config.dataIsEmpty || config.hide.indexOf("xGrid") > -1 || config.axisOnly) {
                return {};
            }
            var axisX = config.container.select(".grid.x").attr("transform", "translate(" + [ 0, config.chartHeight ] + ")").call(config.axisX.tickSize(-config.chartHeight).tickFormat(""));
            return {};
        };
        var lineShapes = function(config) {
            if (config.dataIsEmpty || config.axisOnly || config.chartType !== "line" && config.chartType !== "area") {
                config.container.select(".line-group").selectAll("path.line").remove();
                return {};
            }
            var chartType = config.chartType || "line";
            var lineGenerator;
            if (chartType === "area") {
                lineGenerator = d3.area().defined(function(d) {
                    return d.value != null;
                }).x(function(d) {
                    return config.scaleX(d.timestamp);
                }).y0(function(d) {
                    return config.scaleY(0);
                }).y1(function(d) {
                    return config.scaleY(d.value);
                });
            } else {
                lineGenerator = d3.line().defined(function(d) {
                    return d.value != null;
                }).x(function(d) {
                    return config.scaleX(d.timestamp);
                }).y(function(d) {
                    return config.scaleY(d.value);
                });
            }
            var shapeGroups = config.container.select(".shapes").selectAll(".shape-group").data(config.dataConverted);
            var shapes = shapeGroups.enter().append("g").attr("class", "shape-group").merge(shapeGroups).selectAll("path.shape").data(function(d, i) {
                d.layer = i;
                return [ d ];
            });
            shapes.enter().append("path").merge(shapes).attr("class", function(d, i, a, b) {
                return [ "shape", d.metadata.id, "layer" + d.layer, chartType ].join(" ");
            }).attr("d", function(d) {
                return lineGenerator(d.data);
            });
            shapes.exit().remove();
            shapeGroups.exit().remove();
            return {};
        };
        var stepShapes = function(config) {
            if (config.dataIsEmpty || config.axisOnly || config.chartType !== "step") {
                config.container.select(".step-group").selectAll("path.shape").remove();
                return {};
            }
            var id = config.dataConverted[0].metadata.id;
            var range = config.stepRange || 3;
            var line = [];
            var lineData = config.dataConverted[0].data;
            lineData.forEach(function(d, i) {
                var prevIdx = Math.max(i - 1, 0);
                line.push([ config.scaleX(d.timestamp), config.scaleY(lineData[prevIdx].value) ]);
                line.push([ config.scaleX(d.timestamp), config.scaleY(d.value) ]);
            });
            var areaHigh = [];
            var areaLow = [];
            var areaData = config.dataConverted[0].data;
            areaData.forEach(function(d, i) {
                var prevIdx = Math.max(i - 1, 0);
                areaHigh.push([ config.scaleX(d.timestamp), config.scaleY(lineData[prevIdx].value + range) ]);
                areaHigh.push([ config.scaleX(d.timestamp), config.scaleY(d.value + range) ]);
                areaLow.push([ config.scaleX(d.timestamp), config.scaleY(lineData[prevIdx].value - range) ]);
                areaLow.push([ config.scaleX(d.timestamp), config.scaleY(d.value - range) ]);
            });
            var area = areaHigh.concat(areaLow.reverse());
            var lineGenerator = d3.line().defined(function(d) {
                return d.value != null;
            }).x(function(d) {
                return config.scaleX(d.timestamp);
            }).y(function(d) {
                return config.scaleY(d.value);
            });
            var shapeGroups = config.container.select(".shapes").selectAll(".step-group").data([ line, area ]);
            var shapes = shapeGroups.enter().append("g").attr("class", "step-group").merge(shapeGroups).selectAll("path.shape").data(function(d, i) {
                d.layer = i;
                return [ d ];
            });
            shapes.enter().append("path").merge(shapes).attr("class", function(d, i, a, b) {
                return [ "shape", id, "layer" + d.layer, config.chartType ].join(" ");
            }).attr("d", function(d, i) {
                // return 'M' + d.join() + (d.layer === 1 ? 'Z' : '')
                return "M" + d.join();
            });
            shapes.exit().remove();
            shapeGroups.exit().remove();
            return {};
        };
        var arrowShapes = function(config) {
            if (config.dataIsEmpty || config.axisOnly || config.chartType !== "arrow") {
                config.container.select(".shapes").selectAll("path.arrow").remove();
                return {};
            }
            var arrowPath = "M6 0L12 10L8 10L8 24L4 24L4 10L0 10Z";
            var arrows = config.container.select(".shapes").selectAll("path.arrow").data(config.dataConverted[0].data.filter(function(d, i) {
                var skip = config.arrowSkip || 3;
                return i % skip === 0;
            }));
            arrows.enter().append("path").attr("class", function(d) {
                return "arrow";
            }).merge(arrows).attr("d", arrowPath).attr("transform", function(d) {
                // console.log(d.value)
                return "translate(" + config.scaleX(d.timestamp) + ", 0) scale(0.5) rotate(" + d.value + ", 6, 12)";
            });
            arrows.exit().remove();
            return {};
        };
        var reference = function(config) {
            if (config.dataIsEmpty || typeof config.reference !== "number") {
                config.container.selectAll("path.reference").remove();
                return {};
            }
            var scaledY = config.scaleY(config.reference);
            var path = "M" + [ [ 0, scaledY ], [ config.chartWidth, scaledY ] ].join("L");
            var shapes = config.container.select(".reference").selectAll("path").data([ 0 ]);
            shapes.enter().append("path").attr("class", "reference").style("fill", "none").merge(shapes).attr("d", path);
            shapes.exit().remove();
            return {};
        };
        function getHoverInfo(config, timestamp) {
            var dataUnderCursor = [];
            if (config.dataConverted[0].data.length) {
                config.dataConverted.forEach(function(d, i) {
                    var bisector = d3.bisector(function(dB, x) {
                        return dB.timestamp.getTime() - x.getTime();
                    }).left;
                    var found = bisector(d.data, timestamp);
                    var d1 = d.data[Math.min(found, d.data.length - 1)];
                    var d0 = d.data[Math.max(found - 1, 0)];
                    var datum = timestamp - d0.timestamp > d1.timestamp - timestamp ? d1 : d0;
                    var posX = Math.round(config.scaleX(datum.timestamp));
                    var posY = Math.round(config.scaleY(datum.value));
                    var eventData = {
                        event: d3.event,
                        posX: posX,
                        posY: posY
                    };
                    datum = dh.utils.mergeAll({}, datum, d.metadata, eventData);
                    dataUnderCursor.push(datum);
                });
            }
            return dataUnderCursor;
        }
        var eventsPanel = function(config) {
            var eventPanel = config.container.select(".events .event-panel").on("mousemove touchstart", function(d) {
                if (config.dataIsEmpty) {
                    return;
                }
                var mouseX = d3.mouse(this)[0] - config.margin.left;
                var mouseTimestamp = config.scaleX.invert(mouseX);
                var dataUnderCursor = getHoverInfo(config, mouseTimestamp);
                config.events.call("hover", null, dataUnderCursor);
            }, {
                passive: true
            }).on("mouseout", function(d) {
                hideTooltip(config);
                config.container.selectAll(".axis-title.x text").text(null);
                config.events.call("mouseout", null, {});
            }).on("click", function(d) {
                config.events.call("click", null, {
                    event: d3.event
                });
            });
            return {
                eventPanel: eventPanel
            };
        };
        function setTooltip(config, d, hover) {
            if (!config.dataConverted[0].data.length) {
                return config.datasetIndex = 0;
            }
            config.datasetIndex = hover ? getDatasetIndex() : 0;
            function getDatasetIndex() {
                var firstDataset = config.dataConverted[0].data;
                var lastTimestamp = firstDataset[firstDataset.length - 1].timestamp;
                return d[0].timestamp === lastTimestamp && d[1] ? 1 : 0;
            }
            var x = config.margin.left + d[config.datasetIndex].posX;
            config.container.select(".tooltip line").attr("y1", 0).attr("y2", config.height).attr("x1", x).attr("x2", x).attr("display", "block");
            if (!d || !d[0] || typeof d[0].value === "undefined" || d[0].value === null || config.hide.indexOf("tooltip") > -1) {
                config.container.select(".tooltip").selectAll("text.tooltip-label").remove();
                config.container.select(".tooltip").selectAll(".tooltip-rect").remove();
                return;
            }
            if (config.hide.indexOf("tooltipDot") > -1) {
                config.container.select(".tooltip").selectAll("circle.dot").remove();
            } else {
                var circles = config.container.select(".tooltip").selectAll("circle.dot").data(d);
                circles.enter().append("circle").merge(circles).attr("display", "block").attr("class", function(dB, dI) {
                    return [ "dot", dB.id, "layer" + dI ].join(" ");
                }).attr("cx", function(dB) {
                    return dB.posX + config.margin.left;
                }).attr("cy", function(dB) {
                    return dB.posY + config.margin.top;
                }).attr("r", 2);
                circles.exit().remove();
            }
            if (config.hide.indexOf("tooltipLabel") > -1) {
                config.container.select(".tooltip").selectAll("text.tooltip-label").remove();
                config.container.select(".tooltip").selectAll(".tooltip-rect").remove();
            } else {
                var rects = config.container.select(".tooltip").selectAll(".tooltip-rect").data(d);
                var labels = config.container.select(".tooltip").selectAll("text.tooltip-label").data(d);
                labels.enter().append("text").merge(labels).attr("display", "block").attr("class", function(dB, dI) {
                    return [ "tooltip-label", dB.id, "layer" + dI ].join(" ");
                }).attr("transform", function(dB, dI) {
                    var x = dB.posX + config.margin.left;
                    var y = dB.posY + config.margin.top;
                    if (config.chartType === "arrow") {
                        y = 0;
                    }
                    return "translate(" + [ x, y ] + ")";
                }).attr("dx", -4).attr("text-anchor", "end").text(function(dB, dI) {
                    return config.valueFormatter ? config.valueFormatter(dB, dI) : dB.value;
                });
                // Assign tooltip text BBox, so rect can get its width and height from it
                                config.container.select(".tooltip").selectAll("text.tooltip-label").each(function(item, i) {
                    // get bounding box of text field and store it in texts array
                    try {
                        d[i].bb = this.getBBox();
                    } catch (e) {
                        console.error("Firefox specific error-getting getBBox when it display=none. Using default object.");
                        d[i].bb = {
                            height: 0,
                            width: 0,
                            x: 0,
                            y: 0
                        };
                    }
                });
                // Add tooltip rects
                                var paddingLeftRight = 4;
                var paddingTopBottom = 2;
                rects.enter().insert("rect").merge(rects).attr("display", "block").attr("width", function(d2) {
                    if (d2.bb.width) {
                        return d2.bb.width + paddingLeftRight;
                    }
                    return 0;
                }).attr("height", function(d2) {
                    if (d2.bb.height) {
                        return d2.bb.height + paddingTopBottom;
                    }
                    return 0;
                }).attr("class", function(d2, dI) {
                    return [ "tooltip-rect", d2.id, "layer" + dI ].join(" ");
                }).attr("style", "fill:black;stroke:#575f6d;stroke-width:1;fill-opacity:0.8;stroke-opacity:0.8").attr("transform", function(dB, dI) {
                    var x = dB.posX + config.margin.left - dB.bb.width - paddingLeftRight * 1.5;
                    var y = dB.posY + config.margin.top - dB.bb.height + paddingTopBottom / 1.5;
                    if (config.chartType === "arrow") {
                        y = 0;
                    }
                    return "translate(" + [ x, y ] + ")";
                }).attr("rx", 2);
                // Make so that text is not overlayed with rect
                                config.container.selectAll(".tooltip *").each(function(item, i) {
                    var firstChild = this.parentNode.firstChild;
                    if (this.localName === "rect") {
                        this.parentNode.insertBefore(this, firstChild);
                    }
                });
                labels.exit().remove();
                rects.exit().remove();
            }
            function removeInactiveLayerinfo() {
                var inactive = config.datasetIndex === 1 ? 0 : 1;
                config.container.select(".tooltip").selectAll(".layer" + inactive).remove();
            }
            removeInactiveLayerinfo();
        }
        function hideTooltip(config) {
            config.container.select(".tooltip line").attr("display", "none");
            config.container.selectAll(".tooltip circle").attr("display", "none");
            config.container.selectAll(".tooltip .tooltip-label").attr("display", "none");
            config.container.selectAll(".tooltip .tooltip-rect").attr("display", "none");
        }
        var tooltipComponent = function(config) {
            if (typeof config.tooltipTimestamp !== "undefined") {
                if (config.tooltipTimestamp === null) {
                    hideTooltip(config);
                    config.events.call("tooltipChange", null, {});
                } else {
                    var dataUnderCursor = getHoverInfo(config, config.tooltipTimestamp);
                    if (dataUnderCursor && dataUnderCursor.length > 0) {
                        setTooltip(config, dataUnderCursor);
                        config.events.call("tooltipChange", null, {
                            timestamp: dataUnderCursor[0].timestamp,
                            data: dataUnderCursor
                        });
                    } else {
                        console.info("No data under cursor. Hiding tooltip tooltip");
                        hideTooltip(config);
                        config.events.call("tooltipChange", null, {});
                    }
                }
            }
            // else if(!config.dataIsEmpty) {
            //     var actualTimestamp = config.dataTimestamps[config.dataTimestamps.length - 1]
            //     var dataUnderCursor = getHoverInfo(config, actualTimestamp)
            //     // setTooltip(config, dataUnderCursor)
            //     // config.events.call('tooltipChange', null, {timestamp: actualTimestamp, data: dataUnderCursor})
            //     config.events.call('hover', null, dataUnderCursor)
            // }
                        if (config.dataIsEmpty || config.axisOnly || config.hide.indexOf("tooltip") > -1) {
                hideTooltip(config);
                return {};
            }
            config.events.on("hover.tooltip", function(d) {
                setTooltip(config, d, "hover");
            });
        };
        var xAxisTitle = function(config) {
            if (config.dataIsEmpty || config.axisOnly || config.hide.indexOf("xTitle") > -1) {
                return {};
            }
            var xTitleFormat = config.xTitleFormat || d3.utcFormat("%X");
            var titleContainer = config.container.select(".axis-title.x");
            var title = titleContainer.select("text");
            config.events.on("hover.title", function(d) {
                var timestamp = d[config.datasetIndex].timestamp;
                titleContainer.attr("transform", "translate(" + [ config.chartWidth, config.chartHeight ] + ")");
                title.text(xTitleFormat(timestamp)).attr("dy", -8).attr("text-anchor", "end");
            });
            return {};
        };
        var yAxisTitle = function(config) {
            if (config.axisOnly || config.hide.indexOf("yTitle") > -1) {
                return {};
            }
            config.container.select(".axis-title.y text").text(config.yAxisTitle || "").attr("dx", "0.5em").attr("dy", "1em");
            return {};
        };
        var lineChart = dh.utils.pipeline(defaultConfig, template, data, scaleX, scaleY, axisX, axisY, axisComponentX, gridX, lineShapes, arrowShapes, stepShapes, 
        // dh.common.printer,
        // areaShapes,
        dh.common.message, axisComponentY, reference, eventsPanel, tooltipComponent, xAxisTitle, yAxisTitle);
        /**
   * A line/area/step/arrow timeseries chart.
   * @namespace timeseries
   * @name timeseries
   * @param {object} config The initial configuration can be passed on init or later using timeseries.setConfig.
   * @param {object} config.parent The parent DOM element.
   * @param {object} config.data Data can be passed on init or later using timeseries.setData.
   * @param {number} config.reference Value for the reference line.
   * @param {Date} config.tooltipTimestamp Timestamp of element to highlight.
   * @param {number} [config.width=parent.innerWidth] External width of the chart.
   * @param {number} [config.height=parent.innerHeight] External height of the chart.
   * @param {string} [config.chartType='line'] Chart type: 'line', 'area', 'step', 'arrow'.
   * @param {object} [config.margin={top:0, right:0, bottom:10, left:10}] Margins around the chart panel.
   * @param {Array.<string>} [config.hide] An array of names of elements to hide: 'xTitle', 'yTitle', 'tooltip', 'xAxis', 'yAxis', 'shapes', 'xGrid', 'xTitle', 'yTitle', 'tooltipDot'.
   * @param {Array.<number>} [config.domain] [min, max] domain of the y scale, defaults to data extent.
   * @param {string} [config.xTicks=d3.utcMinute.every(20)] Target x tick count, as passed to d3.axis.ticks.
   * @param {string} [config.axisXFormat='%H:%M'] X tick format, as passed to d3.axis.tickFormat.
   * @param {string} [config.yTicks=6] Target y tick count, as passed to d3.axis.ticks.
   * @param {string} [config.axisYFormat='.2'] Y tick format, as passed to d3.axis.format.
   * @param {string} [config.yAxisTitle] Y axis title.
   * @param {string} [config.xTitleFormat=d3.utcFormat('%c')] Format of the hovered timestamp close to the x axis.
   * @param {function} [config.valueFormatter] Formatter for the tooltip value. Receives (data, index) and should return a string.
   * @param {number} [config.stepRange=3] Only for type:step, band range above and below the line.
   * @param {boolean} [config.axisOnly=false] A minimal version of the chart only showing the x axis.
   * @param {number} [config.arrowSkip=3] Only for type:arrow, keeping 1 arrow out of n.
   * @param {boolean} config.resizeOff Turn off auto resize.
   * @returns {object} A timeseries instance.
   * @example
   * datahub.timeseries({
   *     parent: document.querySelector('.timeseries-area'),
   *     chartType: 'area',
   *     data: datahub.data.generateTimeSeriesSplit()
   * })
   */        var timeseries = function(config) {
            var configCache, events = d3.dispatch("hover", "click", "mouseout", "tooltipChange"), chartCache, uid = ~~(Math.random() * 1e4);
            var onResize = dh.utils.throttle(function() {
                configCache.width = configCache.parent.clientWidth;
                render();
            }, 200);
            if (!config.resizeOff) {
                d3.select(window).on("resize." + uid, onResize);
            }
            var render = function() {
                chartCache = lineChart(configCache);
            };
            /**
     * Set the data.
     * @name setData
     * @param {object} data A data object.
     * @returns {object} The timeseries instance.
     * @memberof timeseries
     * @instance
     * @example
     * datahub.timeseries({
     *     parent: document.querySelector('.timeseries-area')
     * })
     * .setData(datahub.data.generateTimeSeriesSplit())
     */            var setData = function(data) {
                var d = data ? JSON.parse(JSON.stringify(data)) : {};
                configCache = dh.utils.mergeAll({}, configCache, {
                    data: d
                });
                render();
                return this;
            };
            /**
     * Set the config after its instantiation.
     * @name setConfig
     * @instance
     * @param {object} config The same config format as on init.
     * @returns {object} The timeseries instance.
     * @memberof timeseries
     * @instance
     * @example
     * datahub.timeseries({
     *     parent: document.querySelector('.chart'),
     * })
     * .setConfig({
     *     width: 100
     * })
     */            var setConfig = function(config) {
                configCache = dh.utils.mergeAll({}, configCache, config);
                render();
                return this;
            };
            var init = function(config, events) {
                setConfig(dh.utils.mergeAll({}, config, {
                    events: events
                }));
            };
            /**
     * Destroys DOM elements and unbind events.
     * @name destroy
     * @memberof timeseries
     * @instance
     * @example
     * var chart = datahub.timeseries({
     *     parent: document.querySelector('.chart'),
     * })
     * chart.destroy()
     */            var destroy = function() {
                d3.select(window).on("resize." + uid, null);
                configCache.parent.innerHTML = null;
            };
            init(config, events);
            /**
     * Events binder.
     * @function on
     * @param {string} eventName The name of the event: 'hover', 'click', 'mouseout', 'tooltipChange'
     * @param {function} callback The callback for this event
     * @memberof timeseries
     * @instance
     * @example
     * datahub.timeseries({
     *     parent: document.querySelector('.chart'),
     * })
     * .on('hover', function(e) {
     *     console.log(e)
     * })
     */            return {
                on: dh.utils.rebind(events),
                setConfig: setConfig,
                setData: setData,
                destroy: destroy
            };
        };
        dh.timeseries = timeseries;
    }(datahub, root.d3);
    !function(dh, d3) {
        var template = function(config) {
            var containerNode = config.parent.querySelector(".datahub-vertical-chart");
            if (!containerNode) {
                var template = '<div class="datahub-vertical-chart">' + '<div class="header"></div>' + '<div class="chart-container">' + '<div class="chart-wrapper">' + "<svg>" + '<g class="panel">' + '<g class="reference-bars"></g>' + '<g class="bars"></g>' + '<g class="axis"></g>' + "</g>" + "</svg>" + "</div>" + "</div>" + '<div class="number-container"></div>' + "</div>";
                containerNode = dh.utils.appendHtmlToNode(template, config.parent);
            }
            var dataIsEmpty = !(config.elements && config.elements.length);
            var container = d3.select(containerNode);
            var chartContainer = container.select(".chart-container");
            var chartWidth = chartContainer.node().clientWidth;
            var rowHeight = 26;
            var chartHeight = dataIsEmpty ? 0 : config.elements.length * rowHeight;
            return {
                container: container,
                chartWidth: chartWidth,
                chartHeight: chartHeight,
                rowHeight: rowHeight,
                dataIsEmpty: dataIsEmpty,
                refernceValue: 100
            };
        };
        var scaleX = function(config) {
            var linearScaleX = d3.scaleLinear().domain([ 0, 100 ]).range([ 0, config.referenceBarSize ]);
            return {
                scaleX: linearScaleX
            };
        };
        var axisX = function(config) {
            var axisXComponent = d3.axisBottom().scale(config.scaleX);
            var axis = config.container.select(".axis").attr("transform", "translate(" + [ 0, config.chartHeight ] + ")").attr("display", config.dataIsEmpty ? "none" : "block").call(axisXComponent);
            return {
                axisX: axis
            };
        };
        var header = function(config) {
            config.container.select(".header").html(config.title);
            return {};
        };
        var number = function(config) {
            var numbers = config.container.select(".number-container").selectAll(".number").data(config.elements || []);
            var numbersUpdate = numbers.enter().append("div").merge(numbers).attr("class", function(d, i) {
                return "number number" + i;
            });
            numbers.exit().remove();
            var labels = numbersUpdate.selectAll(".label").data(function(d) {
                return [ d ];
            });
            labels.enter().append("div").attr("class", "label").merge(labels).html(function(d) {
                return d.label;
            });
            labels.exit().remove();
            var values = numbersUpdate.selectAll(".value").data(function(d) {
                return [ d ];
            });
            values.enter().append("div").attr("class", "value").merge(values).html(function(d) {
                return Math.round(d.value) + " " + config.unit;
            });
            values.exit().remove();
            return {};
        };
        var bars = function(config) {
            var panel = config.container.select("svg").attr("width", config.chartWidth).attr("height", config.chartHeight).select(".panel");
            var rowH = config.rowHeight;
            var referenceBarH = rowH - 2;
            var barH = referenceBarH / 2;
            var bars = panel.select(".bars").selectAll(".bar").data(config.elements || []);
            bars.enter().append("rect").merge(bars).attr("class", function(d, i) {
                return [ "bar", d.label.toLowerCase(), "bar" + i ].join(" ");
            }).attr("x", function(d) {
                var width = config.scaleX(d.value);
                if (width < 0) {
                    return config.chartWidth / 2 - Math.abs(width);
                }
                return config.chartWidth / 2;
            }).attr("y", function(d, i) {
                return rowH * i + (rowH - barH) / 2;
            }).attr("width", function(d) {
                if (d.value) {
                    return Math.abs(config.scaleX(d.value));
                }
            }).attr("height", barH);
            bars.exit().remove();
            var referenceBars = panel.select(".reference-bars").selectAll(".bar").data(config.elements || []);
            referenceBars.enter().append("rect").attr("class", "bar").merge(referenceBars).attr("x", config.chartWidth / 2).attr("y", function(d, i) {
                return rowH * i + (rowH - referenceBarH) / 2;
            }).attr("width", function(d, i) {
                return config.referenceBarSize;
            }).attr("height", referenceBarH);
            referenceBars.exit().remove();
            var referenceLines = panel.select(".reference-bars").selectAll(".line").data(config.elements || []);
            referenceLines.enter().append("line").attr("class", "line").merge(referenceLines).attr("x1", config.chartWidth / 2 + config.referenceBarSize).attr("y1", function(d, i) {
                return rowH * i + (rowH - referenceBarH) / 2;
            }).attr("x2", config.chartWidth / 2 + config.referenceBarSize).attr("y2", function(d, i) {
                return rowH * i + (rowH - referenceBarH) / 2 + referenceBarH;
            });
            referenceLines.exit().remove();
            return {};
        };
        var verticalLines = function(config) {
            var line = config.container.select(".axis").selectAll(".vertical").data([ 0 ]);
            line.enter().append("line").attr("class", "vertical").merge(line).attr("x1", config.chartWidth / 2).attr("y1", 0).attr("x2", config.chartWidth / 2).attr("y2", config.chartHeight);
            line.exit().remove();
            return {};
        };
        var multi = dh.utils.pipeline(template, header, number, scaleX, verticalLines, bars)
        /**
     * A vertical positive/negative bar chart with reference bar.
     * @namespace verticalChart
     * @name verticalChart
     * @param {object} config The initial configuration can be passed on init or later using verticalChart.setConfig.
     * @param {object} config.parent The parent DOM element.
     * @param {Array.<object>} config.elements Data in the form {key, label, value}.
     * @param {number} config.referenceBarSize The size of the reference bar in px.
     * @param {string} config.title The chart title.
     * @param {string} config.unit The axis unit.
     * @returns {object} A verticalChart instance.
     * @example
     * datahub.verticalChart({
     *     parent: document.querySelector('.vertical-chart')
     *     title: 'Title',
     *     elements:[
     *         {key: 'approved', label: 'Approved', value: 125},
     *         {key: 'written', label: 'Written', value: 16},
     *         {key: 'remains', label: 'Remains', value: -79}
     *     ],
     *     referenceBarSize: 100,
     *     unit: '%'
     * })
     */;
        var verticalChart = function(config) {
            var configCache, events = d3.dispatch("barHover"), chartCache, uid = ~~(Math.random() * 1e4);
            var onResize = dh.utils.throttle(function() {
                configCache.width = configCache.parent.clientWidth;
                render();
            }, 200);
            d3.select(window).on("resize." + uid, onResize);
            var render = function() {
                chartCache = multi(configCache);
            }
            /**
         * Set the config after its instantiation.
         * @name setConfig
         * @param {object} config The same config format as on init.
         * @returns {object} The verticalChart instance.
         * @memberof verticalChart
         * @instance
         * @example
         * datahub.verticalChart({
         *     parent: document.querySelector('.vertical-chart')
         * })
         * .setConfig({
         *     title: 'Title',
         *     elements:[
         *         {key: 'approved', label: 'Approved', value: 125},
         *         {key: 'written', label: 'Written', value: 16},
         *         {key: 'remains', label: 'Remains', value: -79}
         *     ],
         *     referenceBarSize: 100,
         *     unit: '%'
         * })
         */;
            var setConfig = function(config) {
                configCache = dh.utils.mergeAll(configCache, config);
                render();
                return this;
            };
            var init = function(config, events) {
                setConfig(dh.utils.mergeAll(config, {
                    events: events
                }));
            }
            /**
         * Destroys DOM elements and unbind events.
         * @name destroy
         * @memberof verticalChart
         * @instance
         * @example
         * var chart = datahub.verticalChart({
         *     parent: document.querySelector('.chart'),
         * })
         * chart.destroy()
         */;
            var destroy = function() {
                d3.select(window).on("resize." + uid, null);
                configCache.parent.innerHTML = null;
            };
            init(config, events);
            return {
                on: dh.utils.rebind(events),
                setConfig: setConfig,
                destroy: destroy
            };
        };
        dh.verticalChart = verticalChart;
    }(datahub, root.d3);
    !function(dh, d3) {
        var template = function(config) {
            var containerNode = config.parent.querySelector(".datahub-waterfall-chart");
            if (!containerNode) {
                var template = '<div class="datahub-waterfall-chart">' + '<div class="chart-container">' + "<svg>" + '<g class="panel">' + '<g class="bars"></g>' + '<g class="connectors"></g>' + "</g>" + "</svg>" + "</div>" + '<div class="number-container"></div>' + "</div>";
                containerNode = dh.utils.appendHtmlToNode(template, config.parent);
            }
            var infoIsEmpty = !(config.elements && config.elements.length);
            var dataIsEmpty = !(!infoIsEmpty && config.elements[0].value);
            var container = d3.select(containerNode);
            var chartContainer = container.select(".chart-container");
            var chartWidth = config.width || chartContainer.node().clientWidth;
            var chartHeight = config.height || chartContainer.node().clientHeight || 300;
            var isConnected = [ 1, 3 ];
            var isNegative = [ 1 ];
            return {
                container: container,
                chartWidth: chartWidth,
                chartHeight: chartHeight,
                dataIsEmpty: dataIsEmpty,
                infoIsEmpty: infoIsEmpty,
                elements: config.elements || [],
                isConnected: isConnected,
                isNegative: isNegative
            };
        };
        var scaleX = function(config) {
            var scaleX = d3.scaleBand().domain(d3.range(config.elements.length)).rangeRound([ 0, config.chartWidth ]).paddingInner(.4).paddingOuter(.2);
            return {
                scaleX: scaleX
            };
        };
        var scaleY = function(config) {
            var values = config.elements.map(function(d) {
                return d.value;
            });
            var scaleY = d3.scaleLinear().domain([ 0, d3.max(values) ]).range([ 0, config.chartHeight ]);
            return {
                scaleY: scaleY
            };
        };
        var bars = function(config) {
            var panel = config.container.select("svg").attr("width", config.chartWidth).attr("height", config.chartHeight).select(".panel");
            if (config.dataIsEmpty) {
                panel.select(".bars").selectAll(".bar").remove();
                return {};
            }
            var bars = panel.select(".bars").selectAll(".bar").data(config.elements);
            bars.enter().append("rect").merge(bars).attr("class", function(d, i) {
                return [ "bar", d.label.toLowerCase(), d.key, "bar" + i ].join(" ");
            }).attr("x", function(d, i) {
                return config.scaleX(i);
            }).attr("y", function(d, i) {
                var isConnected = config.isConnected.indexOf(i) > -1;
                if (isConnected) {
                    var prevIdx = Math.max(0, i - 1);
                    var prev = config.elements[prevIdx];
                    if (config.isNegative.indexOf(i) > -1) {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value));
                    } else {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value)) - config.scaleY(Math.abs(d.value));
                    }
                }
                return config.chartHeight - config.scaleY(Math.abs(d.value));
            }).attr("width", function(d) {
                if (d.value) {
                    return config.scaleX.bandwidth();
                }
            }).attr("height", function(d) {
                return config.scaleY(Math.abs(d.value));
            });
            bars.exit().remove();
            return {};
        };
        var connectors = function(config) {
            if (config.dataIsEmpty) {
                config.container.select(".connectors").selectAll(".connector").remove();
                return {};
            }
            var line = config.container.select(".connectors").selectAll(".connector").data(config.elements);
            line.enter().append("line").attr("class", "connector").merge(line).attr("x1", function(d, i) {
                return config.scaleX(i);
            }).attr("y1", function(d, i) {
                var isConnected = config.isConnected.indexOf(i) > -1;
                if (isConnected) {
                    var prevIdx = Math.max(0, i - 1);
                    var prev = config.elements[prevIdx];
                    if (config.isNegative.indexOf(i) > -1) {
                        return config.scaleY(Math.abs(d.value));
                    } else {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value)) - config.scaleY(Math.abs(d.value));
                    }
                }
                return config.chartHeight - config.scaleY(Math.abs(d.value));
            }).attr("x2", function(d, i) {
                return config.scaleX(Math.min(i + 1, config.elements.length - 1));
            }).attr("y2", function(d, i) {
                var isConnected = config.isConnected.indexOf(i) > -1;
                if (isConnected) {
                    var prevIdx = Math.max(0, i - 1);
                    var prev = config.elements[prevIdx];
                    if (config.isNegative.indexOf(i) > -1) {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value)) + config.scaleY(Math.abs(d.value));
                    } else {
                        return config.chartHeight - config.scaleY(Math.abs(prev.value)) - config.scaleY(Math.abs(d.value));
                    }
                }
                return config.chartHeight - config.scaleY(Math.abs(d.value));
            });
            line.exit().remove();
            var line = config.container.select(".connectors").selectAll(".base").data([ 0 ]);
            line.enter().append("line").attr("class", "base").merge(line).attr("x1", config.scaleX(0)).attr("y1", config.chartHeight).attr("x2", config.scaleX(Math.max(config.elements.length - 1, 0)) + config.scaleX.bandwidth() || 0).attr("y2", config.chartHeight);
            line.exit().remove();
            return {};
        };
        var number = function(config) {
            var numbers = config.container.select(".number-container").selectAll(".number").data(config.elements);
            var numbersUpdate = numbers.enter().append("div").merge(numbers).attr("class", function(d, i) {
                return "number number" + i;
            });
            numbers.exit().remove();
            var labels = numbersUpdate.selectAll(".label").data(function(d) {
                return [ d ];
            });
            labels.enter().append("div").attr("class", "label").merge(labels).html(function(d) {
                return d.label;
            });
            labels.exit().remove();
            var values = numbersUpdate.selectAll(".value").data(function(d) {
                return [ d ];
            });
            values.enter().append("div").attr("class", "value").merge(values).html(function(d) {
                return typeof d.value === "undefined" ? '<div class="error">(Data Unavailable)</div>' : Math.round(d.value);
            });
            values.exit().remove();
            return {};
        };
        var multi = dh.utils.pipeline(template, scaleX, scaleY, bars, connectors, number);
        /**
   * A waterfall chart designed for a specific use case.
   * @namespace waterfallChart
   * @name waterfallChart
   * @param {object} config The initial configuration can be passed on init or later using waterfallChart.setConfig.
   * @param {object} config.parent The parent DOM element.
   * @param {Array.<object>} config.elements Data in the form {key, label, value}.
   * @returns {object} A waterfallChart instance.
   * @example
   * var waterfall = datahub.waterfallChart({
   *     parent: document.querySelector('.waterfall-chart')
   *     elements:[
   *         {key: 'initial', label: 'Initial', value: 53},
   *         {key: 'closed', label: 'Closed', value: -30},
   *         {key: 'open', label: 'Open', value: 23},
   *         {key: 'new', label: 'New', value: 15},
   *         {key: 'total', label: 'Total', value: 38}
   *     ]
   * })
   */        var waterfallChart = function(config) {
            var configCache, events = d3.dispatch("barHover"), chartCache, uid = ~~(Math.random() * 1e4);
            var onResize = dh.utils.throttle(function() {
                configCache.width = configCache.parent.clientWidth;
                render();
            }, 200);
            if (!config.resizeOff) {
                d3.select(window).on("resize." + uid, onResize);
            }
            var render = function() {
                chartCache = multi(configCache);
            };
            var setData = function(data) {
                var d = data ? JSON.parse(JSON.stringify(data)) : {};
                configCache = dh.utils.mergeAll({}, configCache, {
                    data: d
                });
                render();
                return this;
            };
            /**
     * Set the config after its instantiation.
     * @name setConfig
     * @param {object} config The same config format as on init.
     * @returns {object} The waterfallChart instance.
     * @memberof waterfallChart
     * @instance
     * @example
     * datahub.waterfallChart({
     *     parent: document.querySelector('.waterfall-chart')
     * })
     * .setConfig({
     *     elements:[
     *         {key: 'initial', label: 'Initial', value: 53},
     *         {key: 'closed', label: 'Closed', value: -30},
     *         {key: 'open', label: 'Open', value: 23},
     *         {key: 'new', label: 'New', value: 15},
     *         {key: 'total', label: 'Total', value: 38}
     *     ]
     * })
     */            var setConfig = function(config) {
                configCache = dh.utils.mergeAll(configCache, config);
                render();
                return this;
            };
            var init = function(config, events) {
                setConfig(dh.utils.mergeAll(config, {
                    events: events
                }));
            };
            /**
     * Destroys DOM elements and unbind events.
     * @name destroy
     * @memberof waterfallChart
     * @instance
     * @example
     * var chart = datahub.waterfallChart({
     *     parent: document.querySelector('.chart'),
     * })
     * chart.destroy()
     */            var destroy = function() {
                d3.select(window).on("resize." + uid, null);
                configCache.parent.innerHTML = null;
            };
            init(config, events);
            return {
                on: dh.utils.rebind(events),
                setConfig: setConfig,
                setData: setData,
                destroy: destroy
            };
        };
        dh.waterfallChart = waterfallChart;
    }(datahub, root.d3);
    !function(dh, d3) {
        var template = function(config) {
            var containerNode = config.parent.querySelector(".datahub-weather-chart");
            if (!containerNode) {
                var template = '<div class="datahub-weather-chart">' + '<div class="chart-row topAxis">' + '<div class="historical"></div>' + '<div class="forecast"></div>' + "</div>" + '<div class="chart-row wind">' + '<div class="historical"></div>' + '<div class="forecast"></div>' + "</div>" + '<div class="chart-row windDirection">' + '<div class="historical"></div>' + '<div class="forecast"></div>' + "</div>" + '<div class="chart-row wave">' + '<div class="historical"></div>' + '<div class="forecast"></div>' + "</div>" + '<div class="chart-row tide">' + '<div class="historical"></div>' + '<div class="forecast"></div>' + "</div>" + '<div class="chart-row bottomAxis">' + '<div class="historical"></div>' + '<div class="forecast"></div>' + "</div>" + "</div>";
                containerNode = dh.utils.appendHtmlToNode(template, config.parent);
            }
            var dataIsEmpty = !config.data;
            var container = d3.select(containerNode);
            var chartWidth = config.width || containerNode.clientWidth;
            var chartHeight = config.height || containerNode.clientHeight || 300;
            return {
                container: container,
                chartWidth: chartWidth,
                chartHeight: chartHeight,
                dataIsEmpty: dataIsEmpty
            };
        };
        var defaultConfig = function(config) {
            var leftMargin = 26;
            var historicalChartConfig = {
                xTicks: config.historicalXTicks || d3.utcHour.every(12),
                resolution: "minute",
                axisXFormat: config.historicalXFormat || "%H:%M",
                axisYFormat: ".0f",
                domain: [ 0, 50 ],
                chartType: "area",
                yTicks: 3,
                height: 80,
                width: config.chartWidth / 2,
                valueFormatter: function(d, i) {
                    return Math.round(d.value * 100) / 100;
                },
                hide: [ "xTitle", "yTitle", "xAxis", "tooltipLabel" ],
                margin: {
                    top: 10,
                    right: 4,
                    bottom: 10,
                    left: leftMargin
                }
            };
            var forecastChartConfig = datahub.utils.mergeAll({}, historicalChartConfig, {
                xTicks: config.forecastXTicks || d3.utcHour.every(12),
                axisXFormat: config.forecastXFormat || "%H:%M",
                resolution: "hour",
                hide: [ "xAxis", "yAxis", "yTitle", "xTitle", "tooltipLabel" ],
                margin: {
                    top: 10,
                    right: 4,
                    bottom: 10,
                    left: leftMargin
                }
            });
            var commonArrowsConfig = {
                hide: [ "xAxis", "yAxis", "xTitle", "yTitle", "tooltipDot", "tooltipLabel" ],
                chartType: "arrow",
                height: 20,
                arrowSkip: config.historicalArrowSkip || 3,
                margin: {
                    top: 0,
                    right: 4,
                    bottom: 0,
                    left: leftMargin
                }
            };
            var historicalArrowsConfig = datahub.utils.mergeAll({}, historicalChartConfig, commonArrowsConfig);
            var forecastArrowsConfig = datahub.utils.mergeAll({}, forecastChartConfig, commonArrowsConfig, {
                arrowSkip: config.forecastArrowSkip || 6,
                margin: {
                    top: 0,
                    right: 4,
                    bottom: 0,
                    left: leftMargin
                }
            });
            var commonSingleAxis = {
                axisOnly: true,
                xAxisOnTop: true,
                hide: [ "yAxis", "yTitle", "tooltipLabel" ],
                height: 20,
                margin: {
                    top: 20,
                    right: 4,
                    bottom: 0,
                    left: leftMargin
                }
            };
            var historicalTopAxis = datahub.utils.mergeAll({}, historicalChartConfig, commonSingleAxis);
            var forecastTopAxis = datahub.utils.mergeAll({}, forecastChartConfig, commonSingleAxis, {
                margin: {
                    top: 20,
                    right: 4,
                    bottom: 0,
                    left: leftMargin
                }
            });
            var historicalBottomAxis = datahub.utils.mergeAll({}, historicalChartConfig, commonSingleAxis, {
                margin: {
                    top: 0,
                    right: 4,
                    bottom: 20,
                    left: leftMargin
                },
                xAxisOnTop: false
            });
            var forecastBottomAxis = datahub.utils.mergeAll({}, forecastChartConfig, commonSingleAxis, {
                margin: {
                    top: 0,
                    right: 4,
                    bottom: 20,
                    left: leftMargin
                },
                xAxisOnTop: false
            });
            var chartConfig = {
                historical: {
                    wind: historicalChartConfig,
                    windDirection: historicalArrowsConfig,
                    wave: historicalChartConfig,
                    tide: historicalChartConfig,
                    bottomAxis: historicalBottomAxis,
                    topAxis: historicalTopAxis
                },
                forecast: {
                    wind: forecastChartConfig,
                    windDirection: forecastArrowsConfig,
                    wave: forecastChartConfig,
                    tide: forecastChartConfig,
                    bottomAxis: forecastBottomAxis,
                    topAxis: forecastTopAxis
                }
            };
            return {
                chartConfig: chartConfig
            };
        };
        var data = function(config) {
            var dataConverted = config.data;
            return {
                dataConverted: dataConverted
            };
        };
        function setTimeInfo(timestamp, config) {
            if (timestamp) {
                config.events.call("hover", null, {
                    timestamp: timestamp
                });
            }
        }
        function getDataAtTimestamp(timestamp, data, groupKey) {
            var epoch = new Date(timestamp).getTime();
            var bisector = d3.bisector(function(d, x) {
                return new Date(d.timestamp).getTime() - new Date(x).getTime();
            }).left;
            var info = {};
            var idx = 0;
            var d;
            var foundData;
            for (var x in data) {
                if (x !== groupKey) {
                    continue;
                }
                for (var y in data[x]) {
                    if ([ "topAxis", "bottomAxis" ].indexOf(y) > -1) {
                        continue;
                    }
                    d = data[x][y].data;
                    idx = bisector(d, timestamp);
                    if (!info[x]) {
                        info[x] = {};
                    }
                    foundData = d[idx];
                    if (foundData) {
                        foundData.metadata = data[x][y].metadata;
                        info[x][y] = foundData;
                    } else {
                        console.info("No data found for metadata.");
                    }
                }
            }
            return info;
        }
        function setTooltip(charts, groupKey, chartKey, timestamp, config) {
            for (var x in charts) {
                if (x === groupKey) {
                    for (var y in charts[x]) {
                        if (y !== chartKey && charts[x][y]) {
                            charts[x][y].setConfig({
                                tooltipTimestamp: timestamp
                            });
                        }
                    }
                } else {
                    for (var y in charts[x]) {
                        charts[x][y].setConfig({
                            tooltipTimestamp: null
                        });
                    }
                }
            }
            setTimeInfo(timestamp, config);
        }
        var charts = function(config) {
            var charts = {
                historical: {
                    wind: null,
                    windDirection: null,
                    wave: null,
                    tide: null,
                    bottomAxis: null,
                    topAxis: null
                },
                forecast: {
                    wind: null,
                    windDirection: null,
                    wave: null,
                    tide: null,
                    bottomAxis: null,
                    topAxis: null
                }
            };
            for (var x in charts) {
                for (var y in charts[x]) {
                    charts[x][y] = datahub.timeseries({
                        parent: config.container.select("." + y + " ." + x).node(),
                        resizeOff: config.resizeOff || false
                    }).setConfig(config.chartConfig[x][y]).on("hover", function() {
                        var groupKey = x;
                        var chartKey = y;
                        return function(d) {
                            if (d[0]) {
                                setTooltip(charts, groupKey, chartKey, d[0].timestamp, config);
                                var data = getDataAtTimestamp(d[0].timestamp, config.dataConverted, groupKey);
                                config.events.call("tooltipChange", null, {
                                    data: data,
                                    timestamp: d[0].timestamp,
                                    info: d,
                                    config: config
                                });
                            }
                        };
                    }()).on("mouseout", function() {
                        var hasData = config.dataConverted && config.dataConverted.historical.wind.data && config.dataConverted.historical.wind.data.length > 0;
                        var latestHistoricalTimestamp = new Date(hasData ? config.dataConverted.historical.wind.data.slice(-1)[0].timestamp : Date.now());
                        setTooltip(charts, "historical", null, latestHistoricalTimestamp, config);
                        config.events.call("mouseout", null, {});
                        var data = getDataAtTimestamp(latestHistoricalTimestamp, config.dataConverted, "historical");
                        config.events.call("tooltipChange", null, {
                            data: data,
                            timestamp: latestHistoricalTimestamp,
                            config: config
                        });
                    });
                    if (config.domain) {
                        charts[x][y].setConfig({
                            domain: config.domain[y]
                        });
                    }
                    if (config.dataConverted) {
                        charts[x][y].setData([ config.dataConverted[x][y] ]);
                    }
                }
            }
            if (config.dataConverted) {
                var hasData = config.dataConverted.historical.wind.data && config.dataConverted.historical.wind.data.length > 0;
                var latestHistoricalTimestamp = Date.now();
                if (hasData) {
                    latestHistoricalTimestamp = new Date(config.dataConverted.historical.wind.data.slice(-1)[0].timestamp);
                } else {
                    console.info("No historical data for setTooltip, using now.");
                }
                setTooltip(charts, "historical", null, latestHistoricalTimestamp, config);
                var data = getDataAtTimestamp(latestHistoricalTimestamp, config.dataConverted, "historical");
                config.events.call("tooltipChange", null, {
                    data: data,
                    timestamp: latestHistoricalTimestamp,
                    config: config
                });
            }
            return {
                charts: charts
            };
        };
        var chart = dh.utils.pipeline(template, defaultConfig, data, charts);
        /**
   * A weather chart built on top of datahub.timeseries.
   * @namespace weatherChart
   * @name weatherChart
   * @param {object} config The initial configuration can be passed on init or later using weatherChart.setConfig.
   * @param {object} config.parent The parent DOM element.
   * @param {object} config.data Data can be passed on init or later using weatherChart.setData.
   * @param {number} [config.width=parent.innerWidth] External width of the chart.
   * @param {number} [config.height=parent.innerHeight] External height of the chart.
   * @param {number} [config.historicalXTicks=d3.utcHour.every(12)] Target historical x tick count, as passed to d3.axis.ticks.
   * @param {string} [config.historicalXFormat='%H:%M'] Historical x tick format, as passed to d3.axis.tickFormat.
   * @param {number} [config.forecastXTicks=d3.utcHour.every(12)] Target forecast x tick count, as passed to d3.axis.ticks.
   * @param {string} [config.forecastXFormat='%H:%M'] Forecast x tick format, as passed to d3.axis.tickFormat.
   * @param {number} [config.historicalArrowSkip=3] Only keeping 1 historical arrow out of n.
   * @param {number} [config.forecastArrowSkip=6] Only keeping 1 forecast arrow out of n.
   * @param {boolean} config.resizeOff Turn off auto resize.
   * @returns {object} A weatherChart instance.
   * @example
   * var data = datahub.data.generateWeatherChartData()
   * var chart = datahub.weatherChart({
   *     parent: document.querySelector('.weather-chart'),
   *     data: data
   * })
   * .on('tooltipChange', function(e){ console.log(e) })
   * .setData(data)
   */        var weatherChart = function(config) {
            var configCache, events = d3.dispatch("hover", "tooltipChange", "mouseout"), chartCache, uid = ~~(Math.random() * 1e4);
            var onResize = dh.utils.throttle(function() {
                configCache.width = configCache.parent.clientWidth;
                render();
            }, 200);
            if (!config.resizeOff) {
                d3.select(window).on("resize." + uid, onResize);
            }
            var render = function() {
                chartCache = chart(configCache);
            };
            /**
     * Set the data.
     * @name setData
     * @param {object} data A data object.
     * @returns {object} The weatherChart instance.
     * @memberof weatherChart
     * @instance
     * @example
     * var data = datahub.data.generateWeatherChartData()
     * var chart = datahub.weatherChart({
     *     parent: document.querySelector('.weather-chart')
     * })
     * .setData(data)
     */            var setData = function(data) {
                var d = data ? JSON.parse(JSON.stringify(data)) : {};
                configCache = dh.utils.mergeAll({}, configCache, {
                    data: d
                });
                render();
                return this;
            };
            /**
     * Set the config after its instantiation.
     * @name setConfig
     * @instance
     * @param {object} config The same config format as on init.
     * @returns {object} The weatherChart instance.
     * @memberof weatherChart
     * @example
     * datahub.multiChart({
     *     parent: document.querySelector('.chart'),
     * })
     * .setConfig({
     *     width: 100
     * })
     */            var setConfig = function(config) {
                configCache = dh.utils.mergeAll(configCache, config);
                render();
                return this;
            };
            var init = function(config, events) {
                setConfig(dh.utils.mergeAll(config, {
                    events: events
                }));
            };
            /**
     * Destroys DOM elements and unbind events.
     * @name destroy
     * @memberof weatherChart
     * @instance
     * @example
     * var chart = datahub.weatherChart({
     *     parent: document.querySelector('.chart'),
     * })
     * chart.destroy()
     */            var destroy = function() {
                d3.select(window).on("resize." + uid, null);
                configCache.parent.innerHTML = null;
            };
            init(config, events);
            return {
                on: dh.utils.rebind(events),
                setConfig: setConfig,
                setData: setData,
                destroy: destroy
            };
        };
        dh.weatherChart = weatherChart;
    }(datahub, root.d3);
    var datahub = exports = typeof exports === "object" ? exports : {};
    var root = typeof global === "object" ? global : window;
    if (typeof module === "object" && module.exports) {
        root.d3 = require("d3");
    } else {
        root.d3 = root.d3;
    }
    if (typeof module === "object" && module.exports) {
        module.exports = exports;
    }
})(typeof datahub == "undefined" ? datahub = {} : datahub);