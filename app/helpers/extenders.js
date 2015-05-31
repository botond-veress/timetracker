define(['knockout'],
   function (knockout) {
       ko.extenders.dirty = function (target, isInitiallyDirty) {
           var state = ko.observable(serialize(target));

           target.isDirty = ko.computed(function () {
               return JSON.stringify(state()) != JSON.stringify(serialize(target));
           });

           target.isDirty.reset = function () {
               state(serialize(target));
           };

           function serialize(object) {
               return object && object() && object().serialize && typeof object().serialize == 'function'
                   ? object().serialize()
                   : ko.toJSON(object);
           }
       };

       ko.extenders.serializable = function (target, serializable) {
           target.serializable = ko.observable(!!serializable);
           target.serialize = function () {
               var data = null;
               if (!!target.serializable) {
                   var inner = ko.toJS(target);
                   data = inner && typeof inner.serialize == 'function' ? inner.serialize() : inner;
               }
               return data;
           };
       };
   });