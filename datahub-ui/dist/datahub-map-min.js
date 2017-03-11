!function(t,e){var n=t="object"==typeof t?t:{},a="object"==typeof e?e:window;if("object"==typeof module&&module.exports){a.d3=require("d3");try{a.colorBrewer=require("d3-scale-chromatic")}catch(r){a.colorBrewer=null}try{a.leaflet=require("leaflet")}catch(r){a.leaflet=null}}else a.d3=a.d3,a.colorBrewer=a.d3,a.leaflet=a.L;!function(t){var e=function(t,n){for(var a in n)n[a]&&n[a].constructor==Object&&t[a]?e(t[a],n[a]):t[a]=n[a]},n=function(){for(var t={},n=arguments,a=0;a<n.length;a++)e(t,n[a]);return t},a=function(t,e){for(;e.lastChild;)e.removeChild(e.lastChild);return r(t,e)},r=function(t,e){return e.appendChild(document.importNode((new DOMParser).parseFromString(t,"text/html").body.childNodes[0],!0))},o=function(t,e){var n;return function(){return t&&(n=t.apply(e||this,arguments),t=null),n}},i=function(t,e){var n=!1,a=null;return function(){var r=this;n||(n=!0,clearTimeout(a),a=setTimeout(function(){n=!1,t.apply(r,arguments)},e))}},l=function(t,e){var n,a,r,o,i=[],l=[],s=Number.MAX_VALUE,u=Number.MIN_VALUE,c={};for(r=0;r<t.length;r++)for(n=t[r],o=0;o<n.length;o++)a=e?e(n[o]):n[o],i.push(a),c.hasOwnProperty(a)||null===a||(c[a]=1,a>u&&(u=a),s>a&&(s=a));return l=Object.keys(c).map(function(t,e){return+t}),{flattened:i,uniques:l,max:u,min:s}},s=function(t,e){return l(t,e).uniques},u=function(t,e){return l(t,e).flattened},c=function(t,e,n){for(var a,r=0,o=t.length-1;o>r;)a=r+o>>1,n&&e>=t[a]||!n&&e<t[a]?o=a:r=a+1;return r},d=function(t,e){return c(t,e,!0)},m=function(t){var e,n=0,a=t.length;for(e=0;a>e;e++)t[e]>n&&(n=t[e]);return n},g=function(t){var e,n=1/0,a=t.length;for(e=0;a>e;e++)t[e]<n&&(n=t[e]);return n},f=function(t){return t.slice(4).slice(0,-1).split(",").map(function(t,e){return parseInt(t)})},p=function(){var t=arguments,e=this;return function(n){for(var a=0;a<t.length;a++){var r=t[a].call(this,n);n=e.mergeAll(n,r)}return n}},h=function(t,e){for(var n in e)n in t&&(t[n]=e[n])},v=function(t){return function(){return t.on.apply(t,arguments),this}};t.utils={merge:e,mergeAll:n,htmlToNode:a,appendHtmlToNode:r,once:o,throttle:i,arrayStats:l,arrayUniques:s,arrayFlatten:u,bisection:c,bisectionReversed:d,findMax:m,findMin:g,parseRGB:f,pipeline:p,override:h,rebind:v}}(n),!function(t,e){function n(t){return t.charAt(0).toUpperCase()+t.slice(1)}function a(t){if(t)return!0;throw"You need to set an API key using `datahub.data.setApiKey(API_KEY)`. You can get yours at http://data.planetos.com/"}var r={currentBaseURI:"https://data.planetos.com/",baseURI:"https://api.planetos.com/v1a/",datasetsEndpoint:"https://api.planetos.com/v1/datasets/",apiKey:null},o=function(t){return r.apiKey=t,this},i=function(){return{type:"Feature",properties:{name:""},geometry:{type:"LineString",coordinates:[[-170,80],[170,80],[170,-80],[-170,-80],[-170,80]]}}},l=function(){var t=d(50,function(t,e){return{coordinates:[360*Math.random()-180,180*Math.random()-90],id:"random-point-"+e}});return s(t)},s=function(t){return{type:"FeatureCollection",features:t.map(function(t){return{type:"Feature",geometry:{type:"Point",coordinates:t.coordinates},properties:{id:t.id}}})}},u=function(t){var e="https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json";f(e,function(e,n){t(n)})},c=function(){var e={lon:d(360,function(t,e){return e-180}),lat:d(180,function(t,e){return 180-e-90}),values:d(180,function(t,e){return d(360,function(t,e){return~~(100*Math.random())})})};return e.uniqueValues=t.utils.arrayUniques(e.values),e},d=function(t,e){var n=e||function(t,e){return 0};return Array.apply(null,Array(t)).map(n)},m=function(t){var t=t||{},e={count:t.count||12,layerCount:t.layerCount||1,timeStart:t.timeStart||"2016-01-01",timeIncrement:t.timeIncrement||"month",step:t.step||1,min:t.min||0,max:t.max||100},n=~~(Math.random()*(e.max-e.min))+e.min,a=d(e.count,function(){return d(e.layerCount,function(t){return n+=(2*Math.random()-1)*((e.max-e.min)/10),n=Math.max(n,e.min)})}),r=g(e),o=r.map(function(t,e){return{timestamp:t,value:a[e],id:a[e].map(function(t){return~~(1e3*Math.random())}),className:a[e].map(function(t){return Math.random().toString(36).substring(4,8)})}});return o},g=function(t){var t=t||{},a={count:t.count||12,layerCount:t.layerCount||1,timeStart:t.timeStart||"2016-01-01",timeIncrement:t.timeIncrement||"month",step:t.step||1,min:t.min||0,max:t.max||100},r="utc"+n(a.timeIncrement)||"utcHour",o=e[r],i=e[r+"s"],l=a.timeStart?new Date(a.timeStart):new Date,s=o.offset(l,a.count*a.step),u=i(l,s,a.step),c=u.map(function(t,n){return e.isoFormat(t)});return c},f=function(t,e){var n="undefined"!=typeof XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");n.open("get",t,!0),n.onreadystatechange=function(){var t,a;4==n.readyState&&(t=n.status,200==t?(a=JSON.parse(n.responseText),e(null,a)):e(t))},n.send()},p=function(t,e){a(r.apiKey);var n=r.baseURI+"/datasets/"+t+"?apikey="+r.apiKey;return console.log("get dataset details",n),f(n,function(t,n){if(void 0===n)return console.log("Can not render dataset because of API error",t),!1;var a=n.FeatureType||"timeseries",r="grid"===a.toLowerCase().trim()?"raster":"timeseries";console.log("Data type:",r,n.ProductType,n.FeatureType,n),e({datasetInfo:n,dataType:r,productType:n.ProductType})}),this},h=function(t,e,n){a(r.apiKey);var o=r.baseURI+"/datasets/"+t+"/variables?apikey="+r.apiKey;return console.log("query variables",o),f(o,function(a,r){var o,i=r[t],l=e;l&&(o=i.filter(function(t){return t.name===l})[0]);var s=o||i[0];n({variables:i,defaultVariable:s})}),this},v=function(t,e,n){a(r.apiKey);var o=r.baseURI+"/datasets/"+t+"/variables/"+encodeURIComponent(e)+"/timestamps?apikey="+r.apiKey;return console.log("query timestamps",o),f(o,function(t,e){if(t)return void console.log("Server error",t);var a=e.map(function(t){return new Date(parseInt(t))});n({timestamps:a})}),this},y=function(e,n,o,i){a(r.apiKey);var l=r.baseURI+"/datasets/"+e+"/variables/"+encodeURIComponent(n);return o&&(l+="/timestamps/"+o),l+="/sample_data",l+="?apikey="+r.apiKey,console.log("query dataset",l),f(l,function(a,o){if(a)return void console.log("Server error",a);o.values=o.values.map(function(t,e){return t.map(function(t){return-999===t?null:t})}),o.uniqueValues=t.utils.arrayUniques(o.values).sort();var s=r.currentBaseURI+"/datasets/"+e+"?variable="+n;i({json:o,uri:l,datahubLink:s})}),this},b=function(t,e){a(r.apiKey);var n=r.datasetsEndpoint+t+"/stations?apikey="+r.apiKey;return console.log("get stations",n),f(n,function(t,n){if(t)return void console.log("Server error",t);var a=[];for(var r in n.station){var o=n.station[r];void 0!==o.SpatialExtent&&a.push({id:r,coordinates:o.SpatialExtent.coordinates})}e({stations:a,defaultStation:a[0]})}),this},x=function(t,e,n,o,i){a(r.apiKey);var l=500,s=r.datasetsEndpoint+t+"/stations/"+e+"?apikey="+r.apiKey+"&verbose=true&count="+l;return o||(s+="&time_order=desc"),console.log("station variable",s),f(s,function(e,a){if(e)return void console.log("Server error",e);console.log("Point API data",a,s);var o,l,u={},c=a.metadata.contexts;for(var d in c){o=c[d].dataVariables;for(var m in o)l=o[m],l.key=m,u[m]=l}var g={};a.entries.forEach(function(t){for(var e in t.data)g[e]||(g[e]={values:[],timestamps:[]}),g[e].values.push(t.data[e]),g[e].timestamps.push(new Date(t.axes.time))});var f=[];for(var p in u)f.push(u[p]);var h=r.currentBaseURI+"/datasets/"+t+"?variable="+n;i({datasets:g,variablesMetadata:u,variables:f,datahubLink:h,variableData:g[n],variableMetadata:u[n]})}),this},w=function(t,e,n,o,i){a(r.apiKey);var l=r.baseURI+"/datasets/"+t+"/variables/"+encodeURIComponent(e);return n&&(l+="/timestamps/"+n),l+="/image",l+="?width="+o+"&projection=mercator",l+="&apikey="+r.apiKey,console.log("query image",l),f(l,function(t,e){i(e.img,e.metadata)}),this};t.data={generateRaster:c,generateGeojson:i,generateTimeSeries:m,generateTimestamps:g,getDatasetDetails:p,getVariables:h,getTimestamps:v,getPreview:y,getStations:b,getStationVariables:x,getImage:w,getJSON:f,apiConfig:r,pointsToFeatures:s,generateGeojsonPoints:l,getWorldVector:u,setApiKey:o}}(n,a.d3),!function(t,e,n){var a=n.schemeSpectral[11].reverse(),r=function(t,n){var a=e.scaleQuantile().domain(t).range(e.range(n-1)).quantiles();return a.push(e.max(t)),a.unshift(e.min(t)),a},o=function(t,n){var a=r(t,n.length);return e.scaleLinear().domain(a).range(n)},i=function(t,n){var a=n||t.length,r=e.scaleLinear().domain([0,a-1]).range(t);return e.range(a).map(r)},l={grayscale:function(t){return e.scaleLinear().domain(e.extent(t)).range(["white","black"])},equalizedSpectral:function(t){return o(t,a)},equalizedGrayscale:function(t){return o(t,i(["white","black"],10))}};t.palette=l}(n,a.d3,a.colorBrewer),!function(t,e){var n=function(t){return{margin:t.margin||{right:20,left:20},unit:null,colorScale:t.colorScale||palette.equalizedSpectral}},a=function(n){var a=n.parent.querySelector(".datahub-legend");if(!a){var r='<div class="datahub-legend"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"><g class="panel"><defs><linearGradient id="legend-gradient"></linearGradient></defs><rect class="color-band" fill="url(#legend-gradient)" /><g class="axis"></g><text class="unit"></text></g></svg></div>';a=t.utils.appendHtmlToNode(r,n.parent)}var o=e.select(a),i=n.width||a.offsetWidth,l=n.height||a.offsetHeight;o.select("svg").attr("width",i).attr("height",l);var s=(o.select(".panel").attr("transform","translate("+n.margin.left+",0)"),i-n.margin.left-n.margin.right);return{container:o,width:i,height:l,legendWidth:s}},r=function(t){if(!t.data)return{};var n,a,r,o=t.colorScale(t.data);return a=o.domain(),r=e.range(0,a.length),n=t.colorScale(r),{legendColorScale:n,labelValues:a,colors:r}},o=function(t){if(!t.data)return{};var e=t.container.select("#legend-gradient").selectAll("stop").data(t.colors);return e.enter().append("stop").merge(e).attr("offset",function(e,n){return n*(100/(t.colors.length-1))+"%"}).attr("stop-color",function(e){return t.legendColorScale(e)}),e.exit().remove(),t.container.select(".color-band").attr("width",t.legendWidth).attr("height",t.height/2),{}},i=function(t){if(!t.data)return{};var e=t.container.select(".axis").selectAll("text.tick-label").data(t.labelValues),n=e.enter().append("text").classed("tick-label",!0).merge(e).attr("x",function(e,n){return n*(t.legendWidth/(t.labelValues.length-1))}).attr("y",.7*t.height).attr("dy","0.5em").text(function(t){return t.toPrecision(3)});e.exit().remove(),n.attr("dx",function(t,e){return-(this.getBBox().width/2)});var a=t.container.select(".axis").selectAll("line.tick-line").data(t.labelValues),r=a.enter().append("line").classed("tick-line",!0).merge(a).attr("x1",function(e,n){return n*(t.legendWidth/(t.labelValues.length-1))}).attr("y1",t.height/2).attr("x2",function(e,n){return n*(t.legendWidth/(t.labelValues.length-1))}).attr("y2",.55*t.height);return a.exit().remove(),r.attr("dx",function(t,e){return-(this.getBBox().width/2)}),t.unit&&t.container.select(".unit").attr("y",.95*t.height).text(t.unit),{}},l=t.utils.pipeline(n,a,r,o,i),s=function(n){var a,r,o=~~(1e4*Math.random()),i=t.utils.throttle(function(){a.width=a.parent.clientWidth,s()},200);e.select(window).on("resize."+o,i);var s=function(){r=l(a)},u=function(e){var n=e?JSON.parse(JSON.stringify(e)):{};return a=t.utils.mergeAll({},a),a.data=n,s(),this},c=function(e){return a=t.utils.mergeAll(a,e),s(),this},d=function(e){c(t.utils.mergeAll({},e))},m=function(){e.select(window).on("resize."+o,null),a.parent.innerHTML=null};return d(n),{setConfig:c,render:s,setData:u,destroy:m}};t.colorLegend=s}(n,a.d3),!function(t,e,a){var r=function(){var e=null,n=null,r=null,o=null,i=null,l=null,s=a.DomUtil.create("canvas","data-grid-layer");s.style.display="none",document.body.appendChild(s);var u={};return u.render=function(i){var l=i||o;if(o=l,!l)return u;var c=n.getBounds(),d=n.getPixelOrigin(),m=n.getPixelWorldBounds(),g=n.getSize(),f=g.y;n._zoom<g.y/512&&(f=m.max.y-m.min.y),console.log("Start rendering..."),console.time("render");var p=l.lat,h=l.lon,v=l.values;s.width=g.x,s.height=f;for(var y,b,x,w,k,M,C,T,S,L=s.getContext("2d"),P=Math.max(t.utils.bisectionReversed(p,c.getNorth())-1,0),D=Math.min(t.utils.bisectionReversed(p,c.getSouth()),p.length-1),I=Math.max(t.utils.bisection(h,c.getWest())-1,0),N=Math.min(t.utils.bisection(h,c.getEast())+1,h.length-1),U=n.latLngToContainerPoint([p[P],h[Math.max(I,0)]]),A=n.latLngToContainerPoint([p[P],h[Math.min(I+1,h.length-1)]]),B=Math.ceil(Math.max(A.x-U.x,1))+2,j=L.getImageData(0,0,g.x,f),_=new ArrayBuffer(j.data.length),R=new Uint8ClampedArray(_),l=new Uint32Array(_),q=0;q<p.length;q++)if(!(P>q||q>D)){C=Math.max(q,0),T=Math.min(C+1,p.length-1);for(var z=n.latLngToContainerPoint([p[C],h[I]]),E=n.latLngToContainerPoint([p[T],h[I]]),V=Math.ceil(Math.max(E.y-z.y,1)+1),O=0;O<h.length;O++)if(O>=I&&N>O&&(S=Math.max(O,0),k=n.latLngToContainerPoint([p[C],h[S]]),n._zoom<g.y/512&&(k.y=k.y+d.y-n._getMapPanePos().y),M=v[C][S],-999!==M&&null!==M&&!isNaN(M)&&q%1===0&&O%1===0))for(y=t.utils.parseRGB(e(M)),x=0;B>x;x++)for(w=0;V>w;w++)b=(~~k.y+w-~~(V/2))*g.x+Math.min(Math.max(~~k.x+x-~~(B/2),0),g.x-1),l[b]=255<<24|y[2]<<16|y[1]<<8|y[0]}return j.data.set(R),L.putImageData(j,0,0),r&&r.removeFrom(n),r=a.imageOverlay(s.toDataURL("image/png"),c).addTo(n),r.setOpacity(.8),console.timeEnd("render"),u},u.setColorScale=function(t){return e=t,u},u.setData=function(t){return u.render(t),u},u.addTo=function(t){return n=t,n.on("moveend",function(t){var e=t.target._panes.overlayPane.querySelector("img");if(e){var a=e.style,r=a.transform;if(r){var o=r.match(/\((.*)\)/)[1].split(",").slice(0,2);a.transform="translate("+o+")"}}var s=t.target._zoom,c=s!==i;i=s;var d=n.getBounds(),m=JSON.stringify(d)!==JSON.stringify(l);l=d,(c||m)&&u.render()}),u},u},o=function(t){function n(t){a.marker(t,{interactive:!0}).on("click",function(t){r(),s(),c.call("markerClick",this,t)},this).addTo(g);s()}function r(){return g.clearLayers(),f._toolbars.draw._modes.rectangle.handler.disable(),f._toolbars.draw._modes.marker.handler.disable(),this}function o(t){return{type:"Feature",geometry:{type:"Polygon",coordinates:[t.concat([t[0]])]},properties:{}}}function l(t,e){var n=a.GeoJSON.geometryToLayer(t).on("click",function(t){g.removeLayer(this),e&&e(this),s()},this);return n.addTo(g),this}function s(){var t=g.getBounds();return t._southWest?d.fitBounds(t):d.fitWorld(),this}var u=i({parent:t.parent}).init(),c=e.dispatch("mapCloseClick","rectangleDraw","rectangleClick","markerClick","markerDraw","geojsonClick"),d=u._getMap();d.zoomControl.setPosition("bottomright");var m=a.Control.extend({position:"topright",onAdd:function(t){var e=a.DomUtil.create("a","map-close leaflet-bar leaflet-control leaflet-control-custom");return e.onclick=function(t){c.call("mapCloseClick",this,t)},e}});d.addControl(new m);var g=new a.FeatureGroup;d.addLayer(g);var f=new a.Control.Draw({edit:{featureGroup:g,edit:!1,remove:!1},draw:{polygon:!1,circle:!1,polyline:!1,marker:{icon:new a.Icon.Default,zIndexOffset:2e3,repeatMode:!0},rectangle:{shapeOptions:{fillColor:"#128DE0",color:"#128DE0",opacity:.5},repeatMode:!0}}});return d.addControl(f),d.on("draw:created",function(t){var e=t.layer;r();if("rectangle"===t.layerType&&(e.addTo(g).on("click",function(t){r(),s(),c.call("rectangleClick",this,t)},this),c.call("rectangleDraw",this,e.getBounds()),s()),"marker"===t.layerType){var a=e.getLatLng();n(a),c.call("markerDraw",this,a)}},this),u.addRectangle=function(t){r();var e=o(t);return l(e,function(){c.call("rectangleClick",this,arguments)}),s(),this},u.addPolygons=function(t){return r(),t.forEach(function(t){t[1].id=t[0];var e=a.GeoJSON.geometryToLayer(t[1]).on("click",function(e){g.removeLayer(this),c.call("geojsonClick",this,t),s()},this);e.addTo(g)}),s(),this},u.removeAllPolygons=r,u.zoomToBoundingBox=s,u.addMarker=n,u},i=function(o){function i(){a.Icon.Default.imagePath=x.imagePath,k=a.map(x.container,w).on("click",function(t){P.call("click",this,{lat:t.latlng.lat,lon:t.latlng.lng})}).on("mousedown",function(t){x.container.classList.add("grab")}).on("mouseup",function(t){x.container.classList.remove("grab")}).on("mousemove",function(e){if(S){var r=t.utils.bisectionReversed(S.lat,e.latlng.lat),o=t.utils.bisection(S.lon,e.latlng.lng),i=Math.max(r-1,0),l=S.lat[i]-S.lat[r];e.latlng.lat>S.lat[r]+l/2&&(r=i);var s=Math.max(o-1,0),u=S.lon[o]-S.lon[s];e.latlng.lng<S.lon[o]-u/2&&(o=s);var c=null;if(e.latlng.lat<=S.lat[0]&&e.latlng.lat>=S.lat[S.lat.length-1]&&e.latlng.lng>=S.lon[0]&&e.latlng.lng<=S.lon[S.lon.length-1]&&(c=S.values[r][o]),null!==c&&-999!==c&&x.showTooltip){var d=a.Util.formatNum(c,2);n.setTooltipContent(d+"").openTooltip([e.latlng.lat,e.latlng.lng])}else n.closeTooltip();P.call("mousemove",this,{x:e.containerPoint.x,y:e.containerPoint.y,value:c,lat:e.latlng.lat,lon:e.latlng.lng})}}).on("mouseover",function(t){P.call("mouseenter",this,arguments)}).on("mouseout",function(t){P.call("mouseleave",this,arguments)}),o.mapConfig&&o.mapConfig.zoom||k.fitWorld(),k.createPane("labels");var e={};e.basemapDark=a.tileLayer("https://api.mapbox.com/styles/v1/planetos/ciusdqjc200w12jmlg0dys640/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmV0b3MiLCJhIjoiZjZkNDE4MTE5NWNhOGYyMmZhZmNhMDQwMDg0YWMyNGUifQ.htlwo6U82iekTcpGtDR_dQ",{tileSize:256,maxZoom:19}),e.basemapLight=a.tileLayer("https://api.mapbox.com/styles/v1/planetos/civ28flwe002c2ino04a6jiqs/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmV0b3MiLCJhIjoiZjZkNDE4MTE5NWNhOGYyMmZhZmNhMDQwMDg0YWMyNGUifQ.htlwo6U82iekTcpGtDR_dQ",{tileSize:256,maxZoom:19}),e.labelLight=a.tileLayer("http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",{attribution:"©OpenStreetMap, ©CartoDB",pane:"labels"}),e[x.basemapName].addTo(k),x.showLabels&&e.labelLight.addTo(k),M=r().addTo(k);var n=a.featureGroup().bindTooltip("").addTo(k);return this}function l(t,e){var n=e.bbox,r=[[n.latMax,n.lonMin],[n.latMin,n.lonMax]];return a.imageOverlay(t,r).addTo(k),this}function s(){return x.container.style.display="block",D.isVisible=!0,this}function u(){return x.container.style.display="none",D.isVisible=!1,this}function c(){return k.invalidateSize(),L?d(L):k.fitWorld(),this}function d(t){var e=a.geoJson(t);return k.fitBounds(e.getBounds()),L=t,this}function m(t){var e=function(t,e){e.on({click:function(t){P.call("featureClicked",this,{id:t.target.feature.properties.id,lat:t.target._latlng?t.target._latlng.lat:t.latlng.lat,lon:t.target._latlng?t.target._latlng.lng:t.latlng.lng,layer:t})},mouseover:function(t,e,n){P.call("featureMousEnter",this,{x:t.containerPoint.x,y:t.containerPoint.y,lat:t.latlng.lat,lon:t.latlng.lng,value:t.target.feature.properties.id})},mouseout:function(t){P.call("featureMousLeave",this,{x:t.containerPoint.x,y:t.containerPoint.y,lat:t.latlng.lat,lon:t.latlng.lng,value:t.target.feature.properties.id})}})};return C=a.geoJson(t,{onEachFeature:e,pointToLayer:function(t,e){return new a.CircleMarker(e,{radius:4,fillColor:"#05A5DE",color:"#1E1E1E",weight:1,opacity:.5,fillOpacity:.4})}}).addTo(k),x.polygonTooltipFunc&&C.bindTooltip(x.polygonTooltipFunc),this}function g(t){return f(),T=a.marker(t,{interactive:!0,draggable:!0,opacity:1}).on("click",function(t){P.call("markerClicked",this,arguments)}).addTo(k),this}function f(){return T&&T.remove(),this}function p(t){S=t;var e=t.uniqueValues.sort(function(t,e){return t-e}),n=x.colorScale(e);return M.setColorScale(n).setData(t),this}function h(t){return t?(k.addControl(k.zoomControl),k.doubleClickZoom.enable(),k.boxZoom.enable(),k.dragging.enable()):(k.removeControl(k.zoomControl),k.doubleClickZoom.disable(),k.boxZoom.disable(),k.dragging.disable()),this}function v(){return n.data.getWorldVector(function(t){m(t)}),this}var y=a.DomUtil.create("div","datahub-map"),b=o.parent.appendChild(y),x={container:b,colorScale:o.colorScale,basemapName:o.basemapName||"basemapDark",imagePath:o.imagePath||"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.2/images/",showLabels:!(o.showLabels===!1),showTooltip:!(o.showTooltip===!1),polygonTooltipFunc:o.polygonTooltipFunc},w={maxBounds:[[-90,-180],[90,180]],maxZoom:13,minZoom:1,scrollWheelZoom:!1,zoomSnap:0,zoomDelta:.5,attributionControl:!1,fadeAnimation:!1,tileLayer:{noWrap:!0,continuousWorld:!1}};t.utils.merge(w,o.mapConfig);var k,M,C,T,S,L,P=e.dispatch("click","mousemove","mouseenter","mouseleave","featureClicked","featureMousEnter","featureMousLeave","markerClicked"),D={isVisible:!0};return{init:i,show:s,hide:u,resize:c,zoomToPolygonBoundingBox:d,addMarker:g,removeMarker:f,renderPolygon:m,renderImage:l,renderRaster:p,renderVectorMap:v,isVisible:D.isVisible,hideZoomControl:h,on:t.utils.rebind(P),_getMap:function(){return k}}};t.map={rasterMap:i,selectorMap:o}}(n,a.d3,a.leaflet),"object"==typeof module&&module.exports&&(module.exports=t),e.datahub=t}({},function(){return this}());