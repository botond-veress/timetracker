define(['managers/navigationManager'],
	function (navigationManager) {

	    var router = navigationManager.buildManagementRoutes();

	    function activate() {
	        return true;
	    }

	    var vm = {
	        activate: activate,
            router: router
	    };

	    return vm;
	}
);