piper.data = function(_config){
    var config = {
        data: null
    };
    piper.utils.override(config, _config);

    var dataConverted = config.data.map(function(d, i){
        return {
            x: i,
            y: d
        }
    });

    return {
        dataConverted: dataConverted
    };
};

piper.dataTime = function(_config){
    var config = {
        data: null
    };
    piper.utils.override(config, _config);

    var dataConverted = config.data.map(function(d, i){
        return {
            x: d.timestamp,
            y: d.value
        }
    });

    return {
        dataConverted: dataConverted
    };
};

piper.dataTimeFromSeparateArrays = function(_config){
    var config = {
        data: null
    };
    piper.utils.override(config, _config);

    var dataConverted = config.data.timestamps.map(function(d, i){
        return {
            x: d.getTime(),
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

piper.dataGrouped = function(_config){
    var config = {
        data: null
    };
    piper.utils.override(config, _config);

    var dataConverted = config.data.map(function(d, i){
        return {
            x: i,
            groupName: d.key,
            y: d.values.map(function(dB, iB){ return dB.value; })
        }
    });

    var dataFlat = d3.merge(dataConverted.map(function(d, i){ return d.y; }));

    return {
        dataConverted: dataConverted,
        dataFlat: dataFlat
    };
};