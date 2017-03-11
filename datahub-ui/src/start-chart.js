var datahub = exports = (typeof exports === "object") ? exports : {}
var root = (typeof global === "object") ? global : window
if (typeof module === 'object' && module.exports) {
    root.d3 = require('d3')
} else {
    root.d3 = root.d3
}