define(['services/datacontext', 'managers/navigationManager', 'models/management/detailProject'],
	function (datacontext, navigationManager, detailProject) {

	    var hash = {
	        add: null,
	        client: navigationManager.routes.management.index.hash,
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

	    function activate(clientId, projectId) {
	        hash.client = null;
	        if (clientId) {
	            hash.client = navigationManager.routes.management.client.hash + '/' + clientId;

	            if (projectId) {
	                entity.loading(true);
	                datacontext.management.getProject({ id: projectId })
                        .then(function (data) {
                            data.users = data.users || [];
                            data.users.forEach(function (current) {
                                current.hash = hash.add + '/' + current.projectId
                            });
                            entity(new detailProject(data));
                        })
                        .always(function () {
                            entity.loading(false);
                        });
	            } else {
	                entity(new detailProject());
	            }
	        } else {
	            entity(new detailProject());
	        }

	        return true;
	    }

	    function submit() {
	        entity.submitting(true);
	        return datacontext.management.saveClient(entity.serialize())
                .always(function () {
                    entity.submitting(false);
                });
	    }

	    return vm;
	}
);