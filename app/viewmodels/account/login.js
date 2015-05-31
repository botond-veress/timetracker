define(['managers/navigationManager', 'models/account/loginAccount'],
    function (navigationManager, loginAccount) {

        var hash = {
            register: navigationManager.routes.register.index.hash
        };

        var entity = ko.validatedObservable().extend({ serializable: true });
        entity.loading = ko.observable(false);

        var redirect = null;

        var vm = {
            activate: activate,
            entity: entity,
            submit: submit,
            hash: hash
        };

        return vm;

        function activate(context) {
            redirect = context && context.url
                ? context.url
                : null;

            entity(new loginAccount({
                claim: navigationManager.claim(),
                remember: true,
                params: {
                    recover: navigationManager.routes.recover.index.hash
                }
            }));

            return true;
        }

        function submit() {
            entity.loading(true);
            return navigationManager.authenticate(entity.serialize(), entity().remember.value(), redirect)
                .always(function () {
                    entity.loading(false);
                });
        }
    }
);