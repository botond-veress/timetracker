define(['models/controls/control'],
    function (control) {

        var model = function TextControl(options) {

            options = options || {};;

            var self = this;

            control.call(self, options);

        };

        return model;

    }
);