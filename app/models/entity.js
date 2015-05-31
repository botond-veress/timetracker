define([],
    function () {

        var model = function () {

            var self = this;

            self.validate = function () {

                var errors = ko.unwrap(ko.validation.group(self, { deep: true }));
                var valid = errors.length == 0;
                if (!valid) {
                    self.errors.showAllMessages();
                }

                return valid;
            };

        };

        return model;

    }
);