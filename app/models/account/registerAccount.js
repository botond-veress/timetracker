define(['models/entity', 'models/serializable', 'models/controls/emailControl', 'models/controls/passwordControl', 'models/controls/checkboxControl'],
    function (entity, serializable, emailControl, passwordControl, checkboxControl) {

        var model = function LoginAccount(options) {

            options = options || {};

            var self = this;

            entity.call(self, options);

            self.email = new emailControl({ label: 'Email', placeholder: 'my-email@address.com', value: options.email, validation: { required: { message: 'Required' }, email: { message: 'Invalid address' } }, readonly: !!options.token, serializable: true });
            self.first = new emailControl({ label: 'First name', placeholder: 'Jon', value: options.first, validation: { required: { message: 'Required' } }, serializable: true });
            self.last = new emailControl({ label: 'Last name', placeholder: 'Doe', value: options.last, validation: { required: { message: 'Required' } }, serializable: true });
            self.password = new passwordControl({ label: 'Password', value: options.password, validation: { required: { message: 'Required' }, minLength: { message: 'Too short', params: 6 }, maxLength: { message: 'Too long', params: 12 } }, serializable: true });
            self.token = ko.observable(options.token || null).extend({ serializable: true });

            serializable.call(self);

        };

        return model;

    }
);