# datahub-ui
Reusable UI components and [API](http://docs.planetos.com/) wrappers to build data apps at [Planet OS](https://planetos.com/)

*Notice: The current version is v0.3.5. The components will be out of beta when they will reach v1.0.0. But they are wrappers around components that are used in production for [Planet OS Datahub](http://data.planetos.com/datasets) and for custom [Powerboards](https://planetos.com/powerboard/).*

See some of these components in action [here](https://planet-os.github.io/ui-components/datahub-ui/example/index.html)

## Development
We will start accepting pull requests and bug reports once out of beta. In the meantime, here is how to use the library.

There's a static example in the /example folder, loading all required libraries with script tags. The /example/browserify-example folder shows how to use it as an npm module with Browserify. 

```javascript
npm install
npm run build
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
* datahub.map
  * selectorMap
  * rasterMap

* datahub.chart
  * timeseriesMultilineChart

* datahub.widgets
  * container
  * svgContainer
  * timeSlider
  * buttonGroup
  * number
  * table
  * alertMessage
  * monthCalendar
  * dropdown

* datahub.group
  * number

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
  * pointsToFeatures
  * generateGeojsonPoints
  * getWorldVector
  * setApiKey

* datahub.palette
  * equalizedGrayscale
  * equalizedSpectral
  * grayscale

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


## To do
* Unit tests
* CDN
* More charts
* Documentation (components, APIs)