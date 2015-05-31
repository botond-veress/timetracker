define(['services/datacontext', 'managers/navigationManager', 'models/management/listClient', 'models/management/listItemClient'],
	function (datacontext, navigationManager, listClient, listItemClient) {

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
                        clients: data.map(function (current) {
                            current.hash = hash.add + '/' + current.id;
                            return new listItemClient(current);
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