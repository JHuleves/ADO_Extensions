import { Model } from "./modelll";
export class View {
    private container: JQuery;
    constructor(model: Model) {
        this.container = $("<div />");
        var container = this.container;
        container.addClass("container");
        container.addClass("wrap");
        let index:number=0;
        model.buttonFunctionList.forEach(element => {
            let actionButton = $("<button />");
            actionButton.addClass("buttons");
            actionButton.text(" " + model.buttonNameList[index] + " ");
            
            // Conditional Styling based on Activity
            const activity = model.activityList[index] ? model.activityList[index].trim() : "";
            if (activity === "Analysis") {
                actionButton.css({
                    "background-color": "cyan",
                    "color": "black"
                });
            } else if (activity === "Consulting") {
                actionButton.css({
                    "background-color": "blue",
                    "color": "white"
                });
            } else {
                actionButton.css({
                    "background-color": "darkblue",
                    "color": "white"
                });
            }

            let btnIndex = index;
            actionButton.click(() => { 
                model.buttonPressed(element, btnIndex); 
            });
            container.append(actionButton);
            index++;
        });
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
