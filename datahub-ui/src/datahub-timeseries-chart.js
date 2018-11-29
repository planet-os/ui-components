!(function (dh, d3) {
  var template = function (config) {
    var containerNode = config.parent.querySelector(
      ".datahub-timeseries-chart"
    );
    if (!containerNode) {
      var template =
        '<div class="datahub-timeseries-chart">' +
        '<div class="number-group"></div>' +
        '<div class="chart-group">' +
        "<svg>" +
        '<g class="panel">' +
        '<g class="grid x"></g>' +
        '<g class="shapes"></g>' +
        '<g class="axis x"></g>' +
        '<g class="axis y"></g>' +
        '<g class="axis-title x"><text></text></g>' +
        '<g class="axis-title y"><text></text></g>' +
        '<g class="reference"></g>' +
        "</g>" +
        '<g class="tooltip"><line></line></g>' +
        '<g class="message-group"></g>' +
        '<g class="events"><rect class="event-panel"></rect></g>' +
        "</svg>" +
        "</div>" +
        "</div>";

      containerNode = dh.utils.appendHtmlToNode(template, config.parent);
    }

    var container = d3.select(containerNode);
    var width = config.width || config.parent.clientWidth;
    var height = config.height || config.parent.clientHeight;

    var chartWidth = width - config.margin.left - config.margin.right;
    var chartHeight = height - config.margin.top - config.margin.bottom;

    container
      .select("svg")
      .attr("width", width)
      .attr("height", height);

    container
      .select(".panel")
      .attr(
        "transform",
        "translate(" + config.margin.left + "," + config.margin.top + ")"
      );

    container
      .select(".events rect")
      .attr("width", width)
      .attr("height", height)
      .attr("opacity", 0);

    return {
      container: container,
      width: width,
      height: height,
      chartWidth: chartWidth,
      chartHeight: chartHeight
    };
  };

  var defaultConfig = function (config) {
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
  var normalizeTime = function (d) {
    d = typeof d === "object" ? d.toString() : d;
    var i = d.indexOf("+");
    if (i === -1) return d;
    var offset = d.slice(i);
    return d.slice(0, i) + offset.slice(0, 3) + ":" + offset.slice(3);
  };
  var data = function (config) {
    var dataConverted = config.data || [];

    var values = [];
    var timestamps = [];
    dataConverted.forEach(function (d) {
      d.data.forEach(function (dB, iB, arr) {
        arr[iB].timestamp = new Date(normalizeTime(dB.timestamp));
        values.push(dB.value);
        timestamps.push(arr[iB].timestamp);
      });
    });

    var dataIsAllNulls =
      !!values.length &&
      !values.filter(function (d) {
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

  var scaleX = function (config) {
    if (config.dataIsEmpty) {
      return {};
    }

    var scaleX = d3
      .scaleTime()
      .domain(d3.extent(config.dataTimestamps))
      .range([0, config.chartWidth]);

    return {
      scaleX: scaleX
    };
  };

  var scaleY = function (config) {
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

    var scaleY = d3
      .scaleLinear()
      .domain([min, max])
      .range([config.chartHeight, 0]);

    return {
      scaleY: scaleY
    };
  };

  var axisX = function (config) {
    if (config.dataIsEmpty) {
      return {};
    }
    var axisXFormat
    if (config.axisXFormat instanceof Function) {
      axisXFormat = config.axisXFormat;
    } else {
      axisXFormat = d3.utcFormat(config.axisXFormat || "%H:%M")
    }

    var axisFunc = config.xAxisOnTop ? "axisTop" : "axisBottom";
    var axisX = d3[axisFunc]()
      .scale(config.scaleX)
      .ticks(config.xTicks || null)
      .tickFormat(axisXFormat);

    return {
      axisX: axisX
    };
  };

  var axisY = function (config) {
    if (config.dataIsEmpty) {
      return {};
    }

    var axisY = d3
      .axisLeft()
      .scale(config.scaleY)
      .ticks(config.yTicks || 6)
      .tickFormat(function (d) {
        if (config.axisYFormat) {
          return d3.format(config.axisYFormat)(d);
        } else if (d < 1) {
          return d3.format(".2")(d);
        } else {
          return d3.format(".2s")(d);
        }
      })
      .tickPadding(10);

    return {
      axisY: axisY
    };
  };

  var axisComponentX = function (config) {
    if (config.dataIsEmpty || config.hide.indexOf("xAxis") > -1) {
      return {};
    }

    var axisX = config.container
      .select(".axis.x")
      .attr("transform", "translate(" + [0, config.chartHeight] + ")")
      .call(config.axisX);

    return {};
  };

  var axisComponentY = function (config) {
    if (
      config.dataIsEmpty ||
      config.hide.indexOf("yAxis") > -1 ||
      config.axisOnly
    ) {
      return {};
    }

    var axisY = config.container.select(".axis.y").call(config.axisY);

    return {};
  };

  var gridX = function (config) {
    if (
      config.dataIsEmpty ||
      config.hide.indexOf("xGrid") > -1 ||
      config.axisOnly
    ) {
      return {};
    }

    var axisX = config.container
      .select(".grid.x")
      .attr("transform", "translate(" + [0, config.chartHeight] + ")")
      .call(config.axisX.tickSize(-config.chartHeight).tickFormat(""));

    return {};
  };

  var lineShapes = function (config) {
    if (
      config.dataIsEmpty ||
      config.axisOnly ||
      (config.chartType !== "line" && config.chartType !== "area")
    ) {
      config.container
        .select(".line-group")
        .selectAll("path.line")
        .remove();
      return {};
    }

    var chartType = config.chartType || "line";

    var lineGenerator;
    if (chartType === "area") {
      lineGenerator = d3
        .area()
        .defined(function (d) {
          return d.value != null;
        })
        .x(function (d) {
          return config.scaleX(d.timestamp);
        })
        .y0(function (d) {
          return config.scaleY(0);
        })
        .y1(function (d) {
          return config.scaleY(d.value);
        });
    } else {
      lineGenerator = d3
        .line()
        .defined(function (d) {
          return d.value != null;
        })
        .x(function (d) {
          return config.scaleX(d.timestamp);
        })
        .y(function (d) {
          return config.scaleY(d.value);
        });
    }

    var shapeGroups = config.container
      .select(".shapes")
      .selectAll(".shape-group")
      .data(config.dataConverted);
    var shapes = shapeGroups
      .enter()
      .append("g")
      .attr("class", "shape-group")
      .merge(shapeGroups)
      .selectAll("path.shape")
      .data(function (d, i) {
        d.layer = i;
        return [d];
      });
    shapes
      .enter()
      .append("path")
      .merge(shapes)
      .attr("class", function (d, i, a, b) {
        return ["shape", d.metadata.id, "layer" + d.layer, chartType].join(" ");
      })
      .attr("d", function (d) {
        return lineGenerator(d.data);
      });
    shapes.exit().remove();
    shapeGroups.exit().remove();

    return {};
  };

  var stepShapes = function (config) {
    if (config.dataIsEmpty || config.axisOnly || config.chartType !== "step") {
      config.container
        .select(".step-group")
        .selectAll("path.shape")
        .remove();
      return {};
    }

    var id = config.dataConverted[0].metadata.id;
    var range = config.stepRange || 3;

    var line = [];
    var lineData = config.dataConverted[0].data;
    lineData.forEach(function (d, i) {
      var prevIdx = Math.max(i - 1, 0);
      line.push([
        config.scaleX(d.timestamp),
        config.scaleY(lineData[prevIdx].value)
      ]);
      line.push([config.scaleX(d.timestamp), config.scaleY(d.value)]);
    });
    var areaHigh = [];
    var areaLow = [];
    var areaData = config.dataConverted[0].data;
    areaData.forEach(function (d, i) {
      var prevIdx = Math.max(i - 1, 0);
      areaHigh.push([
        config.scaleX(d.timestamp),
        config.scaleY(lineData[prevIdx].value + range)
      ]);
      areaHigh.push([
        config.scaleX(d.timestamp),
        config.scaleY(d.value + range)
      ]);

      areaLow.push([
        config.scaleX(d.timestamp),
        config.scaleY(lineData[prevIdx].value - range)
      ]);
      areaLow.push([
        config.scaleX(d.timestamp),
        config.scaleY(d.value - range)
      ]);
    });
    var area = areaHigh.concat(areaLow.reverse());

    var lineGenerator = d3
      .line()
      .defined(function (d) {
        return d.value != null;
      })
      .x(function (d) {
        return config.scaleX(d.timestamp);
      })
      .y(function (d) {
        return config.scaleY(d.value);
      });

    var shapeGroups = config.container
      .select(".shapes")
      .selectAll(".step-group")
      .data([line, area]);
    var shapes = shapeGroups
      .enter()
      .append("g")
      .attr("class", "step-group")
      .merge(shapeGroups)
      .selectAll("path.shape")
      .data(function (d, i) {
        d.layer = i;
        return [d];
      });
    shapes
      .enter()
      .append("path")
      .merge(shapes)
      .attr("class", function (d, i, a, b) {
        return ["shape", id, "layer" + d.layer, config.chartType].join(" ");
      })
      .attr("d", function (d, i) {
        // return 'M' + d.join() + (d.layer === 1 ? 'Z' : '')
        return "M" + d.join();
      });
    shapes.exit().remove();
    shapeGroups.exit().remove();

    return {};
  };

  var arrowShapes = function (config) {
    if (config.dataIsEmpty || config.axisOnly || config.chartType !== "arrow") {
      config.container
        .select(".shapes")
        .selectAll("path.arrow")
        .remove();
      return {};
    }

    var arrowPath = "M6 0L12 10L8 10L8 24L4 24L4 10L0 10Z";
    var arrows = config.container
      .select(".shapes")
      .selectAll("path.arrow")
      .data(
        config.dataConverted[0].data.filter(function (d, i) {
          var skip = config.arrowSkip || 3;
          return i % skip === 0;
        })
      );

    arrows
      .enter()
      .append("path")
      .attr("class", function (d) {
        return "arrow";
      })
      .merge(arrows)
      .attr("d", arrowPath)
      .attr("transform", function (d) {
        // console.log(d.value)
        return (
          "translate(" +
          config.scaleX(d.timestamp) +
          ", 0) scale(0.5) rotate(" +
          d.value +
          ", 6, 12)"
        );
      });

    arrows.exit().remove();

    return {};
  };

  var reference = function (config) {
    if (config.dataIsEmpty || typeof config.reference !== "number") {
      config.container.selectAll("path.reference").remove();
      return {};
    }

    var scaledY = config.scaleY(config.reference);
    var path = "M" + [[0, scaledY], [config.chartWidth, scaledY]].join("L");

    var shapes = config.container
      .select(".reference")
      .selectAll("path")
      .data([0]);
    shapes
      .enter()
      .append("path")
      .attr("class", "reference")
      .style("fill", "none")
      .merge(shapes)
      .attr("d", path);
    shapes.exit().remove();

    return {};
  };

  function getHoverInfo(config, timestamp) {
    var dataUnderCursor = [];
    if (config.dataConverted[0].data.length) {
      config.dataConverted.forEach(function (d, i) {
        var bisector = d3.bisector(function (dB, x) {
          return dB.timestamp.getTime() - x.getTime();
        }).left;
        var found = bisector(d.data, timestamp);

        var d1 = d.data[Math.min(found, d.data.length - 1)];
        var d0 = d.data[Math.max(found - 1, 0)];
        var datum =
          timestamp - d0.timestamp > d1.timestamp - timestamp ? d1 : d0;

        var posX = Math.round(config.scaleX(datum.timestamp));
        var posY = Math.round(config.scaleY(datum.value));
        var eventData = { event: d3.event, posX: posX, posY: posY };
        datum = dh.utils.mergeAll({}, datum, d.metadata, eventData);
        dataUnderCursor.push(datum);
      });
    }
    return dataUnderCursor;
  }

  var eventsPanel = function (config) {
    var eventPanel = config.container
      .select(".events .event-panel")
      .on("mousemove touchstart", function (d) {
        if (config.dataIsEmpty) {
          return;
        }
        var mouseX = d3.mouse(this)[0] - config.margin.left;
        var mouseTimestamp = config.scaleX.invert(mouseX);
        var dataUnderCursor = getHoverInfo(config, mouseTimestamp);

        config.events.call("hover", null, dataUnderCursor);
      }, { passive: true })
      .on("mouseout", function (d) {
        hideTooltip(config);
        config.container.selectAll(".axis-title.x text").text(null);
        config.events.call("mouseout", null, {});
      })
      .on("click", function (d) {
        config.events.call("click", null, { event: d3.event });
      });

    return {
      eventPanel: eventPanel
    };
  };

  function setTooltip(config, d, hover) {
    if (!config.dataConverted[0].data.length) {
      return (config.datasetIndex = 0);
    }
    config.datasetIndex = hover ? getDatasetIndex() : 0;
    function getDatasetIndex() {
      var firstDataset = config.dataConverted[0].data;
      var lastTimestamp = firstDataset[firstDataset.length - 1].timestamp;
      return d[0].timestamp === lastTimestamp && d[1] ? 1 : 0;
    }
    var x = config.margin.left + d[config.datasetIndex].posX;
    config.container
      .select(".tooltip line")
      .attr("y1", 0)
      .attr("y2", config.height)
      .attr("x1", x)
      .attr("x2", x)
      .attr("display", "block");

    if (
      !d ||
      !d[0] ||
      typeof d[0].value === "undefined" ||
      d[0].value === null ||
      config.hide.indexOf("tooltip") > -1
    ) {
      config.container
        .select(".tooltip")
        .selectAll("text.tooltip-label")
        .remove();

      config.container
        .select('.tooltip')
        .selectAll('.tooltip-rect')
        .remove();

      return;
    }

    if (config.hide.indexOf("tooltipDot") > -1) {
      config.container
        .select(".tooltip")
        .selectAll("circle.dot")
        .remove();
    } else {
      var circles = config.container
        .select(".tooltip")
        .selectAll("circle.dot")
        .data(d);
      circles
        .enter()
        .append("circle")
        .merge(circles)
        .attr("display", "block")
        .attr("class", function (dB, dI) {
          return ["dot", dB.id, "layer" + dI].join(" ");
        })
        .attr("cx", function (dB) {
          return dB.posX + config.margin.left;
        })
        .attr("cy", function (dB) {
          return dB.posY + config.margin.top;
        })
        .attr("r", 2);
      circles.exit().remove();
    }

    if (config.hide.indexOf("tooltipLabel") > -1) {
      config.container
        .select(".tooltip")
        .selectAll("text.tooltip-label")
        .remove();

      config.container
        .select('.tooltip')
        .selectAll('.tooltip-rect')
        .remove();
    } else {
      var rects = config.container
        .select('.tooltip')
        .selectAll('.tooltip-rect')
        .data(d);

      var labels = config.container
        .select(".tooltip")
        .selectAll("text.tooltip-label")
        .data(d);

      labels
        .enter()
        .append("text")
        .merge(labels)
        .attr("display", "block")
        .attr("class", function (dB, dI) {
          return ["tooltip-label", dB.id, "layer" + dI].join(" ");
        })
        .attr("transform", function (dB, dI) {
          var x = dB.posX + config.margin.left;
          var y = dB.posY + config.margin.top;
          if (config.chartType === "arrow") {
            y = 0;
          }
          return "translate(" + [x, y] + ")";
        })
        .attr("dx", -4)
        .attr("text-anchor", "end")
        .text(function (dB, dI) {
          return config.valueFormatter
            ? config.valueFormatter(dB, dI)
            : dB.value;
        });

      // Assign tooltip text BBox, so rect can get its width and height from it
      config.container
        .select('.tooltip')
        .selectAll('text.tooltip-label')
        .each(function (item, i) {
          // get bounding box of text field and store it in texts array
          try {
            d[i].bb = this.getBBox();
          } catch (e) {
            console.error('Firefox specific error-getting getBBox when it display=none. Using default object.');
            d[i].bb = { height: 0, width: 0, x: 0, y: 0 };
          }
        });

      // Add tooltip rects
      var paddingLeftRight = 4;
      var paddingTopBottom = 2;
      rects
        .enter()
        .insert('rect')
        .merge(rects)
        .attr('display', 'block')
        .attr('width', function (d2) {
          if (d2.bb.width) {
            return d2.bb.width + paddingLeftRight;
          }
          return 0
        })
        .attr('height', function (d2) {
          if (d2.bb.height) {
            return d2.bb.height + paddingTopBottom;
          }
          return 0
        })

        .attr('class', function (d2, dI) {
          return ['tooltip-rect', d2.id, 'layer' + dI].join(' ');
        })
        .attr(
          'style',
          'fill:black;stroke:#575f6d;stroke-width:1;fill-opacity:0.8;stroke-opacity:0.8'
        )
        .attr('transform', function (dB, dI) {
          var x = dB.posX + config.margin.left - dB.bb.width - paddingLeftRight * 1.5;
          var y = dB.posY + config.margin.top - dB.bb.height + paddingTopBottom / 1.5;
          if (config.chartType === 'arrow') {
            y = 0;
          }
          return 'translate(' + [x, y] + ')';
        })
        .attr('rx', 2);

      // Make so that text is not overlayed with rect
      config.container.selectAll('.tooltip *').each(function (item, i) {
        var firstChild = this.parentNode.firstChild;
        if (this.localName === 'rect') {
          this.parentNode.insertBefore(this, firstChild);
        }
      });


      labels.exit().remove();
      rects.exit().remove();
    }

    function removeInactiveLayerinfo() {
      var inactive = config.datasetIndex === 1 ? 0 : 1;
      config.container
        .select(".tooltip")
        .selectAll(".layer" + inactive)
        .remove();
    }
    removeInactiveLayerinfo();
  }

  function hideTooltip(config) {
    config.container.select(".tooltip line").attr("display", "none");
    config.container.selectAll(".tooltip circle").attr("display", "none");
    config.container
      .selectAll(".tooltip .tooltip-label")
      .attr("display", "none");

    config.container.selectAll('.tooltip .tooltip-rect').attr('display', 'none');
  }

  var tooltipComponent = function (config) {
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
    if (
      config.dataIsEmpty ||
      config.axisOnly ||
      config.hide.indexOf("tooltip") > -1
    ) {
      hideTooltip(config);
      return {};
    }

    config.events.on("hover.tooltip", function (d) {
      setTooltip(config, d, "hover");
    });
  };

  var xAxisTitle = function (config) {
    if (
      config.dataIsEmpty ||
      config.axisOnly ||
      config.hide.indexOf("xTitle") > -1
    ) {
      return {};
    }
    var xTitleFormat = config.xTitleFormat || d3.utcFormat("%X");
    var titleContainer = config.container.select(".axis-title.x");
    var title = titleContainer.select("text");

    config.events.on("hover.title", function (d) {
      var timestamp = d[config.datasetIndex].timestamp;

      titleContainer.attr(
        "transform",
        "translate(" + [config.chartWidth, config.chartHeight] + ")"
      );

      title
        .text(xTitleFormat(timestamp))
        .attr("dy", -8)
        .attr("text-anchor", "end");
    });

    return {};
  };

  var yAxisTitle = function (config) {
    if (config.axisOnly || config.hide.indexOf("yTitle") > -1) {
      return {};
    }
    config.container
      .select(".axis-title.y text")
      .text(config.yAxisTitle || "")
      .attr("dx", "0.5em")
      .attr("dy", "1em");

    return {};
  };

  var lineChart = dh.utils.pipeline(
    defaultConfig,
    template,
    data,
    scaleX,
    scaleY,
    axisX,
    axisY,
    axisComponentX,
    gridX,
    lineShapes,
    arrowShapes,
    stepShapes,
    // dh.common.printer,
    // areaShapes,
    dh.common.message,
    axisComponentY,
    reference,
    eventsPanel,
    tooltipComponent,
    xAxisTitle,
    yAxisTitle
  );

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
   */
  var timeseries = function (config) {
    var configCache,
      events = d3.dispatch("hover", "click", "mouseout", "tooltipChange"),
      chartCache,
      uid = ~~(Math.random() * 10000);

    var onResize = dh.utils.throttle(function () {
      configCache.width = configCache.parent.clientWidth;
      render();
    }, 200);

    if (!config.resizeOff) {
      d3.select(window).on("resize." + uid, onResize);
    }

    var render = function () {
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
     */
    var setData = function (data) {
      var d = data ? JSON.parse(JSON.stringify(data)) : {};
      configCache = dh.utils.mergeAll({}, configCache, { data: d });
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
     */
    var setConfig = function (config) {
      configCache = dh.utils.mergeAll({}, configCache, config);
      render();
      return this;
    };

    var init = function (config, events) {
      setConfig(dh.utils.mergeAll({}, config, { events: events }));
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
     */
    var destroy = function () {
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
     */
    return {
      on: dh.utils.rebind(events),
      setConfig: setConfig,
      setData: setData,
      destroy: destroy
    };
  };

  dh.timeseries = timeseries;
})(datahub, root.d3);
