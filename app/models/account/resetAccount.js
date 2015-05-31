define(['models/entity', 'models/serializable', 'models/controls/emailControl', 'models/controls/passwordControl'],
    function (entity, serializable, emailControl, passwordControl) {

        var model = function ResetAccount(options) {

            options = options || {};

            var self = this;

            entity.call(self, options);

            self.email = new emailControl({ label: 'Email', placeholder: 'my-email@address.com', value: options.email, validation: { required: { message: 'Required' }, email: { message: 'Invalid address' } }, readonly: !!options.token, serializable: true });
            self.password = new passwordControl({ label: 'Password', value: options.password, validation: { required: { message: 'Required' }, minLength: { message: 'Too short', params: 6 }, maxLength: { message: 'Too long', params: 12 } }, serializable: true });
            self.token = ko.observable(options.token).extend({ serializable: true });

            serializable.call(self);

        };

        return model;

    }
);