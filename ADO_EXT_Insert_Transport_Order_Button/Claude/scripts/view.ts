import { Model } from "./model";

export class View {
    private container: JQuery;

    constructor(model: Model) {
        this.container = $("<div />");
        let container = this.container;
        container.addClass("container");
        container.addClass("wrap");

        let actionButton = $("<button />");
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
        actionButton.hover(
            function() {
                $(this).css("background-color", "#106ebe"); // darker blue
            },
            function() {
                $(this).css("background-color", "#0078d4");
            }
        );

        let originalText = actionButton.text();
        actionButton.click(() => {
            actionButton.prop("disabled", true);
            actionButton.css("cursor", "default");
            actionButton.text(" Procesando... ");

            // buttonPressed() devuelve una promesa que no se resuelve hasta que
            // termina todo el trabajo real (incluida la consulta OData si aplica),
            // así el botón permanece deshabilitado el tiempo que corresponde.
            let restoreButton = () => {
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

    public setVisible(visible: boolean): void {
        if (visible) {
            this.container.show();
        } else {
            this.container.hide();
        }
        VSS.resize();
    }
}
