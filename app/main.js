window.__build = 1;
window.__version = '0.1a+' + window.__build;

requirejs.config({
    urlArgs: 'v=' + window.__version,
    paths: {
        'text': '../scripts/text',
        'durandal': '../scripts/durandal',
        'plugins': '../scripts/durandal/plugins',
        'transitions': '../scripts/durandal/transitions',
        'jquery': '../scripts/jquery-2.1.1',
        'knockout': '../scripts/knockout-3.3.0',
        'knockout.validation': '../scripts/knockout.validation',
        'moment': '../scripts/moment'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'knockout': {
            exports: 'ko'
        },
        'knockout.validation': {
            deps: ['knockout']
        },
        'helpers/bindings': {
            deps: ['knockout']
        },
        'helpers/extenders': {
            deps: ['knockout']
        },
        'moment': {
            exports: 'moment'
        }
    }
});

 require(['knockout'], function (ko) {
     window.ko = ko

     window.assignVariable = function (variable) {
         return ko.isObservable(variable)
             ? variable
             : ko.observable(variable);
     };
     window.assignArrayVariable = function (variable) {
         return ko.isObservable(variable)
             ? variable
             : ko.observableArray(variable);
     };
     window.trimWhitespace = function (variable) {
         return ko.isObservable(variable)
             ? window.trimWhitespace(variable())
             : variable.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
     };
 });

 define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'plugins/router', 'jquery', 'knockout', 'knockout.validation', 'helpers/bindings', 'helpers/extenders'],
    function (system, app, viewLocator) {
        //>>excludeStart("build", true);
        system.debug(true);
        //>>excludeEnd("build");

        app.title = '';

        app.configurePlugins({
            router: true
        });

        app.start().then(function () {
            viewLocator.useConvention();

            ko.validation.init({
                errorsAsTitle: false,
                decorateElement: true,
                errorClass: 'error',
                messageTemplate: 'validation-message-template'
            });

            app.setRoot('viewmodels/shell', 'fade');
        });
    }
);
