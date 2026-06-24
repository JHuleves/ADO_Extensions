define(["require", "exports", "./model", "./view", "TFS/WorkItemTracking/Services"], function (require, exports, model_1, view_1, Services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkitemController = (function () {
        function WorkitemController() {
            var config = VSS.getConfiguration();
            var inputs = config.witInputs || {};
            var actionsNames = "Create SAP Task";
            var targetType = "Task";
            var linkToWit = "Child";
            var filedsToCopy = "";
            var preTitel = "";
            var includeLinks = false;
            var includeAttachments = false;
            var fieldsValues = "";
            var targetFieldsList = "";
            var targetProject = "";
            var buttonsNames = inputs["ButtonsNames"] || "";
            var logEnabled = inputs["Log"] ? true : false;
            var activityInput = inputs["Activity"] || "";
            var buyPass = inputs["BypassRules"] ? true : false;
            var model = new model_1.Model(actionsNames, buttonsNames, targetType, filedsToCopy, targetProject, preTitel, linkToWit, fieldsValues, targetFieldsList, buyPass, includeLinks, includeAttachments, logEnabled, activityInput);
            this.view = new view_1.View(model);
            VSS.resize();
        }
        WorkitemController.prototype.update = function () {
            var _this = this;
            Services_1.WorkItemFormService.getService().then(function (service) {
                service.getFieldValues(["System.WorkItemType"]).then(function (fields) {
                    var workItemType = fields["System.WorkItemType"];
                    if (workItemType === "User Story") {
                        _this.view.setVisible(true);
                    }
                    else {
                        _this.view.setVisible(false);
                    }
                });
            });
        };
        return WorkitemController;
    }());
    exports.WorkitemController = WorkitemController;
});
