piper.timeseriesLineChart = piper.utils.pipeline(
    piper.dataTimeFromSeparateArrays,
    piper.scaleXTime,
    piper.scaleY,
    piper.axisX,
    piper.axisY,
    piper.panelComponent,
    piper.lineShapes,
    piper.message,
    piper.axisComponentX,
    piper.axisComponentY,
    piper.axisTitleComponentY,
    piper.tooltipComponent,
    piper.hoverCircleComponent,
    piper.tooltipLineComponent
);

if (typeof module === "object" && module.exports) {
    var d3 = require("d3");
    module.exports = piper;
}
