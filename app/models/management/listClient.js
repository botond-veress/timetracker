define([],
    function () {

        var model = function ListClient(options) {

            options = options || {};

            var self = this;

            self.clients = assignArrayVariable(options.clients || []);

        };

        return model;

    }
);