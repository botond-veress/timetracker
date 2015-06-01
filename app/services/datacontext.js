define(['helpers/configuration', 'services/mockupcontext'],
    function (configuration, mockupcontext) {

        var account = {
            authenticate: function (model) {
                return post('/account/authenticate', model);
            },
            signout: function (model) {
                return post('/account/signout', model);
            },
            recover: function (model) {
                return post('/account/recover', model);
            },
            reset: function (model) {
                return post('/account/recover/reset', model);
            },
            validateResetToken: function (model) {
                return post('/account/recover/validate', model);
            },
            register: function (model) {
                return post('/account/register', model);
            },
            activate: function (model) {
                return post('/account/register/activate', model);
            },
            validateRegisterToken: function (model) {
                return post('/account/register/validate', model);
            }
        };

        var management = {
            getClients: function () {
                console.info('[API] GET /management/clients');
                return dummy([
                    { id: 1, name: 'Jet' },
                    { id: 2, name: 'TriggerMail' },
                    { id: 3, name: 'Maurice Lacroix' }
                ], false, 200);
            },
            getClient: function (model) {
                console.info('[API] GET /management/clients/detail', model);
                return dummy({
                    id: 1,
                    name: 'Jet',
                    projects: [
                        { id: 1, name: 'Wolverine' },
                        { id: 2, name: 'Ironman' },
                        { id: 3, name: 'Nova' },
                        { id: 4, name: 'Thor' },
                        { id: 5, name: 'Superman' },
                        { id: 6, name: 'Batman' },
                        { id: 7, name: 'Gambit' }
                    ]
                }, false, 200);
            },
            saveClient: function (model) {
                console.info('[API] POST /management/clients/detail', model);
                return dummy(null, false, 200);
            },
            getProject: function (model) {
                console.info('[API] GET /management/project/detail', model);
                return dummy({
                    id: 1,
                    name: 'Partner Portal',
                    users: [
                        { id: 1, name: 'Wolverine' },
                        { id: 2, name: 'Ironman' },
                        { id: 3, name: 'Nova' },
                        { id: 4, name: 'Thor' },
                        { id: 5, name: 'Superman' },
                        { id: 6, name: 'Batman' },
                        { id: 7, name: 'Gambit' }
                    ]
                }, false, 200);
            }
        };

        function dummy(data, reject, timeout) {
            var defer = new $.Deferred();

            setTimeout(function () {
                if (!reject) {
                    console.info('[API-DUMMY] SUCCESS DATA', data);
                    defer.resolve(data);
                } else {
                    console.info('[API-DUMMY] REJECT DATA', data);
                    defer.reject(data);
                }
            }, timeout || 200);

            return defer;
        }

        var datacontext = {
            account: account,
            management: management,
            setToken: setToken
        };

        return datacontext;

        var token = null;

        function setToken(t) {
            token = t;
        }

        function get(url, model) {
            return call(url, 'GET', model);
        }

        function post(url, model) {
            return call(url, 'POST', model);
        }

        function call(url, type, model) {
            if (token) {
                model = model || {};
                model.token = token;
            }
            return mockupcontext.handle(url, type, model);

            return $.ajax({
                type: type,
                url: configuration.api.url + url,
                data: model,
                dataType: 'json',
                crossDomain: true
            });
        }
    }
);