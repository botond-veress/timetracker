define(['models/entity', 'models/serializable', 'models/controls/emailControl'],
    function (entity, serializable, emailControl) {

        var model = function RecoverAccount(options) {

            options = options || {};

            var self = this;

            entity.call(self, options);

            var claim = options.claim || {};
            self.email = new emailControl({ label: 'Email', placeholder: 'my-email@address.com', value: claim.email, validation: { required: { message: 'Required' }, email: { message: 'Invalid address' } }, serializable: true });
            
            serializable.call(self);

        };

        return model;

    }
);