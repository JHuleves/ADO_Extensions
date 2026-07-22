define(["require", "exports", "./model", "./view"], function (require, exports, model_1, view_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkitemController = (function () {
        function WorkitemController() {
            var config = VSS.getConfiguration();
            var inputs = config.witInputs || {};
            var buttonText = inputs["ButtonText"] || "Insert Transport Order";
            var transportOrderField = inputs["TransportOrderField"] || "";
            var needSystemDownField = inputs["NeedSystemDownField"] || "";
            var needTransactionBlockedField = inputs["NeedTransactionBlockedField"] || "";
            var commentsField = inputs["CommentsField"] || "";
            var transportOrderDataField = inputs["TransportOrderDataField"] || "";
            var checkOdataSap = inputs["CheckOdataSap"] ? true : false;
            var odataUri = inputs["OdataUri"] || "";
            var sapUser = inputs["SapUser"] || "";
            var sapPassword = inputs["SapPassword"] || "";
            this.model = new model_1.Model(buttonText, transportOrderField, needSystemDownField, needTransactionBlockedField, commentsField, transportOrderDataField, checkOdataSap, odataUri, sapUser, sapPassword);
            this.view = new view_1.View(this.model);
            VSS.resize();
        }
        WorkitemController.prototype.update = function () {
            this.view.setVisible(true);
        };
        return WorkitemController;
    }());
    exports.WorkitemController = WorkitemController;
});
