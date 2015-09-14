var _ = require('underscore');

var isNullOrUndefined = function (object) {
    return _.isNull(object) || _.isUndefined(object);
};

var isNullOrUndefinedOrEmpty = function (a) {
    return isNullOrUndefined(a) || !String(a).trim().length;
};

module.exports = {
    match: function (src, pattern) {

        if (isNullOrUndefinedOrEmpty(src)) return;

        var obj = {};
        var vars = [];
        var __vars;

        var components = (__vars = new RegExp(_.map(pattern.split(/(\$\{.+?\})+?/g), function (val) {
            var comps = /^\$\{(.+?)\}$/g.exec(val);
            if (comps && comps.length === 2) {
                vars.push(comps[1]);
                return '(.+)?';
            }

            return val;
        }).join(''))).exec(src);

        if (components && components.length === vars.length + 1) {
            components.shift();
            components.forEach(function (val, i) {
                obj[vars[i]] = val;
            });

            return obj;
        }
    },
    CONTAINS_ANY: 1,
    CONTAINS_ALL: 2,
    searchAndMatch: function (src, patterns, required, search_mode) {

        if (typeof src === 'string' && Array.isArray(patterns)) {
            src = {s: src};
            patterns = {s: patterns};
        }

        for (var k in patterns) {
            if (isNullOrUndefinedOrEmpty(!src[k])) {
                continue;
            }

            for (var i = 0; i < patterns[k].length; i++) {

                var parsed = this.match(src[k], patterns[k][i]);

                if (parsed) {
                    var found = 0;

                    for (var g = 0; g < required.length; g++) {
                        var extracted = parsed[required[g]];
                        if (!isNullOrUndefinedOrEmpty(extracted)) {
                            found++;
                        }
                    }

                    if ((search_mode === this.CONTAINS_ANY && found) ||
                        (found === required.length)) {
                        return parsed;
                    }
                }
            }
        }
    }
};