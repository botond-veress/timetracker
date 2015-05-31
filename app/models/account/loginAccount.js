define(['models/entity', 'models/serializable', 'models/controls/emailControl', 'models/controls/passwordControl', 'models/controls/checkboxControl'],
    function (entity, serializable, emailControl, passwordControl, checkboxControl) {

        var model = function LoginAccount(options) {

            options = options || {};

            var self = this;

            entity.call(self, options);

            var claim = options.claim || {
                email: 'email@address.com',
                password: 'password'
            };
            self.email = new emailControl({ label: 'Email', placeholder: 'my-email@address.com', value: claim.email, validation: { required: { message: 'Required' }, email: { message: 'Invalid address' } }, serializable: true });
            self.password = new passwordControl({ label: 'Password', value: claim.password, template: { id: 'forgot-password-template', params: options.params }, validation: { required: { message: 'Required' }, minLength: { message: 'Too short', params: 6 }, maxLength: { message: 'Too long', params: 12 } }, serializable: true });
            self.remember = new checkboxControl({ label: "Remember me", value: options.remember || false, serializable: true });

            serializable.call(self);

        };

        return model;

    }
);