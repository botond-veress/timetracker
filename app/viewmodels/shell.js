define(['managers/navigationManager', 'text!views/templates/controls.html'],
    function (navigationManager) {

        function activate() {
            navigationManager.initialize();
            return navigationManager.buildShellRoutes().activate({
                pushState : true
            });
        }

        var vm = {
            activate: activate,
            navigationManager: navigationManager
        };

        return vm;
    }
);