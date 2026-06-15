import { Model } from "./model";
import { View } from "./view";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

export class WorkitemController {
    private view: View;
    constructor() {
        let config = VSS.getConfiguration();
        let inputs = config.witInputs || {};

        let actionsNames: string = "Create SAP Task";
        let targetType: string = "Task";
        let linkToWit: string = "Child";
        let filedsToCopy: string = ""; 
        let preTitel: string = "";
        let includeLinks: boolean = false;
        let includeAttachments: boolean = false;
        let fieldsValues: string = "";
        let targetFieldsList: string = "";
        let targetProject: string = ""; 

        let buttonsNames: string = inputs["ButtonsNames"] || "";
        let logEnabled: boolean = inputs["Log"] ? true : false;
        let activityInput: string = inputs["Activity"] || "";
        let buyPass: boolean = inputs["BypassRules"] ? true : false;

        let model = new Model(actionsNames, buttonsNames, targetType, filedsToCopy,
            targetProject, preTitel, linkToWit, fieldsValues, targetFieldsList, buyPass, includeLinks, includeAttachments, logEnabled, activityInput);
        this.view = new View(model);
        VSS.resize();
    }

    public update(): void {
        WorkItemFormService.getService().then((service) => {
            service.getFieldValues(["System.WorkItemType"]).then((fields) => {
                let workItemType = fields["System.WorkItemType"];
                if (workItemType === "User Story") {
                    this.view.setVisible(true);
                } else {
                    this.view.setVisible(false);
                }
            });
        });
    }
}
