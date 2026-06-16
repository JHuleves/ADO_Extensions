define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var View = (function () {
        function View(model) {
            this.container = $("<div />");
            var container = this.container;
            container.addClass("container");
            container.addClass("wrap");
            var index = 0;
            model.buttonFunctionList.forEach(function (element) {
                var actionButton = $("<button />");
                actionButton.addClass("buttons");
                actionButton.text(" " + model.buttonNameList[index] + " ");
                var activity = model.activityList[index] ? model.activityList[index].trim() : "";
                if (activity === "Analysis") {
                    actionButton.css({
                        "background-color": "cyan",
                        "color": "black"
                    });
                }
                else if (activity === "Consulting") {
                    actionButton.css({
                        "background-color": "blue",
                        "color": "white"
                    });
                }
                else {
                    actionButton.css({
                        "background-color": "darkblue",
                        "color": "white"
                    });
                }
                var btnIndex = index;
                actionButton.click(function () {
                    model.buttonPressed(element, btnIndex);
                });
                container.append(actionButton);
                index++;
            });
            $("body").append(container);
            VSS.resize();
        }
        View.prototype.setVisible = function (visible) {
            if (visible) {
                this.container.show();
            }
            else {
                this.container.hide();
            }
            VSS.resize();
        };
        return View;
    }());
    exports.View = View;
});
