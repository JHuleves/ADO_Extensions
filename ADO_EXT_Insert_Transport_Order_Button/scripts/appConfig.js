define(["require", "exports", "./StorageHelper"], function (require, exports, StorageHelper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var commandList;
    function InitP() {
        var main = $("#main").append($("<h2 />").text("Action Button Configuration"));
        var label = $("<label />").text("Action Functions list");
        var listDiv = $("<div />").attr("id", "listDiv").append(label);
        main.append(listDiv);
        StorageHelper_1.RetriveValueList().then(function (functionList) {
            commandList = functionList;
            functionList.forEach(function (func) {
                AddFuncToListView(func.FunctionName);
            });
            var addButton = $("<button />").text("+");
            addButton.click(function () {
                addDiv.show();
                listDiv.hide();
            });
            listDiv.append(addButton);
            VSS.resize();
        });
        var addDiv = $("<div />").attr("id", "addDiv");
        main.append(addDiv);
        addDiv.hide();
        addDiv.append($("<label />").text("New Command"));
        addDiv.append($("<input />").attr("id", "commandName"));
        addDiv.append($("<input />").attr("id", "commandFunc"));
        var saveButton = $("<button />").text("Save");
        var cancleButton = $("<button />").text("Cancle");
        addDiv.append(saveButton);
        addDiv.append(cancleButton);
        cancleButton.click(function () {
            addDiv.hide();
            listDiv.show();
            $("#commandName").val("");
            $("#commandFunc").val("");
        });
        saveButton.click(function () {
            SaveFunction($("#commandName").val(), $("#commandFunc").val());
        });
    }
    function AddFuncToListView(funcName) {
        var div = $("<div />");
        div.append($("<label />").text(funcName));
        var delButton = $("<button />").text("X");
        delButton.click(function () {
            var x = true;
            if (x) {
                DellFunction(funcName);
                div.remove();
            }
        });
        div.append(delButton);
        $("#listDiv").append(div);
    }
    function DellFunction(funcName) {
        var newCommandList = new Array();
        commandList.forEach(function (command) {
            if (command.FunctionName != funcName) {
                newCommandList.push(command);
            }
        });
        commandList = newCommandList;
        StorageHelper_1.StoreValueList(commandList);
    }
    function SaveFunction(commandName, commandFunction) {
        var newFunc = { FunctionName: commandName, Command: commandFunction };
        commandList.push(newFunc);
        StorageHelper_1.StoreValueList(commandList);
        AddFuncToListView(commandName);
        $("#commandName").val("");
        $("#commandFunc").val("");
        $("#listDiv").show();
        $("#addDiv").hide();
    }
    VSS.register(VSS.getContribution().id, InitP);
    InitP();
});
