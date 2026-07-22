define(["require", "exports", "TFS/WorkItemTracking/Services", "TFS/WorkItemTracking/RestClient", "TFS/WorkItemTracking/Contracts"], function (require, exports, Services_1, RestClient, Contracts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Model2Widget = (function () {
        function Model2Widget() {
            this.client = RestClient.getClient();
        }
        Model2Widget.prototype.buttonPressed = function (pressed, data, text, button) {
            this.$button = button;
            this.$text = text;
            switch (pressed) {
                case "Create Work Item": {
                    this.WidgetCreateWorkItem(data);
                    break;
                }
                case "Create Requisition": {
                    this.WidgetCreateRequisition(data);
                    break;
                }
                case "Open URL": {
                    window.open(data);
                    break;
                }
                default: {
                    break;
                }
            }
        };
        Model2Widget.prototype.WidgetCreateWorkItem = function (taskType) {
            Services_1.WorkItemFormNavigationService.getService().then(function (service) {
                var _a;
                var init = (_a = {},
                    _a["System.Title"] = "New " + taskType,
                    _a);
                service.openNewWorkItem(taskType, init);
            });
        };
        Model2Widget.prototype.WidgetCreateRequisition = function (id) {
            var _this = this;
            var Ids = new Array();
            var PNs = id.split(',');
            var message = "";
            PNs.forEach(function (pn) {
                if ((Number(pn) != NaN) && (Number.parseInt(pn).toString() == pn)) {
                    Ids.push(Number.parseInt(pn));
                }
                else {
                    message += "Wrong parts number ids (number only): " + id + "\n";
                }
            });
            if (Ids.length < PNs.length) {
                alert(message);
                return;
            }
            if (Ids.length > 0) {
                try {
                    this.client.getWorkItems(Ids, null, null, Contracts_1.WorkItemExpand.All).then(function (NonPOMPNs) {
                        if (NonPOMPNs.length == 0) {
                            message += "Wrong parts number ids (not exists): " + id + "\n";
                        }
                        else {
                            message += _this.CreateRequisitionWithPN(NonPOMPNs);
                        }
                        alert(message);
                    });
                }
                catch (ex) {
                    message += "There was a problem during handeling your request" + "\n";
                    alert(message);
                }
            }
            else {
                message += "No ids to create Requisition!\n";
                alert(message);
            }
        };
        Model2Widget.prototype.CreateRequisitionWithPN = function (NonPOMPNs) {
            var _this = this;
            var _a;
            var cost = 0;
            var Currency = "";
            var Supplier = "";
            var Requestor = "";
            var GlAccount = "";
            var CostCenter = "";
            var DepartmentSection = "";
            var BudgetType = "";
            var first = true;
            var flag = true;
            var message = "";
            var document;
            var tempDoc = [];
            NonPOMPNs.forEach(function (PNid) {
                if (PNid.relations && PNid.relations.length > 0 && _this.CheckIfAllreadyConnected(PNid.relations)) {
                    message += "Part number " + PNid.id + " allready connected to other requsition\n";
                    flag = false;
                }
                else {
                    var checkCurrency = PNid.fields["Custom.Currency"] ? PNid.fields["Custom.Currency"] : "";
                    var checkSupplier = PNid.fields["Custom.Supplier"] ? PNid.fields["Custom.Supplier"] : "";
                    var checkRequestor = PNid.fields["Custom.Requestor"] ? PNid.fields["Custom.Requestor"] : "";
                    var checkGlAccount = PNid.fields["Custom.G_LAccount"] ? PNid.fields["Custom.G_LAccount"] : "";
                    var checkCostCenter = PNid.fields["Custom.CostCenter_"] ? PNid.fields["Custom.CostCenter_"] : "";
                    BudgetType = PNid.fields["Custom.BudgetType"] ? PNid.fields["Custom.BudgetType"] : "";
                    DepartmentSection = PNid.fields["Custom.DepartmentandSection"];
                    var checkPrice = Number.parseInt(PNid.fields["Custom.PriceperUOM"]);
                    var checkQuantity = Number.parseInt(PNid.fields["Custom.Quantity"]);
                    cost += checkPrice * checkQuantity;
                    tempDoc.push({ op: "add", path: "/relations/-", value: { rel: "System.LinkTypes.Hierarchy-Forward", url: PNid.url } });
                    ;
                    if (first) {
                        Currency = checkCurrency;
                        Supplier = checkSupplier;
                        Requestor = checkRequestor;
                        GlAccount = checkGlAccount;
                        CostCenter = checkCostCenter;
                        first = false;
                    }
                    else {
                        if (!((Currency == checkCurrency) &&
                            (Supplier == checkSupplier) &&
                            (Requestor == checkRequestor) &&
                            (GlAccount == checkGlAccount) &&
                            (CostCenter == checkCostCenter))) {
                            message += "Part number " + PNid.id + " Data not align\n";
                            flag = false;
                        }
                    }
                }
            });
            document = tempDoc;
            if (flag) {
                var init = (_a = {},
                    _a["System.Title"] = "New Requisition",
                    _a["Custom.OrderCurrency"] = Currency,
                    _a["Custom.Supplier"] = Supplier,
                    _a["Custom.Requestor"] = Requestor,
                    _a["Custom.G_LAccount"] = GlAccount,
                    _a["Custom.CostCenter_"] = CostCenter,
                    _a["Custom.OrderCost"] = cost,
                    _a["Custom.DepartmentandSection"] = DepartmentSection,
                    _a["Custom.BudgetType"] = BudgetType,
                    _a);
                message += "All data set... creating Requsition for all Pn\n";
                this.CreateTheRequsition(init, document);
            }
            return message;
        };
        Model2Widget.prototype.CheckIfAllreadyConnected = function (relations) {
            var flag = false;
            relations.forEach(function (relation) {
                if (relation.rel == "System.LinkTypes.Hierarchy-Reverse") {
                    var parentUrl = relation.url.split('/');
                    var parentID = parentUrl[parentUrl.length - 1];
                    flag = true;
                }
            });
            return flag;
        };
        Model2Widget.prototype.CreateTheRequsition = function (init, document) {
            var _this = this;
            Services_1.WorkItemFormNavigationService.getService().then(function (service) {
                service.openNewWorkItem("Requisition", init).then(function (newWorkItem) {
                    if (newWorkItem && newWorkItem.id > 0) {
                        _this.client.updateWorkItem(document, newWorkItem.id);
                        _this.$text.val("");
                    }
                });
            });
        };
        return Model2Widget;
    }());
    exports.Model2Widget = Model2Widget;
});
