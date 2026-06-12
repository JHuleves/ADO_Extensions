import { Model } from "./modelll";
import { View } from "./view";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

export class WorkitemController {
    private view: View;
    constructor() {
        let config = VSS.getConfiguration();
        let inputs = config.witInputs || {};                                          // IDictionaryStringTo<string>;
        
        // Fixed parameters
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

        // Configurable parameters
        let buttonsNames: string = inputs["ButtonsNames"] || "";                                      // list of button content
        let logEnabled: boolean = inputs["Log"] ? true : false;
        let activityInput: string = inputs["Activity"] || "";
        let buyPass: boolean = inputs["BypassRules"] ? true : false;

        let model = new Model(actionsNames, buttonsNames, targetType, filedsToCopy,
<<<<<<< HEAD
            targetProject, preTitel, linkToWit, fieldsValues, targetFieldsList, buyPass, includeLinks, includeAttachments, logEnabled, activityInput);
=======
            targetProject, preTitel, linkToWit, fieldsValues, targetFieldsList,buyPass,includeLinks,includeAttachments);
>>>>>>> f16e1e2df3720139b0b9fc9ecfe0572ce0c3a32b
        this.view = new View(model);
        VSS.resize();
    }

    public update(): void {
        WorkItemFormService.getService().then((service) => {
            service.getFieldValues(["System.WorkItemType"]).then((fields) => {
                let workItemType = fields["System.WorkItemType"];
<<<<<<< HEAD
=======
                // Ocultar si no es User Story (ejemplo de cómo se podría ocultar)
>>>>>>> f16e1e2df3720139b0b9fc9ecfe0572ce0c3a32b
                if (workItemType === "User Story") {
                    this.view.setVisible(true);
                } else {
                    this.view.setVisible(false);
                }
            });
        });
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> f16e1e2df3720139b0b9fc9ecfe0572ce0c3a32b
