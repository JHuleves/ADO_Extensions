var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "TFS/WorkItemTracking/Services", "TFS/WorkItemTracking/RestClient", "TFS/WorkItemTracking/Services", "TFS/WorkItemTracking/Contracts", "./StorageHelper"], function (require, exports, Services_1, RestClient, WorkItemService, Contracts_1, StorageHelper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var documentBuild = (function () {
        function documentBuild() {
        }
        return documentBuild;
    }());
    exports.documentBuild = documentBuild;
    var Model = (function () {
        function Model(buttonActions, buttonsNames, targetTypes, fieldsToCopy, targetProject, titelPrev, linkToWit, fieldsValues, targetFieldsList, buyPass, includeLinks, includeAttachments, logEnabled, activityInput) {
            if (logEnabled === void 0) { logEnabled = false; }
            if (activityInput === void 0) { activityInput = ""; }
            this.titelPrevs = titelPrev.split(",");
            this.logEnabled = logEnabled;
            this.linkToWit = linkToWit.split(",");
            this.buyPass = buyPass;
            this.includeLinks = includeLinks;
            this.includeAttachments = includeAttachments;
            this.activityList = activityInput.split(",");
            fieldsToCopy = "System.Id," + fieldsToCopy;
            this.fieldsList = fieldsToCopy.split(",");
            if (targetFieldsList != null && targetFieldsList != "") {
                this.targetFieldsList = targetFieldsList.split(",");
                if (this.targetFieldsList.length == this.fieldsList.length) {
                    this.mapFields = true;
                }
            }
            if (fieldsValues != null && fieldsValues != "") {
                this.fieldsValues = fieldsValues.split(",");
                if (this.fieldsValues.length == this.fieldsList.length) {
                    this.mapValues = true;
                }
            }
            var flag = false;
            this.fieldsList.forEach(function (element) {
                element = element.trim();
                if (element == "System.TeamProject")
                    flag = true;
            });
            if (flag == false)
                this.fieldsList.push("System.TeamProject");
            this.workItemTypes = targetTypes.split(",");
            this.targetProject = targetProject;
            this.buttonFunctionList = buttonActions.split(",");
            this.buttonNameList = buttonsNames.split(",");
            this.client = RestClient.getClient();
        }
        Model.prototype.buttonPressed = function (pressed, btnIndex) {
            switch (pressed) {
                case "Convert Work Item": {
                    this.ConvertWit(btnIndex);
                    break;
                }
                case "Not a Bug": {
                    this.NotABug(btnIndex);
                    break;
                }
                case "New Task": {
                    this.HPNewWit(btnIndex);
                    break;
                }
                case "New Sub Task": {
                    this.HPNewWit(btnIndex);
                    break;
                }
                case "New Work Item": {
                    this.CreateNewWit(btnIndex);
                    break;
                }
                case "Create SAP Task": {
                    this.createSAPTask(btnIndex);
                    break;
                }
                case "Command": {
                    this.RunString(pressed);
                }
                case "Create Work Item": {
                    this.WidgetCreateWorkItem(this.workItemTypes[btnIndex]);
                }
                case "Create Bulk of Work Items": {
                    this.WidgetCreateWorkItem(this.workItemTypes[btnIndex]);
                }
                case "Open Query URL": {
                    this.RunString(pressed);
                }
                default: {
                    this.CreateNewWit(btnIndex);
                }
            }
        };
        Model.prototype.CreateNewWit = function (btnIndex) {
            var _this = this;
            Services_1.WorkItemFormService.getService().then(function (service) {
                service.getFieldValues(_this.fieldsList).then(function (values) {
                    _this.CreateNewWorkItem(values, btnIndex);
                });
            });
        };
        Model.prototype.CreateNewWorkItem = function (FieldsList, btnIndex) {
            var _this = this;
            if (this.targetProject == "") {
                this.targetProject = FieldsList["System.TeamProject"].toString();
            }
            var id = FieldsList["System.Id"] ? FieldsList["System.Id"].toString() : '';
            var document;
            var tempDoc = [];
            if (this.targetProject == "") {
                FieldsList["System.TeamProject"] = this.targetProject;
            }
            if (FieldsList["System.Title"]) {
                FieldsList["System.Title"] = this.titelPrevs[btnIndex] + " " + FieldsList["System.Title"].toString();
            }
            else {
                if (this.titelPrevs[btnIndex] == null || this.titelPrevs[btnIndex] == "") {
                    FieldsList["System.Title"] = "No Title!! Action Button Avi Hadad";
                }
                else {
                    FieldsList["System.Title"] = this.titelPrevs[btnIndex];
                }
            }
            this.fieldsList.forEach(function (element) {
                if (FieldsList[element] && FieldsList[element] != null && FieldsList[element] != "") {
                    element = element.trim();
                    if (element != "" && element != "System.Id" && element != "System.TeamProject") {
                        if (FieldsList[element] instanceof Date) {
                            var x = { op: "add", path: "/fields/" + element, value: new Date(FieldsList[element].toString()) };
                        }
                        else {
                            var x = { op: "add", path: "/fields/" + element, value: FieldsList[element].toString() };
                        }
                        tempDoc.push(x);
                    }
                }
            });
            if (this.fieldsList.lastIndexOf("System.Title") == -1) {
                if (FieldsList["System.Title"] && FieldsList["System.Title"] != null && FieldsList["System.Title"] != "") {
                    var value = FieldsList["System.Title"].toString();
                    var x = { op: "add", path: "/fields/System.Title", value: value };
                    tempDoc.push(x);
                }
            }
            document = tempDoc;
            var workItemType = (this.workItemTypes[btnIndex] != null && this.workItemTypes[btnIndex] != "") ? this.workItemTypes[btnIndex] : "Child";
            this.client.createWorkItem(document, this.targetProject, workItemType, null, this.buyPass).then(function (newWorkItem) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.CreateAddes(id, btnIndex, newWorkItem);
                    return [2];
                });
            }); });
        };
        Model.prototype.CreateAddes = function (id, btnIndex, newWorkItem) {
            var _this = this;
            var tempDoc = [];
            var selectedRel = this.GetRelName(this.linkToWit[btnIndex]);
            this.client.getWorkItem(+id, null, null, Contracts_1.WorkItemExpand.All).then(function (workitem) {
                if (_this.includeLinks) {
                    _this.CreateLinks(tempDoc, workitem);
                }
                if (_this.includeAttachments) {
                    _this.CreateAttachment(tempDoc, workitem);
                }
                if (selectedRel != "") {
                    var typeName = _this.ConvertRelName(selectedRel);
                    tempDoc.push({ op: "add", path: "/relations/-", value: { rel: typeName, url: workitem.url } });
                }
                _this.CreateAdded(newWorkItem, tempDoc);
            });
        };
        Model.prototype.CreateLinks = function (tempDoc, workItem) {
            var filteredRelations = new Array();
            workItem.relations.forEach(function (rel) {
                if (rel.rel != "ArtifactLink") {
                    if (rel.rel == "System.LinkTypes.Related-Forward" || rel.rel == "System.LinkTypes.Hierarchy-Forward" || rel.rel == "System.LinkTypes.Hierarchy-Reverse") {
                        rel.rel = "System.LinkTypes.Related";
                    }
                    filteredRelations.push(rel);
                    tempDoc.push({ op: "add", path: "/relations/-", value: { rel: rel.rel, url: rel.url } });
                }
            });
        };
        Model.prototype.CreateAttachment = function (tempDoc, workItem) {
        };
        Model.prototype.CreateAdded = function (newWorkItem, tempDoc) {
            var document = tempDoc;
            this.client.updateWorkItem(document, newWorkItem.id).then(function () {
                WorkItemService.WorkItemFormNavigationService.getService().then(function (service) {
                    service.openWorkItem(newWorkItem.id);
                });
            });
        };
        Model.prototype.GetRelName = function (TypeName) {
            switch (TypeName) {
                case null: {
                    TypeName = "";
                    break;
                }
                case "Child": {
                    TypeName = "System.LinkTypes.Hierarchy-Forward";
                    break;
                }
                case "Duplicate Of": {
                    TypeName = "System.LinkTypes.Duplicate-Reverse";
                    break;
                }
                case "Successor": {
                    TypeName = "System.LinkTypes.Dependency";
                    break;
                }
                case "Related": {
                    TypeName = "System.LinkTypes.Related";
                    break;
                }
                case "Tests": {
                    TypeName = "Microsoft.VSTS.Common.TestedBy-Reverse";
                    break;
                }
                case "Affects": {
                    TypeName = "Microsoft.VSTS.Common.Affects-Forward";
                    break;
                }
            }
            return TypeName;
        };
        Model.prototype.ConvertRelName = function (TypeName) {
            switch (TypeName) {
                case "System.LinkTypes.Hierarchy-Forward": {
                    TypeName = "System.LinkTypes.Hierarchy-Reverse";
                    break;
                }
                case "Microsoft.VSTS.Common.Affects-Forward": {
                    TypeName = "Microsoft.VSTS.Common.Affects-Reverse";
                    break;
                }
                case "System.LinkTypes.Duplicate-Reverse": {
                    TypeName = "System.LinkTypes.Duplicate-Forward";
                    break;
                }
                case "Microsoft.VSTS.Common.TestedBy-Reverse": {
                    TypeName = "Microsoft.VSTS.Common.TestedBy-Forward";
                    break;
                }
            }
            return TypeName;
        };
        Model.prototype.NotABug = function (btnIndex) {
            var _this = this;
            Services_1.WorkItemFormService.getService().then(function (service) {
                service.getFieldValues(_this.fieldsList).then(function (values) {
                    _this.ConvertWorkItem(values, btnIndex, true);
                });
            });
        };
        Model.prototype.ConvertWit = function (btnIndex) {
            var _this = this;
            Services_1.WorkItemFormService.getService().then(function (service) {
                service.getFieldValues(_this.fieldsList).then(function (values) {
                    _this.ConvertWorkItem(values, btnIndex);
                });
            });
        };
        Model.prototype.ConvertWorkItem = function (FieldsList, btnIndex, closeTheSource) {
            if (closeTheSource === void 0) { closeTheSource = false; }
            var project = FieldsList["System.TeamProject"].toString();
            var id = FieldsList["System.Id"] ? FieldsList["System.Id"].toString() : '';
            var document;
            var tempDoc = [];
            if (id != '') {
                var x = { op: "add", path: "/fields/System.WorkItemType", value: this.workItemTypes[btnIndex] };
                tempDoc.push(x);
                document = tempDoc;
                this.client.updateWorkItem(document, +id, this.targetProject, null, true);
            }
            else {
                this.fieldsList.forEach(function (element) {
                    var x = { op: "add", path: "/fields/" + element, value: FieldsList[element] ? FieldsList[element].toString() : '' };
                    tempDoc.push(x);
                });
                document = tempDoc;
                this.client.createWorkItem(document, this.targetProject, this.workItemTypes[btnIndex]);
            }
        };
        Model.prototype.closeStateSave = function () {
            Services_1.WorkItemFormService.getService().then(function (service) {
                service.setFieldValue("System.State", "Closed").then(function () {
                    service.save;
                });
            });
        };
        Model.prototype.HPNewWit = function (btnIndex) {
            var _this = this;
            Services_1.WorkItemFormService.getService().then(function (service) {
                service.getFieldValues(["System.Id", "System.Title", "System.Description", "Custom.Stages", "Custom.Severityfield"]).then(function (value) {
                    var id = "";
                    if (value["System.Id"])
                        id = value["System.Id"].toString();
                    _this.HPCreateNewTask(_this.workItemTypes[btnIndex], value["System.Title"].toString(), value["System.Description"].toString(), id, value["Custom.Stages"].toString());
                });
            });
        };
        Model.prototype.HPCreateNewTask = function (taskType, parentTitle, parentDescription, parentId, stage) {
            var _this = this;
            WorkItemService.WorkItemFormNavigationService.getService().then(function (service) {
                var _a;
                var init = (_a = {},
                    _a["System.Title"] = "Sub Task of " + parentTitle,
                    _a["System.Description"] = parentDescription,
                    _a["Custom.Stages"] = stage,
                    _a["System.AreaId"] = "76",
                    _a);
                if (taskType == "I Task") {
                    init["Custom.TaskDescription"] = parentDescription;
                    init["System.Title"] = "Task of " + parentTitle;
                }
                service.openNewWorkItem(taskType, init).then(function (newWorkItem) {
                    var document;
                    var tempDoc = [];
                    Services_1.WorkItemFormService.getService().then(function (service2) {
                        if (parentId != "") {
                            _this.client.getWorkItem(+parentId).then(function (workitem) {
                                tempDoc.push({ op: "add", path: "/relations/-", value: { rel: "System.LinkTypes.Hierarchy-Reverse", url: workitem.url } });
                            }).then(function () {
                                document = tempDoc;
                                _this.client.updateWorkItem(document, newWorkItem.id);
                            }).then(function () {
                                service2.getWorkItemRelations().then(function (x) {
                                    var w = x;
                                });
                            });
                        }
                        else {
                            var relations = new Array();
                            var rel = {
                                attributes: { "isDeleted": "false", "isLocked": "false", "isNew": "false" },
                                rel: "System.LinkTypes.Hierarchy-Forward",
                                url: newWorkItem.url
                            };
                            relations.push(rel);
                            service2.addWorkItemRelations(relations).then(function () { service2.refresh(); });
                        }
                    });
                });
            });
        };
        Model.prototype.RunString = function (Action) {
            return __awaiter(this, void 0, void 0, function () {
                var command;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, StorageHelper_1.GetCommand(Action)];
                        case 1:
                            command = _a.sent();
                            if (command != "") {
                                this.RunAction(command);
                            }
                            else {
                                alert("No Action Set");
                            }
                            return [2];
                    }
                });
            });
        };
        Model.prototype.RunAction = function (command) {
            return eval(command);
        };
        Model.prototype.WidgetCreateWorkItem = function (taskType) {
            WorkItemService.WorkItemFormNavigationService.getService().then(function (service) {
                var _a;
                var init = (_a = {},
                    _a["System.Title"] = "New" + taskType,
                    _a);
                service.openNewWorkItem(taskType, init);
            });
        };
        Model.prototype.HPCreateBulkWorkItems = function (taskType) {
            WorkItemService.WorkItemFormNavigationService.getService().then(function (service) {
                var _a;
                var init = (_a = {},
                    _a["System.Title"] = "New" + taskType,
                    _a);
                service.openNewWorkItem(taskType, init);
            });
        };
        Model.prototype.createSAPTask = function (btnIndex) {
            var _this = this;
            if (this.logEnabled) {
                console.log("SAP Task creation started.");
            }
            var requiredFields = [
                "System.Id",
                "System.Title",
                "System.AreaPath",
                "System.IterationPath",
                "System.TeamProject",
                "Custom.Feature_Title",
                "Custom.ServiceDeskTicketNumber",
                "Custom.AreadeSAP",
                "Custom.ExternalSystemID",
                "Custom.SAP_ACTIVITY_TYPE",
                "Custom.SAP_FAse_Type"
            ];
            Services_1.WorkItemFormService.getService().then(function (service) {
                service.getFieldValues(requiredFields).then(function (values) {
                    if (_this.logEnabled) {
                        console.log("Parent Work Item ID: " + values["System.Id"]);
                        console.log("Read fields from parent User Story:", values);
                    }
                    _this.executeCreateSAPTask(values, btnIndex);
                });
            });
        };
        Model.prototype.executeCreateSAPTask = function (parentFields, btnIndex) {
            var _this = this;
            var parentId = parentFields["System.Id"].toString();
            var project = parentFields["System.TeamProject"].toString();
            var sapActivityType = parentFields["Custom.SAP_ACTIVITY_TYPE"] ? parentFields["Custom.SAP_ACTIVITY_TYPE"].toString() : "";
            var sdTicket = parentFields["Custom.ServiceDeskTicketNumber"] ? parentFields["Custom.ServiceDeskTicketNumber"].toString() : "";
            var parentTitle = parentFields["System.Title"].toString();
            var sapFaseType = parentFields["Custom.SAP_FAse_Type"] ? parentFields["Custom.SAP_FAse_Type"].toString() : "";
            var activityValue = this.activityList[btnIndex] ? this.activityList[btnIndex].trim() : "";
            var newTaskTitle = sdTicket + " - " + activityValue;
            if (sapFaseType.indexOf("Feasibility Study") !== -1) {
                newTaskTitle = sdTicket + " - FS - " + activityValue;
            }
            else if (sapFaseType.indexOf("Developing") !== -1) {
                newTaskTitle = sdTicket + " - DV - " + activityValue;
            }
            if (this.logEnabled) {
                console.log("SAP Fase Type (Parent): " + sapFaseType);
                console.log("Activity (Config): " + activityValue);
                console.log("Calculated New Task Title: " + newTaskTitle);
            }
            var currentUser = VSS.getWebContext().user;
            var assignedTo = currentUser.name + " <" + currentUser.uniqueName + ">";
            var tempDoc = [];
            var fieldMapping = {
                "System.Title": newTaskTitle,
                "System.AreaPath": parentFields["System.AreaPath"],
                "System.IterationPath": parentFields["System.IterationPath"],
                "Custom.Feature_Title": parentFields["Custom.Feature_Title"],
                "Custom.ServiceDeskTicketNumber": sdTicket,
                "Custom.AreadeSAP": parentFields["Custom.AreadeSAP"],
                "Custom.ExternalSystemID": parentFields["Custom.ExternalSystemID"],
                "Custom.SAP_ACTIVITY_TYPE": activityValue,
                "Custom.SAP_FAse_Type": sapFaseType,
                "System.AssignedTo": assignedTo
            };
            for (var field in fieldMapping) {
                if (fieldMapping[field] !== null && fieldMapping[field] !== undefined && fieldMapping[field] !== "") {
                    tempDoc.push({ op: "add", path: "/fields/" + field, value: fieldMapping[field] });
                }
            }
            var document = tempDoc;
            if (this.logEnabled) {
                console.log("Creating new Task in project " + project + " (BypassRules: " + this.buyPass + ") with document:", JSON.stringify(document));
            }
            this.client.createWorkItem(document, project, "Task", null, this.buyPass).then(function (newTask) {
                if (_this.logEnabled) {
                    console.log("Task created successfully. New ID: " + newTask.id);
                }
                var linkDoc = [
                    {
                        op: "add",
                        path: "/relations/-",
                        value: {
                            rel: "System.LinkTypes.Hierarchy-Reverse",
                            url: ""
                        }
                    }
                ];
                _this.client.getWorkItem(+parentId).then(function (parentWI) {
                    linkDoc[0].value.url = parentWI.url;
                    if (_this.logEnabled) {
                        console.log("Linking Task " + newTask.id + " to parent " + parentId + " via:", JSON.stringify(linkDoc));
                    }
                    _this.client.updateWorkItem(linkDoc, newTask.id).then(function () {
                        if (_this.logEnabled) {
                            console.log("Linking complete.");
                        }
                        WorkItemService.WorkItemFormNavigationService.getService().then(function (navService) {
                            navService.openWorkItem(newTask.id);
                        });
                    }, function (error) {
                        alert("Error linking work item: " + JSON.stringify(error));
                        if (_this.logEnabled) {
                            console.error("Error during linking:", error);
                        }
                    });
                });
            }, function (error) {
                alert("Error creating work item: " + JSON.stringify(error));
                if (_this.logEnabled) {
                    console.error("Error during Task creation:", error);
                }
            });
        };
        return Model;
    }());
    exports.Model = Model;
});
