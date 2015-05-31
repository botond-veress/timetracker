define(['services/datacontext', 'managers/navigationManager', 'models/account/recoverAccount'],
    function (datacontext, navigationManager, recoverAccount) {

        var hash = {
            login: navigationManager.routes.login.hash
        };

        var entity = ko.validatedObservable().extend({ serializable: true });
        entity.loading = ko.observable(false);

        var vm = {
            activate: activate,
            entity: entity,
            submit: submit,
            hash: hash
        };

        return vm;

        function activate(context) {
            entity(new recoverAccount({
                claim: navigationManager.claim()
            }));

            return true;
        }

        function submit() {
            entity.loading(true);
            return datacontext.account.recover(entity.serialize())
                .then(function () {
                    navigationManager.router.navigate(navigationManager.routes.recover.confirm.hash);
                })
                .always(function () {
                    entity.loading(false);
                });
        }
    }
);