var datahub = exports = (typeof exports === "object") ? exports : {}
var root = (typeof global === "object") ? global : window
if (typeof module === 'object' && module.exports) {
    root.d3 = require('d3')
    root.colorBrewer = require('d3-scale-chromatic')
    try {
        root.leaflet = require("leaflet");
    }
    catch(e) {
    }
} else {
    root.d3 = root.d3
    root.colorBrewer = root.d3
    root.leaflet = root.L
}