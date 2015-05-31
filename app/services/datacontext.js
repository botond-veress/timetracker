define(['helpers/configuration'],
    function (configuration) {

        var account = {
            authenticate: function (model) {
                console.info('[API] POST /account/authenticate', model);
                return dummy({
                    email: 'botond-veres@clever-software-solutions.com',
                    first: 'Botond',
                    last: 'Veress',
                    token: 'Bearer <token>'
                }, false, 500);
            },
            signout: function (model) {
                console.info('[API] POST /account/signout', model);
                return dummy(null, false, 500);
            },
            recover: function (model) {
                console.info('[API] POST /account/recover', model);
                return dummy(null, false, 500);
            },
            reset: function (model) {
                console.info('[API] POST /account/reset', model);
                return dummy(null, false, 500);
            },
            validateResetToken: function (model) {
                console.info('[API] POST /account/validateresettoken', model);
                return dummy({
                    email: 'some-weird@address.com'
                }, false, 2000);
            },
            register: function (model) {
                console.info('[API] POST /account/register', model);
                return dummy(null, false, 500);
            },
            validateRegisterToken: function (model) {
                console.info('[API] POST /account/validateregistertoken', model);
                return dummy({
                    email: 'some-weird@address.com'
                }, false, 2000);
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
            account: account
        };

        return datacontext;

        function get(url, model) {
            return call(url, 'GET', model);
        }

        function post(url, model) {
            return call(url, 'POST', model);
        }

        function call(url, type, model) {
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