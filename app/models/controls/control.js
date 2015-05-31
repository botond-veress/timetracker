define(['models/unique', 'models/validated'],
    function (unique, validated) {

        var model = function (options) {

            options = options || {};

            var self = this;

            self.label = assignVariable(options.label || null);
            self.placeholder = assignVariable(options.placeholder || null);
            self.value = assignVariable(options.value).extend({ serializable: options.serializable || false });
            self.type = assignVariable(options.type || 'text');
            self.readonly = assignVariable(options.readonly || false);
            self.update = assignVariable(options.update || 'afterkeydown');
            self.template = assignVariable(options.template || null);
            self.template.src = ko.computed(function () {
                return self.template() && self.template().id
                    ? self.template().id
                    : null;
            });
            self.template.params = ko.computed(function () {
                return self.template() && self.template().params
                    ? self.template().params
                    : null;
            });
            self.css = ko.computed(function () {
                var css = 'text';
                if (self.type() != css) {
                    css += ' ' + self.type();
                }
                if (self.template.src()) {
                    css += ' templated';
                }
                return css;
            });
            
            unique.call(self, options);
            validated.call(self, options);

            self.serialize = function () {
                return self.value();
            };

        };

        return model;

    }
);