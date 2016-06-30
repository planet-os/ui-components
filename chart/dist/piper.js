var piper = {
    version: "0.1.0"
};

piper.utils = {
    pipeline: function() {
        var fns = arguments;
        var that = this;
        return function(config) {
            for (var i = 0; i < fns.length; i++) {
                var cache = fns[i].call(this, config);
                config = that.mergeAll(config, cache);
            }
            return config;
        };
    },
    override: function(_objA, _objB) {
        for (var x in _objB) {
            if (x in _objA) {
                _objA[x] = _objB[x];
            }
        }
    },
    merge: function(obj1, obj2) {
        for (var p in obj2) {
            if (obj2[p] && obj2[p].constructor == Object) {
                if (obj1[p]) {
                    this.merge(obj1[p], obj2[p]);
                    continue;
                }
            }
            obj1[p] = obj2[p];
        }
    },
    mergeAll: function() {
        var newObj = {};
        var objs = arguments;
        for (var i = 0; i < objs.length; i++) {
            this.merge(newObj, objs[i]);
        }
        return newObj;
    },
    reactiveProperty: function(value) {
        var listeners;
        function property(newValue) {
            if (arguments.length === 1) {
                value = newValue;
                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i](value);
                    }
                }
                return this;
            }
            return value;
        }
        property.on = function(listener) {
            if (!listeners) {
                listeners = [];
            }
            listeners.push(listener);
            if (typeof value !== "undefined" && value !== null) {
                listener(value);
            }
            return listener;
        };
        property.clear = function(listenerToRemove) {
            listeners = [];
            return this;
        };
        property.off = function(listenerToRemove) {
            if (listeners) {
                listeners = listeners.filter(function(listener) {
                    return listener !== listenerToRemove;
                });
            }
        };
        return property;
    }
};

piper.barChartAutoConfig = function(_config) {
    return {
        axisYPadding: 20
    };
};

piper.data = function(_config) {
    var config = {
        data: null
    };
    piper.utils.override(config, _config);
    var dataConverted = config.data.map(function(d, i) {
        return {
            x: i,
            y: d
        };
    });
    return {
        dataConverted: dataConverted
    };
};

piper.dataTime = function(_config) {
    var config = {
        data: null
    };
    piper.utils.override(config, _config);
    var dataConverted = config.data.map(function(d, i) {
        return {
            x: d.timestamp,
            y: d.value
        };
    });
    return {
        dataConverted: dataConverted
    };
};

piper.dataTimeFromSeparateArrays = function(_config) {
    var config = {
        data: null
    };
    piper.utils.override(config, _config);
    var dataConverted = config.data.timestamps.map(function(d, i) {
        return {
            x: d.getTime(),
            y: config.data.values[i]
        };
    });
    var allNulls = !dataConverted.filter(function(d) {
        return d.y != null;
    }).length;
    return {
        dataConverted: dataConverted,
        dataIsAllNulls: allNulls
    };
};

piper.dataGrouped = function(_config) {
    var config = {
        data: null
    };
    piper.utils.override(config, _config);
    var dataConverted = config.data.map(function(d, i) {
        return {
            x: i,
            groupName: d.key,
            y: d.values.map(function(dB, iB) {
                return dB.value;
            })
        };
    });
    var dataFlat = d3.merge(dataConverted.map(function(d, i) {
        return d.y;
    }));
    return {
        dataConverted: dataConverted,
        dataFlat: dataFlat
    };
};

piper.scaleX = function(_config) {
    var config = {
        dataConverted: null,
        margin: null,
        width: null,
        scaleType: null
    };
    piper.utils.override(config, _config);
    var chartWidth = config.width - config.margin.left - config.margin.right;
    var dataX = config.dataConverted.map(function(d) {
        return d.x;
    });
    var scaleX = d3.scale.linear().domain(d3.extent(dataX)).range([ 0, chartWidth ]);
    return {
        scaleX: scaleX,
        chartWidth: chartWidth
    };
};

piper.scaleXTime = function(_config) {
    var config = {
        dataConverted: null,
        margin: null,
        width: null,
        scaleType: null
    };
    piper.utils.override(config, _config);
    var chartWidth = config.width - config.margin.left - config.margin.right;
    var dataX = config.dataConverted.map(function(d) {
        return d.x;
    });
    var scaleX = d3.time.scale().domain(d3.extent(dataX)).range([ 0, chartWidth ]);
    return {
        scaleX: scaleX,
        chartWidth: chartWidth
    };
};

piper.scaleY = function(_config) {
    var config = {
        dataConverted: null,
        margin: null,
        height: null
    };
    piper.utils.override(config, _config);
    var chartHeight = config.height - config.margin.top - config.margin.bottom;
    var dataY = config.dataConverted.map(function(d) {
        return d.y;
    });
    var scaleY = d3.scale.linear().domain(d3.extent(dataY)).range([ chartHeight, 0 ]);
    return {
        scaleY: scaleY,
        chartHeight: chartHeight
    };
};

piper.scaleYGrouped = function(_config) {
    var config = {
        dataConverted: null,
        margin: null,
        height: null
    };
    piper.utils.override(config, _config);
    var chartHeight = config.height - config.margin.top - config.margin.bottom;
    var dataY = config.dataConverted.map(function(d) {
        return d.y;
    });
    var scaleY = d3.scale.linear().domain(d3.extent(d3.merge(dataY))).range([ chartHeight, 0 ]);
    return {
        scaleY: scaleY,
        chartHeight: chartHeight
    };
};

piper.scaleYFrom0 = function(_config) {
    var config = {
        dataConverted: null,
        margin: null,
        height: null
    };
    piper.utils.override(config, _config);
    var chartHeight = config.height - config.margin.top - config.margin.bottom;
    var dataY = config.dataConverted.map(function(d) {
        return d.y;
    });
    var scaleY = d3.scale.linear().domain([ 0, d3.max(dataY) ]).range([ chartHeight, 0 ]);
    return {
        scaleY: scaleY,
        chartHeight: chartHeight
    };
};

piper.scaleYFrom0Padded = function(_config) {
    var config = {
        dataConverted: null,
        margin: null,
        height: null
    };
    piper.utils.override(config, _config);
    var chartHeight = config.height - config.margin.top - config.margin.bottom;
    var dataY = config.dataConverted.map(function(d) {
        return d.y;
    });
    var valueMax = d3.max(dataY);
    var topPadding = 1 - (valueMax - d3.min(dataY)) / valueMax;
    var valuePadded = valueMax + valueMax * topPadding;
    var scaleY = d3.scale.linear().domain([ 0, valuePadded ]).range([ chartHeight, 0 ]);
    return {
        scaleY: scaleY,
        chartHeight: chartHeight
    };
};

piper.scaleYExtent = function(_config) {
    var config = {
        extentY: null,
        scaleY: null
    };
    piper.utils.override(config, _config);
    config.scaleY.domain(config.extentY);
    return {};
};

piper.axisX = function(_config) {
    var config = {
        scaleX: null,
        axisXFormat: "%H:%M",
        axisXTimeResolution: "minutes",
        axisXTimeSteps: 2
    };
    piper.utils.override(config, _config);
    var axisX = d3.svg.axis().scale(config.scaleX).orient("bottom");
    return {
        axisX: axisX
    };
};

piper.axisY = function(_config) {
    var config = {
        scaleY: null
    };
    piper.utils.override(config, _config);
    var height = config.scaleY.range()[0];
    var axisY = d3.svg.axis().scale(config.scaleY).orient("left").ticks(Math.max(~~(height / 30), 2), ".s3").tickPadding(10);
    return {
        axisY: axisY
    };
};

piper.panelComponent = function(_config) {
    var config = {
        container: null,
        width: null,
        height: null,
        margin: null
    };
    piper.utils.override(config, _config);
    piper.events = {
        mousemove: piper.utils.reactiveProperty(),
        mouseenter: piper.utils.reactiveProperty(),
        mouseout: piper.utils.reactiveProperty()
    };
    var root = d3.select(config.container).selectAll("svg").data([ 0 ]);
    root.enter().append("svg").attr({
        "class": "piper-chart"
    }).append("g").attr({
        "class": "panel"
    });
    root.attr({
        width: config.width,
        height: config.height
    });
    root.exit().remove();
    var panel = root.select("g.panel").attr({
        transform: "translate(" + config.margin.left + "," + config.margin.top + ")"
    });
    return {
        root: root,
        panel: panel
    };
};

piper.axisComponentX = function(_config) {
    var config = {
        axisX: null,
        chartHeight: null,
        panel: null
    };
    piper.utils.override(config, _config);
    var axisX = config.panel.selectAll("g.axis.x").data([ 0 ]);
    axisX.enter().append("g").attr({
        "class": "x axis",
        transform: "translate(" + [ 0, config.chartHeight ] + ")"
    });
    axisX.transition().attr({
        transform: "translate(" + [ 0, config.chartHeight ] + ")"
    }).call(config.axisX);
    axisX.exit().remove();
    return {};
};

piper.singleAxisComponentX = function(_config) {
    var config = {
        axisX: null,
        panel: null
    };
    piper.utils.override(config, _config);
    var axisX = config.panel.selectAll("g.axis.x.single").data([ 0 ]);
    axisX.enter().append("g").attr({
        "class": "x axis single"
    });
    axisX.transition().call(config.axisX);
    axisX.exit().remove();
    return {};
};

piper.axisComponentY = function(_config) {
    var config = {
        axisY: null,
        panel: null,
        axisYPadding: null
    };
    piper.utils.override(config, _config);
    var padding = config.axisYPadding || 0;
    var axisY = config.panel.selectAll("g.axis.y").data([ 0 ]);
    axisY.enter().append("g").attr({
        "class": "y axis",
        transform: "translate(" + [ -padding / 2, 0 ] + ")"
    });
    axisY.transition().call(config.axisY);
    axisY.exit().remove();
    return {};
};

piper.axisTitleComponentX = function(_config) {
    var config = {
        panel: null,
        axisTitleX: null,
        chartHeight: null,
        chartWidth: null
    };
    piper.utils.override(config, _config);
    var axisTitleX = config.panel.selectAll("text.axis-title.x").data([ 0 ]);
    axisTitleX.enter().append("text").attr({
        "class": "x axis-title"
    });
    axisTitleX.text(config.axisTitleX || "").attr({
        x: config.chartWidth,
        y: config.chartHeight
    });
    axisTitleX.exit().remove();
    return {};
};

piper.axisTitleComponentY = function(_config) {
    var config = {
        panel: null,
        axisTitleY: null
    };
    piper.utils.override(config, _config);
    var axisTitleY = config.panel.selectAll("text.axis-title.y").data([ 0 ]);
    axisTitleY.enter().append("text").attr({
        "class": "y axis-title"
    });
    axisTitleY.text(config.axisTitleY || "").attr({
        x: -40,
        y: -10
    });
    axisTitleY.exit().remove();
    return {};
};

piper.chartTitleComponent = function(_config) {
    var config = {
        panel: null,
        chartTitle: null,
        chartWidth: null
    };
    piper.utils.override(config, _config);
    var axisTitleX = config.panel.selectAll("text.chart-title").data([ 0 ]);
    axisTitleX.enter().append("text").attr({
        "class": "chart-title"
    });
    axisTitleX.text(config.chartTitle || "").attr({
        x: function(d) {
            return (config.chartWidth - config.chartTitle.length * 5) / 2;
        },
        y: -5
    });
    axisTitleX.exit().remove();
    return {};
};

piper.tooltipHTMLWidget = function(tooltipNode) {
    var root = d3.select(tooltipNode).style({
        position: "absolute",
        "pointer-events": "none",
        display: "none"
    });
    var setText = function(html) {
        root.html(html);
        return this;
    };
    var position = function(pos) {
        root.style({
            left: pos[0] + "px",
            top: pos[1] + "px"
        });
        return this;
    };
    var show = function() {
        root.style({
            display: "block"
        });
        return this;
    };
    var hide = function() {
        root.style({
            display: "none"
        });
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

piper.thresholdLine = function(_config) {
    var config = {
        panel: null,
        scaleY: null,
        margin: null,
        chartWidth: null,
        thresholdY: null
    };
    piper.utils.override(config, _config);
    if (typeof config.thresholdY !== "number") {
        return {};
    }
    var scaledThresholdY = config.scaleY(config.thresholdY);
    var path = "M" + [ [ 0, scaledThresholdY ], [ config.chartWidth + 6, scaledThresholdY ] ].join("L");
    var shapes = config.panel.selectAll("path.threshold").data([ 0 ]);
    shapes.enter().append("path").attr({
        "class": "threshold shape"
    }).style({
        fill: "none"
    });
    shapes.attr({
        d: path
    });
    shapes.exit().remove();
    return {};
};

piper.thresholdLineLabel = function(_config) {
    var config = {
        panel: null,
        scaleY: null,
        margin: null,
        chartWidth: null,
        thresholdY: null,
        thresholdYLabel: null
    };
    piper.utils.override(config, _config);
    if (!config.thresholdYLabel) {
        return {};
    }
    var scaledThresholdY = config.scaleY(config.thresholdY);
    var path = "M" + [ [ 0, scaledThresholdY ], [ config.chartWidth + 6, scaledThresholdY ] ].join("L");
    var text = config.panel.selectAll("text.threshold-label").data([ 0 ]);
    text.enter().append("text").attr({
        "class": "threshold-label",
        x: config.chartWidth + 8,
        y: scaledThresholdY + 2
    });
    text.text(config.thresholdYLabel);
    text.exit().remove();
    return {};
};

piper.verticalLine = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        chartHeight: null,
        margin: null,
        verticalLineX: null,
        verticalLineValue: null
    };
    piper.utils.override(config, _config);
    var scaledverticalLineX = config.scaleX(config.verticalLineX);
    var path = "M" + [ [ scaledverticalLineX, 0 ], [ scaledverticalLineX, config.chartHeight ] ].join("L");
    var shapes = config.panel.selectAll("path.vertical-line").data([ 0 ]);
    shapes.enter().append("path").attr({
        "class": "vertical-line shape"
    });
    shapes.attr({
        d: path
    });
    shapes.exit().remove();
    var label = config.panel.selectAll("text.vertical-line-label").data([ 0 ]);
    label.enter().append("text").attr({
        "class": "vertical-line-label"
    });
    label.attr({
        x: scaledverticalLineX + 2,
        y: config.chartHeight + config.margin.top + config.margin.bottom / 4
    }).text(config.verticalLineValue);
    shapes.exit().remove();
    return {};
};

piper.tooltipComponent = function(_config) {
    var config = {
        container: null,
        panel: null,
        dataConverted: null,
        dataIsAllNulls: null,
        scaleX: null,
        scaleY: null,
        events: null,
        chartWidth: null,
        chartHeight: null
    };
    piper.utils.override(config, _config);
    piper.utils.override(config, piper.eventsBinder(config));
    var tooltipContainer = config.panel.selectAll("g.hover-tooltip").data([ 0 ]);
    tooltipContainer.enter().append("g").classed("hover-tooltip", true).attr({
        r: 4
    }).style({
        "pointer-events": "none",
        display: "none"
    }).append("text");
    tooltipContainer.exit().remove();
    config.events.mousemove.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        tooltipContainer.attr({
            transform: "translate(" + d.shapePosition + ")"
        }).select("text").text(d.data.y);
    });
    config.events.mouseenter.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        tooltipContainer.style({
            display: "block"
        });
    });
    config.events.mouseout.on(function(d) {
        tooltipContainer.style({
            display: "none"
        });
    });
    return {};
};

piper.hoverCircleComponent = function(_config) {
    var config = {
        container: null,
        panel: null,
        dataConverted: null,
        dataIsAllNulls: null,
        scaleX: null,
        scaleY: null,
        events: null,
        chartWidth: null,
        chartHeight: null
    };
    piper.utils.override(config, _config);
    piper.utils.override(config, piper.eventsBinder(config));
    var circleContainer = config.panel.selectAll("circle.hover-circle").data([ 0 ]);
    circleContainer.enter().append("circle").classed("hover-circle", true).attr({
        r: 3
    }).style({
        "pointer-events": "none",
        display: "none"
    });
    circleContainer.exit().remove();
    config.events.mousemove.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        circleContainer.attr({
            transform: "translate(" + d.shapePosition + ")"
        });
    });
    config.events.mouseenter.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        circleContainer.style({
            display: "block"
        });
    });
    config.events.mouseout.on(function(d) {
        circleContainer.style({
            display: "none"
        });
    });
    return {};
};

piper.tooltipLineComponent = function(_config) {
    var config = {
        container: null,
        panel: null,
        dataConverted: null,
        dataIsAllNulls: null,
        scaleX: null,
        scaleY: null,
        events: null,
        chartWidth: null,
        chartHeight: null
    };
    piper.utils.override(config, _config);
    piper.utils.override(config, piper.eventsBinder(config));
    var lineGroup = config.panel.selectAll("g.line-container").data([ 0 ]);
    lineGroup.enter().append("g").attr({
        "class": "line-container",
        "pointer-events": "none"
    }).style({
        visibility: "hidden"
    }).append("line").attr({
        "class": "tooltip-line"
    });
    lineGroup.exit().remove();
    var tooltipLine = lineGroup.select(".tooltip-line");
    config.events.mouseenter.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        tooltipLine.style({
            visibility: "visible"
        });
    });
    config.events.mouseout.on(function(d) {
        tooltipLine.style({
            visibility: "hidden"
        });
    });
    config.events.mousemove.on(function(d) {
        if (config.dataIsAllNulls) {
            return;
        }
        var x = d.shapePosition[0];
        var y = d.shapePosition[1];
        tooltipLine.attr({
            x1: 0,
            y1: y,
            x2: x,
            y2: y
        });
    });
    return {};
};

piper.shapePanel = function(_config) {
    var config = {
        panel: null
    };
    piper.utils.override(config, _config);
    var shapePanel = config.panel.selectAll("g.shapes").data([ 0 ]);
    shapePanel.enter().append("g").attr({
        "class": "shapes"
    });
    shapePanel.exit().remove();
    return {
        shapePanel: shapePanel
    };
};

piper.areaShapes = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);
    var area = d3.svg.area().defined(function(d) {
        return d.y != null;
    }).x(function(d) {
        return config.scaleX(d.x);
    }).y(function(d) {
        return config.scaleY(d.y);
    }).y0(config.scaleY.range()[0]);
    var shapes = config.shapePanel.selectAll("path.line").data([ config.dataConverted ]);
    shapes.enter().append("path").attr({
        "class": "line shape"
    });
    shapes.attr({
        d: area
    });
    shapes.exit().remove();
    return {};
};

piper.message = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        dataIsAllNulls: null,
        scaleX: null,
        scaleY: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);
    var text = config.shapePanel.selectAll("text").data(config.dataIsAllNulls ? [ 0 ] : []);
    text.enter().append("text");
    text.attr({
        x: (config.scaleX.range()[1] - config.scaleX.range()[0]) / 2,
        y: (config.scaleY.range()[0] - config.scaleY.range()[1]) / 2
    }).text("Values are all null").attr({
        dx: function(d) {
            return -this.getBBox().width / 2;
        }
    });
    text.exit().remove();
    return {};
};

piper.lineShapes = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);
    var line = d3.svg.line().defined(function(d) {
        return d.y != null;
    }).x(function(d) {
        return config.scaleX(d.x);
    }).y(function(d) {
        return config.scaleY(d.y);
    });
    var shapes = config.shapePanel.selectAll("path.line").data([ config.dataConverted ]);
    shapes.enter().append("path").attr({
        "class": "line shape"
    }).style({
        fill: "none"
    });
    shapes.attr({
        d: line
    });
    shapes.exit().remove();
    return {};
};

piper.barShapes = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        chartHeight: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);
    var scaleXRange = config.scaleX.range();
    var width = scaleXRange[1] - scaleXRange[0];
    var barWidth = width / (config.dataConverted.length - 1) / 2;
    var shapes = config.shapePanel.selectAll("rect.bar").data(config.dataConverted);
    shapes.enter().append("rect").attr({
        "class": "bar shape"
    });
    shapes.transition().attr({
        x: function(d) {
            return config.scaleX(d.x) - barWidth / 2;
        },
        y: function(d) {
            var barY = config.scaleY(d.y);
            d.barY = d.y > 0 && barY === config.chartHeight ? config.chartHeight - 1 : barY;
            return d.barY;
        },
        width: function(d) {
            return barWidth;
        },
        height: function(d) {
            return config.chartHeight - d.barY;
        }
    });
    shapes.exit().remove();
    return {};
};

piper.barShapesGrouped = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        dataFlat: null,
        scaleX: null,
        scaleY: null,
        chartHeight: null,
        chartWidth: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);
    var barWidth = config.chartWidth / (config.dataFlat.length - 1) / 2;
    var groupWidth = config.chartWidth / (config.dataConverted.length - 1);
    var groups = config.shapePanel.selectAll("g.shape-group").data(config.dataConverted);
    groups.enter().append("g").attr({
        "class": "shape-group"
    });
    groups.attr({
        transform: function(d, i) {
            return "translate(" + (groupWidth * i - groupWidth / 4) + " 0)";
        }
    });
    groups.exit().remove();
    var shapes = groups.selectAll("rect.bar").data(function(d) {
        return d.y;
    });
    shapes.enter().append("rect").attr({
        "class": "bar shape"
    });
    shapes.transition().attr({
        x: function(d, i) {
            return barWidth * i;
        },
        y: function(d) {
            var barY = config.scaleY(d);
            barY = d && d > 0 && barY === config.chartHeight ? config.chartHeight - 1 : barY;
            return barY;
        },
        width: function(d) {
            return barWidth;
        },
        height: function(d) {
            var barY = config.scaleY(d);
            barY = d && d > 0 && barY === config.chartHeight ? config.chartHeight - 1 : barY;
            return config.chartHeight - barY;
        }
    });
    shapes.exit().remove();
    return {};
};

piper.endCircle = function(_config) {
    var config = {
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        width: null,
        shapePanel: null
    };
    piper.utils.override(config, _config);
    var newConfig = piper.shapePanel(config);
    piper.utils.override(config, newConfig);
    var lastDataY = config.dataConverted[config.dataConverted.length - 1];
    var shapes = config.shapePanel.selectAll("circle.end-circle").data([ lastDataY ]);
    shapes.enter().append("circle").attr({
        "class": "end-circle shape"
    });
    shapes.attr({
        cx: function(d) {
            return config.scaleX(d.x);
        },
        cy: function(d) {
            return config.scaleY(d.y);
        },
        r: 2
    });
    shapes.exit().remove();
    return {};
};

piper.events = {};

piper.eventsBinder = function(_config) {
    var config = {
        container: null,
        panel: null,
        dataConverted: null,
        scaleX: null,
        scaleY: null,
        chartWidth: null,
        chartHeight: null
    };
    piper.utils.override(config, _config);
    var dataConvertedX = config.dataConverted.map(function(d) {
        return d.x;
    });
    var deltaX = config.scaleX(dataConvertedX[1]) - config.scaleX(dataConvertedX[0]);
    var eventPanelContainer = config.panel.selectAll("g.event-panel-container").data([ 0 ]);
    this.dataConverted = config.dataConverted;
    var that = this;
    eventPanelContainer.enter().append("g").attr({
        "class": "event-panel-container"
    }).append("rect").attr({
        "class": "event-panel"
    }).style({
        visibility: "hidden",
        "pointer-events": "all"
    });
    eventPanelContainer.select("rect").attr({
        width: config.chartWidth,
        height: config.chartHeight
    }).on("mouseenter", function(d) {
        piper.events.mouseenter({
            mouse: d3.mouse(this)
        });
    }).on("mouseout", function(d) {
        piper.events.mouseout({
            mouse: d3.mouse(this)
        });
    }).on("mousemove", function(d, i) {
        var mouse = d3.mouse(this);
        var mouseFromContainer = d3.mouse(config.container);
        var panelBBox = this.getBoundingClientRect();
        var containerBBox = config.container.getBoundingClientRect();
        var absoluteOffsetLeft = containerBBox.left;
        var absoluteOffsetTop = containerBBox.top;
        var dateAtCursor = config.scaleX.invert(mouse[0] - deltaX / 2);
        var dataPointIndexAtCursor = d3.bisectLeft(dataConvertedX, dateAtCursor.getTime());
        var dataPointAtCursor = config.dataConverted[dataPointIndexAtCursor];
        if (dataPointAtCursor) {
            var xValue = dataPointAtCursor.x;
            var value = dataPointAtCursor.y;
            var x = config.scaleX(xValue);
            var y = config.scaleY(value);
        }
        piper.events.mousemove({
            data: dataPointAtCursor,
            mouse: mouse,
            mouseFromContainer: [ mouseFromContainer[0] + absoluteOffsetLeft + window.pageXOffset, mouseFromContainer[1] + absoluteOffsetTop + window.pageYOffset ],
            shapePosition: [ x, y ],
            shapePositionFromContainer: [ x + panelBBox.left - containerBBox.left, y + panelBBox.top - containerBBox.top ]
        });
    });
    eventPanelContainer.exit().remove();
    return {
        events: piper.events
    };
};

piper.axisXFormatterTime = function(_config) {
    var config = {
        panel: null,
        dataConverted: null
    };
    piper.utils.override(config, _config);
    config.panel.select("g.axis.x").selectAll(".tick text").text(function(d) {
        return d3.time.format("%a")(d);
    });
    return {};
};

piper.axisXFormatterTimeHour = function(_config) {
    var config = {
        panel: null
    };
    piper.utils.override(config, _config);
    config.panel.select("g.axis.x").selectAll(".tick text").text(function(d) {
        return d3.time.format("%x")(d);
    });
    return {};
};

piper.axisXFormatterRotate30 = function(_config) {
    var config = {
        panel: null
    };
    piper.utils.override(config, _config);
    config.panel.select("g.axis.x").selectAll(".tick text").style({
        transform: "rotate(30deg)",
        "text-anchor": "start"
    });
    return {};
};

piper.axisYFormatSI = function(_config) {
    var config = {
        axisY: null
    };
    piper.utils.override(config, _config);
    config.axisY.tickFormat(d3.format(".2s"));
    return {};
};

piper.timeseriesLineChart = piper.utils.pipeline(piper.dataTimeFromSeparateArrays, piper.scaleXTime, piper.scaleY, piper.axisX, piper.axisY, piper.panelComponent, piper.lineShapes, piper.message, piper.axisComponentX, piper.axisComponentY, piper.axisTitleComponentY, piper.tooltipComponent, piper.hoverCircleComponent, piper.tooltipLineComponent);

if (typeof module === "object" && module.exports) {
    var d3 = require("d3");
    module.exports = piper;
}