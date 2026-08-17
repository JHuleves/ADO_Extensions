/// <reference types="vss-web-extension-sdk" />

import { Model } from "./model";
import { View }  from "./view";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

export class WorkitemController {
    private view: View;

    constructor() {
        const config = VSS.getConfiguration();
        const inputs: IDictionaryStringTo<string> = config.witInputs || {};

        const buttonText:                  string  = inputs["ButtonText"] || "Insert Transport Order";
        const transportOrderField:         string  = (inputs["TransportOrderField"] || "").trim();
        const needSystemDownField:         string  = (inputs["NeedSystemDownField"] || "").trim();
        const needTransactionBlockedField: string  = (inputs["NeedTransactionBlockedField"] || "").trim();
        const commentsField:               string  = (inputs["CommentsField"] || "").trim();
        const transportOrderDataField:     string  = (inputs["TransportOrderDataField"] || "").trim();
        const checkOdataSap:               boolean = inputs["CheckOdataSap"] ? true : false;
        const odataUri:                    string  = (inputs["OdataUri"] || "").trim();
        const sapUser:                     string  = (inputs["SapUser"] || "").trim();
        const sapPassword:                 string  = (inputs["SapPassword"] || "").trim();

        const model  = new Model(
            buttonText,
            transportOrderField,
            needSystemDownField,
            needTransactionBlockedField,
            commentsField,
            transportOrderDataField,
            checkOdataSap,
            odataUri,
            sapUser,
            sapPassword
        );
        this.view = new View(model);
        VSS.resize();
    }

    public update(): void {
        WorkItemFormService.getService().then((service) => {
            service.getFieldValues(["System.WorkItemType"]).then((_fields) => {
                this.view.setVisible(true);
            });
        });
    }
}
