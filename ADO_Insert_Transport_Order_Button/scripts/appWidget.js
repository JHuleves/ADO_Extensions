define(["require", "exports", "TFS/Dashboards/WidgetHelpers", "./model2Widget"], function (require, exports, WidgetHelpers, model2Widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    WidgetHelpers.IncludeWidgetStyles();
    VSS.register("ButtonsWidget", function () {
        var getQueryInfo = function (widgetSettings) {
            var settings = JSON.parse(widgetSettings.customSettings.data);
            var container = $('#buttons-container');
            if (!settings || !settings.buttons) {
                container.empty();
                container.text("Sorry nothing to show, please configure a buttons");
                return WidgetHelpers.WidgetStatusHelper.Success();
            }
            else {
                var model_1 = new model2Widget_1.Model2Widget();
                $('.Title').text(settings.Title);
                var buttonsQuantity = settings.buttons.split(';');
                buttonsQuantity.forEach(function (button) {
                    var val = button.split(',');
                    if (val.length > 0) {
                        var $jqueryElemnt_1;
                        if (val[1] == "Open URL") {
                            $jqueryElemnt_1 = $('<div>');
                            var $a = $('<a>');
                            $jqueryElemnt_1.addClass("aToButton");
                            $jqueryElemnt_1.css("height", "30px");
                            $a.attr("href", val[2]);
                            $a.attr("target", "_parent");
                            $a.text(val[0]);
                            $a.css("color", "white");
                            $a.addClass("center");
                            $jqueryElemnt_1.append($a);
                        }
                        else if (val[1] == "Create Requisition") {
                            $jqueryElemnt_1 = $('<div>');
                            var $input_1 = $('<input>');
                            $input_1.attr('type', 'text');
                            $input_1.css("width", "100%");
                            $input_1.css("margin-top", "5px");
                            var $button = $('<button>');
                            $button.text(val[0]);
                            $button.css("height", "30px");
                            $button.css("width", "100%");
                            $button.css("background-color", "blue");
                            $button.css("font-size", "medium");
                            $button.css("color", "white");
                            $button.click(function () {
                                var inputData = $input_1.val();
                                if (inputData && inputData != "")
                                    model_1.buttonPressed(val[1], inputData, $input_1, $jqueryElemnt_1);
                                else
                                    alert("No PNs Ids");
                            });
                            $jqueryElemnt_1.append($button);
                            $jqueryElemnt_1.append($input_1);
                        }
                        else {
                            $jqueryElemnt_1 = $('<button>');
                            $jqueryElemnt_1.css("background-color", "blue");
                            $jqueryElemnt_1.text(val[0]);
                            $jqueryElemnt_1.css("font-size", "medium");
                            $jqueryElemnt_1.css("color", "white");
                            $jqueryElemnt_1.click(function () {
                                model_1.buttonPressed(val[1], val[2], null, $jqueryElemnt_1);
                            });
                            $jqueryElemnt_1.css("height", "30px");
                        }
                        $jqueryElemnt_1.css("width", "100%");
                        $jqueryElemnt_1.css("margin-top", "5px");
                        container.append($jqueryElemnt_1);
                    }
                });
                return WidgetHelpers.WidgetStatusHelper.Success();
            }
        };
        return {
            load: function (widgetSettings) {
                return getQueryInfo(widgetSettings);
            },
            reload: function (widgetSettings) {
                return getQueryInfo(widgetSettings);
            }
        };
    });
});
