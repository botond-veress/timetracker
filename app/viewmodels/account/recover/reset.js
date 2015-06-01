define(['services/datacontext', 'managers/navigationManager', 'models/account/tokenAccount', 'models/account/resetAccount'],
    function (datacontext, navigationManager, tokenAccount, resetAccount) {

        var hash = {
            login: navigationManager.routes.login.hash
        };

        var entity = ko.validatedObservable(new resetAccount()).extend({ serializable: true });
        entity.loading = ko.observable(false);

        var vm = {
            activate: activate,
            canActivate: canActivate,
            entity: entity,
            submit: submit,
            hash: hash
        };

        return vm;

        function canActivate(context) {
            return !!context && !!context.token;
        }

        function activate(context) {
            entity.loading(true);
            datacontext.account.validateResetToken({ token: context.token })
                .then(function (data) {
                    entity(new resetAccount({
                        email: data.email,
                        token: context.token
                    }));
                })
                .always(function () {
                    entity.loading(false);
                });
            return true;
        }

        function submit() {
            entity.loading(true);
            return datacontext.account.reset(entity.serialize())
                .then(function () {
                    navigationManager.claim(new tokenAccount({
                        email: entity().email.value()
                    }));
                    navigationManager.router.navigate(navigationManager.routes.login.hash);
                })
                .always(function () {
                    entity.loading(false);
                });
        }
    }
);