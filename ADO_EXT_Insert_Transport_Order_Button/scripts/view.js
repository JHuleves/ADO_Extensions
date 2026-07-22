define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var View = (function () {
        function View(model) {
            this.container = $("<div />");
            var container = this.container;
            container.addClass("container");
            container.addClass("wrap");
            var actionButton = $("<button />");
            actionButton.addClass("buttons");
            actionButton.text(" " + model.buttonText + " ");
            actionButton.css({
                "background-color": "#0078d4",
                "color": "white",
                "border": "1px solid #0078d4",
                "padding": "6px 16px",
                "cursor": "pointer",
                "font-size": "14px",
                "font-weight": "400",
                "border-radius": "2px",
                "min-width": "120px"
            });
            actionButton.hover(function () {
                $(this).css("background-color", "#106ebe");
            }, function () {
                $(this).css("background-color", "#0078d4");
            });
            actionButton.click(function () {
                model.buttonPressed();
            });
            container.append(actionButton);
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
