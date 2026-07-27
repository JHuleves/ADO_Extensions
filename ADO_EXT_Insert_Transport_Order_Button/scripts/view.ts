/// <reference types="vss-web-extension-sdk" />

import { Model } from "./model";

export class View {
    private container: JQuery;

    constructor(model: Model) {
        this.container = $("<div />");
        this.container.addClass("container wrap");

        const actionButton = $("<button />");
        actionButton.addClass("buttons");
        actionButton.text(" " + model.buttonText + " ");

        // Styling: Blue, beautiful professional Microsoft theme or standard yellow
        // Let's use a nice, modern Microsoft blue button
        actionButton.css({
            "background-color": "#0078d4",
            "color":            "white",
            "font-weight":      "normal",
            "border":           "1px solid #0078d4",
            "padding":          "6px 16px",
            "border-radius":    "2px",
            "cursor":           "pointer",
            "font-size":        "14px"
        });

        actionButton.hover(
            function() {
                $(this).css("background-color", "#106ebe");
            },
            function() {
                $(this).css("background-color", "#0078d4");
            }
        );

        actionButton.click(() => {
            actionButton.prop("disabled", true);
            const originalText = actionButton.text();
            actionButton.text(" Procesando... ");

            setTimeout(() => {
                model.buttonPressed();
                actionButton.prop("disabled", false);
                actionButton.text(originalText);
            }, 100);
        });

        this.container.append(actionButton);
        $("body").append(this.container);
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
