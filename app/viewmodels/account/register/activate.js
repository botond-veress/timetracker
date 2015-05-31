define(['managers/navigationManager'],
    function (navigationManager) {

        var hash = {
            login: navigationManager.routes.login.hash
        };

        var vm = {
            activate: activate,
            hash: hash
        };

        return vm;

        function activate(context) {
            return true;
        }
    }
);