define(['models/controls/control'],
    function (control) {

        var model = function (options) {

            options = options || {};
            options.type = 'password';
            options.placeholder = options.placeholder || '••••••';

            var self = this;

            control.call(self, options);

        };

        return model;

    }
);