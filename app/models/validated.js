define([],
    function () {

        var model = function (options) {

            var self = this;

            if (options.validation && ko.isObservable(self.value)) {
                var shouldValidate = true;
                if (options.validation.hasOwnProperty('shouldValidate')) {
                    shouldValidate = ko.utils.unwrapObservable(options.validation.shouldValidate);
                    delete options.validation.shouldValidate;
                }
                if (shouldValidate) {
                    self.value = self.value.extend(options.validation);
                } else if (options.validation && options.validation.hasOwnProperty('validation')) {
                    var validation = {
                        validation: options.validation.validation
                    };
                    self.value = self.value.extend(validation);
                }
            }

        };

        return model;

    }
);