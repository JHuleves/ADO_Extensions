import { Model } from "./model";
import { View } from "./view";

export class WorkitemController {
    private view: View;
    private model: Model;

    constructor() {
        let config = VSS.getConfiguration();
        let inputs = config.witInputs || {};

        // Retrieve configuration parameters
        let buttonText: string = inputs["ButtonText"] || "Insert Transport Order";
        let transportOrderField: string = inputs["TransportOrderField"] || "";
        let needSystemDownField: string = inputs["NeedSystemDownField"] || "";
        let needTransactionBlockedField: string = inputs["NeedTransactionBlockedField"] || "";
        let commentsField: string = inputs["CommentsField"] || "";
        let transportOrderDataField: string = inputs["TransportOrderDataField"] || "";
        let checkOdataSap: boolean = inputs["CheckOdataSap"] ? true : false;
        let odataUri: string = inputs["OdataUri"] || "";
        let sapUser: string = inputs["SapUser"] || "";
        let sapPassword: string = inputs["SapPassword"] || "";

        this.model = new Model(
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
        
        this.view = new View(this.model);
        VSS.resize();
    }

    public update(): void {
        this.view.setVisible(true);
    }
}
