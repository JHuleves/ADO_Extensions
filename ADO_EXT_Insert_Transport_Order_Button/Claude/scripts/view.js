define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.View = void 0;
    var View = /** @class */ (function () {
        function View(model) {
            this.container = $("<div />");
            var container = this.container;
            container.addClass("container");
            container.addClass("wrap");
            var actionButton = $("<button />");
            actionButton.addClass("buttons");
            actionButton.text(" " + model.buttonText + " ");
            // Beautiful standard styling for the button
            actionButton.css({
                "background-color": "#0078d4", // Microsoft core blue color
                "color": "white",
                "border": "1px solid #0078d4",
                "padding": "6px 16px",
                "cursor": "pointer",
                "font-size": "14px",
                "font-weight": "400",
                "border-radius": "2px",
                "min-width": "120px"
            });
            // Hover effect to make it look responsive
            actionButton.hover(function () {
                $(this).css("background-color", "#106ebe"); // darker blue
            }, function () {
                $(this).css("background-color", "#0078d4");
            });
            var originalText = actionButton.text();
            actionButton.click(function () {
                actionButton.prop("disabled", true);
                actionButton.css("cursor", "default");
                actionButton.text(" Procesando... ");
                // buttonPressed() devuelve una promesa que no se resuelve hasta que
                // termina todo el trabajo real (incluida la consulta OData si aplica),
                // así el botón permanece deshabilitado el tiempo que corresponde.
                var restoreButton = function () {
                    actionButton.prop("disabled", false);
                    actionButton.css("cursor", "pointer");
                    actionButton.text(originalText);
                };
                model.buttonPressed().then(restoreButton, restoreButton);
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
