define(['services/datacontext', 'managers/navigationManager', 'models/account/registerAccount'],
    function (datacontext, navigationManager, registerAccount) {

        var hash = {
            login: navigationManager.routes.login.hash
        };

        var entity = ko.validatedObservable(new registerAccount()).extend({ serializable: true });
        entity.loading = ko.observable(false);

        var vm = {
            activate: activate,
            entity: entity,
            submit: submit,
            hash: hash
        };

        return vm;

        function activate(context) {
            if (context && context.token) {
                entity.loading(true);
                datacontext.account.validateRegisterToken({ token: context.token })
                    .then(function (data) {
                        entity(new registerAccount({
                            email: data.email,
                            token: context.token
                        }));
                    })
                    .always(function () {
                        entity.loading(false);
                    });
            } else {
                entity(new registerAccount({
                    token: context && context.token
                        ? context.token
                        : null
                }));
            }

            return true;
        }

        function submit() {
            entity.loading(true);
            return datacontext.account.register(entity.serialize())
                .then(function () {
                    navigationManager.router.navigate(navigationManager.routes.register.confirm.hash);
                })
                .always(function () {
                    entity.loading(false);
                });
        }
    }
);