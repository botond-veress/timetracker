define(['plugins/router', 'services/datacontext', 'models/account/tokenAccount'],
    function (router, datacontext, tokenAccount) {

        function Route(options) {

            options = options || {};
            var self = this;

            self.route = options.route;
            self.moduleId = options.moduleId;
            self.title = options.title;
            self.nav = options.nav;
            self.hash = options.hash || null;
            self.hidden = options.hidden;

        }

        var routes = {
            login: new Route({ route: 'login', moduleId: 'viewmodels/account/login', title: 'Login', nav: true }),
            recover: {
                index: new Route({ route: 'recover', moduleId: 'viewmodels/account/recover', title: 'Recover your account', nav: true }),
                confirm: new Route({ route: 'recover/confirm', moduleId: 'viewmodels/account/recover/confirm', title: 'Email confirmation', nav: true }),
                reset: new Route({ route: 'recover/reset', moduleId: 'viewmodels/account/recover/reset', title: 'Reset your password', nav: true })
            },
            register: {
                index: new Route({ route: 'register', moduleId: 'viewmodels/account/register', title: 'Join us', nav: true }),
                confirm: new Route({ route: 'register/confirm', moduleId: 'viewmodels/account/register/confirm', title: 'Join us', nav: true }),
                activate: new Route({ route: 'register/activate', moduleId: 'viewmodels/account/register/activate', title: 'Activate your account', nav: true })
            },
            home: new Route({ route: 'home', moduleId: 'viewmodels/home', title: 'Home', nav: true }),
            time: new Route({ route: 'time', moduleId: 'viewmodels/time', title: 'Personal Time Management', nav: true }),
            management: {
                index: new Route({ route: 'management*details', moduleId: 'viewmodels/management', hash: 'management', title: 'Team Management', nav: true }),
                clients: new Route({ route: ['management', 'management/clients'], moduleId: 'viewmodels/management/client/list', hash: 'management/clients', title: 'Client Management', nav: true }),
                client: new Route({ route: 'management/client(/:clientId)', moduleId: 'viewmodels/management/client/detail', hash: 'management/client', title: 'Client Details', nav: true }),
                project: new Route({ route: 'management/client/:clientId/project(/:projectId)', moduleId: 'viewmodels/management/project/detail', hash: 'management/client/:clientId/project', title: 'Project Details', nav: true })
            }
        };

        var anonymousRoutes = [
            routes.login,
            routes.recover.index,
            routes.recover.confirm,
            routes.recover.reset,
            routes.register.index,
            routes.register.confirm,
            routes.register.activate,
            routes.home
        ];

        var shellRoutes = [
            routes.time,
            routes.management.index
        ];

        var managementRoutes = [
            routes.management.clients,
            routes.management.client,
            routes.management.project
        ];

        var allRoutes = anonymousRoutes.slice().concat(shellRoutes);

        var claim = ko.observable(null).extend({ serializable: true });
        claim.isAuthorized = ko.computed(function () {
            var claim = this();
            var isAuthorized = !!claim && !!claim.token();
            datacontext.setToken(isAuthorized ? claim.token() : null);
            return isAuthorized;
        }, claim);
        claim.isAuthorized.subscribe(buildShellRoutes);

        var navigationManager = {
            routes: routes,
            router: router,
            claim: claim,
            buildShellRoutes: buildShellRoutes,
            buildManagementRoutes: buildManagementRoutes,

            initialize: initialize,
            authenticate: authenticate,
            signout: signout
        };

        return navigationManager;

        //#region authentication

        function initialize() {
            var data = load();
            claim(new tokenAccount(data));
        }

        function authenticate(model, remember, url) {
            return datacontext.account.authenticate(model)
            .then(function (data) {
                data.remember = remember;
                claim(new tokenAccount(data));
                if (claim().remember()) {
                    save(claim.serialize());
                }
                router.navigate(routeExists(shellRoutes, url) ? url : shellRoutes[0].hash);
            });
        }

        function signout() {
            return datacontext.account.signout()
            .then(function () {
                if (!!claim()) {
                    claim().token(null);
                    router.navigate(anonymousRoutes[0].hash);
                    if (!claim().remember()) {
                        claim(null);
                    }
                    save(claim.serialize());
                }
            });
        }

        //#endregion

        //#region storage

        function load() {
            return JSON.parse(localStorage.getItem('login')) || null;
        }

        function save(data) {
            if (data) {
                localStorage.setItem('login', JSON.stringify(data));
            } else {
                localStorage.removeItem('login');
            }
        }

        //#endregion

        //#region build routes

        function buildShellRoutes() {
            setRouteVisibility(anonymousRoutes, !claim.isAuthorized());
            setRouteVisibility(shellRoutes, claim.isAuthorized());
            return buildRoutes(router, allRoutes, claim.isAuthorized() ? shellRoutes[0].hash : anonymousRoutes[0].hash);
        }

        function buildManagementRoutes() {
            return buildRoutes(router.createChildRouter(), managementRoutes, managementRoutes[0]);
        }

        function buildRoutes(router, mappings, initial) {
            router.reset();

            router.guardRoute = function (routeInfo, params) {
                var guard = true;

                if (routeExists(allRoutes, params.fragment, true)) {
                    //the route is defined
                    if (claim.isAuthorized()) {
                        //the claim is authorized
                        if (routeExists(anonymousRoutes, params.fragment, true)) {
                            //but the content is anonymous => redirect to the current default route
                            guard = initial || mappings[0].hash;
                        }
                    } else if (!routeExists(mappings, params.fragment)) {
                        //the claim is not authorized to access the route => redirect to login
                        guard = routes.login.hash + '?url=' + params.fragment;
                    }
                } else {
                    //the does not exist => redirect to the current default route
                    guard = initial || mappings[0].hash;
                }

                return guard;
            };

            router
                .map(mappings)
                .mapUnknownRoutes(function (instruction) {
                    console.error('Unknown route: ', instruction);
                })
                .buildNavigationModel();

            router.visibleNavigationModel = router.visibleNavigationModel || ko.computed(function () {
                return router.navigationModel().filter(function (current) {
                    return !current.hidden;
                });
            });

            return router;
        }

        //#endregion

        //#region internal

        function routeExists(array, route, ignoreVisibility) {
            for (var index = 0; index < array.length; ++index) {
                if (array[index].routePattern && (ignoreVisibility || array[index].nav)) {
                    var pattern = new RegExp(array[index].routePattern);
                    if (pattern.test(route)) {
                        return true;
                    }
                }
            }
            return false;
        }

        function setRouteVisibility(routes, visibility) {
            routes.forEach(function (current) {
                current.nav = visibility;
            });
        }

        //#endregion
    });