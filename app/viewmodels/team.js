define(['services/datacontext', 'managers/navigationManager'],
	function (datacontext, navigationManager) {

	    function listClientItem(options) {

	        options = options || {};

	        var self = this;

	        self.id = assignVariable(options.id || 0);
	        self.name = assignVariable(options.name || 'Undefined client');
	        self.hash = assignVariable(options.hash || null);

	    }

	    function listClient(options) {

	        options = options || {};

	        var self = this;

	        self.list = assignArrayVariable(options.list || []);

	    }

	    var hash = {
	        add: navigationManager.routes.team.add.hash
	    };

	    var entity = ko.observable(new listClient()).extend({ serializable: true });
	    entity.loading = ko.observable(false);

	    function activate() {
	        entity.loading(true);
	        datacontext.management.getClients()
                .then(function (data) {
                    entity(new listClient({
                        list: data.map(function (current) {
                            return new listClientItem(current);
                        })
                    }));
                })
                .always(function () {
                    entity.loading(false);
                });

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