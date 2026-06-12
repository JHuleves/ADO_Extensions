import { Model } from "./model";
import { View } from "./view";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

export class WorkitemController {
    private view: View;
    constructor() {
        let config = VSS.getConfiguration();
        let inputs = config.witInputs || {};

        let fieldsToConcat: string = inputs["FieldsToConcat"] || "";
        let targetField: string = inputs["TargetField"] || "";
        let buttonText: string = inputs["ButtonText"] || "Concatenate";
        let logEnabled: boolean = inputs["Log"] ? true : false;

        let model = new Model(fieldsToConcat, targetField, buttonText, logEnabled);
        this.view = new View(model);
        VSS.resize();
    }

    public update(): void {
        WorkItemFormService.getService().then((service) => {
            service.getFieldValues(["System.WorkItemType"]).then((fields) => {
                let workItemType = fields["System.WorkItemType"];
                // Always visible for now, or we can restrict to Task if preferred. 
                // The prompt says "concatena tres campos del work item", usually Tasks have these fields.
                this.view.setVisible(true);
            });
        });
    }
}
