define(["require", "exports", "./workitemControl", "TFS/WorkItemTracking/Services"], function (require, exports, workitemControl_1, Services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    $(window).bind("keydown", function (event) {
        if (event.ctrlKey || event.metaKey) {
            if (String.fromCharCode(event.which).toUpperCase() === "S") {
                event.preventDefault();
                Services_1.WorkItemFormService.getService().then(function (service) {
                    return service.beginSaveWorkItem($.noop, $.noop);
                });
            }
        }
    });
    var control;
    var provider = function () {
        return {
            onLoaded: function (_workItemLoadedArgs) {
                control = new workitemControl_1.WorkitemController();
                control.update();
                VSS.resize();
            },
            onFieldChanged: function (_args) {
                if (control) {
                    control.update();
                }
            }
        };
    };
    VSS.register(VSS.getContribution().id, provider);
});
