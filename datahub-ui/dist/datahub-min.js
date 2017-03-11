!function(e, t) {
    var a = e = "object" == typeof e ? e : {}, n = "object" == typeof t ? t : window;
    if ("object" == typeof module && module.exports) {
        n.d3 = require("d3"), n.colorBrewer = require("d3-scale-chromatic");
        try {
            n.leaflet = require("leaflet");
        } catch (r) {}
    } else n.d3 = n.d3, n.colorBrewer = n.d3, n.leaflet = n.L;
    !function(e) {
        var t = function(e, a) {
            for (var n in a) a[n] && a[n].constructor == Object && e[n] ? t(e[n], a[n]) : e[n] = a[n];
        }, a = function() {
            for (var e = {}, a = arguments, n = 0; n < a.length; n++) t(e, a[n]);
            return e;
        }, n = function(e, t) {
            for (;t.lastChild; ) t.removeChild(t.lastChild);
            return r(e, t);
        }, r = function(e, t) {
            return t.appendChild(document.importNode(new DOMParser().parseFromString(e, "text/html").body.childNodes[0], !0));
        }, i = function(e, t) {
            var a;
            return function() {
                return e && (a = e.apply(t || this, arguments), e = null), a;
            };
        }, l = function(e, t) {
            var a = !1, n = null;
            return function() {
                var r = this;
                a || (a = !0, clearTimeout(n), n = setTimeout(function() {
                    a = !1, e.apply(r, arguments);
                }, t));
            };
        }, o = function(e, t) {
            var a, n, r, i, l = [], o = [], s = Number.MAX_VALUE, c = Number.MIN_VALUE, u = {};
            for (r = 0; r < e.length; r++) for (a = e[r], i = 0; i < a.length; i++) n = t ? t(a[i]) : a[i], 
            l.push(n), u.hasOwnProperty(n) || null === n || (u[n] = 1, n > c && (c = n), s > n && (s = n));
            return o = Object.keys(u).map(function(e, t) {
                return +e;
            }), {
                flattened: l,
                uniques: o,
                max: c,
                min: s
            };
        }, s = function(e, t) {
            return o(e, t).uniques;
        }, c = function(e, t) {
            return o(e, t).flattened;
        }, u = function(e, t, a) {
            for (var n, r = 0, i = e.length - 1; i > r; ) n = r + i >> 1, a && t >= e[n] || !a && t < e[n] ? i = n : r = n + 1;
            return r;
        }, d = function(e, t) {
            return u(e, t, !0);
        }, m = function(e) {
            var t, a = 0, n = e.length;
            for (t = 0; n > t; t++) e[t] > a && (a = e[t]);
            return a;
        }, h = function(e) {
            var t, a = 1 / 0, n = e.length;
            for (t = 0; n > t; t++) e[t] < a && (a = e[t]);
            return a;
        }, f = function(e) {
            return e.slice(4).slice(0, -1).split(",").map(function(e, t) {
                return parseInt(e);
            });
        }, g = function() {
            var e = arguments, t = this;
            return function(a) {
                for (var n = 0; n < e.length; n++) {
                    var r = e[n].call(this, a);
                    a = t.mergeAll(a, r);
                }
                return a;
            };
        }, v = function(e, t) {
            for (var a in t) a in e && (e[a] = t[a]);
        }, p = function(e) {
            return function() {
                return e.on.apply(e, arguments), this;
            };
        };
        e.utils = {
            merge: t,
            mergeAll: a,
            htmlToNode: n,
            appendHtmlToNode: r,
            once: i,
            throttle: l,
            arrayStats: o,
            arrayUniques: s,
            arrayFlatten: c,
            bisection: u,
            bisectionReversed: d,
            findMax: m,
            findMin: h,
            parseRGB: f,
            pipeline: g,
            override: v,
            rebind: p
        };
    }(a), !function(e, t) {
        var a = function(e) {
            var a = t.utcFormat("%b %e, %Y at %H:%M UTC"), n = "";
            if (!e.dataIsEmpty) {
                var r = function(e) {
                    return e % 1 ? ~~(100 * e) / 100 : e;
                }, i = [], l = t.extent(e.timestamps), o = l[0], s = l[1];
                o.getTime() === s.getTime() && o.getUTCMonth() === s.getUTCMonth() || i.push("%b %e"), 
                o.getYear() !== s.getYear() && i.push("%Y"), o.getYear() === s.getYear() && o.getUTCHours() !== s.getUTCHours() && i.push("%H:%M"), 
                n = t.utcFormat(i.join(" "));
            }
            return {
                axisXFormat: n,
                axisTitleXFormat: function(e) {
                    return a(e.data.x);
                },
                tooltipFormat: function(e) {
                    return r(e.data.y);
                }
            };
        }, n = function(e) {
            var t = {
                top: 50,
                right: 50,
                bottom: 100,
                left: 50
            };
            return {
                margin: e.margin || t,
                width: e.width || 600,
                height: e.height || 300
            };
        }, r = function(e) {
            return e.dataConverted.sort(function(e, t) {
                var a = e.x.getTime(), n = t.x.getTime();
                return n > a ? -1 : a > n ? 1 : 0;
            }), {};
        }, i = function(e) {
            var t = !e.flattenedData.filter(function(e) {
                return null != e.y;
            }).length;
            return {
                dataIsAllNulls: t
            };
        }, l = function(e) {
            var a = e.axisXFormat || "%b", n = t.utcFormat(a) || function(e) {
                return e.toString();
            }, r = t.axisBottom().scale(e.scaleX).tickFormat(n);
            return {
                axisX: r
            };
        }, o = function(e) {
            var a = e.axisYFormat || ".2s", n = t.format(a), r = e.scaleY.range()[0], i = t.axisLeft().scale(e.scaleY).ticks(Math.max(~~(r / 30), 2)).tickPadding(10).tickFormat(n).tickSize(-e.chartWidth);
            return {
                axisY: i
            };
        }, s = function(e) {
            var a = e.container.selectAll("g.axis.x").data([ 0 ]), n = a.enter().append("g").attr("class", "x axis").attr("transform", "translate(" + [ 0, e.chartHeight ] + ")").merge(a).attr("display", function(t) {
                return e.dataIsEmpty ? "none" : null;
            }).attr("transform", "translate(" + [ 0, e.chartHeight ] + ")");
            n.call(e.axisX), a.exit().remove();
            var r = [], i = (n.selectAll(".tick").select("text").each(function(e, t) {
                var a = this.getBBox().width;
                a && r.push(a);
            }), Math.floor(t.max(r) / e.stripeScaleX.bandwidth()));
            return i && n.selectAll(".tick text").attr("display", function(e, t) {
                return t % (i + 1) ? "none" : "block";
            }), {};
        }, c = function(e) {
            var t = e.axisYPadding || 0, a = e.container.selectAll("g.axis.y").data([ 0 ]);
            return a.enter().append("g").attr("class", "y axis").attr("transform", "translate(" + [ -t / 2, 0 ] + ")").merge(a).call(e.axisY).attr("text-anchor", "start").selectAll("text").attr("dx", -e.margin.left + 10), 
            a.exit().remove(), {};
        }, u = function(e) {
            var t = e.container.selectAll("text.axis-title.x").data([ 0 ]);
            return t.enter().append("text").attr("class", "x axis-title").merge(t).text(e.axisTitleX || "").attr("x", e.chartWidth).attr("y", e.chartHeight), 
            t.exit().remove(), {
                axisTitleXComponent: l
            };
        }, d = function(e) {
            var t = e.container.selectAll("text.axis-title.y").data([ 0 ]);
            t.enter().append("text").attr("class", "y axis-title").merge(t).text(e.axisTitleY || "").attr("x", -e.margin.left).attr("y", -10).attr("text-anchor", "start");
            return t.exit().remove(), {};
        }, m = function(e) {
            var t = e.container.selectAll("text.chart-title").data([ e.chartTitle || "" ]);
            return t.enter().append("text").attr("class", "chart-title").merge(t).html(function(e) {
                return e;
            }).attr("x", function(t) {
                return (e.chartWidth - 5 * t.length) / 2;
            }).attr("y", -5), t.exit().remove(), {};
        }, h = function(e) {
            var t = e.container.selectAll("g.shapes").data([ 0 ]), a = t.enter().append("g").attr("class", "shapes").merge(t);
            return t.exit().remove(), {
                shapePanel: a
            };
        }, f = function(e) {
            var a = t.select(e.parent).selectAll("div.widget-container").data([ 0 ]), n = a.enter().append("div").attr("class", "widget-container").merge(a).attr("width", e.width).attr("height", e.height);
            return a.exit().remove(), {
                container: n
            };
        }, g = function(e) {
            var t = f(e).container, a = t.selectAll("svg").data([ 0 ]), n = a.enter().append("svg").attr("class", "datahub-chart"), r = n.append("g").attr("class", "panel").merge(a).attr("transform", "translate(" + e.margin.left + "," + e.margin.top + ")");
            return n.merge(a).attr("width", e.width).attr("height", e.height), a.exit().remove(), 
            {
                root: a,
                container: r
            };
        }, v = function(e) {
            var t = "";
            e.dataIsEmpty ? t = "(Data Unavailable)" : e.dataIsAllNulls && (t = "Values are all null");
            var a = e.container.select(".message-group").selectAll("text").data([ t ]);
            return a.enter().append("text").merge(a).attr("x", (e.scaleX.range()[1] - e.scaleX.range()[0]) / 2).attr("y", function() {
                return e.height / 2 - this.getBBox().height / 2;
            }).text(function(e) {
                return e;
            }).attr("dx", function(e) {
                return -this.getBBox().width / 2;
            }), a.exit().remove(), {};
        }, p = function(e) {
            return e.container.select("g.axis.x").selectAll(".tick text").text(function(e) {
                return t.timeFormat("%a")(e);
            }), {};
        }, x = function(e) {
            return e.container.select("g.axis.x").selectAll(".tick text").text(function(e) {
                return t.timeFormat("%x")(e);
            }), {};
        }, b = function(e) {
            return e.container.select("g.axis.x").selectAll(".tick text").style("transform", "rotate(30deg)").style("text-anchor", "start"), 
            {};
        }, y = function(e) {
            return config.axisY.tickFormat(t.format(".2s")), {};
        }, w = function(e) {
            return e.labelsRewriterY ? (e.container.selectAll("g.axis.y").selectAll("text").html(function(t, a) {
                return e.labelsRewriterY(t, a, e);
            }), {}) : {};
        };
        e.common = {
            axesFormatAutoconfig: a,
            defaultConfig: n,
            sortData: r,
            detectDataAllNulls: i,
            axisX: l,
            axisY: o,
            axisComponentX: s,
            axisComponentY: c,
            axisTitleComponentX: u,
            axisTitleComponentY: d,
            chartTitleComponent: m,
            shapePanel: h,
            svgContainer: g,
            container: f,
            message: v,
            axisXFormatterTime: p,
            axisXFormatterTimeHour: x,
            axisXFormatterRotate30: b,
            axisYFormatSI: y,
            labelsRewriterY: w
        };
    }(a, n.d3), !function(e, t) {
        function a(e) {
            return e.charAt(0).toUpperCase() + e.slice(1);
        }
        function n(e) {
            if (e) return !0;
            throw "You need to set an API key using `datahub.data.setApiKey(API_KEY)`. You can get yours at http://data.planetos.com/";
        }
        var r = {
            currentBaseURI: "https://data.planetos.com/",
            baseURI: "https://api.planetos.com/v1a/",
            datasetsEndpoint: "https://api.planetos.com/v1/datasets/",
            apiKey: null
        }, i = function(e) {
            return r.apiKey = e, this;
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
        }, o = function() {
            var e = d(50, function(e, t) {
                return {
                    coordinates: [ 360 * Math.random() - 180, 180 * Math.random() - 90 ],
                    id: "random-point-" + t
                };
            });
            return s(e);
        }, s = function(e) {
            return {
                type: "FeatureCollection",
                features: e.map(function(e) {
                    return {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: e.coordinates
                        },
                        properties: {
                            id: e.id
                        }
                    };
                })
            };
        }, c = function(e) {
            var t = "https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json";
            f(t, function(t, a) {
                e(a);
            });
        }, u = function() {
            var t = {
                lon: d(360, function(e, t) {
                    return t - 180;
                }),
                lat: d(180, function(e, t) {
                    return 180 - t - 90;
                }),
                values: d(180, function(e, t) {
                    return d(360, function(e, t) {
                        return ~~(100 * Math.random());
                    });
                })
            };
            return t.uniqueValues = e.utils.arrayUniques(t.values), t;
        }, d = function(e, t) {
            var a = t || function(e, t) {
                return 0;
            };
            return Array.apply(null, Array(e)).map(a);
        }, m = function(e) {
            var e = e || {}, t = {
                count: e.count || 12,
                layerCount: e.layerCount || 1,
                timeStart: e.timeStart || "2016-01-01",
                timeIncrement: e.timeIncrement || "month",
                step: e.step || 1,
                min: e.min || 0,
                max: e.max || 100
            }, a = ~~(Math.random() * (t.max - t.min)) + t.min, n = d(t.count, function() {
                return d(t.layerCount, function(e) {
                    return a += (2 * Math.random() - 1) * ((t.max - t.min) / 10), a = Math.max(a, t.min);
                });
            }), r = h(t), i = r.map(function(e, t) {
                return {
                    timestamp: e,
                    value: n[t],
                    id: n[t].map(function(e) {
                        return ~~(1e3 * Math.random());
                    }),
                    className: n[t].map(function(e) {
                        return Math.random().toString(36).substring(4, 8);
                    })
                };
            });
            return i;
        }, h = function(e) {
            var e = e || {}, n = {
                count: e.count || 12,
                layerCount: e.layerCount || 1,
                timeStart: e.timeStart || "2016-01-01",
                timeIncrement: e.timeIncrement || "month",
                step: e.step || 1,
                min: e.min || 0,
                max: e.max || 100
            }, r = "utc" + a(n.timeIncrement) || "utcHour", i = t[r], l = t[r + "s"], o = n.timeStart ? new Date(n.timeStart) : new Date(), s = i.offset(o, n.count * n.step), c = l(o, s, n.step), u = c.map(function(e, a) {
                return t.isoFormat(e);
            });
            return u;
        }, f = function(e, t) {
            var a = "undefined" != typeof XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            a.open("get", e, !0), a.onreadystatechange = function() {
                var e, n;
                4 == a.readyState && (e = a.status, 200 == e ? (n = JSON.parse(a.responseText), 
                t(null, n)) : t(e));
            }, a.send();
        }, g = function(e, t) {
            n(r.apiKey);
            var a = r.baseURI + "/datasets/" + e + "?apikey=" + r.apiKey;
            return console.log("get dataset details", a), f(a, function(e, a) {
                if (void 0 === a) return console.log("Can not render dataset because of API error", e), 
                !1;
                var n = a.FeatureType || "timeseries", r = "grid" === n.toLowerCase().trim() ? "raster" : "timeseries";
                console.log("Data type:", r, a.ProductType, a.FeatureType, a), t({
                    datasetInfo: a,
                    dataType: r,
                    productType: a.ProductType
                });
            }), this;
        }, v = function(e, t, a) {
            n(r.apiKey);
            var i = r.baseURI + "/datasets/" + e + "/variables?apikey=" + r.apiKey;
            return console.log("query variables", i), f(i, function(n, r) {
                var i, l = r[e], o = t;
                o && (i = l.filter(function(e) {
                    return e.name === o;
                })[0]);
                var s = i || l[0];
                a({
                    variables: l,
                    defaultVariable: s
                });
            }), this;
        }, p = function(e, t, a) {
            n(r.apiKey);
            var i = r.baseURI + "/datasets/" + e + "/variables/" + encodeURIComponent(t) + "/timestamps?apikey=" + r.apiKey;
            return console.log("query timestamps", i), f(i, function(e, t) {
                if (e) return void console.log("Server error", e);
                var n = t.map(function(e) {
                    return new Date(parseInt(e));
                });
                a({
                    timestamps: n
                });
            }), this;
        }, x = function(t, a, i, l) {
            n(r.apiKey);
            var o = r.baseURI + "/datasets/" + t + "/variables/" + encodeURIComponent(a);
            return i && (o += "/timestamps/" + i), o += "/sample_data", o += "?apikey=" + r.apiKey, 
            console.log("query dataset", o), f(o, function(n, i) {
                if (n) return void console.log("Server error", n);
                i.values = i.values.map(function(e, t) {
                    return e.map(function(e) {
                        return -999 === e ? null : e;
                    });
                }), i.uniqueValues = e.utils.arrayUniques(i.values).sort();
                var s = r.currentBaseURI + "/datasets/" + t + "?variable=" + a;
                l({
                    json: i,
                    uri: o,
                    datahubLink: s
                });
            }), this;
        }, b = function(e, t) {
            n(r.apiKey);
            var a = r.datasetsEndpoint + e + "/stations?apikey=" + r.apiKey;
            return console.log("get stations", a), f(a, function(e, a) {
                if (e) return void console.log("Server error", e);
                var n = [];
                for (var r in a.station) {
                    var i = a.station[r];
                    void 0 !== i.SpatialExtent && n.push({
                        id: r,
                        coordinates: i.SpatialExtent.coordinates
                    });
                }
                t({
                    stations: n,
                    defaultStation: n[0]
                });
            }), this;
        }, y = function(e, t, a, i, l) {
            n(r.apiKey);
            var o = 500, s = r.datasetsEndpoint + e + "/stations/" + t + "?apikey=" + r.apiKey + "&verbose=true&count=" + o;
            return i || (s += "&time_order=desc"), console.log("station variable", s), f(s, function(t, n) {
                if (t) return void console.log("Server error", t);
                console.log("Point API data", n, s);
                var i, o, c = {}, u = n.metadata.contexts;
                for (var d in u) {
                    i = u[d].dataVariables;
                    for (var m in i) o = i[m], o.key = m, c[m] = o;
                }
                var h = {};
                n.entries.forEach(function(e) {
                    for (var t in e.data) h[t] || (h[t] = {
                        values: [],
                        timestamps: []
                    }), h[t].values.push(e.data[t]), h[t].timestamps.push(new Date(e.axes.time));
                });
                var f = [];
                for (var g in c) f.push(c[g]);
                var v = r.currentBaseURI + "/datasets/" + e + "?variable=" + a;
                l({
                    datasets: h,
                    variablesMetadata: c,
                    variables: f,
                    datahubLink: v,
                    variableData: h[a],
                    variableMetadata: c[a]
                });
            }), this;
        }, w = function(e, t, a, i, l) {
            n(r.apiKey);
            var o = r.baseURI + "/datasets/" + e + "/variables/" + encodeURIComponent(t);
            return a && (o += "/timestamps/" + a), o += "/image", o += "?width=" + i + "&projection=mercator", 
            o += "&apikey=" + r.apiKey, console.log("query image", o), f(o, function(e, t) {
                l(t.img, t.metadata);
            }), this;
        };
        e.data = {
            generateRaster: u,
            generateGeojson: l,
            generateTimeSeries: m,
            generateTimestamps: h,
            getDatasetDetails: g,
            getVariables: v,
            getTimestamps: p,
            getPreview: x,
            getStations: b,
            getStationVariables: y,
            getImage: w,
            getJSON: f,
            apiConfig: r,
            pointsToFeatures: s,
            generateGeojsonPoints: o,
            getWorldVector: c,
            setApiKey: i
        };
    }(a, n.d3), !function(e, t) {
        var a = function(e) {
            var a = e.width - e.margin.left - e.margin.right, n = e.timeRange.map(function(e) {
                return new Date(e);
            }), r = t.scaleTime().domain(n).range([ 0, a ]);
            return {
                scaleX: r,
                sliderWidth: a
            };
        }, n = function(e) {
            var a = e.height - e.margin.top - e.margin.bottom, n = e.axisXFormat || t.utcFormat("%b"), r = t.axisBottom().scale(e.scaleX).tickFormat(n).tickSize(a - 12);
            return {
                axisX: r,
                sliderHeight: a
            };
        }, r = function(e) {
            var t = e.container.selectAll("g.axis.x").data([ 0 ]);
            return t.enter().append("g").attr("class", "x axis").attr("transform", "translate(" + [ 0, e.margin.top ] + ")").merge(t).transition().attr("transform", "translate(" + [ 0, e.margin.top ] + ")").call(e.axisX), 
            t.exit().remove(), {};
        }, i = function(e) {
            e.container.classed("datahub-button-group", !0);
            var a = t.dispatch("click"), n = e.container.selectAll(".element").data(e.elements), r = n.enter().append("div").on("click", function(t) {
                var n = this, i = !1;
                r.classed("active", function() {
                    return isAlreadyActive = this.classList.contains("active"), isTarget = n === this, 
                    isTarget && isAlreadyActive && e.isTogglable !== !1 && (i = !0), e.isExclusive ? (!isAlreadyActive || isAlreadyActive && e.isTogglable === !1) && isTarget : isTarget ? !isAlreadyActive : isAlreadyActive;
                }), a.call("click", null, {
                    selected: i ? null : t
                });
            }).merge(n).attr("class", function(e) {
                return "element " + (e.className || "");
            }).classed("active", function(t) {
                return t.key === e.defaultElementKey;
            }).html(function(e) {
                return e.label;
            });
            return n.exit().remove(), {
                events: a
            };
        }, l = function(e) {
            e.container.classed("datahub-slider", !0);
            var a = t.dispatch("brush"), n = t.brushX().extent([ [ 0, 0 ], [ e.sliderWidth, e.sliderHeight - 12 ] ]).handleSize(10).on("brush", function() {
                var n = t.event.selection, r = {
                    start: e.scaleX.invert(n[0]),
                    end: e.scaleX.invert(n[1])
                };
                a.call("brush", null, {
                    brushExtent: r
                });
            }), r = e.container.selectAll("g.brush").data([ 0 ]);
            r.enter().append("g").attr("class", "brush").attr("transform", "translate(" + [ 0, e.margin.top ] + ")").merge(r).attr("transform", "translate(" + [ 0, e.margin.top ] + ")").call(n).call(n.move, e.scaleX.range());
            return r.exit().remove(), e.initialTimeRange, {
                events: a
            };
        }, o = function(a) {
            function n(e) {
                return l.title = e || l.title, c.select(".title").html(l.title), this;
            }
            function r(e) {
                return l.value = e || l.value, c.select(".value").html(l.value), this;
            }
            function i(e) {
                return l.info = e || l.info, c.select(".info").html(l.info), this;
            }
            var l = {
                title: a.title,
                value: a.value,
                info: a.info
            }, o = '<div class="datahub-number"><div class="title"></div><div class="value"></div><div class="info"></div></div>', s = e.utils.appendHtmlToNode(o, a.parent), c = t.select(s).on("click", function(e) {
                u.call("click", null, l);
            }), u = t.dispatch("click");
            return n(l.title), r(l.value), i(l.info), {
                on: e.utils.rebind(u),
                setTitle: n,
                setValue: r,
                setInfo: i
            };
        }, s = function(a) {
            function n(e) {
                if (!e) return this;
                c.header = e, c.defaultSortKey = e[0].key;
                var t = s.select(".header-row").selectAll(".header-cell").data(e), a = t.enter().append("div").attr("class", "header-cell").on("click", function(e, t) {
                    if (this.classList.contains("sortable") && c.elements) {
                        var n = this, i = !1;
                        a.classed("ascending", function(e) {
                            var t = n === this;
                            return t && (i = this.classList.contains("ascending"), t = !i), t;
                        }), r(c.elements, e.key, !i);
                    }
                }).merge(t).classed("sortable", function(e) {
                    return e.sortable;
                }).classed("ascending", function(e) {
                    return e.key === c.defaultSortKey;
                }).html(function(e) {
                    return e.label;
                });
                t.exit().remove();
            }
            function r(e, t, a) {
                if (!e || !c.header) return this;
                c.elements = e;
                var n = t || c.defaultSortKey, r = "undefined" == typeof a ? !0 : a, l = i(e, n, r), o = s.selectAll(".table-row").data(l), u = o.enter().append("div").attr("class", "table-row").merge(o);
                o.exit().remove();
                var d = u.selectAll(".cell").data(function(e) {
                    return e;
                });
                d.enter().append("div").attr("class", "cell").merge(d).html(function(e) {
                    return e;
                }), d.exit().remove();
            }
            function i(e, t, a) {
                var n = c.header.map(function(e) {
                    return e.key;
                }).indexOf(t), r = JSON.parse(JSON.stringify(e)).sort(function(e, t) {
                    return e[n] < t[n] ? a ? -1 : 1 : e[n] > t[n] ? a ? 1 : -1 : 0;
                });
                return r;
            }
            var l = '<div class="datahub-table"><div class="header-row"></div></div>', o = e.utils.appendHtmlToNode(l, a.parent), s = t.select(o), c = {
                elements: a.elements,
                header: a.header,
                defaultSortKey: a.header ? a.header[0].key : null
            };
            return r(a.elements), n(a.header), {
                setHeader: n,
                setElements: r
            };
        }, c = function(a) {
            function n(e) {
                o.select(".alert-band").classed(e, !0);
            }
            function r(e) {
                o.select(".alert-message").html(e);
            }
            var i = '<div class="datahub-alert-message"><div class="alert-band"></div><div class="alert-message"></div></div>', l = e.utils.appendHtmlToNode(i, a.parent), o = t.select(l);
            return n(a.level), r(a.message), {
                setLevel: n,
                setMessage: r
            };
        }, u = function(a) {
            function n() {
                M.text(w.year), l();
            }
            function r() {
                A.classed("active", function(e) {
                    return e === w.month;
                }), l();
            }
            function i() {
                k.call("change", null, o()), l();
            }
            function l() {
                k.call("update", null, o());
            }
            function o() {
                return {
                    year: w.year,
                    month: w.month,
                    date: s(),
                    iso: u(),
                    formatted: c()
                };
            }
            function s() {
                return new Date(w.year, y.indexOf(w.month));
            }
            function c(e) {
                var a = e || "%B %Y";
                return t.timeFormat(a)(s());
            }
            function u(e) {
                return t.isoFormat(s());
            }
            function d(e) {
                return w = {
                    month: y[new Date(e).getMonth()],
                    year: new Date(e).getFullYear()
                }, n(), r(), this;
            }
            function m(e) {
                return w.month = e, r(), this;
            }
            function h(e) {
                return w.year = e, n(), this;
            }
            function f() {
                return y;
            }
            function g(e) {
                return w.month = y[e], r(), this;
            }
            function v() {
                a.parent.innerHTML = null;
            }
            var p = '<div class="datahub-month-calendar"> <div class="year-selector">     <div class="prev-year">&lsaquo;</div>     <div class="selected-year"></div>     <div class="next-year">&rsaquo;</div> </div> <div class="month-selector"> </div></div>', x = e.utils.appendHtmlToNode(p, a.parent), b = t.select(x), y = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ], w = {
                month: y[new Date().getMonth()],
                year: new Date().getFullYear()
            }, k = t.dispatch("change", "update"), M = b.select(".selected-year").text(w.year);
            b.select(".prev-year").on("click", function(e) {
                w.year -= 1, n(), i();
            }), b.select(".next-year").on("click", function(e) {
                w.year += 1, n(), i();
            });
            var D = b.select(".month-selector").selectAll(".element").data(y), A = D.enter().append("div").attr("class", "element month").text(function(e) {
                return e;
            }).on("click", function(e) {
                var t = this;
                A.classed("active", function() {
                    return t === this;
                }), w.month = e, r(), i();
            }).merge(D).classed("active", function(e) {
                return e === w.month;
            });
            return a.defaultMonth && a.defaultYear ? (m(a.defaultMonth), h(a.defaultYear)) : a.defaultMonthNumber && a.defaultYear ? (g(a.defaultMonthNumber), 
            h(a.defaultYear)) : d(a.defaultDate || new Date()), i(), {
                on: e.utils.rebind(k),
                getDateFormats: o,
                getDate: s,
                getISODate: u,
                getFormattedDate: c,
                setDate: d,
                setMonth: m,
                setYear: h,
                getMonthNames: f,
                setMonthNumber: g,
                destroy: v
            };
        }, d = function(a) {
            function n(e) {
                return g.html(e), c && c.classed("active", function(t) {
                    return t.label === e;
                }), this;
            }
            function r(e) {
                if (!e) return this;
                var t = h.selectAll(".element").data(e, function(e) {
                    return e.key;
                });
                return c = t.enter().append("div").attr("class", "element").on("mouseover", l).on("click", function(e) {
                    if (!a.ignoreClickEvents) {
                        var t = this;
                        c.classed("active", function() {
                            return t === this;
                        }), n(e.label), f.call("change", null, e), o();
                    }
                }).merge(t).html(function(e) {
                    return e.label;
                }), t.exit().remove(), n(a.selected || a.elements[0].label), this;
            }
            function i(e) {
                return h.classed("active", e), this;
            }
            function l() {
                return i(!0), this;
            }
            function o() {
                return i(!1), this;
            }
            function s() {
                return h.classed("active");
            }
            var c, u = '<div class="datahub-dropdown"> <div class="top">     <div class="title"></div>     <div class="selected-element"></div> </div> <div class="elements"></div></div>', d = e.utils.appendHtmlToNode(u, a.parent), m = t.select(d), h = m.select(".elements"), f = t.dispatch("change");
            m.select(".title").html(a.title);
            var g = m.on("mouseover", function() {
                var e = "ontouchstart" in document.documentElement, t = h.classed("active");
                t || e || l();
            }).on("mouseout", function() {
                var e = h.classed("active"), t = "ontouchstart" in document.documentElement;
                e && !t && o();
            }).select(".top").on("click", function() {
                var e = h.classed("active");
                e ? o() : l();
            }).select(".selected-element");
            return r(a.elements), {
                on: e.utils.rebind(f),
                toggle: i,
                open: l,
                close: o,
                isOpened: s,
                setElements: r,
                setSelected: n
            };
        }, m = function(a) {
            var n = t.dispatch("change"), r = d({
                parent: a.parent,
                ignoreClickEvents: !0
            }), i = u({
                parent: a.parent.querySelector(".elements"),
                defaultDate: a.defaultDate,
                defaultMonthNumber: a.defaultMonthNumber,
                defaultYear: a.defaultYear,
                defaultMonth: a.defaultMonth
            }).on("change", function(e) {
                n.call("change", null, e);
            }).on("update", function(e) {
                r.setSelected(e.formatted);
            });
            return r.setSelected(i.getFormattedDate()), {
                on: e.utils.rebind(n),
                toggle: r.toggle,
                open: r.open,
                close: r.close,
                isOpened: r.isOpened,
                setElements: r.setElements,
                setSelected: r.setSelected,
                getDateFormats: i.getDateFormats,
                getDate: i.getDate,
                getISODate: i.getISODate,
                getFormattedDate: i.getFormattedDate,
                setDate: i.setDate,
                setMonth: i.setMonth,
                setYear: i.setYear,
                getMonthNames: i.getMonthNames,
                setMonthNumber: i.setMonthNumber
            };
        }, l = e.utils.pipeline(a, n, e.common.svgContainer, r, l), h = e.utils.pipeline(e.common.container, i);
        e.widget = {
            timeSlider: l,
            buttonGroup: h,
            number: o,
            table: s,
            alertMessage: c,
            monthCalendar: u,
            dropdown: d,
            dropdownCalendar: m
        };
    }(a, n.d3), !function(e, t) {
        var a = function(e) {
            return {
                margin: e.margin || {
                    right: 20,
                    left: 20
                },
                unit: null,
                colorScale: e.colorScale || palette.equalizedSpectral
            };
        }, n = function(a) {
            var n = a.parent.querySelector(".datahub-legend");
            if (!n) {
                var r = '<div class="datahub-legend"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"><g class="panel"><defs><linearGradient id="legend-gradient"></linearGradient></defs><rect class="color-band" fill="url(#legend-gradient)" /><g class="axis"></g><text class="unit"></text></g></svg></div>';
                n = e.utils.appendHtmlToNode(r, a.parent);
            }
            var i = t.select(n), l = a.width || n.offsetWidth, o = a.height || n.offsetHeight;
            i.select("svg").attr("width", l).attr("height", o);
            var s = (i.select(".panel").attr("transform", "translate(" + a.margin.left + ",0)"), 
            l - a.margin.left - a.margin.right);
            return {
                container: i,
                width: l,
                height: o,
                legendWidth: s
            };
        }, r = function(e) {
            if (!e.data) return {};
            var a, n, r, i = e.colorScale(e.data);
            return n = i.domain(), r = t.range(0, n.length), a = e.colorScale(r), {
                legendColorScale: a,
                labelValues: n,
                colors: r
            };
        }, i = function(e) {
            if (!e.data) return {};
            var t = e.container.select("#legend-gradient").selectAll("stop").data(e.colors);
            return t.enter().append("stop").merge(t).attr("offset", function(t, a) {
                return a * (100 / (e.colors.length - 1)) + "%";
            }).attr("stop-color", function(t) {
                return e.legendColorScale(t);
            }), t.exit().remove(), e.container.select(".color-band").attr("width", e.legendWidth).attr("height", e.height / 2), 
            {};
        }, l = function(e) {
            if (!e.data) return {};
            var t = e.container.select(".axis").selectAll("text.tick-label").data(e.labelValues), a = t.enter().append("text").classed("tick-label", !0).merge(t).attr("x", function(t, a) {
                return a * (e.legendWidth / (e.labelValues.length - 1));
            }).attr("y", .7 * e.height).attr("dy", "0.5em").text(function(e) {
                return e.toPrecision(3);
            });
            t.exit().remove(), a.attr("dx", function(e, t) {
                return -(this.getBBox().width / 2);
            });
            var n = e.container.select(".axis").selectAll("line.tick-line").data(e.labelValues), r = n.enter().append("line").classed("tick-line", !0).merge(n).attr("x1", function(t, a) {
                return a * (e.legendWidth / (e.labelValues.length - 1));
            }).attr("y1", e.height / 2).attr("x2", function(t, a) {
                return a * (e.legendWidth / (e.labelValues.length - 1));
            }).attr("y2", .55 * e.height);
            return n.exit().remove(), r.attr("dx", function(e, t) {
                return -(this.getBBox().width / 2);
            }), e.unit && e.container.select(".unit").attr("y", .95 * e.height).text(e.unit), 
            {};
        }, o = e.utils.pipeline(a, n, r, i, l), s = function(a) {
            var n, r, i = ~~(1e4 * Math.random()), l = e.utils.throttle(function() {
                n.width = n.parent.clientWidth, s();
            }, 200);
            t.select(window).on("resize." + i, l);
            var s = function() {
                r = o(n);
            }, c = function(t) {
                var a = t ? JSON.parse(JSON.stringify(t)) : {};
                return n = e.utils.mergeAll({}, n), n.data = a, s(), this;
            }, u = function(t) {
                return n = e.utils.mergeAll(n, t), s(), this;
            }, d = function(t) {
                u(e.utils.mergeAll({}, t));
            }, m = function() {
                t.select(window).on("resize." + i, null), n.parent.innerHTML = null;
            };
            return d(a), {
                setConfig: u,
                render: s,
                setData: c,
                destroy: m
            };
        };
        e.colorLegend = s;
    }(a, n.d3), !function(e, t, a) {
        var n = a.schemeSpectral[11].reverse(), r = function(e, a) {
            var n = t.scaleQuantile().domain(e).range(t.range(a - 1)).quantiles();
            return n.push(t.max(e)), n.unshift(t.min(e)), n;
        }, i = function(e, a) {
            var n = r(e, a.length);
            return t.scaleLinear().domain(n).range(a);
        }, l = function(e, a) {
            var n = a || e.length, r = t.scaleLinear().domain([ 0, n - 1 ]).range(e);
            return t.range(n).map(r);
        }, o = {
            grayscale: function(e) {
                return t.scaleLinear().domain(t.extent(e)).range([ "white", "black" ]);
            },
            equalizedSpectral: function(e) {
                return i(e, n);
            },
            equalizedGrayscale: function(e) {
                return i(e, l([ "white", "black" ], 10));
            }
        };
        e.palette = o;
    }(a, n.d3, n.colorBrewer), !function(e, t, n) {
        var r = function() {
            var t = null, a = null, r = null, i = null, l = null, o = null, s = n.DomUtil.create("canvas", "data-grid-layer");
            s.style.display = "none", document.body.appendChild(s);
            var c = {};
            return c.render = function(l) {
                var o = l || i;
                if (i = o, !o) return c;
                var u = a.getBounds(), d = a.getPixelOrigin(), m = a.getPixelWorldBounds(), h = a.getSize(), f = h.y;
                a._zoom < h.y / 512 && (f = m.max.y - m.min.y), console.log("Start rendering..."), 
                console.time("render");
                var g = o.lat, v = o.lon, p = o.values;
                s.width = h.x, s.height = f;
                for (var x, b, y, w, k, M, D, A, S, T = s.getContext("2d"), C = Math.max(e.utils.bisectionReversed(g, u.getNorth()) - 1, 0), Y = Math.min(e.utils.bisectionReversed(g, u.getSouth()), g.length - 1), N = Math.max(e.utils.bisection(v, u.getWest()) - 1, 0), X = Math.min(e.utils.bisection(v, u.getEast()) + 1, v.length - 1), H = a.latLngToContainerPoint([ g[C], v[Math.max(N, 0)] ]), I = a.latLngToContainerPoint([ g[C], v[Math.min(N + 1, v.length - 1)] ]), L = Math.ceil(Math.max(I.x - H.x, 1)) + 2, E = T.getImageData(0, 0, h.x, f), F = new ArrayBuffer(E.data.length), O = new Uint8ClampedArray(F), o = new Uint32Array(F), B = 0; B < g.length; B++) if (!(C > B || B > Y)) {
                    D = Math.max(B, 0), A = Math.min(D + 1, g.length - 1);
                    for (var W = a.latLngToContainerPoint([ g[D], v[N] ]), P = a.latLngToContainerPoint([ g[A], v[N] ]), j = Math.ceil(Math.max(P.y - W.y, 1) + 1), z = 0; z < v.length; z++) if (z >= N && X > z && (S = Math.max(z, 0), 
                    k = a.latLngToContainerPoint([ g[D], v[S] ]), a._zoom < h.y / 512 && (k.y = k.y + d.y - a._getMapPanePos().y), 
                    M = p[D][S], -999 !== M && null !== M && !isNaN(M) && B % 1 === 0 && z % 1 === 0)) for (x = e.utils.parseRGB(t(M)), 
                    y = 0; L > y; y++) for (w = 0; j > w; w++) b = (~~k.y + w - ~~(j / 2)) * h.x + Math.min(Math.max(~~k.x + y - ~~(L / 2), 0), h.x - 1), 
                    o[b] = 255 << 24 | x[2] << 16 | x[1] << 8 | x[0];
                }
                return E.data.set(O), T.putImageData(E, 0, 0), r && r.removeFrom(a), r = n.imageOverlay(s.toDataURL("image/png"), u).addTo(a), 
                r.setOpacity(.8), console.timeEnd("render"), c;
            }, c.setColorScale = function(e) {
                return t = e, c;
            }, c.setData = function(e) {
                return c.render(e), c;
            }, c.addTo = function(e) {
                return a = e, a.on("moveend", function(e) {
                    var t = e.target._panes.overlayPane.querySelector("img");
                    if (t) {
                        var n = t.style, r = n.transform;
                        if (r) {
                            var i = r.match(/\((.*)\)/)[1].split(",").slice(0, 2);
                            n.transform = "translate(" + i + ")";
                        }
                    }
                    var s = e.target._zoom, u = s !== l;
                    l = s;
                    var d = a.getBounds(), m = JSON.stringify(d) !== JSON.stringify(o);
                    o = d, (u || m) && c.render();
                }), c;
            }, c;
        }, i = function(e) {
            function a(e) {
                n.marker(e, {
                    interactive: !0
                }).on("click", function(e) {
                    r(), s(), u.call("markerClick", this, e);
                }, this).addTo(h);
                s();
            }
            function r() {
                return h.clearLayers(), f._toolbars.draw._modes.rectangle.handler.disable(), f._toolbars.draw._modes.marker.handler.disable(), 
                this;
            }
            function i(e) {
                return {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [ e.concat([ e[0] ]) ]
                    },
                    properties: {}
                };
            }
            function o(e, t) {
                var a = n.GeoJSON.geometryToLayer(e).on("click", function(e) {
                    h.removeLayer(this), t && t(this), s();
                }, this);
                return a.addTo(h), this;
            }
            function s() {
                var e = h.getBounds();
                return e._southWest ? d.fitBounds(e) : d.fitWorld(), this;
            }
            var c = l({
                parent: e.parent
            }).init(), u = t.dispatch("mapCloseClick", "rectangleDraw", "rectangleClick", "markerClick", "markerDraw", "geojsonClick"), d = c._getMap();
            d.zoomControl.setPosition("bottomright");
            var m = n.Control.extend({
                position: "topright",
                onAdd: function(e) {
                    var t = n.DomUtil.create("a", "map-close leaflet-bar leaflet-control leaflet-control-custom");
                    return t.onclick = function(e) {
                        u.call("mapCloseClick", this, e);
                    }, t;
                }
            });
            d.addControl(new m());
            var h = new n.FeatureGroup();
            d.addLayer(h);
            var f = new n.Control.Draw({
                edit: {
                    featureGroup: h,
                    edit: !1,
                    remove: !1
                },
                draw: {
                    polygon: !1,
                    circle: !1,
                    polyline: !1,
                    marker: {
                        icon: new n.Icon.Default(),
                        zIndexOffset: 2e3,
                        repeatMode: !0
                    },
                    rectangle: {
                        shapeOptions: {
                            fillColor: "#128DE0",
                            color: "#128DE0",
                            opacity: .5
                        },
                        repeatMode: !0
                    }
                }
            });
            return d.addControl(f), d.on("draw:created", function(e) {
                var t = e.layer;
                r();
                if ("rectangle" === e.layerType && (t.addTo(h).on("click", function(e) {
                    r(), s(), u.call("rectangleClick", this, e);
                }, this), u.call("rectangleDraw", this, t.getBounds()), s()), "marker" === e.layerType) {
                    var n = t.getLatLng();
                    a(n), u.call("markerDraw", this, n);
                }
            }, this), c.addRectangle = function(e) {
                r();
                var t = i(e);
                return o(t, function() {
                    u.call("rectangleClick", this, arguments);
                }), s(), this;
            }, c.addPolygons = function(e) {
                return r(), e.forEach(function(e) {
                    e[1].id = e[0];
                    var t = n.GeoJSON.geometryToLayer(e[1]).on("click", function(t) {
                        h.removeLayer(this), u.call("geojsonClick", this, e), s();
                    }, this);
                    t.addTo(h);
                }), s(), this;
            }, c.removeAllPolygons = r, c.zoomToBoundingBox = s, c.addMarker = a, c;
        }, l = function(i) {
            function l() {
                n.Icon.Default.imagePath = y.imagePath, k = n.map(y.container, w).on("click", function(e) {
                    C.call("click", this, {
                        lat: e.latlng.lat,
                        lon: e.latlng.lng
                    });
                }).on("mousedown", function(e) {
                    y.container.classList.add("grab");
                }).on("mouseup", function(e) {
                    y.container.classList.remove("grab");
                }).on("mousemove", function(t) {
                    if (S) {
                        var r = e.utils.bisectionReversed(S.lat, t.latlng.lat), i = e.utils.bisection(S.lon, t.latlng.lng), l = Math.max(r - 1, 0), o = S.lat[l] - S.lat[r];
                        t.latlng.lat > S.lat[r] + o / 2 && (r = l);
                        var s = Math.max(i - 1, 0), c = S.lon[i] - S.lon[s];
                        t.latlng.lng < S.lon[i] - c / 2 && (i = s);
                        var u = null;
                        if (t.latlng.lat <= S.lat[0] && t.latlng.lat >= S.lat[S.lat.length - 1] && t.latlng.lng >= S.lon[0] && t.latlng.lng <= S.lon[S.lon.length - 1] && (u = S.values[r][i]), 
                        null !== u && -999 !== u && y.showTooltip) {
                            var d = n.Util.formatNum(u, 2);
                            a.setTooltipContent(d + "").openTooltip([ t.latlng.lat, t.latlng.lng ]);
                        } else a.closeTooltip();
                        C.call("mousemove", this, {
                            x: t.containerPoint.x,
                            y: t.containerPoint.y,
                            value: u,
                            lat: t.latlng.lat,
                            lon: t.latlng.lng
                        });
                    }
                }).on("mouseover", function(e) {
                    C.call("mouseenter", this, arguments);
                }).on("mouseout", function(e) {
                    C.call("mouseleave", this, arguments);
                }), i.mapConfig && i.mapConfig.zoom || k.fitWorld(), k.createPane("labels");
                var t = {};
                t.basemapDark = n.tileLayer("https://api.mapbox.com/styles/v1/planetos/ciusdqjc200w12jmlg0dys640/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmV0b3MiLCJhIjoiZjZkNDE4MTE5NWNhOGYyMmZhZmNhMDQwMDg0YWMyNGUifQ.htlwo6U82iekTcpGtDR_dQ", {
                    tileSize: 256,
                    maxZoom: 19
                }), t.basemapLight = n.tileLayer("https://api.mapbox.com/styles/v1/planetos/civ28flwe002c2ino04a6jiqs/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmV0b3MiLCJhIjoiZjZkNDE4MTE5NWNhOGYyMmZhZmNhMDQwMDg0YWMyNGUifQ.htlwo6U82iekTcpGtDR_dQ", {
                    tileSize: 256,
                    maxZoom: 19
                }), t.labelLight = n.tileLayer("http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", {
                    attribution: "©OpenStreetMap, ©CartoDB",
                    pane: "labels"
                }), t[y.basemapName].addTo(k), y.showLabels && t.labelLight.addTo(k), M = r().addTo(k);
                var a = n.featureGroup().bindTooltip("").addTo(k);
                return this;
            }
            function o(e, t) {
                var a = t.bbox, r = [ [ a.latMax, a.lonMin ], [ a.latMin, a.lonMax ] ];
                return n.imageOverlay(e, r).addTo(k), this;
            }
            function s() {
                return y.container.style.display = "block", Y.isVisible = !0, this;
            }
            function c() {
                return y.container.style.display = "none", Y.isVisible = !1, this;
            }
            function u() {
                return k.invalidateSize(), T ? d(T) : k.fitWorld(), this;
            }
            function d(e) {
                var t = n.geoJson(e);
                return k.fitBounds(t.getBounds()), T = e, this;
            }
            function m(e) {
                var t = function(e, t) {
                    t.on({
                        click: function(e) {
                            C.call("featureClicked", this, {
                                id: e.target.feature.properties.id,
                                lat: e.target._latlng ? e.target._latlng.lat : e.latlng.lat,
                                lon: e.target._latlng ? e.target._latlng.lng : e.latlng.lng,
                                layer: e
                            });
                        },
                        mouseover: function(e, t, a) {
                            C.call("featureMousEnter", this, {
                                x: e.containerPoint.x,
                                y: e.containerPoint.y,
                                lat: e.latlng.lat,
                                lon: e.latlng.lng,
                                value: e.target.feature.properties.id
                            });
                        },
                        mouseout: function(e) {
                            C.call("featureMousLeave", this, {
                                x: e.containerPoint.x,
                                y: e.containerPoint.y,
                                lat: e.latlng.lat,
                                lon: e.latlng.lng,
                                value: e.target.feature.properties.id
                            });
                        }
                    });
                };
                return D = n.geoJson(e, {
                    onEachFeature: t,
                    pointToLayer: function(e, t) {
                        return new n.CircleMarker(t, {
                            radius: 4,
                            fillColor: "#05A5DE",
                            color: "#1E1E1E",
                            weight: 1,
                            opacity: .5,
                            fillOpacity: .4
                        });
                    }
                }).addTo(k), y.polygonTooltipFunc && D.bindTooltip(y.polygonTooltipFunc), this;
            }
            function h(e) {
                return f(), A = n.marker(e, {
                    interactive: !0,
                    draggable: !0,
                    opacity: 1
                }).on("click", function(e) {
                    C.call("markerClicked", this, arguments);
                }).addTo(k), this;
            }
            function f() {
                return A && A.remove(), this;
            }
            function g(e) {
                S = e;
                var t = e.uniqueValues.sort(function(e, t) {
                    return e - t;
                }), a = y.colorScale(t);
                return M.setColorScale(a).setData(e), this;
            }
            function v(e) {
                return e ? (k.addControl(k.zoomControl), k.doubleClickZoom.enable(), k.boxZoom.enable(), 
                k.dragging.enable()) : (k.removeControl(k.zoomControl), k.doubleClickZoom.disable(), 
                k.boxZoom.disable(), k.dragging.disable()), this;
            }
            function p() {
                return a.data.getWorldVector(function(e) {
                    m(e);
                }), this;
            }
            var x = n.DomUtil.create("div", "datahub-map"), b = i.parent.appendChild(x), y = {
                container: b,
                colorScale: i.colorScale,
                basemapName: i.basemapName || "basemapDark",
                imagePath: i.imagePath || "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.2/images/",
                showLabels: !(i.showLabels === !1),
                showTooltip: !(i.showTooltip === !1),
                polygonTooltipFunc: i.polygonTooltipFunc
            }, w = {
                maxBounds: [ [ -90, -180 ], [ 90, 180 ] ],
                maxZoom: 13,
                minZoom: 1,
                scrollWheelZoom: !1,
                zoomSnap: 0,
                zoomDelta: .5,
                attributionControl: !1,
                fadeAnimation: !1,
                tileLayer: {
                    noWrap: !0,
                    continuousWorld: !1
                }
            };
            e.utils.merge(w, i.mapConfig);
            var k, M, D, A, S, T, C = t.dispatch("click", "mousemove", "mouseenter", "mouseleave", "featureClicked", "featureMousEnter", "featureMousLeave", "markerClicked"), Y = {
                isVisible: !0
            };
            return {
                init: l,
                show: s,
                hide: c,
                resize: u,
                zoomToPolygonBoundingBox: d,
                addMarker: h,
                removeMarker: f,
                renderPolygon: m,
                renderImage: o,
                renderRaster: g,
                renderVectorMap: p,
                isVisible: Y.isVisible,
                hideZoomControl: v,
                on: e.utils.rebind(C),
                _getMap: function() {
                    return k;
                }
            };
        };
        e.map = {
            rasterMap: l,
            selectorMap: i
        };
    }(a, n.d3, n.leaflet), !function(e, t) {
        var a = function(a) {
            var n = a.parent.querySelector(".widget-container");
            if (!n) {
                var r = '<div class="widget-container"><svg class="datahub-chart"><g class="panel"><g class="stripe-group"></g><g class="area-group"></g><g class="stacked-area-group"></g><g class="reference-bar-group"></g><g class="reference-line-group"></g><g class="bar-group"></g><g class="stacked-bar-group"></g><g class="estimate-bar-group"></g><g class="line-group"></g><g class="dot-group"></g><g class="threshold-line-group"></g><g class="y axis"></g><g class="x axis"></g><g class="active-group"></g><g class="title-container"><text class="y axis-title"></text><text class="x axis-title"></text><text class="chart-title"></text></g><g class="message-group"></g><g class="events"><rect class="event-panel"></rect></g></g></svg></div>';
                n = e.utils.appendHtmlToNode(r, a.parent);
            }
            var i = a.width - a.margin.left - a.margin.right, l = a.height - a.margin.top - a.margin.bottom, o = t.select(n);
            return o.select("svg").attr("width", a.width).attr("height", a.height), o.select(".panel").attr("transform", "translate(" + a.margin.left + "," + a.margin.top + ")"), 
            o.select(".events rect").attr("width", i).attr("height", l).attr("opacity", 0), 
            {
                container: o,
                chartWidth: i,
                chartHeight: l
            };
        }, n = function(e, t, a) {
            return e[t] ? e[t].map(function(e) {
                return e.timestamp = new Date(e.timestamp), e.value = Array.isArray(e.value) && !a ? e.value[0] : e.value, 
                e;
            }) : [];
        }, r = function(e) {
            return e.timestamp ? e.timestamp.map(function(e) {
                return new Date(e);
            }) : [];
        }, i = function(e) {
            var t = e.data || {};
            return {
                dataIsEmpty: !t || !t.timestamp || !t.timestamp.length,
                data: {
                    timestamp: r(t),
                    stackedBarData: n(t, "stackedBarData", !0),
                    stackedAreaData: n(t, "stackedAreaData", !0),
                    lineData: n(t, "lineData", !0),
                    barData: n(t, "barData"),
                    referenceData: n(t, "referenceData"),
                    estimateData: n(t, "estimateData"),
                    thresholdData: n(t, "thresholdData"),
                    areaData: n(t, "areaData")
                }
            };
        }, l = function(e) {
            var a = e.dataIsEmpty ? 0 : e.data.timestamp, n = t.scaleBand().domain(a).range([ 0, e.chartWidth ]).paddingInner(.4).paddingOuter(.2), r = n.copy().paddingInner(.1).paddingOuter(.05), i = n.copy().paddingInner(0).paddingOuter(0), l = n.copy().paddingInner(1).paddingOuter(.5);
            return {
                scaleX: n,
                referenceScaleX: r,
                stripeScaleX: i,
                lineScaleX: l
            };
        }, o = function(e, a) {
            var n = a ? "min" : "max";
            return e ? t[n](e.map(function(e) {
                return e.value;
            })) : null;
        }, s = function(e, a) {
            var n = a ? "min" : "max";
            if (e && e.length) {
                var r = e.map(function(e) {
                    return t.sum(e.value);
                });
                return t[n](r);
            }
            return null;
        }, c = function(e, a) {
            var n = a ? "min" : "max";
            if (e && e.length) {
                var r = e.map(function(e, t) {
                    return e.value;
                });
                return r[0].length && (r = t.merge(r)), t[n](r);
            }
            return null;
        }, u = function(e) {
            var a = [];
            a.push(o(e.data.barData)), a.push(o(e.data.referenceData)), a.push(o(e.data.estimateData)), 
            a.push(o(e.data.thresholdData)), a.push(o(e.data.areaData)), a.push(s(e.data.stackedBarData)), 
            a.push(s(e.data.stackedAreaData)), a.push(c(e.data.lineData));
            var n = [], r = !0;
            n.push(o(e.data.barData, r)), n.push(o(e.data.referenceData, r)), n.push(o(e.data.estimateData, r)), 
            n.push(o(e.data.thresholdData, r)), n.push(o(e.data.areaData, r)), n.push(s(e.data.stackedBarData, r)), 
            n.push(s(e.data.stackedAreaData, r)), n.push(c(e.data.lineData, r));
            var i, l = t.max(a);
            if (e.autoScaleY) {
                i = t.min(n);
                var u = (l - i) / 10;
                i = Math.max(i - u, 0), l += u;
            } else i = Math.min(t.min(n), 0), l = Math.max(l, 0);
            var d = [ i, l ];
            e.domain && (d = e.domain), e.reverseY && (d = [ d[1], d[0] ]);
            var m = t.scaleLinear().domain(d).range([ e.chartHeight, 0 ]);
            return {
                scaleY: m
            };
        }, d = function(t, a, n) {
            if (!n) return null;
            var r = t[a].map(function(e) {
                return e.timestamp && e.timestamp.getTime();
            }).indexOf(n.getTime());
            if (r > -1) {
                var i = e.utils.mergeAll({}, t[a][r]);
                return i.value = [].concat(t[a][r].value), i.id = [].concat(t[a][r].id), i;
            }
            return null;
        }, m = function(t, a, n) {
            if (t[a][0]) {
                var r = e.utils.mergeAll({}, t[a][0]);
                return r.value = [].concat(t[a][0].value), r.id = [].concat(t[a][0].id), r;
            }
            return null;
        }, h = function(e, t) {
            var a = {
                referenceData: d(t, "referenceData", e),
                estimateData: d(t, "estimateData", e),
                barData: d(t, "barData", e),
                stackedBarData: d(t, "stackedBarData", e),
                lineData: d(t, "lineData", e),
                areaData: d(t, "areaData", e),
                stackedAreaData: d(t, "stackedAreaData", e),
                thresholdData: m(t, "thresholdData", e)
            };
            return a;
        }, f = function(e) {
            var a = e.container.select(".events .event-panel").on("mousemove touchstart", function(a) {
                if (!e.dataIsEmpty) {
                    var n = t.mouse(this)[0], r = e.stripeScaleX.bandwidth(), i = e.stripeScaleX.domain(), l = i.length, o = Math.min(~~(n / r), l - 1), s = i[o], c = h(s, e.data);
                    e.events.call("hover", null, {
                        index: o,
                        timestamp: s,
                        data: c,
                        config: e,
                        event: t.event
                    });
                }
            }).on("mouseout", function(t) {
                e.events.call("mouseout", null, {});
            }).on("click", function(a) {
                e.events.call("click", null, {
                    event: t.event
                });
            });
            return {
                eventPanel: a
            };
        }, g = function(e) {
            var t = e.container.select(".bar-group").selectAll("rect.bar").data(e.data.barData);
            return t.enter().append("rect").merge(t).attr("class", function(e) {
                return [ "bar", e.id, e.className ].join(" ");
            }).attr("x", function(t, a) {
                return e.scaleX(t.timestamp) || 0;
            }).attr("y", function(t) {
                return e.autoScaleY ? e.chartHeight - (e.chartHeight - Math.abs(e.scaleY(t.value))) : t.value >= 0 || e.reverseY ? e.scaleY(0) - Math.abs(e.scaleY(t.value) - e.scaleY(0)) : e.scaleY(0);
            }).attr("width", function(t) {
                return e.scaleX.bandwidth();
            }).attr("height", function(t) {
                return e.autoScaleY ? e.chartHeight - Math.abs(e.scaleY(t.value)) : Math.abs(e.scaleY(t.value) - e.scaleY(0));
            }), t.exit().remove(), {};
        }, v = function(e) {
            var t = e.container.select(".estimate-bar-group").selectAll("rect.estimate-bar").data(e.data.estimateData);
            return t.enter().append("rect").merge(t).attr("class", function(e) {
                return [ "estimate-bar", e.id, e.className ].join(" ");
            }).attr("x", function(t, a) {
                return e.scaleX(t.timestamp) || 0;
            }).attr("y", function(t) {
                return e.scaleY(t.value) || 0;
            }).attr("width", function(t) {
                return e.scaleX.bandwidth();
            }).attr("height", function(t) {
                return e.chartHeight - e.scaleY(t.value) || 0;
            }), t.exit().remove(), {};
        }, p = function(e) {
            var t = e.container.select(".reference-bar-group").selectAll("rect.reference-bar").data(e.data.referenceData);
            t.enter().append("rect").merge(t).attr("class", function(e) {
                return [ "reference-bar", e.id, e.className ].join(" ");
            }).attr("x", function(t, a) {
                return e.referenceScaleX(t.timestamp) || 0;
            }).attr("y", function(t) {
                return e.autoScaleY ? e.chartHeight - (e.chartHeight - Math.abs(e.scaleY(t.value))) : t.value >= 0 || e.reverseY ? e.scaleY(0) - Math.abs(e.scaleY(t.value) - e.scaleY(0)) : e.scaleY(0);
            }).attr("width", function(t) {
                return e.referenceScaleX.bandwidth();
            }).attr("height", function(t) {
                return e.autoScaleY ? e.chartHeight - Math.abs(e.scaleY(t.value)) : Math.abs(e.scaleY(t.value) - e.scaleY(0));
            }), t.exit().remove();
            var a = e.container.select(".reference-line-group").selectAll("path.reference-top").data(e.data.referenceData);
            return a.enter().append("path").attr("class", "reference-top").merge(a).attr("d", function(t, a) {
                var n = e.referenceScaleX(t.timestamp) || 0, r = 0;
                r = t.value >= 0 || e.reverseY ? e.scaleY(0) - Math.abs(e.scaleY(t.value) - e.scaleY(0)) : e.scaleY(0) + Math.abs(e.scaleY(t.value) - e.scaleY(0));
                var i = e.referenceScaleX.bandwidth();
                return "M" + [ [ n, r ], [ n + i, r ] ];
            }), a.exit().remove(), {};
        }, x = function(a) {
            if (!a.data.stackedBarData || !a.data.stackedBarData.length) return a.container.select(".stacked-bar-group").selectAll("g.stack").remove(), 
            {};
            var n = a.data.stackedBarData[0].value.map(function(e, t) {
                return "y" + t;
            }), r = [];
            a.data.stackedBarData.forEach(function(t, a) {
                var n = e.utils.mergeAll({}, t);
                t.value && t.value.length && (t.value.forEach(function(e, t) {
                    n["y" + t] = e;
                }), r.push(n));
            });
            var i = a.container.select(".stacked-bar-group").selectAll("g.stack").data(t.stack().keys(n)(r)), l = i.enter().append("g").attr("class", "stack").merge(i).selectAll("rect.stacked-bar").data(function(e, t) {
                return e.forEach(function(t) {
                    t.index = e.index;
                }), e;
            });
            return l.enter().append("rect").attr("class", "stacked-bar").merge(l).attr("class", function(e, t, a) {
                var n = e.data.id ? e.data.id[e.index] : null, r = e.data.className ? e.data.className[e.index] : null;
                return [ "stacked-bar", "layer" + e.index, n, r ].join(" ");
            }).filter(function(e) {
                return !Number.isNaN(e[0]) && !Number.isNaN(e[1]);
            }).attr("x", function(e) {
                return a.scaleX(e.data.timestamp);
            }).attr("y", function(e) {
                return a.scaleY(e[1]);
            }).attr("height", function(e) {
                return a.scaleY(e[0]) - a.scaleY(e[1]);
            }).attr("width", a.scaleX.bandwidth()), l.exit().remove(), i.exit().remove(), {};
        }, b = function(e) {
            if (!e.data.lineData.length) return e.container.select(".line-group").selectAll("path.line").remove(), 
            {};
            var a = t.line().defined(function(e) {
                return null != e.value;
            }).x(function(t) {
                return e.lineScaleX(t.timestamp);
            }).y(function(t) {
                return e.scaleY(t.value);
            }), n = [], r = e.data.lineData[0].value.length;
            if ("undefined" == typeof r) n.push(e.data.lineData); else for (var i = 0; r > i; i++) {
                var l = e.data.lineData.map(function(e) {
                    return {
                        timestamp: e.timestamp,
                        value: e.value[i],
                        id: e.id && e.id[i],
                        className: e.className && e.className[i]
                    };
                });
                n.push(l);
            }
            var o = e.container.select(".line-group").selectAll("path.line").data(n);
            return o.enter().append("path").style("fill", "none").merge(o).attr("class", function(e, t) {
                return [ "line", "layer" + t, e[0].id, e[0].className ].join(" ");
            }).attr("d", a), o.exit().remove(), {};
        }, y = function(e) {
            if (!e.data.lineData.length) return e.container.select(".dot-group").selectAll(".dot-layer").remove(), 
            {};
            for (var t = e.data.lineData, a = [], n = t[0].value.length, r = 0; n > r; r++) {
                var i = [];
                t.forEach(function(e, a) {
                    var n = Math.max(0, a - 1), l = Math.min(t.length - 1, a + 1), o = a, s = t[n].value[r], c = t[l].value[r], u = e.value[r];
                    (null !== u && (null === s || null === c) || o === n && o === l) && i.push({
                        value: u,
                        timestamp: e.timestamp,
                        layer: r
                    });
                }), a.push(i);
            }
            var l = e.container.select(".dot-group").selectAll(".dot-layer").data(a), o = l.enter().append("g").merge(l).attr("class", "dot-layer");
            l.exit().remove();
            var s = o.selectAll(".dot").data(function(e, t) {
                return e;
            });
            return s.enter().append("circle").merge(s).attr("class", function(e, t, a) {
                return [ "dot", "layer" + e.layer ].join(" ");
            }).attr("cx", function(t) {
                return e.lineScaleX(t.timestamp);
            }).attr("cy", function(t) {
                return e.scaleY(t.value);
            }).attr("r", 2), s.exit().remove(), {};
        }, w = function(e) {
            var t = e.container.select(".threshold-line-group").selectAll("line.threshold-line").data(e.data.thresholdData);
            return t.enter().append("line").merge(t).attr("class", function(e) {
                return [ "threshold-line", e.id, e.className ].join(" ");
            }).attr("x1", 0).attr("y1", function(t) {
                return e.scaleY(t.value) || 0;
            }).attr("x2", e.chartWidth).attr("y2", function(t) {
                return e.scaleY(t.value) || 0;
            }).attr("display", function(e) {
                return e ? null : "none";
            }), t.exit().remove(), {};
        }, k = function(e) {
            if (!e.data.areaData || !e.data.areaData.length) return e.container.select(".area-group").selectAll("path.area").remove(), 
            {};
            var a = t.area().defined(function(e) {
                return null != e.value;
            }).x(function(t) {
                return e.lineScaleX(t.timestamp);
            }).y0(e.chartHeight).y1(function(t) {
                return e.scaleY(t.value);
            }), n = e.container.select(".area-group").selectAll("path.area").data([ e.data.areaData ]);
            return n.enter().append("path").attr("class", function(e, t) {
                return [ "area", "layer" + t, e[0].id, e[0].className ].join(" ");
            }).merge(n).attr("d", a), n.exit().remove(), {};
        }, M = function(a) {
            if (!a.data.stackedAreaData || !a.data.stackedAreaData.length) return a.container.select(".stacked-area-group").selectAll("g.stack-area").remove(), 
            {};
            var n = a.data.stackedAreaData[0].value.map(function(e, t) {
                return "y" + t;
            }), r = t.area().defined(function(e) {
                return !Number.isNaN(e[0]) && !Number.isNaN(e[1]);
            }).x(function(e) {
                return a.lineScaleX(e.data.timestamp);
            }).y0(function(e) {
                return a.scaleY(e[0]);
            }).y1(function(e) {
                return a.scaleY(e[1]);
            }), i = [];
            a.data.stackedAreaData.forEach(function(t, a) {
                var n = e.utils.mergeAll({}, t);
                t.value && t.value.length && (t.value.forEach(function(e, t) {
                    n["y" + t] = e;
                }), i.push(n));
            });
            var l = a.container.select(".stacked-area-group").selectAll("g.stack-area").data(t.stack().keys(n)(i)), o = l.enter().append("g").attr("class", "stack-area").merge(l).selectAll("path.stacked-area").data(function(e, t) {
                return e.forEach(function(t) {
                    t.index = e.index;
                }), [ e ];
            });
            return o.enter().append("path").merge(o).attr("class", function(e) {
                var t = e[0].data.id ? e[0].data.id[e.index] : null, a = e[0].data.className ? e[0].data.className[e.index] : null;
                return [ "stacked-area", "layer" + e.index, t, a ].join(" ");
            }).attr("d", r), o.exit().remove(), l.exit().remove(), {};
        }, D = function(e) {
            if (e.showStripes === !1) return e.container.select(".stripe-group").selectAll("rect.stripe").remove(), 
            {};
            var t = e.container.select(".stripe-group").selectAll("rect.stripe").data(e.data.timestamp);
            return t.enter().append("rect").attr("class", "stripe").merge(t).classed("even", function(e, t) {
                return t % 2;
            }).attr("x", function(t, a) {
                return e.stripeScaleX(t) || 0;
            }).attr("y", function(e) {
                return 0;
            }).attr("width", function(t) {
                return e.stripeScaleX.bandwidth();
            }).attr("height", function(t) {
                return e.chartHeight;
            }), t.exit().remove(), {};
        }, A = function(e) {
            var a = e.activeDate && void 0 !== e.activeDate.getTime ? e.activeDate.getTime() : new Date(e.activeDate).getTime(), n = e.data.timestamp.filter(function(e) {
                return e.getTime() === a;
            }), r = e.container.select(".active-group").selectAll("rect.active").data(n);
            return r.enter().append("rect").attr("class", "active").merge(r).each(function(a) {
                if (!e.dataIsEmpty) {
                    var n = h(a, e.data);
                    e.events.call("active", null, {
                        timestamp: a,
                        data: n,
                        config: e,
                        event: t.event
                    });
                }
            }).attr("x", function(t, a) {
                return e.stripeScaleX(t) || 0;
            }).attr("y", function(e) {
                return 0;
            }).attr("width", function(t) {
                return e.stripeScaleX.bandwidth();
            }).attr("height", function(t) {
                return e.chartHeight;
            }), r.exit().remove(), {};
        }, S = e.utils.pipeline(e.common.defaultConfig, i, a, l, u, f, e.common.axisX, e.common.axisY, D, A, k, p, x, M, g, v, b, y, w, e.common.axisComponentY, e.common.labelsRewriterY, e.common.message, e.common.axisComponentX, e.common.axisTitleComponentX, e.common.axisTitleComponentY, e.common.chartTitleComponent), T = function(a) {
            var n, r, i = t.dispatch("hover", "click", "mouseout", "active"), l = ~~(1e4 * Math.random()), o = e.utils.throttle(function() {
                n.width = n.parent.clientWidth, s();
            }, 200);
            t.select(window).on("resize." + l, o);
            var s = function() {
                r = S(n);
            }, c = function(t) {
                var a = t ? JSON.parse(JSON.stringify(t)) : {};
                return n = e.utils.mergeAll({}, n), n.data = a, s(), this;
            }, u = function(t) {
                return n = e.utils.mergeAll(n, t), s(), this;
            }, d = function(t, a) {
                u(e.utils.mergeAll(t, {
                    events: a
                }));
            }, m = function() {
                t.select(window).on("resize." + l, null), n.parent.innerHTML = null;
            };
            return d(a, i), {
                on: e.utils.rebind(i),
                setConfig: u,
                setData: c,
                destroy: m
            };
        };
        e.multiChart = T;
    }(a, n.d3), !function(e, t) {
        var a = function(a) {
            var n = a.parent.querySelector(".datahub-table-chart");
            if (!n) {
                var r = '<div class="datahub-table-chart"><div class="table-container"><div class="header"><div class="row"></div></div><div class="content"></div><div class="footer"><div class="row"></div></div></div><div class="chart-container"><div class="header"><div class="row"></div></div><div class="content"><div class="rows"></div><div class="chart"><svg><g class="panel"><g class="stripes"></g><g class="bars"></g><g class="axis"></g><g class="message-group"></g></g></svg></div></div><div class="footer"><div class="row"></div></div></div></div>';
                n = e.utils.appendHtmlToNode(r, a.parent);
            }
            var i = !(a.elements && a.elements.length), l = {
                top: 0,
                bottom: 24,
                right: 24,
                left: 24
            }, o = a.margin || l, s = a.rowHeight || 48, c = t.select(n), u = c.select(".chart-container"), d = u.node().clientWidth, m = d - o.left - o.right, h = i ? s : a.elements.length * s + o.bottom, f = h - o.bottom;
            return {
                container: c,
                width: d,
                height: h,
                chartWidth: m,
                chartHeight: f,
                rowHeight: s,
                margin: o,
                dataIsEmpty: i
            };
        }, n = function(e) {
            if (e.elements) {
                var t = e.elements.slice(), a = t.sort(e.sortFunc);
                return {
                    elements: a
                };
            }
            return {};
        }, r = function(e) {
            var a = e.domain || [ 0, 0 ];
            if (!e.domain && e.elements) {
                var n = t.merge(e.elements).filter(function(t) {
                    return t.key === e.valueKey || t.key === e.referenceKey;
                }).map(function(e) {
                    return e.value;
                });
                a = n.length ? t.extent(n) : [ 0, 0 ];
            }
            a[0] = Math.min(a[0], 0);
            var r = Math.max(Math.abs(a[0]), Math.abs(a[1]));
            a = [ -r, r ];
            var i = t.scaleLinear().domain(a).range([ 0, e.chartWidth ]);
            return {
                scaleX: i
            };
        }, i = function(e) {
            var a = e.axisXFormat || ".2s", n = t.axisBottom().scale(e.scaleX).tickFormat(t.format(a)), r = e.container.select(".axis").attr("transform", "translate(" + [ 0, e.chartHeight ] + ")").attr("display", e.dataIsEmpty ? "none" : "block").call(n);
            return {
                axisX: r
            };
        }, l = function(e) {
            var t = e.container.select(".header .row").selectAll("div.column").data(e.header || []);
            return t.enter().append("div").merge(t).attr("class", function(e) {
                return "column " + e.key;
            }).html(function(e) {
                if (Array.isArray(e.label)) {
                    var t = e.label.map(function(e, t) {
                        return "<div>" + e + "</div>";
                    }).join("");
                    return '<div class="multiline">' + t + "</div>";
                }
                return e.label;
            }), t.exit().remove(), {};
        }, o = function(e) {
            var t = e.container.select(".table-container .content").selectAll("div.row").data(e.elements || []), a = t.enter().append("div").merge(t).attr("class", "row");
            t.exit().remove();
            var n = a.selectAll("div.column").data(function(e) {
                return e;
            });
            n.enter().append("div").merge(n).attr("class", "column").html(function(t) {
                if ("number" == typeof t.label) {
                    var a = function(e) {
                        return Math.floor(100 * e) / 100;
                    }, n = e.valueFormat || a;
                    return n(t.label);
                }
                if (Array.isArray(t.label)) {
                    var r = t.label.map(function(e, t) {
                        return "<div>" + e + "</div>";
                    }).join("");
                    return '<div class="multiline">' + r + "</div>";
                }
                return null === t.label || "undefined" == typeof t.label ? e.emptyPlaceholder || "" : t.label;
            }), n.exit().remove();
            var r = e.container.select(".chart-container .rows").selectAll("div.row").data(e.elements || []);
            return r.enter().append("div").attr("class", "row").append("div").attr("class", "column"), 
            r.exit().remove(), {};
        }, s = function(e) {
            var t = e.container.select("svg").attr("width", e.width).attr("height", e.height).select(".panel").attr("transform", "translate(" + e.margin.left + " 0)").select(".bars").selectAll("g.bar-group").data(e.elements || []), a = t.enter().append("g").merge(t).attr("class", "bar-group").attr("transform", function(t, a) {
                return "translate(0 " + a * e.rowHeight + ")";
            });
            t.exit().remove();
            var n = a.selectAll("rect.reference-bar").data(function(t, a) {
                var n = t.filter(function(t) {
                    return t.key === e.referenceKey;
                });
                return [ n && n[0] ];
            });
            n.enter().append("rect").merge(n).attr("class", "reference-bar").attr("width", function(t) {
                return Math.abs(e.scaleX(t.value) - e.scaleX(0));
            }).attr("height", function(t) {
                return e.rowHeight / 2;
            }).attr("x", function(t) {
                return t.value < 0 ? e.scaleX(t.value) : e.scaleX(0);
            }).attr("y", function(t) {
                return e.rowHeight / 4;
            }), n.exit().remove();
            var r = 2, i = a.selectAll("rect.reference-line").data(function(t, a) {
                var n = t.filter(function(t) {
                    return t.key === e.referenceKey;
                });
                return [ n && n[0] ];
            });
            i.enter().append("rect").merge(i).attr("class", "reference-line").attr("display", function(e) {
                return e.value || 0 === e.value ? "block" : "none";
            }).attr("width", r).attr("height", function(t) {
                return e.rowHeight / 2;
            }).attr("x", function(t) {
                var a = r;
                return t.value > 0 && (a *= -1), e.scaleX(t.value) + a;
            }).attr("y", function(t) {
                return e.rowHeight / 4;
            }), i.exit().remove();
            var l = a.selectAll("rect.value-bar").data(function(t, a) {
                var n = t.filter(function(t) {
                    return t.key === e.valueKey;
                });
                return [ n && n[0] ];
            });
            return l.enter().append("rect").merge(l).attr("class", "value-bar").attr("width", function(t) {
                return Math.abs(e.scaleX(t.value) - e.scaleX(0));
            }).attr("height", function(t) {
                return e.rowHeight / 4;
            }).attr("x", function(t) {
                return t.value < 0 ? e.scaleX(t.value) : e.scaleX(0);
            }).attr("y", function(t) {
                return 3 * e.rowHeight / 8;
            }), l.exit().remove(), {};
        }, c = function(e) {
            return e.container.on("click", function() {
                e.events.call("click", null, {
                    event: t.event
                });
            }), {};
        }, u = function(e) {
            var t = e.scaleX.ticks(), a = e.container.select(".stripes").selectAll("rect.stripe").data(t);
            return a.enter().append("rect").attr("class", "stripe").merge(a).attr("x", function(a, n) {
                var r = t[Math.max(n - 1, 0)], i = (e.scaleX(a) - e.scaleX(r)) / 2;
                return e.scaleX(a) - i;
            }).attr("y", function(e) {
                return 0;
            }).attr("width", function(a, n) {
                var r = t[Math.max(n - 1, 0)], i = (e.scaleX(a) - e.scaleX(r)) / 2;
                return i = Math.max(i, 0);
            }).attr("height", function(t) {
                return e.chartHeight;
            }), a.exit().remove(), {};
        }, d = function(e) {
            var t = (e.scaleX.ticks(), e.container.select(".stripes").selectAll("line.grid").data([ 0 ]));
            return t.enter().append("line").attr("class", "grid").merge(t).attr("display", e.dataIsEmpty ? "none" : "block").attr("x1", function(t) {
                return e.scaleX(0) + .5;
            }).attr("y1", 0).attr("x2", function(t) {
                return e.scaleX(0) + .5;
            }).attr("y2", e.chartHeight), t.exit().remove(), {};
        }, m = function(e) {
            return e.labelsRewriterX ? (e.container.selectAll(".axis").selectAll("text").html(function(t, a) {
                return e.labelsRewriterX(t, a, e);
            }), {}) : {};
        }, h = e.utils.pipeline(a, n, l, o, r, c, u, d, i, m, s), f = function(a) {
            var n, r, i = t.dispatch("click"), l = ~~(1e4 * Math.random()), o = e.utils.throttle(function() {
                n.width = n.parent.clientWidth, s();
            }, 200);
            t.select(window).on("resize." + l, o);
            var s = function() {
                r = h(n);
            }, c = function(t) {
                var a = t ? JSON.parse(JSON.stringify(t)) : {};
                return n = e.utils.mergeAll({}, n, {
                    data: a
                }), s(), this;
            }, u = function(t) {
                return n = e.utils.mergeAll(n, t), s(), this;
            }, d = function(t, a) {
                u(e.utils.mergeAll(t, {
                    events: a
                }));
            }, m = function() {
                t.select(window).on("resize." + l, null), n.parent.innerHTML = null;
            };
            return d(a, i), {
                on: e.utils.rebind(i),
                setConfig: u,
                setData: c,
                destroy: m
            };
        };
        e.tableChart = f;
    }(a, n.d3), !function(e, t) {
        var a = function(a) {
            var n = a.parent.querySelector(".datahub-vertical-chart");
            if (!n) {
                var r = '<div class="datahub-vertical-chart"><div class="header"></div><div class="chart-container"><div class="chart-wrapper"><svg><g class="panel"><g class="reference-bars"></g><g class="bars"></g><g class="axis"></g></g></svg></div></div><div class="number-container"></div></div>';
                n = e.utils.appendHtmlToNode(r, a.parent);
            }
            var i = !(a.elements && a.elements.length), l = t.select(n), o = l.select(".chart-container"), s = o.node().clientWidth, c = 26, u = i ? 0 : a.elements.length * c;
            return {
                container: l,
                chartWidth: s,
                chartHeight: u,
                rowHeight: c,
                dataIsEmpty: i,
                refernceValue: 100
            };
        }, n = function(e) {
            var a = t.scaleLinear().domain([ 0, 100 ]).range([ 0, e.referenceBarSize ]);
            return {
                scaleX: a
            };
        }, r = function(e) {
            return e.container.select(".header").html(e.title), {};
        }, i = function(e) {
            var t = e.container.select(".number-container").selectAll(".number").data(e.elements || []), a = t.enter().append("div").merge(t).attr("class", function(e, t) {
                return "number number" + t;
            });
            t.exit().remove();
            var n = a.selectAll(".label").data(function(e) {
                return [ e ];
            });
            n.enter().append("div").attr("class", "label").merge(n).html(function(e) {
                return e.label;
            }), n.exit().remove();
            var r = a.selectAll(".value").data(function(e) {
                return [ e ];
            });
            return r.enter().append("div").attr("class", "value").merge(r).html(function(t) {
                return Math.round(t.value) + " " + e.unit;
            }), r.exit().remove(), {};
        }, l = function(e) {
            var t = e.container.select("svg").attr("width", e.chartWidth).attr("height", e.chartHeight).select(".panel"), a = e.rowHeight, n = a - 2, r = n / 2, i = t.select(".bars").selectAll(".bar").data(e.elements || []);
            i.enter().append("rect").merge(i).attr("class", function(e, t) {
                return [ "bar", e.label.toLowerCase(), "bar" + t ].join(" ");
            }).attr("x", function(t) {
                var a = e.scaleX(t.value);
                return 0 > a ? e.chartWidth / 2 - Math.abs(a) : e.chartWidth / 2;
            }).attr("y", function(e, t) {
                return a * t + (a - r) / 2;
            }).attr("width", function(t) {
                return t.value ? Math.abs(e.scaleX(t.value)) : void 0;
            }).attr("height", r), i.exit().remove();
            var l = t.select(".reference-bars").selectAll(".bar").data(e.elements || []);
            l.enter().append("rect").attr("class", "bar").merge(l).attr("x", e.chartWidth / 2).attr("y", function(e, t) {
                return a * t + (a - n) / 2;
            }).attr("width", function(t, a) {
                return e.referenceBarSize;
            }).attr("height", n), l.exit().remove();
            var o = t.select(".reference-bars").selectAll(".line").data(e.elements || []);
            return o.enter().append("line").attr("class", "line").merge(o).attr("x1", e.chartWidth / 2 + e.referenceBarSize).attr("y1", function(e, t) {
                return a * t + (a - n) / 2;
            }).attr("x2", e.chartWidth / 2 + e.referenceBarSize).attr("y2", function(e, t) {
                return a * t + (a - n) / 2 + n;
            }), o.exit().remove(), {};
        }, o = function(e) {
            var t = e.container.select(".axis").selectAll(".vertical").data([ 0 ]);
            return t.enter().append("line").attr("class", "vertical").merge(t).attr("x1", e.chartWidth / 2).attr("y1", 0).attr("x2", e.chartWidth / 2).attr("y2", e.chartHeight), 
            t.exit().remove(), {};
        }, s = e.utils.pipeline(a, r, i, n, o, l), c = function(a) {
            var n, r, i = t.dispatch("barHover"), l = ~~(1e4 * Math.random()), o = e.utils.throttle(function() {
                n.width = n.parent.clientWidth, c();
            }, 200);
            t.select(window).on("resize." + l, o);
            var c = function() {
                r = s(n);
            }, u = function(t) {
                var a = t ? JSON.parse(JSON.stringify(t)) : {};
                return n = e.utils.mergeAll({}, n, {
                    data: a
                }), c(), this;
            }, d = function(t) {
                return n = e.utils.mergeAll(n, t), c(), this;
            }, m = function(t, a) {
                d(e.utils.mergeAll(t, {
                    events: a
                }));
            }, h = function() {
                t.select(window).on("resize." + l, null), n.parent.innerHTML = null;
            };
            return m(a, i), {
                on: e.utils.rebind(i),
                setConfig: d,
                setData: u,
                destroy: h
            };
        };
        e.verticalChart = c;
    }(a, n.d3), !function(e, t) {
        var a = function(a) {
            var n = a.parent.querySelector(".datahub-waterfall-chart");
            if (!n) {
                var r = '<div class="datahub-waterfall-chart"><div class="chart-container"><svg><g class="panel"><g class="bars"></g><g class="connectors"></g></g></svg></div><div class="number-container"></div></div>';
                n = e.utils.appendHtmlToNode(r, a.parent);
            }
            var i = !(a.elements && a.elements.length), l = !(!i && a.elements[0].value), o = t.select(n), s = o.select(".chart-container"), c = a.width || s.node().clientWidth, u = a.height || s.node().clientHeight || 300, d = [ 1, 3 ], m = [ 1 ];
            return {
                container: o,
                chartWidth: c,
                chartHeight: u,
                dataIsEmpty: l,
                infoIsEmpty: i,
                elements: a.elements || [],
                isConnected: d,
                isNegative: m
            };
        }, n = function(e) {
            var a = t.scaleBand().domain(t.range(e.elements.length)).rangeRound([ 0, e.chartWidth ]).paddingInner(.4).paddingOuter(.2);
            return {
                scaleX: a
            };
        }, r = function(e) {
            var a = e.elements.map(function(e) {
                return e.value;
            }), n = t.scaleLinear().domain([ 0, t.max(a) ]).range([ 0, e.chartHeight ]);
            return {
                scaleY: n
            };
        }, i = function(e) {
            var t = e.container.select("svg").attr("width", e.chartWidth).attr("height", e.chartHeight).select(".panel");
            if (e.dataIsEmpty) return t.select(".bars").selectAll(".bar").remove(), {};
            var a = t.select(".bars").selectAll(".bar").data(e.elements);
            return a.enter().append("rect").merge(a).attr("class", function(e, t) {
                return [ "bar", e.label.toLowerCase(), e.key, "bar" + t ].join(" ");
            }).attr("x", function(t, a) {
                return e.scaleX(a);
            }).attr("y", function(t, a) {
                var n = e.isConnected.indexOf(a) > -1;
                if (n) {
                    var r = Math.max(0, a - 1), i = e.elements[r];
                    return e.isNegative.indexOf(a) > -1 ? e.chartHeight - e.scaleY(Math.abs(i.value)) : e.chartHeight - e.scaleY(Math.abs(i.value)) - e.scaleY(Math.abs(t.value));
                }
                return e.chartHeight - e.scaleY(Math.abs(t.value));
            }).attr("width", function(t) {
                return t.value ? e.scaleX.bandwidth() : void 0;
            }).attr("height", function(t) {
                return e.scaleY(Math.abs(t.value));
            }), a.exit().remove(), {};
        }, l = function(e) {
            if (e.dataIsEmpty) return e.container.select(".connectors").selectAll(".connector").remove(), 
            {};
            var t = e.container.select(".connectors").selectAll(".connector").data(e.elements);
            t.enter().append("line").attr("class", "connector").merge(t).attr("x1", function(t, a) {
                return e.scaleX(a);
            }).attr("y1", function(t, a) {
                var n = e.isConnected.indexOf(a) > -1;
                if (n) {
                    var r = Math.max(0, a - 1), i = e.elements[r];
                    return e.isNegative.indexOf(a) > -1 ? e.scaleY(Math.abs(t.value)) : e.chartHeight - e.scaleY(Math.abs(i.value)) - e.scaleY(Math.abs(t.value));
                }
                return e.chartHeight - e.scaleY(Math.abs(t.value));
            }).attr("x2", function(t, a) {
                return e.scaleX(Math.min(a + 1, e.elements.length - 1));
            }).attr("y2", function(t, a) {
                var n = e.isConnected.indexOf(a) > -1;
                if (n) {
                    var r = Math.max(0, a - 1), i = e.elements[r];
                    return e.isNegative.indexOf(a) > -1 ? e.chartHeight - e.scaleY(Math.abs(i.value)) + e.scaleY(Math.abs(t.value)) : e.chartHeight - e.scaleY(Math.abs(i.value)) - e.scaleY(Math.abs(t.value));
                }
                return e.chartHeight - e.scaleY(Math.abs(t.value));
            }), t.exit().remove();
            var t = e.container.select(".connectors").selectAll(".base").data([ 0 ]);
            return t.enter().append("line").attr("class", "base").merge(t).attr("x1", e.scaleX(0)).attr("y1", e.chartHeight).attr("x2", e.scaleX(Math.max(e.elements.length - 1, 0)) + e.scaleX.bandwidth() || 0).attr("y2", e.chartHeight), 
            t.exit().remove(), {};
        }, o = function(e) {
            var t = e.container.select(".number-container").selectAll(".number").data(e.elements), a = t.enter().append("div").merge(t).attr("class", function(e, t) {
                return "number number" + t;
            });
            t.exit().remove();
            var n = a.selectAll(".label").data(function(e) {
                return [ e ];
            });
            n.enter().append("div").attr("class", "label").merge(n).html(function(e) {
                return e.label;
            }), n.exit().remove();
            var r = a.selectAll(".value").data(function(e) {
                return [ e ];
            });
            return r.enter().append("div").attr("class", "value").merge(r).html(function(e) {
                return "undefined" == typeof e.value ? '<div class="error">(Data Unavailable)</div>' : Math.round(e.value);
            }), r.exit().remove(), {};
        }, s = e.utils.pipeline(a, n, r, i, l, o), c = function(a) {
            var n, r, i = t.dispatch("barHover"), l = ~~(1e4 * Math.random()), o = e.utils.throttle(function() {
                n.width = n.parent.clientWidth, c();
            }, 200);
            t.select(window).on("resize." + l, o);
            var c = function() {
                r = s(n);
            }, u = function(t) {
                var a = t ? JSON.parse(JSON.stringify(t)) : {};
                return n = e.utils.mergeAll({}, n, {
                    data: a
                }), c(), this;
            }, d = function(t) {
                return n = e.utils.mergeAll(n, t), c(), this;
            }, m = function(t, a) {
                d(e.utils.mergeAll(t, {
                    events: a
                }));
            }, h = function() {
                t.select(window).on("resize." + l, null), n.parent.innerHTML = null;
            };
            return m(a, i), {
                on: e.utils.rebind(i),
                setConfig: d,
                setData: u,
                destroy: h
            };
        };
        e.waterfallChart = c;
    }(a, n.d3);
    var a = e = "object" == typeof e ? e : {}, n = "object" == typeof t ? t : window;
    "object" == typeof module && module.exports ? n.d3 = require("d3") : n.d3 = n.d3, 
    "object" == typeof module && module.exports && (module.exports = e), t.datahub = e;
}({}, function() {
    return this;
}());