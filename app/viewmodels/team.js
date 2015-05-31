define(['managers/navigationManager'],
	function (navigationManager) {

	    function listClientItem(options) {

	        options = options || {};

	        var self = this;

	        self.name = assignVariable(options.name || 'Undefined client');

	    }

	    function listClient(options) {

	        options = options || {};
	        options.list = [new listClientItem({ name: 'Jet' }), new listClientItem({ name: 'TriggerMail' }), new listClientItem({ name: 'Maurice Lacroix' })];

	        var self = this;

	        self.list = assignArrayVariable(options.list || []);

	    }

	    var hash = {
	        add: navigationManager.routes.team.add.hash
	    };

	    var entity = ko.observable(new listClient()).extend({ serializable: true });
	    entity.loading = ko.observable(false);

	    function activate() {
	        return true;
	    }

	    var vm = {
	        activate: activate,
	        entity: entity,
            hash: hash
	    };

	    return vm;
	}
);