import { Model } from "./model";
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
            
            // Hardcoded Styling: Yellow background, black text
            actionButton.css({
                "background-color": "#ffff00",
                "color": "black",
                "font-weight": "bold",
                "border": "1px solid #ccc",
                "padding": "5px 10px",
                "border-radius": "4px"
            });

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
