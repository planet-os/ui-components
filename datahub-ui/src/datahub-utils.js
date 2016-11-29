(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory(module.exports);
    } else {
        root.colorScales = factory((root.datahub = root.datahub || {}));
    }
}(this, function(exports, utils) {

    var merge = function(obj1, obj2) {
        for (var p in obj2) {
            if (obj2[p] && obj2[p].constructor == Object) {
                if (obj1[p]) {
                    merge(obj1[p], obj2[p])
                    continue
                }
            }
            obj1[p] = obj2[p]
        }
    }

    var mergeAll = function() {
        var newObj = {}
        var objs = arguments
        for (var i = 0; i < objs.length; i++) {
            merge(newObj, objs[i])
        }
        return newObj
    }

    var htmlToNode = function(htmlString, parent) {
        while (parent.lastChild) { parent.removeChild(parent.lastChild) }
        return appendHtmlToNode(htmlString, parent)
    }

    var appendHtmlToNode = function(htmlString, parent) {
        return parent.appendChild(document.importNode(new DOMParser().parseFromString(htmlString, 'text/html').body.childNodes[0], true))
    }

    var once = function once(fn, context) {
        var result
        return function() {
            if (fn) {
                result = fn.apply(context || this, arguments)
                fn = null
            }
            return result
        }
    }

    var throttle = function throttle(callback, limit) {
        var wait = false
        var timer = null
        return function() {
            var that = this
            if (!wait) {
                //callback.apply(this, arguments)
                wait = true
                clearTimeout(timer)
                timer = setTimeout(function() {
                    wait = false
                    callback.apply(that, arguments)
                }, limit)
            }
        }
    }

    var reactiveProperty = function(value) {
        var listeners

        function property(newValue) {
            if (arguments.length === 1) {
                value = newValue
                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i](value)
                    }
                }
                return this
            }
            return value
        }
        property.on = function(listener) {
            if (!listeners) {
                listeners = []
            }
            listeners.push(listener)
            if (typeof value !== "undefined" && value !== null) {
                listener(value)
            }
            return listener
        }
        property.off = function(listenerToRemove) {
            if (listeners) {
                listeners = listeners.filter(function(listener) {
                    return listener !== listenerToRemove
                })
            }
        }
        return property
    }

    var flattenAndUniquify = function(data, _accessor) {
        var flattened = []
        var uniques = []
        var values, value, i, j, min = Number.MAX_VALUE,
            max = Number.MIN_VALUE
        var u = {}
        for (i = 0; i < data.length; i++) {
            values = data[i]
            for (j = 0; j < values.length; j++) {
                value = _accessor ? _accessor(values[j]) : values[j]
                flattened.push(value)
                if (u.hasOwnProperty(value) || value === null) {
                    continue
                }
                u[value] = 1
                if (value > max) {
                    max = value
                }
                if (value < min) {
                    min = value
                }
            }
        }
        uniques = Object.keys(u).map(function(d, i) {
            return +d
        })
        return { flattened: flattened, uniques: uniques, max: max, min: min }
    }

    var bisection = function(array, x, isReversed) {
        var mid, low = 0,
            high = array.length - 1
        while (low < high) {
            mid = (low + high) >> 1

            if ((isReversed && x >= array[mid]) || (!isReversed && x < array[mid])) {
                high = mid
            } else {
                low = mid + 1
            }
        }

        return low
    }

    var bisectionReversed = function(array, x) {
        return bisection(array, x, true)
    }

    var findMax = function(array) {
        var max = 0,
            a = array.length,
            counter

        for (counter = 0; counter < a; counter++) {
            if (array[counter] > max) {
                max = array[counter]
            }
        }
        return max
    }

    var findMin = function(array) {
        var min = Infinity,
            a = array.length,
            counter

        for (counter = 0; counter < a; counter++) {
            if (array[counter] < min) {
                min = array[counter]
            }
        }
        return min
    }

    var parseRGB = function(rgb) {
        return rgb.slice(4).slice(0, -1).split(',').map(function(d, i) {
            return parseInt(d)
        })
    }

    exports.utils = {
        merge: merge,
        mergeAll: mergeAll,
        htmlToNode: htmlToNode,
        appendHtmlToNode: appendHtmlToNode,
        once: once,
        throttle: throttle,
        reactiveProperty: reactiveProperty,
        flattenAndUniquify: flattenAndUniquify,
        bisection: bisection,
        bisectionReversed: bisectionReversed,
        findMax: findMax,
        findMin: findMin,
        parseRGB: parseRGB
    }

}))