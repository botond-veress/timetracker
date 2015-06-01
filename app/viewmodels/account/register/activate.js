define(['services/datacontext', 'managers/navigationManager', 'models/account/tokenAccount'],
    function (datacontext, navigationManager, tokenAccount) {

        var hash = {
            login: navigationManager.routes.login.hash
        };

        var entity = ko.observable();
        entity.loading = ko.observable(false);

        var vm = {
            activate: activate,
            canActivate: canActivate,
            entity: entity,
            hash: hash
        };

        return vm;

        function canActivate(context) {
            return !!context && !!context.token;
        }

        function activate(context) {
            return datacontext.account.activate({ token: context.token })
                .then(function (data) {
                    navigationManager.claim(new tokenAccount({
                        email: data.email
                    }));
                })
                .always(function () {
                    navigationManager.router.navigate(hash.login);
                });
        }
    }
);