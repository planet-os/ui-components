# datahub-ui
Reusable UI components and [API](http://docs.planetos.com/) wrappers to build data apps at [Planet OS](https://planetos.com/)

You can read a blog post about it [here](https://medium.com/planet-os/insights-from-designing-datahub-ui-in-d3-js-d8f0f5da0b82). See some of these components in action [here](https://planet-os.github.io/ui-components/datahub-ui/example/index.html). Tests are available [here](https://planet-os.github.io/ui-components/datahub-ui/test/).

## Development
*Notice: The components will be out of beta when they will reach v1.0.0. But they are used in production for [Planet OS Datahub](http://data.planetos.com/datasets) and for custom [Powerboards](https://planetos.com/powerboard/). We will start accepting pull requests and bug reports once out of beta. In the meantime, here is how to use the library.*

Datahub.js and datahub-min.js can also be loaded from https://planet-os.github.io/ui-components/datahub-ui/dist/datahub.js

To compile datahub.js and datahub-min.js

```javascript
npm install
// and run Rollup with
npm run build
npm run build-min
npm run build-watch
```

While the library is in development, the best way to keep it up-to-date is by using [npm link](https://docs.npmjs.com/cli/link) from the downloaded repo.

```javascript
cd /datahub-ui
npm link
cd ../project-folder
npm install
npm uninstall datahub-ui
npm link datahub-ui
```

## Modules

* datahub.multiChart
  * on
  * setConfig
  * setData
  * destroy

* datahub.tableChart
  * on
  * setConfig
  * setData
  * destroy

* datahub.verticalChart
  * on
  * setConfig
  * setData
  * destroy

* datahub.waterfallChart
  * on
  * setConfig
  * setData
  * destroy

* datahub.widgets
  * timeSlider
  * buttonGroup
  * number
  * table
  * alertMessage
  * monthCalendar
  * dropdown
  * dropdownCalendar

* datahub.map: rasterMap, selectorMap
  * init
  * show
  * hide
  * resize
  * zoomToPolygonBoundingBox
  * addMarker
  * removeMarker
  * renderPolygon
  * renderImage
  * renderRaster
  * renderVectorMap
  * isVisible
  * hideZoomControl
  * on

* datahub.palette
  * equalizedGrayscale
  * equalizedSpectral
  * grayscale

* datahub.legend
  * setConfig
  * render
  * setData
  * destroy

* datahub.utils
  * merge
  * mergeAll
  * htmlToNode
  * appendHtmlToNode
  * once
  * throttle
  * arrayStats
  * arrayUniques
  * arrayFlatten
  * bisection
  * bisectionReversed
  * findMax
  * findMin
  * parseRGB
  * pipeline
  * override
  * rebind

* datahub.data
  * generateRaster
  * generateGeojson
  * getDatasetDetails
  * getVariables
  * getTimestamps
  * getPreview
  * getStations
  * getStationVariables
  * getImage
  * getJSON
  * apiConfig
  * generateTimeSeries
  * generateTimestamps
  * pointsToFeatures
  * generateGeojsonPoints
  * getWorldVector
  * setApiKey


## To do
* Documentation (components, APIs)