!function(e){var t,n,a,r,o,i,l,s,u,c,d,m,g,p,f,h,v,y,b,x=e="object"==typeof e?e:{},S="object"==typeof global?global:window;if("object"==typeof module&&module.exports){S.d3=require("d3");try{S.colorBrewer=require("d3-scale-chromatic")}catch(e){S.colorBrewer=null}try{S.leaflet=require("leaflet")}catch(e){S.leaflet=null}}else S.d3=S.d3,S.colorBrewer=S.d3,S.leaflet=S.L;t=function(e,n){for(var a in n)n[a]&&n[a].constructor==Object&&e[a]?t(e[a],n[a]):e[a]=n[a]},n=function(e,t){return t.appendChild(document.importNode((new DOMParser).parseFromString(e,"text/html").body.childNodes[0],!0))},a=function(e,t){return t.appendChild(document.importNode((new DOMParser).parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+e+"</svg>","application/xml").documentElement.firstChild,!0))},r=function(e,t){var n,a,r,o,i=[],l=Number.MAX_VALUE,s=Number.MIN_VALUE,u={};for(r=0;r<e.length;r++)for(n=e[r],o=0;o<n.length;o++)a=t?t(n[o]):n[o],i.push(a),u.hasOwnProperty(a)||null===a||(u[a]=1,a>s&&(s=a),a<l&&(l=a));return{flattened:i,uniques:Object.keys(u).map(function(e,t){return+e}),max:s,min:l}},o=function(e,t,n){for(var a,r=0,o=e.length-1;r<o;)a=r+o>>1,n&&t>=e[a]||!n&&t<e[a]?o=a:r=a+1;return r},x.utils={merge:t,mergeAll:function(e,t){for(var n=Object(e),a=1;a<arguments.length;a++){var r=arguments[a];if(null!=r)for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(n[o]=r[o])}return n},htmlToNode:function(e,t){for(;t.lastChild;)t.removeChild(t.lastChild);return n(e,t)},appendHtmlToNode:n,svgToNode:function(e,t){var n=t.parentNode,r=t.cloneNode(!1);return n.removeChild(t),n.appendChild(r),a(e,r)},appendSvgToNode:a,once:function(e,t){var n;return function(){return e&&(n=e.apply(t||this,arguments),e=null),n}},throttle:function(e,t){var n=!1,a=null;return function(){var r=this;n||(n=!0,clearTimeout(a),a=setTimeout(function(){n=!1,e.apply(r,arguments)},t))}},arrayStats:r,arrayUniques:function(e,t){return r(e,t).uniques},arrayFlatten:function(e,t){return r(e,t).flattened},bisection:o,bisectionReversed:function(e,t){return o(e,t,!0)},findMax:function(e){var t,n=0,a=e.length;for(t=0;t<a;t++)e[t]>n&&(n=e[t]);return n},findMin:function(e){var t,n=1/0,a=e.length;for(t=0;t<a;t++)e[t]<n&&(n=e[t]);return n},parseRGB:function(e){return e.slice(4).slice(0,-1).split(",").map(function(e,t){return parseInt(e)})},pipeline:function(){var e=arguments,t=this;return function(n){for(var a=0;a<e.length;a++){var r=e[a].call(this,n);n=t.mergeAll(n,r)}return n}},override:function(e,t){for(var n in t)n in e&&(e[n]=t[n])},rebind:function(e){return function(){return e.on.apply(e,arguments),this}},capitalize:function(e){return e.charAt(0).toUpperCase()+e.slice(1)},getExtent:function(e,t){return e?d3[t?"min":"max"](e.map(function(e){return e.value})):null},getStackExtent:function(e,t){var n=t?"min":"max";if(e&&e.length){var a=e.map(function(e){return d3.sum(e.value)});return d3[n](a)}return null},getMultiExtent:function(e,t){var n=t?"min":"max";if(e&&e.length){var a=e.map(function(e,t){return e.value});return a[0].length&&(a=d3.merge(a)),d3[n](a)}return null}},function(e,t){var n={currentBaseURI:"https://data.planetos.com/",baseURI:"https://api.planetos.com/v1a/",datasetsEndpoint:"https://api.planetos.com/v1/datasets/",apiKey:null},a=function(e){return{type:"FeatureCollection",features:e.map(function(e){return{type:"Feature",geometry:{type:"Point",coordinates:e.coordinates},properties:{id:e.id}}})}};var r=function(e,t){var n=t||function(e,t){return 0};return Array.apply(null,Array(e)).map(n)},o=function(n){var a={count:(n=n||{}).count||12,layerCount:n.layerCount||1,timeStart:n.timeStart||"2016-01-01",timeIncrement:n.timeIncrement||"month",step:n.step||1,min:n.min||0,max:n.max||100},r="utc"+e.utils.capitalize(a.timeIncrement)||"utcHour",o=t[r],i=t[r+"s"],l=a.timeStart?new Date(a.timeStart):new Date;return i(l,o.offset(l,a.count*a.step),a.step).map(function(e,n){return t.isoFormat(e)})},i=function(e,t){var n="undefined"!=typeof XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");n.open("get",e,!0),n.onreadystatechange=function(){var e,a;4==n.readyState&&(200==(e=n.status)?(a=JSON.parse(n.responseText),t(null,a)):t(e))},n.send()};function l(e){if(e)return!0;throw"You need to set an API key using `datahub.data.setApiKey(API_KEY)`. You can get yours at http://data.planetos.com/"}e.data={generateRaster:function(){var t={lon:r(360,function(e,t){return t-180}),lat:r(180,function(e,t){return 180-t-90}),values:r(180,function(e,t){return r(360,function(e,t){return~~(100*Math.random())})})};return t.uniqueValues=e.utils.arrayUniques(t.values),t},generateGeojson:function(){return{type:"Feature",properties:{name:""},geometry:{type:"LineString",coordinates:[[-170,80],[170,80],[170,-80],[-170,-80],[-170,80]]}}},generateTimeSeries:function(e){var t={count:(e=e||{}).count||12,layerCount:e.layerCount||1,timeStart:e.timeStart||"2016-01-01",timeIncrement:e.timeIncrement||"month",step:e.step||1,min:e.min||0,max:e.max||100},n=~~(Math.random()*(t.max-t.min))+t.min,a=r(t.count,function(){return r(t.layerCount,function(e){return n+=(2*Math.random()-1)*((t.max-t.min)/10),n=Math.max(n,t.min)})});return o(t).map(function(e,t){return{timestamp:e,value:a[t],id:a[t].map(function(e){return~~(1e3*Math.random())}),className:a[t].map(function(e){return Math.random().toString(36).substring(4,8)})}})},generateTimeSeriesSplit:function(e){var t={count:(e=e||{}).count||12,layerCount:e.layerCount||1,timeStart:e.timeStart||"2016-01-01",timeIncrement:e.timeIncrement||"month",step:e.step||1,min:e.min||0,max:e.max||100},n=~~(Math.random()*(t.max-t.min))+t.min;return r(t.layerCount,function(){var e,a={},i=o(t);return a.data=r(t.count,function(e,a){return n+=(2*Math.random()-1)*((t.max-t.min)/10),n=Math.max(n,t.min),{value:n=Math.min(n,t.max),timestamp:i[a]}}),a.metadata={id:(e=8,Math.random().toString(36).substring(4,e+4||8))},a})},generateTimestamps:o,generateWeatherChartData:function(){var e={layerCount:1,count:10,timeIncrement:"minute",min:0,max:50},t=x.utils.mergeAll({},e,{layerCount:1,count:100,timeIncrement:"hour"});return{historical:{wind:x.data.generateTimeSeriesSplit(e)[0],windDirection:x.data.generateTimeSeriesSplit(e)[0],wave:x.data.generateTimeSeriesSplit(e)[0],tide:x.data.generateTimeSeriesSplit(e)[0],bottomAxis:x.data.generateTimeSeriesSplit(e)[0],topAxis:x.data.generateTimeSeriesSplit(e)[0]},forecast:{wind:x.data.generateTimeSeriesSplit(t)[0],windDirection:x.data.generateTimeSeriesSplit(t)[0],wave:x.data.generateTimeSeriesSplit(t)[0],tide:x.data.generateTimeSeriesSplit(t)[0],bottomAxis:x.data.generateTimeSeriesSplit(t)[0],topAxis:x.data.generateTimeSeriesSplit(t)[0]}}},getDatasetDetails:function(e,t){l(n.apiKey);var a=n.baseURI+"/datasets/"+e+"?apikey="+n.apiKey;return console.log("get dataset details",a),i(a,function(e,n){if(void 0===n)return console.log("Can not render dataset because of API error",e),!1;var a="grid"===(n.FeatureType||"timeseries").toLowerCase().trim()?"raster":"timeseries";console.log("Data type:",a,n.ProductType,n.FeatureType,n),t({datasetInfo:n,dataType:a,productType:n.ProductType})}),this},getVariables:function(e,t,a){l(n.apiKey);var r=n.baseURI+"/datasets/"+e+"/variables?apikey="+n.apiKey;return console.log("query variables",r),i(r,function(n,r){var o,i=r[e],l=t;l&&(o=i.filter(function(e){return e.name===l})[0]);var s=o||i[0];a({variables:i,defaultVariable:s})}),this},getTimestamps:function(e,t,a){l(n.apiKey);var r=n.baseURI+"/datasets/"+e+"/variables/"+encodeURIComponent(t)+"/timestamps?apikey="+n.apiKey;return console.log("query timestamps",r),i(r,function(e,t){if(e)console.log("Server error",e);else{var n=t.map(function(e){return new Date(parseInt(e))});a({timestamps:n})}}),this},getPreview:function(t,a,r,o){l(n.apiKey);var s=n.baseURI+"/datasets/"+t+"/variables/"+encodeURIComponent(a);return r&&(s+="/timestamps/"+r),s+="/sample_data",s+="?apikey="+n.apiKey,console.log("query dataset",s),i(s,function(r,i){if(r)console.log("Server error",r);else{i.values=i.values.map(function(e,t){return e.map(function(e){return-999===e?null:e})}),i.uniqueValues=e.utils.arrayUniques(i.values).sort();var l=n.currentBaseURI+"/datasets/"+t+"?variable="+a;o({json:i,uri:s,datahubLink:l})}}),this},getStations:function(e,t){l(n.apiKey);var a=n.datasetsEndpoint+e+"/stations?apikey="+n.apiKey;return console.log("get stations",a),i(a,function(e,n){if(e)console.log("Server error",e);else{var a=[];for(var r in n.station){var o=n.station[r];void 0!==o.SpatialExtent&&a.push({id:r,coordinates:o.SpatialExtent.coordinates})}t({stations:a,defaultStation:a[0]})}}),this},getStationVariables:function(e,t,a,r,o){l(n.apiKey);var s=n.datasetsEndpoint+e+"/stations/"+t+"?apikey="+n.apiKey+"&verbose=true&count=500";return r||(s+="&time_order=desc"),console.log("station variable",s),i(s,function(t,r){if(t)console.log("Server error",t);else{console.log("Point API data",r,s);var i,l,u={},c=[],d=r.metadata.contexts;for(var m in d){i=d[m].dataVariables,d[m].axes&&Object.keys(d[m].axes)&&Object.keys(d[m].axes).map(function(e,t){return e.toLowerCase().trim()}).indexOf("time")>-1&&(c=c.concat(Object.keys(i)));for(var g in i)(l=i[g]).key=g,u[g]=l}var p={};r.entries.forEach(function(e){for(var t in e.data)p[t]||(p[t]={values:[],timestamps:[]}),p[t].values.push(e.data[t]),p[t].timestamps.push(new Date(e.axes.time))});var f=[];for(var h in u)f.push(u[h]);var v=n.currentBaseURI+"/datasets/"+e+"?variable="+a;o({datasets:p,variablesMetadata:u,variables:f,datahubLink:v,variableData:p[a],variableMetadata:u[a],timeVariableIDs:c})}}),this},getImage:function(e,t,a,r,o){l(n.apiKey);var s=n.baseURI+"/datasets/"+e+"/variables/"+encodeURIComponent(t);return a&&(s+="/timestamps/"+a),s+="/image",s+="?width="+r+"&projection=mercator",s+="&apikey="+n.apiKey,console.log("query image",s),i(s,function(e,t){o(t.img,t.metadata)}),this},getJSON:i,apiConfig:n,pointsToFeatures:a,generateGeojsonPoints:function(){var e=r(50,function(e,t){return{coordinates:[360*Math.random()-180,180*Math.random()-90],id:"random-point-"+t}});return a(e)},getWorldVector:function(e){i("https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json",function(t,n){e(n)})},setApiKey:function(e){return n.apiKey=e,this},setApiConfig:function(e){return n=x.utils.mergeAll(n,e),this}}}(x,S.d3),i=x,l=S.d3,s=S.colorBrewer.schemeSpectral[11].reverse(),u=function(e,t){var n,a,r,o=(n=e,a=t.length,(r=l.scaleQuantile().domain(n).range(l.range(a-1)).quantiles()).push(l.max(n)),r.unshift(l.min(n)),r);return l.scaleLinear().domain(o).range(t)},c=function(e,t){var n=(l.max(e)-l.min(e))/t;return l.range(t).map(function(t,a){return l.min(e)+a*n})},d={grayscale:function(e){return l.scaleLinear().domain(l.extent(e)).range(["white","black"])},equalizedSpectral:function(e){return u(e,s)},equalizedGrayscale:function(e){return u(e,(t=["white","black"],n=10||t.length,a=l.scaleLinear().domain([0,n-1]).range(t),l.range(n).map(a)));var t,n,a},reversedBrewerSpectral:function(e){if(l.min(e)>=0)return l.scaleLinear().domain(c(e,s.length)).range(s.slice().reverse());var t=c(e.filter(function(e){return e<=0}),s.length/2-1),n=c(e.filter(function(e){return e>0}),s.length/2-1),a=t.concat([0]).concat(n),r=s.slice().reverse();return l.scaleLinear().domain(a).range(r)}},i.palette=d,m=x,g=S.d3,p=m.utils.pipeline(function(e){return{margin:e.margin||{right:20,left:20},unit:null,colorScale:e.colorScale||palette.equalizedSpectral}},function(e){var t=e.parent.querySelector(".datahub-legend");t||(t=m.utils.appendHtmlToNode('<div class="datahub-legend"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"><g class="panel"><defs><linearGradient id="legend-gradient"></linearGradient></defs><rect class="color-band" fill="url(#legend-gradient)" /><g class="axis"></g><text class="unit"></text></g></svg></div>',e.parent));var n=g.select(t),a=e.width||t.offsetWidth,r=e.height||t.offsetHeight;n.select("svg").attr("width",a).attr("height",r);n.select(".panel").attr("transform","translate("+e.margin.left+",0)");return{container:n,width:a,height:r,legendWidth:a-e.margin.left-e.margin.right}},function(e){if(!e.data)return{};var t,n;return t=e.colorScale(e.data).domain(),n=g.range(0,t.length),{legendColorScale:e.colorScale(n),labelValues:t,colors:n}},function(e){if(!e.data)return{};var t=e.container.select("#legend-gradient").selectAll("stop").data(e.colors);return t.enter().append("stop").merge(t).attr("offset",function(t,n){return n*(100/(e.colors.length-1))+"%"}).attr("stop-color",function(t){return e.legendColorScale(t)}),t.exit().remove(),e.container.select(".color-band").attr("width",e.legendWidth).attr("height",e.height/2),{}},function(e){if(!e.data)return{};var t=e.container.select(".axis").selectAll("text.tick-label").data(e.labelValues),n=t.enter().append("text").classed("tick-label",!0).merge(t).attr("x",function(t,n){return n*(e.legendWidth/(e.labelValues.length-1))}).attr("y",.7*e.height).attr("dy","0.5em").text(function(e){return e.toPrecision(3)});t.exit().remove(),n.attr("dx",function(e,t){return-this.getBBox().width/2});var a=e.container.select(".axis").selectAll("line.tick-line").data(e.labelValues),r=a.enter().append("line").classed("tick-line",!0).merge(a).attr("x1",function(t,n){return n*(e.legendWidth/(e.labelValues.length-1))}).attr("y1",e.height/2).attr("x2",function(t,n){return n*(e.legendWidth/(e.labelValues.length-1))}).attr("y2",.55*e.height);return a.exit().remove(),r.attr("dx",function(e,t){return-this.getBBox().width/2}),e.unit&&e.container.select(".unit").attr("y",.95*e.height).text(e.unit),{}}),m.colorLegend=function(e){var t,n=~~(1e4*Math.random()),a=m.utils.throttle(function(){t.width=t.parent.clientWidth,o()},200);g.select(window).on("resize."+n,a);var r,o=function(){p(t)},i=function(e){return t=m.utils.mergeAll(t,e),o(),this};return r=e,i(m.utils.mergeAll({},r)),{setConfig:i,render:o,setData:function(e){var n=e?JSON.parse(JSON.stringify(e)):{};return(t=m.utils.mergeAll({},t)).data=n,o(),this},destroy:function(){g.select(window).on("resize."+n,null),t.parent.innerHTML=null}}},f=x,h=S.d3,v=S.leaflet,y=function(){var e=null,t=null,n=null,a=null,r=null,o=null,i=v.DomUtil.create("canvas","data-grid-layer");i.style.display="none",document.body.appendChild(i);var l={};return l.render=function(r){if(a=E=r||a,!E)return l;var o=t.getBounds(),s=t.getPixelOrigin(),u=t.getPixelWorldBounds(),c=t.getSize(),d=c.y;t._zoom<c.y/512&&(d=u.max.y-u.min.y),console.log("Start rendering..."),console.time("render");var m=E.lat,g=E.lon,p=E.values;i.width=c.x,i.height=d;for(var h,y,b,x,S,w,C,k,M=i.getContext("2d"),T=Math.max(f.utils.bisectionReversed(m,o.getNorth())-1,0),L=Math.min(f.utils.bisectionReversed(m,o.getSouth()),m.length-1),P=Math.max(f.utils.bisection(g,o.getWest())-1,0),D=Math.min(f.utils.bisection(g,o.getEast())+1,g.length-1),I=t.latLngToContainerPoint([m[T],g[Math.max(P,0)]]),A=t.latLngToContainerPoint([m[T],g[Math.min(P+1,g.length-1)]]),B=Math.ceil(Math.max(A.x-I.x,1))+2,O=M.getImageData(0,0,c.x,d),N=new ArrayBuffer(O.data.length),z=new Uint8ClampedArray(N),E=new Uint32Array(N),U=0;U<m.length;U++)if(!(U<T||U>L)){w=Math.max(U,0),C=Math.min(w+1,m.length-1);for(var _=t.latLngToContainerPoint([m[w],g[P]]),R=t.latLngToContainerPoint([m[C],g[P]]),V=Math.ceil(Math.max(R.y-_.y,1)+1),j=0;j<g.length;j++)if(j>=P&&j<D&&(k=Math.max(j,0),x=t.latLngToContainerPoint([m[w],g[k]]),t._zoom<c.y/512&&(x.y=x.y+s.y-t._getMapPanePos().y),-999!==(S=p[w][k])&&null!==S&&!isNaN(S)&&U%1==0&&j%1==0))for(h=f.utils.parseRGB(e(S)),y=0;y<B;y++)for(b=0;b<V;b++)E[(~~x.y+b-~~(V/2))*c.x+Math.min(Math.max(~~x.x+y-~~(B/2),0),c.x-1)]=255<<24|h[2]<<16|h[1]<<8|h[0]}return O.data.set(z),M.putImageData(O,0,0),n&&n.removeFrom(t),(n=v.imageOverlay(i.toDataURL("image/png"),o).addTo(t)).setOpacity(.8),console.timeEnd("render"),l},l.setColorScale=function(t){return e=t,l},l.setData=function(e){return l.render(e),l},l.addTo=function(e){return(t=e).on("moveend",function(e){var n=e.target._panes.overlayPane.querySelector("img");if(n){var a=n.style,i=a.transform;if(i){var s=i.match(/\((.*)\)/)[1].split(",").slice(0,2);a.transform="translate("+s+")"}}var u=e.target._zoom,c=u!==r;r=u;var d=t.getBounds(),m=JSON.stringify(d)!==JSON.stringify(o);o=d,(c||m)&&l.render()}),l},l},b=function(e){var t=v.DomUtil.create("div","datahub-map"),n={container:e.parent.appendChild(t),colorScale:e.colorScale,clusterMarkers:e.clusterMarkers,basemapName:e.basemapName||"basemapDark",imagePath:e.imagePath||"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.2/images/",showLabels:!(!1===e.showLabels),showTooltip:!(!1===e.showTooltip),polygonTooltipFunc:e.polygonTooltipFunc},a={maxBounds:[[-90,-180],[90,180]],maxZoom:13,minZoom:1,scrollWheelZoom:!1,zoomSnap:0,zoomDelta:.5,attributionControl:!1,fadeAnimation:!1,tileLayer:{noWrap:!0,continuousWorld:!1}};f.utils.merge(a,e.mapConfig);var r,o,i,l,s,u,c=h.dispatch("click","mousemove","mouseenter","mouseleave","featureClick","featureMousEnter","featureMousLeave","markerClick"),d={isVisible:!0};function m(e){var t=v.geoJson(e);return r.fitBounds(t.getBounds()),u=e,this}function g(e){if(i=v.geoJson(e,{onEachFeature:function(e,t){t.on({click:function(e){c.call("featureClick",this,{id:e.target.feature.properties.id,lat:e.target._latlng?e.target._latlng.lat:e.latlng.lat,lon:e.target._latlng?e.target._latlng.lng:e.latlng.lng,layer:e})},mouseover:function(e,t,n){c.call("featureMousEnter",this,{x:e.containerPoint.x,y:e.containerPoint.y,lat:e.latlng.lat,lon:e.latlng.lng,value:e.target.feature.properties.id})},mouseout:function(e){c.call("featureMousLeave",this,{x:e.containerPoint.x,y:e.containerPoint.y,lat:e.latlng.lat,lon:e.latlng.lng,value:e.target.feature.properties.id})}})},pointToLayer:function(e,t){return new v.CircleMarker(t,{radius:4,fillColor:"#05A5DE",color:"#1E1E1E",weight:1,opacity:.5,fillOpacity:.4})}}),n.polygonTooltipFunc&&i.bindTooltip(n.polygonTooltipFunc),n.clusterMarkers){var t=v.markerClusterGroup({chunkedLoading:!0});t.addLayer(i),r.addLayer(t)}else r.addLayer(i);return this}function p(){return l&&l.remove(),this}return{init:function(){v.Icon.Default.imagePath=n.imagePath,r=v.map(n.container,a).on("click",function(e){c.call("click",this,{lat:e.latlng.lat,lon:e.latlng.lng})}).on("mousedown",function(e){n.container.classList.add("grab")}).on("mouseup",function(e){n.container.classList.remove("grab")}).on("mousemove",function(e){if(s){var t=f.utils.bisectionReversed(s.lat,e.latlng.lat),a=f.utils.bisection(s.lon,e.latlng.lng),r=Math.max(t-1,0),o=s.lat[r]-s.lat[t];e.latlng.lat>s.lat[t]+o/2&&(t=r);var l=Math.max(a-1,0),u=s.lon[a]-s.lon[l];e.latlng.lng<s.lon[a]-u/2&&(a=l);var d=null;if(e.latlng.lat<=s.lat[0]&&e.latlng.lat>=s.lat[s.lat.length-1]&&e.latlng.lng>=s.lon[0]&&e.latlng.lng<=s.lon[s.lon.length-1]&&(d=s.values[t][a]),null!==d&&-999!==d&&n.showTooltip){var m=v.Util.formatNum(d,2);i.setTooltipContent(m+"").openTooltip([e.latlng.lat,e.latlng.lng])}else i.closeTooltip();c.call("mousemove",this,{x:e.containerPoint.x,y:e.containerPoint.y,value:d,lat:e.latlng.lat,lon:e.latlng.lng})}}).on("mouseover",function(e){c.call("mouseenter",this,arguments)}).on("mouseout",function(e){c.call("mouseleave",this,arguments)}),e.mapConfig&&e.mapConfig.zoom||r.fitWorld(),r.createPane("labels");var t={};t.basemapDark=v.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",{attribution:"©OpenStreetMap, ©CartoDB",tileSize:256,maxZoom:19}),t.basemapLight=v.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",{attribution:"©OpenStreetMap, ©CartoDB",tileSize:256,maxZoom:19}),t.labelLight=v.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",{attribution:"©OpenStreetMap, ©CartoDB",pane:"labels"}),t[n.basemapName].addTo(r),n.showLabels&&t.labelLight.addTo(r),o=y().addTo(r);var i=v.featureGroup().bindTooltip("").addTo(r);return this},show:function(){return n.container.style.display="block",d.isVisible=!0,this},hide:function(){return n.container.style.display="none",d.isVisible=!1,this},resize:function(){return r.invalidateSize(),u?m(u):r.fitWorld(),this},zoomToPolygonBoundingBox:m,addMarker:function(e){return p(),l=v.marker(e,{interactive:!0,draggable:!0,opacity:1}).on("click",function(e){c.call("markerClick",this,arguments)}).addTo(r),this},removeMarker:p,renderPolygon:g,renderImage:function(e,t){var n=t.bbox,a=[[n.latMax,n.lonMin],[n.latMin,n.lonMax]];return v.imageOverlay(e,a).addTo(r),this},renderRaster:function(e){s=e;var t=e.uniqueValues.sort(function(e,t){return e-t}),a=n.colorScale(t);return o.setColorScale(a).setData(e),this},renderVectorMap:function(){return x.data.getWorldVector(function(e){g(e)}),this},isVisible:d.isVisible,hideZoomControl:function(e){return e?(r.addControl(r.zoomControl),r.doubleClickZoom.enable(),r.boxZoom.enable(),r.dragging.enable()):(r.removeControl(r.zoomControl),r.doubleClickZoom.disable(),r.boxZoom.disable(),r.dragging.disable()),this},on:f.utils.rebind(c),_getMap:function(){return r}}},f.map={rasterMap:b,selectorMap:function(e){var t=b(e).init(),n=h.dispatch("mapCloseClick","rectangleDraw","rectangleClick","markerClick","markerDraw","geojsonClick"),a=t._getMap();a.zoomControl.setPosition("bottomright");var r=v.Control.extend({position:"topright",onAdd:function(e){var t=v.DomUtil.create("a","map-close leaflet-bar leaflet-control leaflet-control-custom");return t.onclick=function(e){n.call("mapCloseClick",this,e)},t}});a.addControl(new r);var o=new v.FeatureGroup;a.addLayer(o);var i=new v.Control.Draw({edit:{featureGroup:o,edit:!1,remove:!1},draw:{polygon:!1,circle:!1,polyline:!1,marker:{icon:new v.Icon.Default,zIndexOffset:2e3,repeatMode:!0},rectangle:{shapeOptions:{fillColor:"#128DE0",color:"#128DE0",opacity:.5},repeatMode:!0}}});function l(e){v.marker(e,{interactive:!0}).on("click",function(e){s(),c(),n.call("markerClick",this,e)},this).addTo(o),c()}function s(){return o.clearLayers(),i._toolbars.draw._modes.rectangle.handler.disable(),i._toolbars.draw._modes.marker.handler.disable(),this}function u(e,t){return v.GeoJSON.geometryToLayer(e).on("click",function(e){o.removeLayer(this),t&&t(this),c()},this).addTo(o),this}function c(){if(e.disableAutoZoom)return this;var t=o.getBounds();return t._southWest?a.fitBounds(t):a.fitWorld(),this}return a.addControl(i),a.on("draw:created",function(e){var t=e.layer;if(s(),"rectangle"===e.layerType&&(t.addTo(o).on("click",function(e){s(),c(),n.call("rectangleClick",this,e)},this),n.call("rectangleDraw",this,t.getBounds()),c()),"marker"===e.layerType){var a=t.getLatLng();l(a),n.call("markerDraw",this,a)}},this),t.addRectangle=function(e){var t;return s(),u({type:"Feature",geometry:{type:"Polygon",coordinates:[(t=e).concat([t[0]])]},properties:{}},function(){n.call("rectangleClick",this,arguments)}),c(),this},t.addPolygons=function(e){return s(),e.forEach(function(e){var t;e[1].id=e[0],u({type:"Feature",geometry:{type:(t=e[1]).type,coordinates:t.coordinates},properties:{}},function(){n.call("geojsonClick",this,e)})}),c(),this},t.removeAllPolygons=s,t.zoomToBoundingBox=c,t.addMarker=l,t.on=f.utils.rebind(n),t}},"object"==typeof module&&module.exports&&(module.exports=e)}("undefined"==typeof datahub?datahub={}:datahub);