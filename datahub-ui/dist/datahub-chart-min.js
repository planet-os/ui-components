!function(t, e) {
    var a = t = "object" == typeof t ? t : {}, r = "object" == typeof e ? e : window;
    "object" == typeof module && module.exports ? r.d3 = require("d3") : r.d3 = r.d3, 
    !function(t) {
        var e = function(t, a) {
            for (var r in a) a[r] && a[r].constructor == Object && t[r] ? e(t[r], a[r]) : t[r] = a[r];
        }, a = function() {
            for (var t = {}, a = arguments, r = 0; r < a.length; r++) e(t, a[r]);
            return t;
        }, r = function(t, e) {
            for (;e.lastChild; ) e.removeChild(e.lastChild);
            return n(t, e);
        }, n = function(t, e) {
            return e.appendChild(document.importNode(new DOMParser().parseFromString(t, "text/html").body.childNodes[0], !0));
        }, i = function(t, e) {
            var a;
            return function() {
                return t && (a = t.apply(e || this, arguments), t = null), a;
            };
        }, l = function(t, e) {
            var a = !1, r = null;
            return function() {
                var n = this;
                a || (a = !0, clearTimeout(r), r = setTimeout(function() {
                    a = !1, t.apply(n, arguments);
                }, e));
            };
        }, s = function(t, e) {
            var a, r, n, i, l = [], s = [], c = Number.MAX_VALUE, o = Number.MIN_VALUE, u = {};
            for (n = 0; n < t.length; n++) for (a = t[n], i = 0; i < a.length; i++) r = e ? e(a[i]) : a[i], 
            l.push(r), u.hasOwnProperty(r) || null === r || (u[r] = 1, r > o && (o = r), c > r && (c = r));
            return s = Object.keys(u).map(function(t, e) {
                return +t;
            }), {
                flattened: l,
                uniques: s,
                max: o,
                min: c
            };
        }, c = function(t, e) {
            return s(t, e).uniques;
        }, o = function(t, e) {
            return s(t, e).flattened;
        }, u = function(t, e, a) {
            for (var r, n = 0, i = t.length - 1; i > n; ) r = n + i >> 1, a && e >= t[r] || !a && e < t[r] ? i = r : n = r + 1;
            return n;
        }, d = function(t, e) {
            return u(t, e, !0);
        }, m = function(t) {
            var e, a = 0, r = t.length;
            for (e = 0; r > e; e++) t[e] > a && (a = t[e]);
            return a;
        }, h = function(t) {
            var e, a = 1 / 0, r = t.length;
            for (e = 0; r > e; e++) t[e] < a && (a = t[e]);
            return a;
        }, v = function(t) {
            return t.slice(4).slice(0, -1).split(",").map(function(t, e) {
                return parseInt(t);
            });
        }, f = function() {
            var t = arguments, e = this;
            return function(a) {
                for (var r = 0; r < t.length; r++) {
                    var n = t[r].call(this, a);
                    a = e.mergeAll(a, n);
                }
                return a;
            };
        }, p = function(t, e) {
            for (var a in e) a in t && (t[a] = e[a]);
        }, g = function(t) {
            return function() {
                return t.on.apply(t, arguments), this;
            };
        };
        t.utils = {
            merge: e,
            mergeAll: a,
            htmlToNode: r,
            appendHtmlToNode: n,
            once: i,
            throttle: l,
            arrayStats: s,
            arrayUniques: c,
            arrayFlatten: o,
            bisection: u,
            bisectionReversed: d,
            findMax: m,
            findMin: h,
            parseRGB: v,
            pipeline: f,
            override: p,
            rebind: g
        };
    }(a), !function(t, e) {
        var a = function(t) {
            var a = e.utcFormat("%b %e, %Y at %H:%M UTC"), r = "";
            if (!t.dataIsEmpty) {
                var n = function(t) {
                    return t % 1 ? ~~(100 * t) / 100 : t;
                }, i = [], l = e.extent(t.timestamps), s = l[0], c = l[1];
                s.getTime() === c.getTime() && s.getUTCMonth() === c.getUTCMonth() || i.push("%b %e"), 
                s.getYear() !== c.getYear() && i.push("%Y"), s.getYear() === c.getYear() && s.getUTCHours() !== c.getUTCHours() && i.push("%H:%M"), 
                r = e.utcFormat(i.join(" "));
            }
            return {
                axisXFormat: r,
                axisTitleXFormat: function(t) {
                    return a(t.data.x);
                },
                tooltipFormat: function(t) {
                    return n(t.data.y);
                }
            };
        }, r = function(t) {
            var e = {
                top: 50,
                right: 50,
                bottom: 100,
                left: 50
            };
            return {
                margin: t.margin || e,
                width: t.width || 600,
                height: t.height || 300
            };
        }, n = function(t) {
            return t.dataConverted.sort(function(t, e) {
                var a = t.x.getTime(), r = e.x.getTime();
                return r > a ? -1 : a > r ? 1 : 0;
            }), {};
        }, i = function(t) {
            var e = !t.flattenedData.filter(function(t) {
                return null != t.y;
            }).length;
            return {
                dataIsAllNulls: e
            };
        }, l = function(t) {
            var a = t.axisXFormat || "%b", r = e.utcFormat(a) || function(t) {
                return t.toString();
            }, n = e.axisBottom().scale(t.scaleX).tickFormat(r);
            return {
                axisX: n
            };
        }, s = function(t) {
            var a = t.axisYFormat || ".2s", r = e.format(a), n = t.scaleY.range()[0], i = e.axisLeft().scale(t.scaleY).ticks(Math.max(~~(n / 30), 2)).tickPadding(10).tickFormat(r).tickSize(-t.chartWidth);
            return {
                axisY: i
            };
        }, c = function(t) {
            var a = t.container.selectAll("g.axis.x").data([ 0 ]), r = a.enter().append("g").attr("class", "x axis").attr("transform", "translate(" + [ 0, t.chartHeight ] + ")").merge(a).attr("display", function(e) {
                return t.dataIsEmpty ? "none" : null;
            }).attr("transform", "translate(" + [ 0, t.chartHeight ] + ")");
            r.call(t.axisX), a.exit().remove();
            var n = [], i = (r.selectAll(".tick").select("text").each(function(t, e) {
                var a = this.getBBox().width;
                a && n.push(a);
            }), Math.floor(e.max(n) / t.stripeScaleX.bandwidth()));
            return i && r.selectAll(".tick text").attr("display", function(t, e) {
                return e % (i + 1) ? "none" : "block";
            }), {};
        }, o = function(t) {
            var e = t.axisYPadding || 0, a = t.container.selectAll("g.axis.y").data([ 0 ]);
            return a.enter().append("g").attr("class", "y axis").attr("transform", "translate(" + [ -e / 2, 0 ] + ")").merge(a).call(t.axisY).attr("text-anchor", "start").selectAll("text").attr("dx", -t.margin.left + 10), 
            a.exit().remove(), {};
        }, u = function(t) {
            var e = t.container.selectAll("text.axis-title.x").data([ 0 ]);
            return e.enter().append("text").attr("class", "x axis-title").merge(e).text(t.axisTitleX || "").attr("x", t.chartWidth).attr("y", t.chartHeight), 
            e.exit().remove(), {
                axisTitleXComponent: l
            };
        }, d = function(t) {
            var e = t.container.selectAll("text.axis-title.y").data([ 0 ]);
            e.enter().append("text").attr("class", "y axis-title").merge(e).text(t.axisTitleY || "").attr("x", -t.margin.left).attr("y", -10).attr("text-anchor", "start");
            return e.exit().remove(), {};
        }, m = function(t) {
            var e = t.container.selectAll("text.chart-title").data([ t.chartTitle || "" ]);
            return e.enter().append("text").attr("class", "chart-title").merge(e).html(function(t) {
                return t;
            }).attr("x", function(e) {
                return (t.chartWidth - 5 * e.length) / 2;
            }).attr("y", -5), e.exit().remove(), {};
        }, h = function(t) {
            var e = t.container.selectAll("g.shapes").data([ 0 ]), a = e.enter().append("g").attr("class", "shapes").merge(e);
            return e.exit().remove(), {
                shapePanel: a
            };
        }, v = function(t) {
            var a = e.select(t.parent).selectAll("div.widget-container").data([ 0 ]), r = a.enter().append("div").attr("class", "widget-container").merge(a).attr("width", t.width).attr("height", t.height);
            return a.exit().remove(), {
                container: r
            };
        }, f = function(t) {
            var e = v(t).container, a = e.selectAll("svg").data([ 0 ]), r = a.enter().append("svg").attr("class", "datahub-chart"), n = r.append("g").attr("class", "panel").merge(a).attr("transform", "translate(" + t.margin.left + "," + t.margin.top + ")");
            return r.merge(a).attr("width", t.width).attr("height", t.height), a.exit().remove(), 
            {
                root: a,
                container: n
            };
        }, p = function(t) {
            var e = "";
            t.dataIsEmpty ? e = "(Data Unavailable)" : t.dataIsAllNulls && (e = "Values are all null");
            var a = t.container.select(".message-group").selectAll("text").data([ e ]);
            return a.enter().append("text").merge(a).attr("x", (t.scaleX.range()[1] - t.scaleX.range()[0]) / 2).attr("y", function() {
                return t.height / 2 - this.getBBox().height / 2;
            }).text(function(t) {
                return t;
            }).attr("dx", function(t) {
                return -this.getBBox().width / 2;
            }), a.exit().remove(), {};
        }, g = function(t) {
            return t.container.select("g.axis.x").selectAll(".tick text").text(function(t) {
                return e.timeFormat("%a")(t);
            }), {};
        }, x = function(t) {
            return t.container.select("g.axis.x").selectAll(".tick text").text(function(t) {
                return e.timeFormat("%x")(t);
            }), {};
        }, b = function(t) {
            return t.container.select("g.axis.x").selectAll(".tick text").style("transform", "rotate(30deg)").style("text-anchor", "start"), 
            {};
        }, y = function(t) {
            return config.axisY.tickFormat(e.format(".2s")), {};
        }, w = function(t) {
            return t.labelsRewriterY ? (t.container.selectAll("g.axis.y").selectAll("text").html(function(e, a) {
                return t.labelsRewriterY(e, a, t);
            }), {}) : {};
        };
        t.common = {
            axesFormatAutoconfig: a,
            defaultConfig: r,
            sortData: n,
            detectDataAllNulls: i,
            axisX: l,
            axisY: s,
            axisComponentX: c,
            axisComponentY: o,
            axisTitleComponentX: u,
            axisTitleComponentY: d,
            chartTitleComponent: m,
            shapePanel: h,
            svgContainer: f,
            container: v,
            message: p,
            axisXFormatterTime: g,
            axisXFormatterTimeHour: x,
            axisXFormatterRotate30: b,
            axisYFormatSI: y,
            labelsRewriterY: w
        };
    }(a, r.d3), !function(t, e) {
        function a(t) {
            return t.charAt(0).toUpperCase() + t.slice(1);
        }
        function r(t) {
            if (t) return !0;
            throw "You need to set an API key using `datahub.data.setApiKey(API_KEY)`. You can get yours at http://data.planetos.com/";
        }
        var n = {
            currentBaseURI: "https://data.planetos.com/",
            baseURI: "https://api.planetos.com/v1a/",
            datasetsEndpoint: "https://api.planetos.com/v1/datasets/",
            apiKey: null
        }, i = function(t) {
            return n.apiKey = t, this;
        }, l = function() {
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
        }, s = function() {
            var t = d(50, function(t, e) {
                return {
                    coordinates: [ 360 * Math.random() - 180, 180 * Math.random() - 90 ],
                    id: "random-point-" + e
                };
            });
            return c(t);
        }, c = function(t) {
            return {
                type: "FeatureCollection",
                features: t.map(function(t) {
                    return {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: t.coordinates
                        },
                        properties: {
                            id: t.id
                        }
                    };
                })
            };
        }, o = function(t) {
            var e = "https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json";
            v(e, function(e, a) {
                t(a);
            });
        }, u = function() {
            var e = {
                lon: d(360, function(t, e) {
                    return e - 180;
                }),
                lat: d(180, function(t, e) {
                    return 180 - e - 90;
                }),
                values: d(180, function(t, e) {
                    return d(360, function(t, e) {
                        return ~~(100 * Math.random());
                    });
                })
            };
            return e.uniqueValues = t.utils.arrayUniques(e.values), e;
        }, d = function(t, e) {
            var a = e || function(t, e) {
                return 0;
            };
            return Array.apply(null, Array(t)).map(a);
        }, m = function(t) {
            var t = t || {}, e = {
                count: t.count || 12,
                layerCount: t.layerCount || 1,
                timeStart: t.timeStart || "2016-01-01",
                timeIncrement: t.timeIncrement || "month",
                step: t.step || 1,
                min: t.min || 0,
                max: t.max || 100
            }, a = ~~(Math.random() * (e.max - e.min)) + e.min, r = d(e.count, function() {
                return d(e.layerCount, function(t) {
                    return a += (2 * Math.random() - 1) * ((e.max - e.min) / 10), a = Math.max(a, e.min);
                });
            }), n = h(e), i = n.map(function(t, e) {
                return {
                    timestamp: t,
                    value: r[e],
                    id: r[e].map(function(t) {
                        return ~~(1e3 * Math.random());
                    }),
                    className: r[e].map(function(t) {
                        return Math.random().toString(36).substring(4, 8);
                    })
                };
            });
            return i;
        }, h = function(t) {
            var t = t || {}, r = {
                count: t.count || 12,
                layerCount: t.layerCount || 1,
                timeStart: t.timeStart || "2016-01-01",
                timeIncrement: t.timeIncrement || "month",
                step: t.step || 1,
                min: t.min || 0,
                max: t.max || 100
            }, n = "utc" + a(r.timeIncrement) || "utcHour", i = e[n], l = e[n + "s"], s = r.timeStart ? new Date(r.timeStart) : new Date(), c = i.offset(s, r.count * r.step), o = l(s, c, r.step), u = o.map(function(t, a) {
                return e.isoFormat(t);
            });
            return u;
        }, v = function(t, e) {
            var a = "undefined" != typeof XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            a.open("get", t, !0), a.onreadystatechange = function() {
                var t, r;
                4 == a.readyState && (t = a.status, 200 == t ? (r = JSON.parse(a.responseText), 
                e(null, r)) : e(t));
            }, a.send();
        }, f = function(t, e) {
            r(n.apiKey);
            var a = n.baseURI + "/datasets/" + t + "?apikey=" + n.apiKey;
            return console.log("get dataset details", a), v(a, function(t, a) {
                if (void 0 === a) return console.log("Can not render dataset because of API error", t), 
                !1;
                var r = a.FeatureType || "timeseries", n = "grid" === r.toLowerCase().trim() ? "raster" : "timeseries";
                console.log("Data type:", n, a.ProductType, a.FeatureType, a), e({
                    datasetInfo: a,
                    dataType: n,
                    productType: a.ProductType
                });
            }), this;
        }, p = function(t, e, a) {
            r(n.apiKey);
            var i = n.baseURI + "/datasets/" + t + "/variables?apikey=" + n.apiKey;
            return console.log("query variables", i), v(i, function(r, n) {
                var i, l = n[t], s = e;
                s && (i = l.filter(function(t) {
                    return t.name === s;
                })[0]);
                var c = i || l[0];
                a({
                    variables: l,
                    defaultVariable: c
                });
            }), this;
        }, g = function(t, e, a) {
            r(n.apiKey);
            var i = n.baseURI + "/datasets/" + t + "/variables/" + encodeURIComponent(e) + "/timestamps?apikey=" + n.apiKey;
            return console.log("query timestamps", i), v(i, function(t, e) {
                if (t) return void console.log("Server error", t);
                var r = e.map(function(t) {
                    return new Date(parseInt(t));
                });
                a({
                    timestamps: r
                });
            }), this;
        }, x = function(e, a, i, l) {
            r(n.apiKey);
            var s = n.baseURI + "/datasets/" + e + "/variables/" + encodeURIComponent(a);
            return i && (s += "/timestamps/" + i), s += "/sample_data", s += "?apikey=" + n.apiKey, 
            console.log("query dataset", s), v(s, function(r, i) {
                if (r) return void console.log("Server error", r);
                i.values = i.values.map(function(t, e) {
                    return t.map(function(t) {
                        return -999 === t ? null : t;
                    });
                }), i.uniqueValues = t.utils.arrayUniques(i.values).sort();
                var c = n.currentBaseURI + "/datasets/" + e + "?variable=" + a;
                l({
                    json: i,
                    uri: s,
                    datahubLink: c
                });
            }), this;
        }, b = function(t, e) {
            r(n.apiKey);
            var a = n.datasetsEndpoint + t + "/stations?apikey=" + n.apiKey;
            return console.log("get stations", a), v(a, function(t, a) {
                if (t) return void console.log("Server error", t);
                var r = [];
                for (var n in a.station) {
                    var i = a.station[n];
                    void 0 !== i.SpatialExtent && r.push({
                        id: n,
                        coordinates: i.SpatialExtent.coordinates
                    });
                }
                e({
                    stations: r,
                    defaultStation: r[0]
                });
            }), this;
        }, y = function(t, e, a, i, l) {
            r(n.apiKey);
            var s = 500, c = n.datasetsEndpoint + t + "/stations/" + e + "?apikey=" + n.apiKey + "&verbose=true&count=" + s;
            return i || (c += "&time_order=desc"), console.log("station variable", c), v(c, function(e, r) {
                if (e) return void console.log("Server error", e);
                console.log("Point API data", r, c);
                var i, s, o = {}, u = r.metadata.contexts;
                for (var d in u) {
                    i = u[d].dataVariables;
                    for (var m in i) s = i[m], s.key = m, o[m] = s;
                }
                var h = {};
                r.entries.forEach(function(t) {
                    for (var e in t.data) h[e] || (h[e] = {
                        values: [],
                        timestamps: []
                    }), h[e].values.push(t.data[e]), h[e].timestamps.push(new Date(t.axes.time));
                });
                var v = [];
                for (var f in o) v.push(o[f]);
                var p = n.currentBaseURI + "/datasets/" + t + "?variable=" + a;
                l({
                    datasets: h,
                    variablesMetadata: o,
                    variables: v,
                    datahubLink: p,
                    variableData: h[a],
                    variableMetadata: o[a]
                });
            }), this;
        }, w = function(t, e, a, i, l) {
            r(n.apiKey);
            var s = n.baseURI + "/datasets/" + t + "/variables/" + encodeURIComponent(e);
            return a && (s += "/timestamps/" + a), s += "/image", s += "?width=" + i + "&projection=mercator", 
            s += "&apikey=" + n.apiKey, console.log("query image", s), v(s, function(t, e) {
                l(e.img, e.metadata);
            }), this;
        };
        t.data = {
            generateRaster: u,
            generateGeojson: l,
            generateTimeSeries: m,
            generateTimestamps: h,
            getDatasetDetails: f,
            getVariables: p,
            getTimestamps: g,
            getPreview: x,
            getStations: b,
            getStationVariables: y,
            getImage: w,
            getJSON: v,
            apiConfig: n,
            pointsToFeatures: c,
            generateGeojsonPoints: s,
            getWorldVector: o,
            setApiKey: i
        };
    }(a, r.d3), !function(t, e) {
        var a = function(a) {
            var r = a.parent.querySelector(".widget-container");
            if (!r) {
                var n = '<div class="widget-container"><svg class="datahub-chart"><g class="panel"><g class="stripe-group"></g><g class="area-group"></g><g class="stacked-area-group"></g><g class="reference-bar-group"></g><g class="reference-line-group"></g><g class="bar-group"></g><g class="stacked-bar-group"></g><g class="estimate-bar-group"></g><g class="line-group"></g><g class="dot-group"></g><g class="threshold-line-group"></g><g class="y axis"></g><g class="x axis"></g><g class="active-group"></g><g class="title-container"><text class="y axis-title"></text><text class="x axis-title"></text><text class="chart-title"></text></g><g class="message-group"></g><g class="events"><rect class="event-panel"></rect></g></g></svg></div>';
                r = t.utils.appendHtmlToNode(n, a.parent);
            }
            var i = a.width - a.margin.left - a.margin.right, l = a.height - a.margin.top - a.margin.bottom, s = e.select(r);
            return s.select("svg").attr("width", a.width).attr("height", a.height), s.select(".panel").attr("transform", "translate(" + a.margin.left + "," + a.margin.top + ")"), 
            s.select(".events rect").attr("width", i).attr("height", l).attr("opacity", 0), 
            {
                container: s,
                chartWidth: i,
                chartHeight: l
            };
        }, r = function(t, e, a) {
            return t[e] ? t[e].map(function(t) {
                return t.timestamp = new Date(t.timestamp), t.value = Array.isArray(t.value) && !a ? t.value[0] : t.value, 
                t;
            }) : [];
        }, n = function(t) {
            return t.timestamp ? t.timestamp.map(function(t) {
                return new Date(t);
            }) : [];
        }, i = function(t) {
            var e = t.data || {};
            return {
                dataIsEmpty: !e || !e.timestamp || !e.timestamp.length,
                data: {
                    timestamp: n(e),
                    stackedBarData: r(e, "stackedBarData", !0),
                    stackedAreaData: r(e, "stackedAreaData", !0),
                    lineData: r(e, "lineData", !0),
                    barData: r(e, "barData"),
                    referenceData: r(e, "referenceData"),
                    estimateData: r(e, "estimateData"),
                    thresholdData: r(e, "thresholdData"),
                    areaData: r(e, "areaData")
                }
            };
        }, l = function(t) {
            var a = t.dataIsEmpty ? 0 : t.data.timestamp, r = e.scaleBand().domain(a).range([ 0, t.chartWidth ]).paddingInner(.4).paddingOuter(.2), n = r.copy().paddingInner(.1).paddingOuter(.05), i = r.copy().paddingInner(0).paddingOuter(0), l = r.copy().paddingInner(1).paddingOuter(.5);
            return {
                scaleX: r,
                referenceScaleX: n,
                stripeScaleX: i,
                lineScaleX: l
            };
        }, s = function(t, a) {
            var r = a ? "min" : "max";
            return t ? e[r](t.map(function(t) {
                return t.value;
            })) : null;
        }, c = function(t, a) {
            var r = a ? "min" : "max";
            if (t && t.length) {
                var n = t.map(function(t) {
                    return e.sum(t.value);
                });
                return e[r](n);
            }
            return null;
        }, o = function(t, a) {
            var r = a ? "min" : "max";
            if (t && t.length) {
                var n = t.map(function(t, e) {
                    return t.value;
                });
                return n[0].length && (n = e.merge(n)), e[r](n);
            }
            return null;
        }, u = function(t) {
            var a = [];
            a.push(s(t.data.barData)), a.push(s(t.data.referenceData)), a.push(s(t.data.estimateData)), 
            a.push(s(t.data.thresholdData)), a.push(s(t.data.areaData)), a.push(c(t.data.stackedBarData)), 
            a.push(c(t.data.stackedAreaData)), a.push(o(t.data.lineData));
            var r = [], n = !0;
            r.push(s(t.data.barData, n)), r.push(s(t.data.referenceData, n)), r.push(s(t.data.estimateData, n)), 
            r.push(s(t.data.thresholdData, n)), r.push(s(t.data.areaData, n)), r.push(c(t.data.stackedBarData, n)), 
            r.push(c(t.data.stackedAreaData, n)), r.push(o(t.data.lineData, n));
            var i, l = e.max(a);
            if (t.autoScaleY) {
                i = e.min(r);
                var u = (l - i) / 10;
                i = Math.max(i - u, 0), l += u;
            } else i = Math.min(e.min(r), 0), l = Math.max(l, 0);
            var d = [ i, l ];
            t.domain && (d = t.domain), t.reverseY && (d = [ d[1], d[0] ]);
            var m = e.scaleLinear().domain(d).range([ t.chartHeight, 0 ]);
            return {
                scaleY: m
            };
        }, d = function(e, a, r) {
            if (!r) return null;
            var n = e[a].map(function(t) {
                return t.timestamp && t.timestamp.getTime();
            }).indexOf(r.getTime());
            if (n > -1) {
                var i = t.utils.mergeAll({}, e[a][n]);
                return i.value = [].concat(e[a][n].value), i.id = [].concat(e[a][n].id), i;
            }
            return null;
        }, m = function(e, a, r) {
            if (e[a][0]) {
                var n = t.utils.mergeAll({}, e[a][0]);
                return n.value = [].concat(e[a][0].value), n.id = [].concat(e[a][0].id), n;
            }
            return null;
        }, h = function(t, e) {
            var a = {
                referenceData: d(e, "referenceData", t),
                estimateData: d(e, "estimateData", t),
                barData: d(e, "barData", t),
                stackedBarData: d(e, "stackedBarData", t),
                lineData: d(e, "lineData", t),
                areaData: d(e, "areaData", t),
                stackedAreaData: d(e, "stackedAreaData", t),
                thresholdData: m(e, "thresholdData", t)
            };
            return a;
        }, v = function(t) {
            var a = t.container.select(".events .event-panel").on("mousemove touchstart", function(a) {
                if (!t.dataIsEmpty) {
                    var r = e.mouse(this)[0], n = t.stripeScaleX.bandwidth(), i = t.stripeScaleX.domain(), l = i.length, s = Math.min(~~(r / n), l - 1), c = i[s], o = h(c, t.data);
                    t.events.call("hover", null, {
                        index: s,
                        timestamp: c,
                        data: o,
                        config: t,
                        event: e.event
                    });
                }
            }).on("mouseout", function(e) {
                t.events.call("mouseout", null, {});
            }).on("click", function(a) {
                t.events.call("click", null, {
                    event: e.event
                });
            });
            return {
                eventPanel: a
            };
        }, f = function(t) {
            var e = t.container.select(".bar-group").selectAll("rect.bar").data(t.data.barData);
            return e.enter().append("rect").merge(e).attr("class", function(t) {
                return [ "bar", t.id, t.className ].join(" ");
            }).attr("x", function(e, a) {
                return t.scaleX(e.timestamp) || 0;
            }).attr("y", function(e) {
                return t.autoScaleY ? t.chartHeight - (t.chartHeight - Math.abs(t.scaleY(e.value))) : e.value >= 0 || t.reverseY ? t.scaleY(0) - Math.abs(t.scaleY(e.value) - t.scaleY(0)) : t.scaleY(0);
            }).attr("width", function(e) {
                return t.scaleX.bandwidth();
            }).attr("height", function(e) {
                return t.autoScaleY ? t.chartHeight - Math.abs(t.scaleY(e.value)) : Math.abs(t.scaleY(e.value) - t.scaleY(0));
            }), e.exit().remove(), {};
        }, p = function(t) {
            var e = t.container.select(".estimate-bar-group").selectAll("rect.estimate-bar").data(t.data.estimateData);
            return e.enter().append("rect").merge(e).attr("class", function(t) {
                return [ "estimate-bar", t.id, t.className ].join(" ");
            }).attr("x", function(e, a) {
                return t.scaleX(e.timestamp) || 0;
            }).attr("y", function(e) {
                return t.scaleY(e.value) || 0;
            }).attr("width", function(e) {
                return t.scaleX.bandwidth();
            }).attr("height", function(e) {
                return t.chartHeight - t.scaleY(e.value) || 0;
            }), e.exit().remove(), {};
        }, g = function(t) {
            var e = t.container.select(".reference-bar-group").selectAll("rect.reference-bar").data(t.data.referenceData);
            e.enter().append("rect").merge(e).attr("class", function(t) {
                return [ "reference-bar", t.id, t.className ].join(" ");
            }).attr("x", function(e, a) {
                return t.referenceScaleX(e.timestamp) || 0;
            }).attr("y", function(e) {
                return t.autoScaleY ? t.chartHeight - (t.chartHeight - Math.abs(t.scaleY(e.value))) : e.value >= 0 || t.reverseY ? t.scaleY(0) - Math.abs(t.scaleY(e.value) - t.scaleY(0)) : t.scaleY(0);
            }).attr("width", function(e) {
                return t.referenceScaleX.bandwidth();
            }).attr("height", function(e) {
                return t.autoScaleY ? t.chartHeight - Math.abs(t.scaleY(e.value)) : Math.abs(t.scaleY(e.value) - t.scaleY(0));
            }), e.exit().remove();
            var a = t.container.select(".reference-line-group").selectAll("path.reference-top").data(t.data.referenceData);
            return a.enter().append("path").attr("class", "reference-top").merge(a).attr("d", function(e, a) {
                var r = t.referenceScaleX(e.timestamp) || 0, n = 0;
                n = e.value >= 0 || t.reverseY ? t.scaleY(0) - Math.abs(t.scaleY(e.value) - t.scaleY(0)) : t.scaleY(0) + Math.abs(t.scaleY(e.value) - t.scaleY(0));
                var i = t.referenceScaleX.bandwidth();
                return "M" + [ [ r, n ], [ r + i, n ] ];
            }), a.exit().remove(), {};
        }, x = function(a) {
            if (!a.data.stackedBarData || !a.data.stackedBarData.length) return a.container.select(".stacked-bar-group").selectAll("g.stack").remove(), 
            {};
            var r = a.data.stackedBarData[0].value.map(function(t, e) {
                return "y" + e;
            }), n = [];
            a.data.stackedBarData.forEach(function(e, a) {
                var r = t.utils.mergeAll({}, e);
                e.value && e.value.length && (e.value.forEach(function(t, e) {
                    r["y" + e] = t;
                }), n.push(r));
            });
            var i = a.container.select(".stacked-bar-group").selectAll("g.stack").data(e.stack().keys(r)(n)), l = i.enter().append("g").attr("class", "stack").merge(i).selectAll("rect.stacked-bar").data(function(t, e) {
                return t.forEach(function(e) {
                    e.index = t.index;
                }), t;
            });
            return l.enter().append("rect").attr("class", "stacked-bar").merge(l).attr("class", function(t, e, a) {
                var r = t.data.id ? t.data.id[t.index] : null, n = t.data.className ? t.data.className[t.index] : null;
                return [ "stacked-bar", "layer" + t.index, r, n ].join(" ");
            }).filter(function(t) {
                return !Number.isNaN(t[0]) && !Number.isNaN(t[1]);
            }).attr("x", function(t) {
                return a.scaleX(t.data.timestamp);
            }).attr("y", function(t) {
                return a.scaleY(t[1]);
            }).attr("height", function(t) {
                return a.scaleY(t[0]) - a.scaleY(t[1]);
            }).attr("width", a.scaleX.bandwidth()), l.exit().remove(), i.exit().remove(), {};
        }, b = function(t) {
            if (!t.data.lineData.length) return t.container.select(".line-group").selectAll("path.line").remove(), 
            {};
            var a = e.line().defined(function(t) {
                return null != t.value;
            }).x(function(e) {
                return t.lineScaleX(e.timestamp);
            }).y(function(e) {
                return t.scaleY(e.value);
            }), r = [], n = t.data.lineData[0].value.length;
            if ("undefined" == typeof n) r.push(t.data.lineData); else for (var i = 0; n > i; i++) {
                var l = t.data.lineData.map(function(t) {
                    return {
                        timestamp: t.timestamp,
                        value: t.value[i],
                        id: t.id && t.id[i],
                        className: t.className && t.className[i]
                    };
                });
                r.push(l);
            }
            var s = t.container.select(".line-group").selectAll("path.line").data(r);
            return s.enter().append("path").style("fill", "none").merge(s).attr("class", function(t, e) {
                return [ "line", "layer" + e, t[0].id, t[0].className ].join(" ");
            }).attr("d", a), s.exit().remove(), {};
        }, y = function(t) {
            if (!t.data.lineData.length) return t.container.select(".dot-group").selectAll(".dot-layer").remove(), 
            {};
            for (var e = t.data.lineData, a = [], r = e[0].value.length, n = 0; r > n; n++) {
                var i = [];
                e.forEach(function(t, a) {
                    var r = Math.max(0, a - 1), l = Math.min(e.length - 1, a + 1), s = a, c = e[r].value[n], o = e[l].value[n], u = t.value[n];
                    (null !== u && (null === c || null === o) || s === r && s === l) && i.push({
                        value: u,
                        timestamp: t.timestamp,
                        layer: n
                    });
                }), a.push(i);
            }
            var l = t.container.select(".dot-group").selectAll(".dot-layer").data(a), s = l.enter().append("g").merge(l).attr("class", "dot-layer");
            l.exit().remove();
            var c = s.selectAll(".dot").data(function(t, e) {
                return t;
            });
            return c.enter().append("circle").merge(c).attr("class", function(t, e, a) {
                return [ "dot", "layer" + t.layer ].join(" ");
            }).attr("cx", function(e) {
                return t.lineScaleX(e.timestamp);
            }).attr("cy", function(e) {
                return t.scaleY(e.value);
            }).attr("r", 2), c.exit().remove(), {};
        }, w = function(t) {
            var e = t.container.select(".threshold-line-group").selectAll("line.threshold-line").data(t.data.thresholdData);
            return e.enter().append("line").merge(e).attr("class", function(t) {
                return [ "threshold-line", t.id, t.className ].join(" ");
            }).attr("x1", 0).attr("y1", function(e) {
                return t.scaleY(e.value) || 0;
            }).attr("x2", t.chartWidth).attr("y2", function(e) {
                return t.scaleY(e.value) || 0;
            }).attr("display", function(t) {
                return t ? null : "none";
            }), e.exit().remove(), {};
        }, A = function(t) {
            if (!t.data.areaData || !t.data.areaData.length) return t.container.select(".area-group").selectAll("path.area").remove(), 
            {};
            var a = e.area().defined(function(t) {
                return null != t.value;
            }).x(function(e) {
                return t.lineScaleX(e.timestamp);
            }).y0(t.chartHeight).y1(function(e) {
                return t.scaleY(e.value);
            }), r = t.container.select(".area-group").selectAll("path.area").data([ t.data.areaData ]);
            return r.enter().append("path").attr("class", function(t, e) {
                return [ "area", "layer" + e, t[0].id, t[0].className ].join(" ");
            }).merge(r).attr("d", a), r.exit().remove(), {};
        }, D = function(a) {
            if (!a.data.stackedAreaData || !a.data.stackedAreaData.length) return a.container.select(".stacked-area-group").selectAll("g.stack-area").remove(), 
            {};
            var r = a.data.stackedAreaData[0].value.map(function(t, e) {
                return "y" + e;
            }), n = e.area().defined(function(t) {
                return !Number.isNaN(t[0]) && !Number.isNaN(t[1]);
            }).x(function(t) {
                return a.lineScaleX(t.data.timestamp);
            }).y0(function(t) {
                return a.scaleY(t[0]);
            }).y1(function(t) {
                return a.scaleY(t[1]);
            }), i = [];
            a.data.stackedAreaData.forEach(function(e, a) {
                var r = t.utils.mergeAll({}, e);
                e.value && e.value.length && (e.value.forEach(function(t, e) {
                    r["y" + e] = t;
                }), i.push(r));
            });
            var l = a.container.select(".stacked-area-group").selectAll("g.stack-area").data(e.stack().keys(r)(i)), s = l.enter().append("g").attr("class", "stack-area").merge(l).selectAll("path.stacked-area").data(function(t, e) {
                return t.forEach(function(e) {
                    e.index = t.index;
                }), [ t ];
            });
            return s.enter().append("path").merge(s).attr("class", function(t) {
                var e = t[0].data.id ? t[0].data.id[t.index] : null, a = t[0].data.className ? t[0].data.className[t.index] : null;
                return [ "stacked-area", "layer" + t.index, e, a ].join(" ");
            }).attr("d", n), s.exit().remove(), l.exit().remove(), {};
        }, Y = function(t) {
            if (t.showStripes === !1) return t.container.select(".stripe-group").selectAll("rect.stripe").remove(), 
            {};
            var e = t.container.select(".stripe-group").selectAll("rect.stripe").data(t.data.timestamp);
            return e.enter().append("rect").attr("class", "stripe").merge(e).classed("even", function(t, e) {
                return e % 2;
            }).attr("x", function(e, a) {
                return t.stripeScaleX(e) || 0;
            }).attr("y", function(t) {
                return 0;
            }).attr("width", function(e) {
                return t.stripeScaleX.bandwidth();
            }).attr("height", function(e) {
                return t.chartHeight;
            }), e.exit().remove(), {};
        }, k = function(t) {
            var a = t.activeDate && void 0 !== t.activeDate.getTime ? t.activeDate.getTime() : new Date(t.activeDate).getTime(), r = t.data.timestamp.filter(function(t) {
                return t.getTime() === a;
            }), n = t.container.select(".active-group").selectAll("rect.active").data(r);
            return n.enter().append("rect").attr("class", "active").merge(n).each(function(a) {
                if (!t.dataIsEmpty) {
                    var r = h(a, t.data);
                    t.events.call("active", null, {
                        timestamp: a,
                        data: r,
                        config: t,
                        event: e.event
                    });
                }
            }).attr("x", function(e, a) {
                return t.stripeScaleX(e) || 0;
            }).attr("y", function(t) {
                return 0;
            }).attr("width", function(e) {
                return t.stripeScaleX.bandwidth();
            }).attr("height", function(e) {
                return t.chartHeight;
            }), n.exit().remove(), {};
        }, X = t.utils.pipeline(t.common.defaultConfig, i, a, l, u, v, t.common.axisX, t.common.axisY, Y, k, A, g, x, D, f, p, b, y, w, t.common.axisComponentY, t.common.labelsRewriterY, t.common.message, t.common.axisComponentX, t.common.axisTitleComponentX, t.common.axisTitleComponentY, t.common.chartTitleComponent), M = function(a) {
            var r, n, i = e.dispatch("hover", "click", "mouseout", "active"), l = ~~(1e4 * Math.random()), s = t.utils.throttle(function() {
                r.width = r.parent.clientWidth, c();
            }, 200);
            e.select(window).on("resize." + l, s);
            var c = function() {
                n = X(r);
            }, o = function(e) {
                var a = e ? JSON.parse(JSON.stringify(e)) : {};
                return r = t.utils.mergeAll({}, r), r.data = a, c(), this;
            }, u = function(e) {
                return r = t.utils.mergeAll(r, e), c(), this;
            }, d = function(e, a) {
                u(t.utils.mergeAll(e, {
                    events: a
                }));
            }, m = function() {
                e.select(window).on("resize." + l, null), r.parent.innerHTML = null;
            };
            return d(a, i), {
                on: t.utils.rebind(i),
                setConfig: u,
                setData: o,
                destroy: m
            };
        };
        t.multiChart = M;
    }(a, r.d3), !function(t, e) {
        var a = function(a) {
            var r = a.parent.querySelector(".datahub-table-chart");
            if (!r) {
                var n = '<div class="datahub-table-chart"><div class="table-container"><div class="header"><div class="row"></div></div><div class="content"></div><div class="footer"><div class="row"></div></div></div><div class="chart-container"><div class="header"><div class="row"></div></div><div class="content"><div class="rows"></div><div class="chart"><svg><g class="panel"><g class="stripes"></g><g class="bars"></g><g class="axis"></g><g class="message-group"></g></g></svg></div></div><div class="footer"><div class="row"></div></div></div></div>';
                r = t.utils.appendHtmlToNode(n, a.parent);
            }
            var i = !(a.elements && a.elements.length), l = {
                top: 0,
                bottom: 24,
                right: 24,
                left: 24
            }, s = a.margin || l, c = a.rowHeight || 48, o = e.select(r), u = o.select(".chart-container"), d = u.node().clientWidth, m = d - s.left - s.right, h = i ? c : a.elements.length * c + s.bottom, v = h - s.bottom;
            return {
                container: o,
                width: d,
                height: h,
                chartWidth: m,
                chartHeight: v,
                rowHeight: c,
                margin: s,
                dataIsEmpty: i
            };
        }, r = function(t) {
            if (t.elements) {
                var e = t.elements.slice(), a = e.sort(t.sortFunc);
                return {
                    elements: a
                };
            }
            return {};
        }, n = function(t) {
            var a = t.domain || [ 0, 0 ];
            if (!t.domain && t.elements) {
                var r = e.merge(t.elements).filter(function(e) {
                    return e.key === t.valueKey || e.key === t.referenceKey;
                }).map(function(t) {
                    return t.value;
                });
                a = r.length ? e.extent(r) : [ 0, 0 ];
            }
            a[0] = Math.min(a[0], 0);
            var n = Math.max(Math.abs(a[0]), Math.abs(a[1]));
            a = [ -n, n ];
            var i = e.scaleLinear().domain(a).range([ 0, t.chartWidth ]);
            return {
                scaleX: i
            };
        }, i = function(t) {
            var a = t.axisXFormat || ".2s", r = e.axisBottom().scale(t.scaleX).tickFormat(e.format(a)), n = t.container.select(".axis").attr("transform", "translate(" + [ 0, t.chartHeight ] + ")").attr("display", t.dataIsEmpty ? "none" : "block").call(r);
            return {
                axisX: n
            };
        }, l = function(t) {
            var e = t.container.select(".header .row").selectAll("div.column").data(t.header || []);
            return e.enter().append("div").merge(e).attr("class", function(t) {
                return "column " + t.key;
            }).html(function(t) {
                if (Array.isArray(t.label)) {
                    var e = t.label.map(function(t, e) {
                        return "<div>" + t + "</div>";
                    }).join("");
                    return '<div class="multiline">' + e + "</div>";
                }
                return t.label;
            }), e.exit().remove(), {};
        }, s = function(t) {
            var e = t.container.select(".table-container .content").selectAll("div.row").data(t.elements || []), a = e.enter().append("div").merge(e).attr("class", "row");
            e.exit().remove();
            var r = a.selectAll("div.column").data(function(t) {
                return t;
            });
            r.enter().append("div").merge(r).attr("class", "column").html(function(e) {
                if ("number" == typeof e.label) {
                    var a = function(t) {
                        return Math.floor(100 * t) / 100;
                    }, r = t.valueFormat || a;
                    return r(e.label);
                }
                if (Array.isArray(e.label)) {
                    var n = e.label.map(function(t, e) {
                        return "<div>" + t + "</div>";
                    }).join("");
                    return '<div class="multiline">' + n + "</div>";
                }
                return null === e.label || "undefined" == typeof e.label ? t.emptyPlaceholder || "" : e.label;
            }), r.exit().remove();
            var n = t.container.select(".chart-container .rows").selectAll("div.row").data(t.elements || []);
            return n.enter().append("div").attr("class", "row").append("div").attr("class", "column"), 
            n.exit().remove(), {};
        }, c = function(t) {
            var e = t.container.select("svg").attr("width", t.width).attr("height", t.height).select(".panel").attr("transform", "translate(" + t.margin.left + " 0)").select(".bars").selectAll("g.bar-group").data(t.elements || []), a = e.enter().append("g").merge(e).attr("class", "bar-group").attr("transform", function(e, a) {
                return "translate(0 " + a * t.rowHeight + ")";
            });
            e.exit().remove();
            var r = a.selectAll("rect.reference-bar").data(function(e, a) {
                var r = e.filter(function(e) {
                    return e.key === t.referenceKey;
                });
                return [ r && r[0] ];
            });
            r.enter().append("rect").merge(r).attr("class", "reference-bar").attr("width", function(e) {
                return Math.abs(t.scaleX(e.value) - t.scaleX(0));
            }).attr("height", function(e) {
                return t.rowHeight / 2;
            }).attr("x", function(e) {
                return e.value < 0 ? t.scaleX(e.value) : t.scaleX(0);
            }).attr("y", function(e) {
                return t.rowHeight / 4;
            }), r.exit().remove();
            var n = 2, i = a.selectAll("rect.reference-line").data(function(e, a) {
                var r = e.filter(function(e) {
                    return e.key === t.referenceKey;
                });
                return [ r && r[0] ];
            });
            i.enter().append("rect").merge(i).attr("class", "reference-line").attr("display", function(t) {
                return t.value || 0 === t.value ? "block" : "none";
            }).attr("width", n).attr("height", function(e) {
                return t.rowHeight / 2;
            }).attr("x", function(e) {
                var a = n;
                return e.value > 0 && (a *= -1), t.scaleX(e.value) + a;
            }).attr("y", function(e) {
                return t.rowHeight / 4;
            }), i.exit().remove();
            var l = a.selectAll("rect.value-bar").data(function(e, a) {
                var r = e.filter(function(e) {
                    return e.key === t.valueKey;
                });
                return [ r && r[0] ];
            });
            return l.enter().append("rect").merge(l).attr("class", "value-bar").attr("width", function(e) {
                return Math.abs(t.scaleX(e.value) - t.scaleX(0));
            }).attr("height", function(e) {
                return t.rowHeight / 4;
            }).attr("x", function(e) {
                return e.value < 0 ? t.scaleX(e.value) : t.scaleX(0);
            }).attr("y", function(e) {
                return 3 * t.rowHeight / 8;
            }), l.exit().remove(), {};
        }, o = function(t) {
            return t.container.on("click", function() {
                t.events.call("click", null, {
                    event: e.event
                });
            }), {};
        }, u = function(t) {
            var e = t.scaleX.ticks(), a = t.container.select(".stripes").selectAll("rect.stripe").data(e);
            return a.enter().append("rect").attr("class", "stripe").merge(a).attr("x", function(a, r) {
                var n = e[Math.max(r - 1, 0)], i = (t.scaleX(a) - t.scaleX(n)) / 2;
                return t.scaleX(a) - i;
            }).attr("y", function(t) {
                return 0;
            }).attr("width", function(a, r) {
                var n = e[Math.max(r - 1, 0)], i = (t.scaleX(a) - t.scaleX(n)) / 2;
                return i = Math.max(i, 0);
            }).attr("height", function(e) {
                return t.chartHeight;
            }), a.exit().remove(), {};
        }, d = function(t) {
            var e = (t.scaleX.ticks(), t.container.select(".stripes").selectAll("line.grid").data([ 0 ]));
            return e.enter().append("line").attr("class", "grid").merge(e).attr("display", t.dataIsEmpty ? "none" : "block").attr("x1", function(e) {
                return t.scaleX(0) + .5;
            }).attr("y1", 0).attr("x2", function(e) {
                return t.scaleX(0) + .5;
            }).attr("y2", t.chartHeight), e.exit().remove(), {};
        }, m = function(t) {
            return t.labelsRewriterX ? (t.container.selectAll(".axis").selectAll("text").html(function(e, a) {
                return t.labelsRewriterX(e, a, t);
            }), {}) : {};
        }, h = t.utils.pipeline(a, r, l, s, n, o, u, d, i, m, c), v = function(a) {
            var r, n, i = e.dispatch("click"), l = ~~(1e4 * Math.random()), s = t.utils.throttle(function() {
                r.width = r.parent.clientWidth, c();
            }, 200);
            e.select(window).on("resize." + l, s);
            var c = function() {
                n = h(r);
            }, o = function(e) {
                var a = e ? JSON.parse(JSON.stringify(e)) : {};
                return r = t.utils.mergeAll({}, r, {
                    data: a
                }), c(), this;
            }, u = function(e) {
                return r = t.utils.mergeAll(r, e), c(), this;
            }, d = function(e, a) {
                u(t.utils.mergeAll(e, {
                    events: a
                }));
            }, m = function() {
                e.select(window).on("resize." + l, null), r.parent.innerHTML = null;
            };
            return d(a, i), {
                on: t.utils.rebind(i),
                setConfig: u,
                setData: o,
                destroy: m
            };
        };
        t.tableChart = v;
    }(a, r.d3), !function(t, e) {
        var a = function(a) {
            var r = a.parent.querySelector(".datahub-vertical-chart");
            if (!r) {
                var n = '<div class="datahub-vertical-chart"><div class="header"></div><div class="chart-container"><div class="chart-wrapper"><svg><g class="panel"><g class="reference-bars"></g><g class="bars"></g><g class="axis"></g></g></svg></div></div><div class="number-container"></div></div>';
                r = t.utils.appendHtmlToNode(n, a.parent);
            }
            var i = !(a.elements && a.elements.length), l = e.select(r), s = l.select(".chart-container"), c = s.node().clientWidth, o = 26, u = i ? 0 : a.elements.length * o;
            return {
                container: l,
                chartWidth: c,
                chartHeight: u,
                rowHeight: o,
                dataIsEmpty: i,
                refernceValue: 100
            };
        }, r = function(t) {
            var a = e.scaleLinear().domain([ 0, 100 ]).range([ 0, t.referenceBarSize ]);
            return {
                scaleX: a
            };
        }, n = function(t) {
            return t.container.select(".header").html(t.title), {};
        }, i = function(t) {
            var e = t.container.select(".number-container").selectAll(".number").data(t.elements || []), a = e.enter().append("div").merge(e).attr("class", function(t, e) {
                return "number number" + e;
            });
            e.exit().remove();
            var r = a.selectAll(".label").data(function(t) {
                return [ t ];
            });
            r.enter().append("div").attr("class", "label").merge(r).html(function(t) {
                return t.label;
            }), r.exit().remove();
            var n = a.selectAll(".value").data(function(t) {
                return [ t ];
            });
            return n.enter().append("div").attr("class", "value").merge(n).html(function(e) {
                return Math.round(e.value) + " " + t.unit;
            }), n.exit().remove(), {};
        }, l = function(t) {
            var e = t.container.select("svg").attr("width", t.chartWidth).attr("height", t.chartHeight).select(".panel"), a = t.rowHeight, r = a - 2, n = r / 2, i = e.select(".bars").selectAll(".bar").data(t.elements || []);
            i.enter().append("rect").merge(i).attr("class", function(t, e) {
                return [ "bar", t.label.toLowerCase(), "bar" + e ].join(" ");
            }).attr("x", function(e) {
                var a = t.scaleX(e.value);
                return 0 > a ? t.chartWidth / 2 - Math.abs(a) : t.chartWidth / 2;
            }).attr("y", function(t, e) {
                return a * e + (a - n) / 2;
            }).attr("width", function(e) {
                return e.value ? Math.abs(t.scaleX(e.value)) : void 0;
            }).attr("height", n), i.exit().remove();
            var l = e.select(".reference-bars").selectAll(".bar").data(t.elements || []);
            l.enter().append("rect").attr("class", "bar").merge(l).attr("x", t.chartWidth / 2).attr("y", function(t, e) {
                return a * e + (a - r) / 2;
            }).attr("width", function(e, a) {
                return t.referenceBarSize;
            }).attr("height", r), l.exit().remove();
            var s = e.select(".reference-bars").selectAll(".line").data(t.elements || []);
            return s.enter().append("line").attr("class", "line").merge(s).attr("x1", t.chartWidth / 2 + t.referenceBarSize).attr("y1", function(t, e) {
                return a * e + (a - r) / 2;
            }).attr("x2", t.chartWidth / 2 + t.referenceBarSize).attr("y2", function(t, e) {
                return a * e + (a - r) / 2 + r;
            }), s.exit().remove(), {};
        }, s = function(t) {
            var e = t.container.select(".axis").selectAll(".vertical").data([ 0 ]);
            return e.enter().append("line").attr("class", "vertical").merge(e).attr("x1", t.chartWidth / 2).attr("y1", 0).attr("x2", t.chartWidth / 2).attr("y2", t.chartHeight), 
            e.exit().remove(), {};
        }, c = t.utils.pipeline(a, n, i, r, s, l), o = function(a) {
            var r, n, i = e.dispatch("barHover"), l = ~~(1e4 * Math.random()), s = t.utils.throttle(function() {
                r.width = r.parent.clientWidth, o();
            }, 200);
            e.select(window).on("resize." + l, s);
            var o = function() {
                n = c(r);
            }, u = function(e) {
                var a = e ? JSON.parse(JSON.stringify(e)) : {};
                return r = t.utils.mergeAll({}, r, {
                    data: a
                }), o(), this;
            }, d = function(e) {
                return r = t.utils.mergeAll(r, e), o(), this;
            }, m = function(e, a) {
                d(t.utils.mergeAll(e, {
                    events: a
                }));
            }, h = function() {
                e.select(window).on("resize." + l, null), r.parent.innerHTML = null;
            };
            return m(a, i), {
                on: t.utils.rebind(i),
                setConfig: d,
                setData: u,
                destroy: h
            };
        };
        t.verticalChart = o;
    }(a, r.d3), !function(t, e) {
        var a = function(a) {
            var r = a.parent.querySelector(".datahub-waterfall-chart");
            if (!r) {
                var n = '<div class="datahub-waterfall-chart"><div class="chart-container"><svg><g class="panel"><g class="bars"></g><g class="connectors"></g></g></svg></div><div class="number-container"></div></div>';
                r = t.utils.appendHtmlToNode(n, a.parent);
            }
            var i = !(a.elements && a.elements.length), l = !(!i && a.elements[0].value), s = e.select(r), c = s.select(".chart-container"), o = a.width || c.node().clientWidth, u = a.height || c.node().clientHeight || 300, d = [ 1, 3 ], m = [ 1 ];
            return {
                container: s,
                chartWidth: o,
                chartHeight: u,
                dataIsEmpty: l,
                infoIsEmpty: i,
                elements: a.elements || [],
                isConnected: d,
                isNegative: m
            };
        }, r = function(t) {
            var a = e.scaleBand().domain(e.range(t.elements.length)).rangeRound([ 0, t.chartWidth ]).paddingInner(.4).paddingOuter(.2);
            return {
                scaleX: a
            };
        }, n = function(t) {
            var a = t.elements.map(function(t) {
                return t.value;
            }), r = e.scaleLinear().domain([ 0, e.max(a) ]).range([ 0, t.chartHeight ]);
            return {
                scaleY: r
            };
        }, i = function(t) {
            var e = t.container.select("svg").attr("width", t.chartWidth).attr("height", t.chartHeight).select(".panel");
            if (t.dataIsEmpty) return e.select(".bars").selectAll(".bar").remove(), {};
            var a = e.select(".bars").selectAll(".bar").data(t.elements);
            return a.enter().append("rect").merge(a).attr("class", function(t, e) {
                return [ "bar", t.label.toLowerCase(), t.key, "bar" + e ].join(" ");
            }).attr("x", function(e, a) {
                return t.scaleX(a);
            }).attr("y", function(e, a) {
                var r = t.isConnected.indexOf(a) > -1;
                if (r) {
                    var n = Math.max(0, a - 1), i = t.elements[n];
                    return t.isNegative.indexOf(a) > -1 ? t.chartHeight - t.scaleY(Math.abs(i.value)) : t.chartHeight - t.scaleY(Math.abs(i.value)) - t.scaleY(Math.abs(e.value));
                }
                return t.chartHeight - t.scaleY(Math.abs(e.value));
            }).attr("width", function(e) {
                return e.value ? t.scaleX.bandwidth() : void 0;
            }).attr("height", function(e) {
                return t.scaleY(Math.abs(e.value));
            }), a.exit().remove(), {};
        }, l = function(t) {
            if (t.dataIsEmpty) return t.container.select(".connectors").selectAll(".connector").remove(), 
            {};
            var e = t.container.select(".connectors").selectAll(".connector").data(t.elements);
            e.enter().append("line").attr("class", "connector").merge(e).attr("x1", function(e, a) {
                return t.scaleX(a);
            }).attr("y1", function(e, a) {
                var r = t.isConnected.indexOf(a) > -1;
                if (r) {
                    var n = Math.max(0, a - 1), i = t.elements[n];
                    return t.isNegative.indexOf(a) > -1 ? t.scaleY(Math.abs(e.value)) : t.chartHeight - t.scaleY(Math.abs(i.value)) - t.scaleY(Math.abs(e.value));
                }
                return t.chartHeight - t.scaleY(Math.abs(e.value));
            }).attr("x2", function(e, a) {
                return t.scaleX(Math.min(a + 1, t.elements.length - 1));
            }).attr("y2", function(e, a) {
                var r = t.isConnected.indexOf(a) > -1;
                if (r) {
                    var n = Math.max(0, a - 1), i = t.elements[n];
                    return t.isNegative.indexOf(a) > -1 ? t.chartHeight - t.scaleY(Math.abs(i.value)) + t.scaleY(Math.abs(e.value)) : t.chartHeight - t.scaleY(Math.abs(i.value)) - t.scaleY(Math.abs(e.value));
                }
                return t.chartHeight - t.scaleY(Math.abs(e.value));
            }), e.exit().remove();
            var e = t.container.select(".connectors").selectAll(".base").data([ 0 ]);
            return e.enter().append("line").attr("class", "base").merge(e).attr("x1", t.scaleX(0)).attr("y1", t.chartHeight).attr("x2", t.scaleX(Math.max(t.elements.length - 1, 0)) + t.scaleX.bandwidth() || 0).attr("y2", t.chartHeight), 
            e.exit().remove(), {};
        }, s = function(t) {
            var e = t.container.select(".number-container").selectAll(".number").data(t.elements), a = e.enter().append("div").merge(e).attr("class", function(t, e) {
                return "number number" + e;
            });
            e.exit().remove();
            var r = a.selectAll(".label").data(function(t) {
                return [ t ];
            });
            r.enter().append("div").attr("class", "label").merge(r).html(function(t) {
                return t.label;
            }), r.exit().remove();
            var n = a.selectAll(".value").data(function(t) {
                return [ t ];
            });
            return n.enter().append("div").attr("class", "value").merge(n).html(function(t) {
                return "undefined" == typeof t.value ? '<div class="error">(Data Unavailable)</div>' : Math.round(t.value);
            }), n.exit().remove(), {};
        }, c = t.utils.pipeline(a, r, n, i, l, s), o = function(a) {
            var r, n, i = e.dispatch("barHover"), l = ~~(1e4 * Math.random()), s = t.utils.throttle(function() {
                r.width = r.parent.clientWidth, o();
            }, 200);
            e.select(window).on("resize." + l, s);
            var o = function() {
                n = c(r);
            }, u = function(e) {
                var a = e ? JSON.parse(JSON.stringify(e)) : {};
                return r = t.utils.mergeAll({}, r, {
                    data: a
                }), o(), this;
            }, d = function(e) {
                return r = t.utils.mergeAll(r, e), o(), this;
            }, m = function(e, a) {
                d(t.utils.mergeAll(e, {
                    events: a
                }));
            }, h = function() {
                e.select(window).on("resize." + l, null), r.parent.innerHTML = null;
            };
            return m(a, i), {
                on: t.utils.rebind(i),
                setConfig: d,
                setData: u,
                destroy: h
            };
        };
        t.waterfallChart = o;
    }(a, r.d3);
    var a = t = "object" == typeof t ? t : {}, r = "object" == typeof e ? e : window;
    "object" == typeof module && module.exports ? r.d3 = require("d3") : r.d3 = r.d3, 
    "object" == typeof module && module.exports && (module.exports = t), e.datahub = t;
}({}, function() {
    return this;
}());