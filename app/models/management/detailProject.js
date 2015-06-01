define(['models/entity', 'models/serializable', 'models/controls/textControl'],
    function (entity, serializable, textControl) {

        var model = function DetailProject(options) {

            options = options || {};

            var self = this;

            self.id = ko.observable(options.id);
            self.name = new textControl({ label: 'Name', placeholder: 'Project Sparta', value: options.name, css: 'secondary', validation: { required: { message: 'Required' } }, serializable: true });
            self.description = new textControl({ label: 'Description', placeholder: 'Some description about the project', value: options.description, css: 'secondary', validation: { maxLength: { params: 255, message: 'Too long' } }, serializable: true });
            self.users = assignArrayVariable(options.projects || []);

            entity.call(self, options);
            serializable.call(self);

        };

        return model;

    }
);