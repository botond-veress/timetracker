define(['models/controls/control'],
    function (control) {

        var model = function (options) {

            options = options || {};
            options.type = 'checkbox';

            var self = this;

            control.call(self, options);

        };

        return model;

    }
);