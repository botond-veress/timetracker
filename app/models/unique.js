define([],
    function () {

        var model = function () {

            var self = this;

            window.__uid = window.__uid || 0;

            self.__uid = ++window.__uid;

        };

        return model;

    }
);