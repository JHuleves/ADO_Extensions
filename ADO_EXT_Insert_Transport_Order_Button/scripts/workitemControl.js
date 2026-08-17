define(["require", "exports", "./model", "./view", "TFS/WorkItemTracking/Services"], function (require, exports, model_1, view_1, Services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkitemController = (function () {
        function WorkitemController() {
            var config = VSS.getConfiguration();
            var inputs = config.witInputs || {};
            var buttonText = inputs["ButtonText"] || "Insert Transport Order";
            var transportOrderField = (inputs["TransportOrderField"] || "").trim();
            var needSystemDownField = (inputs["NeedSystemDownField"] || "").trim();
            var needTransactionBlockedField = (inputs["NeedTransactionBlockedField"] || "").trim();
            var commentsField = (inputs["CommentsField"] || "").trim();
            var transportOrderDataField = (inputs["TransportOrderDataField"] || "").trim();
            var checkOdataSap = inputs["CheckOdataSap"] ? true : false;
            var odataUri = (inputs["OdataUri"] || "").trim();
            var sapUser = (inputs["SapUser"] || "").trim();
            var sapPassword = (inputs["SapPassword"] || "").trim();
            var model = new model_1.Model(buttonText, transportOrderField, needSystemDownField, needTransactionBlockedField, commentsField, transportOrderDataField, checkOdataSap, odataUri, sapUser, sapPassword);
            this.view = new view_1.View(model);
            VSS.resize();
        }
        WorkitemController.prototype.update = function () {
            var _this = this;
            Services_1.WorkItemFormService.getService().then(function (service) {
                service.getFieldValues(["System.WorkItemType"]).then(function (_fields) {
                    _this.view.setVisible(true);
                });
            });
        };
        return WorkitemController;
    }());
    exports.WorkitemController = WorkitemController;
});
