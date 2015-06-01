define(['services/datacontext', 'managers/navigationManager', 'models/management/detailClient'],
	function (datacontext, navigationManager, detailClient) {

	    var hash = {
	        add: null,
	        clients: navigationManager.routes.management.index.hash,
	        detail: navigationManager.routes.management.client.hash
	    };

	    var entity = ko.observable().extend({ serializable: true });
	    entity.loading = ko.observable(false);
	    entity.submitting = ko.observable(false);
	    entity.submitting.subscribe(function (value) {
	        return entity.loading(value);
	    });

	    var vm = {
	        activate: activate,
	        entity: entity,
	        submit: submit,
	        hash: hash
	    };

	    function activate(id) {
	        hash.add = null;
	        if (id) {
	            console.log('---- LOAD', id);
	            entity.loading(true);
	            datacontext.management.getClient({ id: id })
                    .then(function (data) {
                        data.projects = data.projects || [];
                        hash.add = navigationManager.routes.management.project.hash.replace(':clientId', id);
                        data.projects.forEach(function (current) {
                            current.hash = hash.add + '/' + current.id
                        });
                        entity(new detailClient(data));
                    })
                    .always(function () {
                        entity.loading(false);
                    });
	        } else {
	            entity(new detailClient());
	        }

	        return true;
	    }

	    function submit() {
	        entity.submitting(true);
	        console.log('----', entity.serialize());
	        return datacontext.management.saveClient(entity.serialize())
                .then(function (data) {
                    entity().id(data.id);
                    navigationManager.router.navigate(hash.detail + '/' + data.id, { replace: true });
                })
                .always(function () {
                    entity.submitting(false);
                });
	    }

	    return vm;
	}
);