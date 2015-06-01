define(['models/entity', 'models/serializable', 'models/controls/textControl'],
    function (entity, serializable, textControl) {

        var model = function DetailClient(options) {

            options = options || {};

            var self = this;

            self.id = ko.observable(options.id);
            self.name = new textControl({ label: 'Name', placeholder: 'Company Next Door Inc.', value: options.name, css: 'secondary', validation: { required: { message: 'Required' } }, serializable: true });
            self.description = new textControl({ label: 'Description', placeholder: 'Some description about the client', value: options.description, css: 'secondary', validation: { maxLength: { params: 255, message: 'Too long' } }, serializable: true });
            self.projects = assignArrayVariable(options.projects || []);

            entity.call(self, options);
            serializable.call(self);

        };

        return model;

    }
);