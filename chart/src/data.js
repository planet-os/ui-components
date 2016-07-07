piper.data = function(_config){
    var config = {
        data: null
    };
    piper.utils.override(config, _config);

    var dataConverted = config.data.timestamps.map(function(d, i){
        return {
            x: d,
            y: config.data.values[i]
        }
    });

    var allNulls = !dataConverted
        .filter(function(d) {
            return d.y != null;
        })
        .length;

    return {
        dataConverted: dataConverted,
        dataIsAllNulls: allNulls
    };
};