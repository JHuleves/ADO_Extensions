/// <reference types="vss-web-extension-sdk" />

import { WorkitemController } from "./workitemControl";
import { IWorkItemLoadedArgs } from "TFS/WorkItemTracking/ExtensionContracts";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

// ── Ctrl+S → guardar el work item ────────────────────────────────────────────
$(window).bind("keydown", function (event: JQueryEventObject) {
    if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which).toUpperCase() === "S") {
            event.preventDefault();
            WorkItemFormService.getService().then((service) =>
                service.beginSaveWorkItem($.noop, $.noop)
            );
        }
    }
});

// ── Proveedor del control ─────────────────────────────────────────────────────
var control: WorkitemController;

var provider = () => {
    return {
        onLoaded: (_workItemLoadedArgs: IWorkItemLoadedArgs) => {
            control = new WorkitemController();
            control.update();
            VSS.resize();
        },
        onFieldChanged: (_args: any) => {
            if (control) {
                control.update();
            }
        }
    };
};

VSS.register(VSS.getContribution().id, provider);
