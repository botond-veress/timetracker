define(['helpers/configuration', 'services/mockupcontext'],
    function () {

        //#region Polyfill - ECMA 6

        Array.prototype.find = function (predicate) {
            var array = this;
            for (var index = 0; index < array.length; ++index) {
                if (predicate(array[index])) {
                    return array[index];
                }
            }
            return null;
        };

        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };

        //#endregion

        //#region Underlaying data access

        function getData(name, initial) {
            var data = localStorage.getItem('mockup.' + name);
            return data ? JSON.parse(data) : initial;
        }

        function getArray(name) {
            return getData(name, []);
        }

        function getObject(name) {
            return getData(name, {});
        }

        function saveData(name, data) {
            localStorage.setItem('mockup.' + name, data);
        }

        function saveObject(name, array) {
            saveData(name, JSON.stringify(array || []));
        }

        function updateArrayItem(name, predicate, callback) {
            var array = getArray(name);
            for (var index in array) {
                if (predicate(array[index])) {
                    var result = callback(array[index])
                    saveObject(name, array);
                    return result;
                }
            }
            return false;
        }

        function removeArrayItem(name, predicate, callback) {
            var array = getArray(name);
            for (var index in array) {
                if (predicate(array[index])) {
                    array.splice(index, 1);
                    saveObject(name, array);
                    return true;
                }
            }
            return false;
        }

        function getUID() {
            var id = +getData('uid', 0) + 1;
            saveData('uid', id);
            return id;
        }

        //#endregion

        //#region Token related

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }

        function getTokens() {
            return getArray('tokens');
        }

        function saveTokens(array) {
            return saveObject('tokens', array);
        }

        function getToken(token) {
            return getTokens().find(function (current) {
                return current.token === token;
            });
        }

        function createToken(data) {
            var tokens = getTokens();
            tokens.push($.extend(data, {
                token: guid()
            }));
            saveTokens(tokens);
            return tokens[tokens.length - 1];
        }

        function removeToken(predicate) {
            return removeArrayItem('tokens', predicate);
        }

        //#endregion

        //#region User related

        function getUsers() {
            return getArray('users');
        }

        function saveUsers(array) {
            return saveObject('users', array);
        }

        function updateUser(predicate, callback) {
            return updateArrayItem('users', predicate, callback);
        }

        function getUserScope(user) {
            return getObject('user.' + user.id);
        }

        function saveUserScope(user, scope) {
            return saveObject('user.' + user.id, scope);
        }

        function getUserByCredentials(email, password) {
            return getUsers().find(function (current) {
                return current.email === email && current.password === password;
            });
        }

        function getUserByEmail(email) {
            return getUsers().find(function (current) {
                return current.email === email;
            });
        }

        function getUserById(id) {
            return getUsers().find(function (current) {
                return current.id === id;
            });
        }

        function createUser(data) {
            var users = getUsers();
            data.id = getUID();
            var user = new UserEntity(data);
            users.push(user);
            var token = createToken(new UserTokenEntity(user));
            console.info('[API - TKN] Token (' + token.token + ') generated for user ' + user.email);
            saveUsers(users);
        }

        function recoverUser(user) {
            var token = createToken(new UserTokenEntity(user));
            console.info('[API - TKN] Token (' + token.token + ') generated for user ' + user.email);
        }

        function activateUser(token) {
            return updateUser(function (current) {
                return current.email === token.email;
            }, function (user) {
                user.activated = true;
                return removeToken(function (current) {
                    return current.token === token.token;
                });
            });
        }

        function resetUser(token, data) {
            return updateUser(function (current) {
                return current.email === token.email;
            }, function (user) {
                user.password = data.password;
                return removeToken(function (current) {
                    return current.token === token.token;
                });
            });
        }

        //#endregion

        //#region User entities

        function UserTokenEntity(options) {

            var self = this;

            self.email = options.email;

        }

        function UserEntity(options) {

            var self = this;

            self.id = options.id;
            self.email = options.email;
            self.first = options.first;
            self.last = options.last;
            self.password = options.password;
            self.activated = options.activated || false;

        }

        //#endregion

        //#region Client related

        function getClients(user) {
            var scope = getUserScope(user);
            return scope.clients || [];
        }

        function getClient(user, id) {
            return getClients(user).find(function (current) {
                console.log('client id', current.id == id, current.id, id);
                return current.id == id;
            });
        }

        function saveClient(user, id, data) {
            var client = null;
            var scope = getUserScope(user);
            scope.clients = scope.clients || [];
            if (id) {
                data.id = id;
                for (var index in scope.clients) {
                    if (scope.clients.id == id) {
                        client = new ClientEntity(data);
                        scope.clients[index] = client;
                        break;
                    }
                }
            } else {
                data.id = getUID();
                client = new ClientEntity(data);
                scope.clients.push(client)
            }
            saveUserScope(user, scope);
            return client;
        }

        function ClientEntity(options) {

            var self = this;

            self.id = options.id;
            self.name = options.name;
            self.description = options.description;
            self.projects = options.projects || [];

        }

        //#endregion

        function handle(url, type, model) {
            console.info('[API - REQ] ' + type.toUpperCase() + ' ' + url, model);
            switch (url) {
                case '/account/authenticate':
                    var user = getUserByCredentials(model.email, model.password);
                    if (user && user.activated) {
                        return dummy({
                            email: user.email,
                            first: user.first,
                            last: user.last,
                            token: createToken({ id: user.id }).token
                        });
                    } else {
                        return dummy({
                            error: 'Username or password is incorrect.'
                        }, true);
                    }
                case '/account/register':
                    var user = getUserByEmail(model.email);
                    if (!user) {
                        createUser(model);
                        return dummy(null);
                    } else {
                        return dummy({
                            error: 'Email is already in use.'
                        }, true);
                    }
                case '/account/register/validate':
                    var token = getToken(model.token);
                    if (token) {
                        delete token.token;
                        return dummy(token);
                    } else {
                        return dummy({
                            error: 'Token cannot be found or already expired.'
                        }, true);
                    }
                case '/account/register/activate':
                    var token = getToken(model.token);
                    if (token && activateUser(token)) {
                        return dummy({
                            email: token.email
                        });
                    }
                    return dummy({
                        error: 'Token cannot be found or already expired.'
                    }, true);
                case '/account/signout':
                    removeToken(function (current) {
                        return current.token == model.token;
                    });
                    return dummy(null);
                case '/account/recover/validate':
                    var token = getToken(model.token);
                    if (token) {
                        delete token.token;
                        return dummy(token);
                    } else {
                        return dummy({
                            error: 'Token cannot be found or already expired.'
                        }, true);
                    }
                case '/account/recover':
                    var user = getUserByEmail(model.email);
                    if (user) {
                        recoverUser(model);
                    }
                    return dummy(null);
                case '/account/recover/reset':
                    var token = getToken(model.token);
                    if (token && token.email === model.email) {
                        resetUser(token, model);
                    }
                    return dummy(null);
                case '/management/clients':
                    return authorize(model.token, function (user) {
                        return dummy(getClients(user));
                    });
                default:
                    if (url.startsWith('/management/client')) {
                        var id = url.replace('/management/client', '');
                        if (id.length > 0) {
                            id = id.substring(1, id.length);
                        }
                        if (id.length == 0) {
                            id = null;
                        }
                        if (type == 'POST') {
                            return authorize(model.token, function (user) {
                                var client = saveClient(user, id, model);
                                return client ? dummy(client) : notFound();
                            });
                        } else {
                            return authorize(model.token, function (user) {
                                var client = getClient(user, id);
                                return client ? dummy(client): notFound();
                            });
                        }
                    } else {
                        return notFound();
                    }
            }
        }

        function notFound() {
            return dummy({
                error: 'Not found'
            }, true);
        }

        function authorize(token, callback) {
            var token = getToken(token);
            if (token) {
                var user = getUserById(token.id);
                if (user) {
                    return callback(user);
                }
            }
            return dummy({
                error: 'Unauthorized. Token cannot be found or already expired.'
            }, true);
        }

        function dummy(data, reject, timeout) {
            var defer = new $.Deferred();

            setTimeout(function () {
                if (!reject) {
                    console.info('[API - RSP] SUCCESS', data);
                    defer.resolve(data);
                } else {
                    console.info('[API - RSP] FAIL', data);
                    defer.reject(data);
                }
            }, timeout || 200);

            return defer;
        }

        var mockupcontext = {
            handle: handle
        };

        return mockupcontext;
    }
);