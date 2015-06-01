define([],
    function () {

        var model = function ListItemClient(options) {

            options = options || {};

            var self = this;

            self.id = assignVariable(options.id || 0);
            self.name = assignVariable(options.name || 'Undefined client');
            self.hash = assignVariable(options.hash || null);

        };

        return model;

    }
);