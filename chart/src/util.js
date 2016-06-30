var piper = { version: '0.1.0' };

piper.utils = {
    pipeline: function() {
        var fns = arguments;
        var that = this;
        return function(config) {
            for (var i = 0; i < fns.length; i++) {
                //                    console.log(i, 'before', config);
                var cache = fns[i].call(this, config);
                config = that.mergeAll(config, cache);
                //                    console.log(i, 'after', config);
            }
            return config;
        };
    },
    override: function(_objA, _objB) {
        for (var x in _objB) {
            if (x in _objA) { _objA[x] = _objB[x]; } } },
    merge: function(obj1, obj2) {
        for (var p in obj2) {
            if (obj2[p] && obj2[p].constructor == Object) {
                if (obj1[p]) {
                    this.merge(obj1[p], obj2[p]);
                    continue;
                }
            }
            obj1[p] = obj2[p];
        }
    },
    mergeAll: function() {
        var newObj = {};
        var objs = arguments;
        for (var i = 0; i < objs.length; i++) {
            this.merge(newObj, objs[i]);
        }
        return newObj;
    },

    // from https://github.com/curran/reactive-property
    reactiveProperty: function(value) {
        var listeners;

        function property(newValue) {
            if (arguments.length === 1) {
                value = newValue;
                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i](value);
                    }
                }
                return this;
            }
            return value;
        }

        property.on = function(listener) {
            if (!listeners) {
                listeners = [];
            }
            listeners.push(listener);
            if (typeof(value) !== "undefined" && value !== null) {
                listener(value);
            }
            return listener;
        };

        property.clear = function(listenerToRemove) {
            listeners = [];
            return this;
        };

        property.off = function(listenerToRemove) {
            if (listeners) {
                listeners = listeners.filter(function(listener) {
                    return listener !== listenerToRemove;
                });
            }
        };

        return property;

    }
};
