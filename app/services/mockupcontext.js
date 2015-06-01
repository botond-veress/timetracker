define(['helpers/configuration', 'services/mockupcontext'],
    function () {

        Array.prototype.find = function (predicate) {
            var array = this;
            for (var index in array) {
                if (predicate(array[index])) {
                    return array[index];
                }
            }
            return null;
        };

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }

        function getArray(name) {
            var data = localStorage.getItem('mockup.' + name);
            return data ? JSON.parse(data) : [];
        }

        function saveArray(name, array) {
            localStorage.setItem('mockup.' + name, JSON.stringify(array || []));
        }

        function getUsers() {
            return getArray('users');
        }

        function saveUsers(array) {
            return saveArray('users', array);
        }

        function getTokens() {
            return getArray('tokens');
        }

        function saveTokens(array) {
            return saveArray('tokens', array);
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

        function createToken(data) {
            var tokens = getTokens();
            tokens.push($.extend(data, {
                token: guid()
            }));
            saveTokens(tokens);
            return tokens[tokens.length - 1];
        }

        function createUser(data) {
            var user = new UserEntity(data);
            var users = getUsers();
            users.push(user);
            var token = createToken(new UserTokenEntity(user));
            console.info('[API - TKN] Token (' + token.token + ') generated for user ' + user.email);
            saveUsers(users);
        }

        function recoverUser(user) {
            var token = createToken(new UserTokenEntity(user));
            console.info('[API - TKN] Token (' + token.token + ') generated for user ' + user.email);
        }

        function updateArrayItem(name, predicate, callback) {
            var array = getArray(name);
            for (var index in array) {
                if (predicate(array[index])) {
                    var result = callback(array[index])
                    saveArray(name, array);
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
                    saveArray(name, array);
                    return true;
                }
            }
            return false;
        }

        function updateUser(predicate, callback) {
            return updateArrayItem('users', predicate, callback);
        }

        function removeToken(predicate) {
            return removeArrayItem('tokens', predicate);
        }

        function getToken(token) {
            return getTokens().find(function (current) {
                return current.token === token;
            });
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
                            token: createToken({ email: user.email }).token
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
            }
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