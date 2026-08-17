define(["require", "exports", "./model", "./view"], function (require, exports, model_1, view_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkitemController = void 0;
    var WorkitemController = /** @class */ (function () {
        function WorkitemController() {
            var config = VSS.getConfiguration();
            var inputs = config.witInputs || {};
            // Retrieve configuration parameters (trim para tolerar espacios accidentales al configurarlos)
            var buttonText = (inputs["ButtonText"] || "Insert Transport Order").trim();
            var transportOrderField = (inputs["TransportOrderField"] || "").trim();
            var needSystemDownField = (inputs["NeedSystemDownField"] || "").trim();
            var needTransactionBlockedField = (inputs["NeedTransactionBlockedField"] || "").trim();
            var commentsField = (inputs["CommentsField"] || "").trim();
            var transportOrderDataField = (inputs["TransportOrderDataField"] || "").trim();
            var checkOdataSap = WorkitemController.parseBoolean(inputs["CheckOdataSap"]);
            var odataUri = (inputs["OdataUri"] || "").trim();
            var sapUser = (inputs["SapUser"] || "").trim();
            var sapPassword = (inputs["SapPassword"] || "").trim();
            this.model = new model_1.Model(buttonText, transportOrderField, needSystemDownField, needTransactionBlockedField, commentsField, transportOrderDataField, checkOdataSap, odataUri, sapUser, sapPassword);
            this.view = new view_1.View(this.model);
            VSS.resize();
        }
        // El input "CheckOdataSap" puede llegar como boolean real o como texto
        // ("true"/"false", "1"/"0"...) según cómo lo serialice el editor de proceso.
        WorkitemController.parseBoolean = function (value) {
            if (typeof value === "boolean") {
                return value;
            }
            if (value === null || value === undefined) {
                return false;
            }
            var normalized = value.toString().trim().toLowerCase();
            return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "si";
        };
        WorkitemController.prototype.update = function () {
            this.view.setVisible(true);
        };
        return WorkitemController;
    }());
    exports.WorkitemController = WorkitemController;
});
