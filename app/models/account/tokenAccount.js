define(['models/serializable'],
    function (serializable) {

        var model = function TokenAccount(options) {

            options = options || {};

            var self = this;

            self.email = assignVariable(options.email).extend({ serializable: true });
            self.first = assignVariable(options.first).extend({ serializable: true });
            self.last = assignVariable(options.last).extend({ serializable: true });
            self.remember = assignVariable(options.remember || false).extend({ serializable: true });
            self.token = assignVariable(options.token || null).extend({ serializable: true });

            self.display = ko.computed(function () {
                return self.first() && self.last() ? self.first() + ' ' + self.last() : self.email();
            });

            serializable.call(self);

        };

        return model;

    }
);