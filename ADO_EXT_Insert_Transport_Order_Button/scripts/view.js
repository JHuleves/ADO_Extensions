define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var View = (function () {
        function View(model) {
            this.container = $("<div />");
            this.container.addClass("container wrap");
            var actionButton = $("<button />");
            actionButton.addClass("buttons");
            actionButton.text(" " + model.buttonText + " ");
            actionButton.css({
                "background-color": "#0078d4",
                "color": "white",
                "font-weight": "normal",
                "border": "1px solid #0078d4",
                "padding": "6px 16px",
                "border-radius": "2px",
                "cursor": "pointer",
                "font-size": "14px"
            });
            actionButton.hover(function () {
                $(this).css("background-color", "#106ebe");
            }, function () {
                $(this).css("background-color", "#0078d4");
            });
            actionButton.click(function () {
                actionButton.prop("disabled", true);
                var originalText = actionButton.text();
                actionButton.text(" Procesando... ");
                setTimeout(function () {
                    model.buttonPressed();
                    actionButton.prop("disabled", false);
                    actionButton.text(originalText);
                }, 100);
            });
            this.container.append(actionButton);
            $("body").append(this.container);
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
