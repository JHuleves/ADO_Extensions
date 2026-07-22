define(["require", "exports", "TFS/Dashboards/WidgetHelpers"], function (require, exports, WidgetHelpers) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WidgetConfigurationContext;
    VSS.register("ActionButtonWidget.Configuration", function () {
        var $addNewButton = $("#addNewButton");
        return {
            load: function (widgetSettings, widgetConfigurationContext) {
                WidgetConfigurationContext = widgetConfigurationContext;
                var settings = JSON.parse(widgetSettings.customSettings.data);
                if (settings && settings.buttons) {
                    SetTheView(settings.buttons);
                }
                $addNewButton.click(function () {
                    AddNewButton();
                    UpdateConfigurations();
                });
                VSS.resize();
                return WidgetHelpers.WidgetStatusHelper.Success();
            },
            onSave: function () {
                var customSettings = {
                    data: JSON.stringify({
                        buttons: GetButtonList()
                    })
                };
                return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);
            }
        };
    });
    function GetButtonList() {
        var x = document.getElementsByClassName("li");
        var result = "";
        var i;
        for (i = 0; i < x.length; i++) {
            result += x[i].innerHTML + ";";
        }
        result = result.substring(0, result.length - 1);
        return result;
    }
    function AddNewButton() {
        var buttonName = $('#buttonTitle');
        var buttonACtion = $('#buttonAction');
        var buttonWit = $('#buttonWit');
        var button = buttonName.val() + "," + buttonACtion.val() + "," + buttonWit.val();
        AddButtonToView(button);
        VSS.resize();
        buttonName.val("");
        buttonACtion.val("");
        buttonWit.val("");
    }
    function SetTheView(data) {
        var buttons = data.split(';');
        buttons.forEach(function (button) {
            AddButtonToView(button);
            UpdateConfigurations();
        });
    }
    function AddButtonToView(button) {
        var $ulList = $("#list");
        var $li = $('<li>');
        var $label = $('<label>');
        $label.addClass("li");
        $label.css("margin-left", "5px;");
        $label.text(button);
        var removeButton = $('<button>');
        removeButton.text("X").click(function () {
            $li.remove();
        });
        $li.append(removeButton);
        $li.append($label);
        $ulList.append($li);
    }
    function UpdateConfigurations() {
        var customSettings = {
            data: JSON.stringify({
                buttons: GetButtonList()
            })
        };
        var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
        var eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
        WidgetConfigurationContext.notify(eventName, eventArgs);
    }
});
