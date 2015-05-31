define(['models/controls/control'],
    function (control) {

        var model = function (options) {

            options = options || {};
            options.type = 'email';

            var self = this;

            control.call(self, options);

        };

        return model;

    }
);