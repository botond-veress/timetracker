define(['managers/navigationManager'],
	function (navigationManager) {

	    function activate() {
	        return true;
	    }

	    var vm = {
	        activate: activate,
	        navigationManager: navigationManager,
            signout: signout
	    };

	    function signout() {
	        return navigationManager.signout();
	    }

	    return vm;
	}
);