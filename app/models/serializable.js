define([],
    function () {

        var model = function Serializable() {

            var self = this;

            self.serialize = function () {
                var data = null;
                var keys = Object.keys(self);
                for (var index in keys) {
                    var property = self[keys[index]];
                    if (property && typeof property.serialize == 'function') {
                        data = data || {};
                        data[keys[index]] = property.serialize();
                    }
                }
                return data;
            };

        };

        return model;

    }
);