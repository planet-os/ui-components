# datahub-ui
Reusable UI components and [API](http://docs.planetos.com/) wrappers to build data apps at [Planet OS](https://planetos.com/)

*Notice: The current version is v0.1.0. The components will be out of beta when they will reach v1.0.0. But they are wrappers around components that are used in production for [Planet OS Datahub](http://data.planetos.com/datasets) and for custom [Powerboards](https://planetos.com/powerboard/).*

## Development
We will start accepting pull requests and bug reports once out of beta. In the meantime, here is how to use the library.

There's a static example in the /example folder, loading all required libraries with script tags
```javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.2/leaflet.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.4.0/d3.js"></script>
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
<script src="../src/datahub-utils.js"></script>
<script src="../src/datahub-palette.js"></script>
<script src="../src/datahub-data.js"></script>
<script src="../src/datahub-map.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.2/leaflet.css" />
```

The /example/browserify-example folder shows how to use it as an npm module with Browserify. 

```javascript
npm install
npm run build
```

## Modules
* datahub.map
  * selectorMap
  * rasterMap

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
  * reactiveProperty
  * flattenAndUniquify
  * bisection
  * bisectionReversed
  * findMax
  * findMin
  * parseRGB

## To do
* Unit tests
* CDN
* Charts
* Documentation (components, APIs, examples)