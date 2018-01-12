!(function(dh, d3) {
  var template = function(config) {
    var containerNode = config.parent.querySelector(".datahub-weather-chart");
    if (!containerNode) {
      var template =
        '<div class="datahub-weather-chart">' +
        '<div class="chart-row topAxis">' +
        '<div class="historical"></div>' +
        '<div class="forecast"></div>' +
        "</div>" +
        '<div class="chart-row wind">' +
        '<div class="historical"></div>' +
        '<div class="forecast"></div>' +
        "</div>" +
        '<div class="chart-row windDirection">' +
        '<div class="historical"></div>' +
        '<div class="forecast"></div>' +
        "</div>" +
        '<div class="chart-row wave">' +
        '<div class="historical"></div>' +
        '<div class="forecast"></div>' +
        "</div>" +
        '<div class="chart-row tide">' +
        '<div class="historical"></div>' +
        '<div class="forecast"></div>' +
        "</div>" +
        '<div class="chart-row bottomAxis">' +
        '<div class="historical"></div>' +
        '<div class="forecast"></div>' +
        "</div>" +
        "</div>";

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
      domain: [0, 50],
      chartType: "area",
      yTicks: 3,
      height: 80,
      width: config.chartWidth / 2,
      valueFormatter: function(d, i) {
        return Math.round(d.value * 100) / 100;
      },
      hide: ["xTitle", "yTitle", "xAxis", "tooltipLabel"],
      margin: { top: 10, right: 4, bottom: 10, left: leftMargin }
    };

    var forecastChartConfig = datahub.utils.mergeAll(
      {},
      historicalChartConfig,
      {
        xTicks: config.forecastXTicks || d3.utcHour.every(12),
        axisXFormat: config.forecastXFormat || "%H:%M",
        resolution: "hour",
        hide: ["xAxis", "yAxis", "yTitle", "xTitle", "tooltipLabel"],
        margin: { top: 10, right: 4, bottom: 10, left: leftMargin }
      }
    );

    var commonArrowsConfig = {
      hide: [
        "xAxis",
        "yAxis",
        "xTitle",
        "yTitle",
        "tooltipDot",
        "tooltipLabel"
      ],
      chartType: "arrow",
      height: 20,
      arrowSkip: config.historicalArrowSkip || 3,
      margin: { top: 0, right: 4, bottom: 0, left: leftMargin }
    };

    var historicalArrowsConfig = datahub.utils.mergeAll(
      {},
      historicalChartConfig,
      commonArrowsConfig
    );

    var forecastArrowsConfig = datahub.utils.mergeAll(
      {},
      forecastChartConfig,
      commonArrowsConfig,
      {
        arrowSkip: config.forecastArrowSkip || 6,
        margin: { top: 0, right: 4, bottom: 0, left: leftMargin }
      }
    );

    var commonSingleAxis = {
      axisOnly: true,
      xAxisOnTop: true,
      hide: ["yAxis", "yTitle", "tooltipLabel"],
      height: 20,
      margin: { top: 20, right: 4, bottom: 0, left: leftMargin }
    };

    var historicalTopAxis = datahub.utils.mergeAll(
      {},
      historicalChartConfig,
      commonSingleAxis
    );
    var forecastTopAxis = datahub.utils.mergeAll(
      {},
      forecastChartConfig,
      commonSingleAxis,
      {
        margin: { top: 20, right: 4, bottom: 0, left: leftMargin }
      }
    );
    var historicalBottomAxis = datahub.utils.mergeAll(
      {},
      historicalChartConfig,
      commonSingleAxis,
      {
        margin: { top: 0, right: 4, bottom: 20, left: leftMargin },
        xAxisOnTop: false
      }
    );
    var forecastBottomAxis = datahub.utils.mergeAll(
      {},
      forecastChartConfig,
      commonSingleAxis,
      {
        margin: { top: 0, right: 4, bottom: 20, left: leftMargin },
        xAxisOnTop: false
      }
    );

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
      config.events.call("hover", null, { timestamp: timestamp });
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
        if (["topAxis", "bottomAxis"].indexOf(y) > -1) {
          continue;
        }
        d = data[x][y].data;
        idx = bisector(d, timestamp);
        if (!info[x]) {
          info[x] = {};
        }
        foundData = d[idx];
        foundData.metadata = data[x][y].metadata;
        info[x][y] = foundData;
      }
    }
    return info;
  }

  function setTooltip(charts, groupKey, chartKey, timestamp, config) {
    for (var x in charts) {
      if (x === groupKey) {
        for (var y in charts[x]) {
          if (y !== chartKey && charts[x][y]) {
            charts[x][y].setConfig({ tooltipTimestamp: timestamp });
          }
        }
      } else {
        for (var y in charts[x]) {
          charts[x][y].setConfig({ tooltipTimestamp: null });
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
        charts[x][y] = datahub
          .timeseries({
            parent: config.container.select("." + y + " ." + x).node()
          })
          .setConfig(config.chartConfig[x][y])
          .on(
            "hover",
            (function() {
              var groupKey = x;
              var chartKey = y;
              return function(d) {
                setTooltip(charts, groupKey, chartKey, d[0].timestamp, config);

                var data = getDataAtTimestamp(
                  d[0].timestamp,
                  config.dataConverted,
                  groupKey
                );
                config.events.call("tooltipChange", null, {
                  data: data,
                  timestamp: d[0].timestamp,
                  info: d,
                  config: config
                });
              };
            })()
          )
          .on("mouseout", function() {
            var latestHistoricalTimestamp = new Date(
              config.dataConverted.historical.wind.data.slice(-1)[0].timestamp
            );
            setTooltip(
              charts,
              "historical",
              null,
              latestHistoricalTimestamp,
              config
            );
            config.events.call("mouseout", null, {});

            var data = getDataAtTimestamp(
              latestHistoricalTimestamp,
              config.dataConverted,
              "historical"
            );
            config.events.call("tooltipChange", null, {
              data: data,
              timestamp: latestHistoricalTimestamp,
              config: config
            });
          });
        if (config.domain) {
          charts[x][y].setConfig({ domain: config.domain[y] });
        }

        if (config.dataConverted) {
          charts[x][y].setData([config.dataConverted[x][y]]);
        }
      }
    }

    if (config.dataConverted) {
      var latestHistoricalTimestamp = new Date(
        config.dataConverted.historical.wind.data.slice(-1)[0].timestamp
      );
      setTooltip(charts, "historical", null, latestHistoricalTimestamp, config);

      var data = getDataAtTimestamp(
        latestHistoricalTimestamp,
        config.dataConverted,
        "historical"
      );
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
   * @returns {object} A weatherChart instance.
   * @example
   * var data = datahub.data.generateWeatherChartData()
   * var chart = datahub.weatherChart({
   *     parent: document.querySelector('.weather-chart'),
   *     data: data
   * })
   * .on('tooltipChange', function(e){ console.log(e) })
   * .setData(data)
   */
  var weatherChart = function(config) {
    var configCache,
      events = d3.dispatch("hover", "tooltipChange", "mouseout"),
      chartCache,
      uid = ~~(Math.random() * 10000);

    var onResize = dh.utils.throttle(function() {
      configCache.width = configCache.parent.clientWidth;
      render();
    }, 200);

    // d3.select(window).on('resize.' + uid, onResize)

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
     */
    var setData = function(data) {
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
     * @returns {object} The weatherChart instance.
     * @memberof weatherChart
     * @example
     * datahub.multiChart({
     *     parent: document.querySelector('.chart'),
     * })
     * .setConfig({
     *     width: 100
     * })
     */
    var setConfig = function(config) {
      configCache = dh.utils.mergeAll(configCache, config);
      render();
      return this;
    };

    var init = function(config, events) {
      setConfig(dh.utils.mergeAll(config, { events: events }));
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
     */
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

  dh.weatherChart = weatherChart;
})(datahub, root.d3);
