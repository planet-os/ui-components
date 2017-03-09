import { default as utils } from "./src/datahub-utils.js"
import { default as data } from "./src/datahub-data.js"

import { default as common } from "./src/datahub-common.js"
import { default as multiChart } from "./src/datahub-chart.js"
import { default as tableChart } from "./src/datahub-table-chart.js"
import { default as verticalChart } from "./src/datahub-vertical-chart.js"
import { default as waterfallChart } from "./src/datahub-waterfall-chart.js"
import { default as widget } from "./src/datahub-widget.js"

import { default as palette } from "./src/datahub-palette.js"
import { default as colorLegend } from "./src/datahub-legend.js"
import { default as map } from "./src/datahub-map.js"

var datahub = {
    palette: palette,
    colorLegend: colorLegend,
    map: map,
    widget: widget,
    multiChart: multiChart,
    tableChart: tableChart,
    verticalChart: verticalChart,
    waterfallChart: waterfallChart,
    common: common,
    utils: utils,
    data: data
}

export default datahub