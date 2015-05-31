define([],
    function () {

        ko.bindingHandlers.validationMessageCache = {
            update: function (element, valueAccessor) {
                var obsv = valueAccessor(),
                    config = ko.validation.utils.getConfigOptions(element),
                    val = ko.utils.unwrapObservable(obsv),
                    isModified = false,
                    isValid = false;

                obsv.extend({ validatable: true });

                isModified = obsv.isModified();
                isValid = obsv.isValid();

                var errorMsgAccessor = function () {
                    if (!config.messagesOnModified || isModified) {
                        return isValid ? obsv.previousMessage || null : obsv.error;
                    } else {
                        return obsv.previousMessage || null;
                    }
                };
                obsv.previousMessage = errorMsgAccessor();

                var visiblityAccessor = function () {
                    return { visible: isModified && !isValid };
                };

                ko.bindingHandlers.text.update(element, errorMsgAccessor);
                ko.bindingHandlers.css.update(element, visiblityAccessor);
            }
        };

        ko.bindingHandlers.validate = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var submit = function () {
                    return function () {
                        var $form = $(element);
                        var validate = valueAccessor().entity() && typeof valueAccessor().entity().validate == 'function'
                            ? valueAccessor().entity().validate()
                            : null;
                        $.when(validate).then(function (validated) {
                            if (validated) {
                                var submit = valueAccessor().submit && typeof valueAccessor().submit == 'function'
                                    ? valueAccessor().submit
                                    : null;
                                if (submit) {
                                    var $element = $form.find('button[type=submit]') || $form.find('input[type=submit]');
                                    if ($element && $element.length) {
                                        var text = $element.text();
                                        $element.attr('disabled', 'disabled').text($element.data('loading-text'));

                                        $.when(submit()).always(function () {
                                            $element.removeAttr('disabled').text(text);
                                        });
                                    }
                                }
                            }
                        });
                    };
                };

                ko.bindingHandlers['submit'].init(element, submit, allBindingsAccessor, viewModel, bindingContext);
            }
        };

        ko.bindingHandlers.hidden = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var hidden = !ko.unwrap(valueAccessor());
                ko.bindingHandlers.visible.update(element, function () { return hidden; }, allBindingsAccessor, viewModel, bindingContext);
            }
        };
    }
);