define(["require", "exports", "TFS/WorkItemTracking/Services"], function (require, exports, Services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Model = void 0;
    var Model = /** @class */ (function () {
        function Model(buttonText, transportOrderField, needSystemDownField, needTransactionBlockedField, commentsField, transportOrderDataField, checkOdataSap, odataUri, sapUser, sapPassword) {
            this.buttonText = buttonText;
            this.transportOrderField = transportOrderField;
            this.needSystemDownField = needSystemDownField;
            this.needTransactionBlockedField = needTransactionBlockedField;
            this.commentsField = commentsField;
            this.transportOrderDataField = transportOrderDataField;
            this.checkOdataSap = checkOdataSap;
            this.odataUri = odataUri;
            this.sapUser = sapUser;
            this.sapPassword = sapPassword;
        }
        Model.prototype.buttonPressed = function () {
            return this.executeLogic();
        };
        Model.prototype.executeLogic = function () {
            var _this = this;
            return Services_1.WorkItemFormService.getService().then(function (service) {
                var fieldsToRead = [
                    _this.transportOrderField,
                    _this.needSystemDownField,
                    _this.needTransactionBlockedField,
                    _this.commentsField,
                    _this.transportOrderDataField,
                    "StructureOrderData",
                    "Custom.StructureOrderData"
                ];
                // Filter out empty or duplicate field names
                fieldsToRead = fieldsToRead.filter(function (f, idx) { return f && f.trim() !== "" && fieldsToRead.indexOf(f) === idx; });
                return service.getFieldValues(fieldsToRead).then(function (values) {
                    var transportOrderValue = (values[_this.transportOrderField] || "").toString().trim();
                    var needSystemDownValue = values[_this.needSystemDownField];
                    var needTransactionBlockedValue = values[_this.needTransactionBlockedField];
                    var commentsValue = (values[_this.commentsField] || "").toString().trim();
                    var transportOrderDataValue = (values[_this.transportOrderDataField] || "").toString().trim();
                    var structureOrderDataValue = values["StructureOrderData"] || values["Custom.StructureOrderData"] || "";
                    var structureOrderDataStr = structureOrderDataValue.toString().trim();
                    // 1. Si el campo indicado como "Transport Order" esta vacio, no se realiza ninguna accion.
                    if (transportOrderValue === "") {
                        return;
                    }
                    // 2. Si el contenido del campo indicado como "Transport Order" no es de 10 caracteres,
                    // se da un mensaje de error indicando que el tamaño es incorrecto
                    if (transportOrderValue.length !== 10) {
                        alert("Error: El tamaño del campo Transport Order es incorrecto. Debe tener exactamente 10 caracteres.");
                        return;
                    }
                    // 3. Revisar si el contenido del campo indicado como "Comments" contiene algun ";",
                    // en cuyo caso, mostraremos un error indicando que no se permite su uso.
                    if (commentsValue.indexOf(";") !== -1) {
                        alert("Error: El campo de comentarios no puede contener el carácter ';' (punto y coma).");
                        return;
                    }
                    var proceedWithODataAndInsert = function (odataData) {
                        return _this.processTransportOrderData(service, transportOrderValue, needSystemDownValue, needTransactionBlockedValue, commentsValue, transportOrderDataValue, structureOrderDataStr, odataData);
                    };
                    // 4. Si el parametro "Check Odata SAP" esta activo, se realiza la consulta al Odata.
                    if (_this.checkOdataSap) {
                        return _this.queryOData(transportOrderValue)
                            .then(function (odataResult) {
                            if (!odataResult || odataResult.exists === false) {
                                // Si la consulta al Odata devuelve que la orden no existe,
                                // se muestra un mensaje y se inicializan los campos.
                                alert("Error: La orden de transporte " + transportOrderValue + " no existe en SAP.");
                                return _this.resetWorkItemFields(service);
                            }
                            else {
                                return proceedWithODataAndInsert(odataResult.data);
                            }
                        })
                            .catch(function (err) {
                            // Si no se puede establecer la comunicacion se muestra mensaje de error.
                            alert("Error: No se pudo establecer la comunicación con SAP mediante el servicio OData. Detalle: " + err);
                            // No relanzamos: el botón debe volver a habilitarse aunque falle la conexión.
                        });
                    }
                    else {
                        return proceedWithODataAndInsert();
                    }
                });
            });
        };
        Model.prototype.queryOData = function (transportOrder) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var odataUrl = _this.odataUri.trim();
                if (odataUrl === "") {
                    reject("URI de OData no configurada.");
                    return;
                }
                if (odataUrl.endsWith("/")) {
                    odataUrl = odataUrl.slice(0, -1);
                }
                // Si la URI configurada no apunta ya al entity set, se añade
                // "/ZBC_OD_TRANSPORT_ORDER_STATUS" para completar el endpoint del servicio SAP.
                var entitySetSuffix = "/" + Model.ODATA_ENTITY_SET;
                if (odataUrl.toLowerCase().indexOf(Model.ODATA_ENTITY_SET.toLowerCase()) === -1) {
                    odataUrl = odataUrl + entitySetSuffix;
                }
                // Standard OData query for a single entity by key
                var queryUrl = odataUrl + "('" + transportOrder + "')";
                if (queryUrl.indexOf("?") === -1) {
                    queryUrl += "?$format=json";
                }
                else {
                    queryUrl += "&$format=json";
                }
                var headers = {
                    "Accept": "application/json"
                };
                if (_this.sapUser && _this.sapPassword) {
                    headers["Authorization"] = "Basic " + btoa(_this.sapUser + ":" + _this.sapPassword);
                }
                $.ajax({
                    url: queryUrl,
                    type: "GET",
                    headers: headers,
                    dataType: "json",
                    timeout: 15000,
                    success: function (response) {
                        var data = response;
                        if (response && response.d) {
                            data = response.d;
                        }
                        resolve({ exists: true, data: data });
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        if (xhr.status === 404) {
                            resolve({ exists: false });
                        }
                        else {
                            var errorMsg = textStatus || errorThrown || "Error de red desconocido";
                            if (xhr.status) {
                                errorMsg += " (HTTP " + xhr.status + ")";
                            }
                            reject(errorMsg);
                        }
                    }
                });
            });
        };
        Model.prototype.resetWorkItemFields = function (service) {
            var _this = this;
            var updateData = {};
            if (this.transportOrderField) {
                updateData[this.transportOrderField] = "";
            }
            if (this.needSystemDownField) {
                updateData[this.needSystemDownField] = "";
            }
            if (this.needTransactionBlockedField) {
                updateData[this.needTransactionBlockedField] = "";
            }
            if (this.commentsField) {
                updateData[this.commentsField] = "";
            }
            return service.setFieldValues(updateData).then(function () { }).catch(function (err) {
                // fallback in case setFieldValues fails or has typescript interface limitations
                var fallbacks = [];
                if (_this.transportOrderField) {
                    fallbacks.push(service.setFieldValue(_this.transportOrderField, ""));
                }
                if (_this.needSystemDownField) {
                    fallbacks.push(service.setFieldValue(_this.needSystemDownField, ""));
                }
                if (_this.needTransactionBlockedField) {
                    fallbacks.push(service.setFieldValue(_this.needTransactionBlockedField, ""));
                }
                if (_this.commentsField) {
                    fallbacks.push(service.setFieldValue(_this.commentsField, ""));
                }
                return Promise.all(fallbacks).then(function () { });
            });
        };
        Model.prototype.processTransportOrderData = function (service, transportOrderValue, needSystemDownValue, needTransactionBlockedValue, commentsValue, transportOrderDataValue, structureOrderDataStr, odataData) {
            // If StructureOrderData is empty, use default structure
            if (structureOrderDataStr === "") {
                structureOrderDataStr = "Sequence;TransportOrder;NeedSystemDown;NeedTransactionBlocked;Status;User;Date;Time;Comments";
            }
            var columns = structureOrderDataStr.split(";").map(function (c) { return c.trim(); });
            // Find index of standard columns
            var seqIndex = -1;
            var toIndex = -1;
            var sdIndex = -1;
            var tbIndex = -1;
            var commentsIndex = -1;
            // Exact match
            for (var i = 0; i < columns.length; i++) {
                var col = columns[i].toLowerCase();
                if (col === "sequence" || col === "seq" || col === "secuencia") {
                    seqIndex = i;
                }
                else if (col === "transportorder" || col === "transport order" || col === "orden" || col === "trkorr") {
                    toIndex = i;
                }
                else if (col === "needsystemdown" || col === "need system down" || col === "systemdown") {
                    sdIndex = i;
                }
                else if (col === "needtransactionblocked" || col === "need transaction blocked" || col === "transactionblocked") {
                    tbIndex = i;
                }
                else if (col === "comments" || col === "comment" || col === "comentarios") {
                    commentsIndex = i;
                }
            }
            // Substring fallback
            for (var i = 0; i < columns.length; i++) {
                var col = columns[i].toLowerCase();
                if (seqIndex === -1 && col.indexOf("seq") !== -1)
                    seqIndex = i;
                if (toIndex === -1 && (col.indexOf("transport") !== -1 || col.indexOf("order") !== -1 || col.indexOf("tr") !== -1))
                    toIndex = i;
                if (sdIndex === -1 && (col.indexOf("system") !== -1 || col.indexOf("down") !== -1 || col.indexOf("sys") !== -1))
                    sdIndex = i;
                if (tbIndex === -1 && (col.indexOf("transaction") !== -1 || col.indexOf("blocked") !== -1 || col.indexOf("block") !== -1))
                    tbIndex = i;
                if (commentsIndex === -1 && col.indexOf("comment") !== -1)
                    commentsIndex = i;
            }
            // Defaults if completely missing
            if (seqIndex === -1)
                seqIndex = 0;
            if (toIndex === -1)
                toIndex = 1;
            // Parse lines
            var lines = transportOrderDataValue.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(function (l) { return l !== ""; });
            var lineValuesArray = [];
            var existingLineIndex = -1;
            for (var i = 0; i < lines.length; i++) {
                var vals = lines[i].split(";").map(function (v) { return v.trim(); });
                while (vals.length < columns.length) {
                    vals.push("");
                }
                lineValuesArray.push(vals);
                if (vals[toIndex] && vals[toIndex].toLowerCase() === transportOrderValue.toLowerCase()) {
                    existingLineIndex = i;
                }
            }
            // Format flags: active is "X", inactive is ""
            var formatFlagValue = function (val) {
                if (!val)
                    return "";
                var s = val.toString().toLowerCase().trim();
                if (s === "true" || s === "1" || s === "x" || s === "yes" || s === "si" || val === true) {
                    return "X";
                }
                return "";
            };
            var systemDownFlag = formatFlagValue(needSystemDownValue);
            var transactionBlockedFlag = formatFlagValue(needTransactionBlockedValue);
            // Helper to retrieve case-insensitive property value from OData JSON
            var getODataValue = function (colName) {
                if (!odataData)
                    return "";
                var searchKey = colName.toLowerCase().replace(/[^a-z0-9]/g, "");
                for (var key in odataData) {
                    var cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
                    if (cleanKey === searchKey) {
                        var val = odataData[key];
                        if (val !== null && val !== undefined) {
                            return val.toString().trim();
                        }
                    }
                }
                return "";
            };
            if (existingLineIndex !== -1) {
                // Update existing line
                var existingVals = lineValuesArray[existingLineIndex];
                existingVals[toIndex] = transportOrderValue;
                if (sdIndex !== -1)
                    existingVals[sdIndex] = systemDownFlag;
                if (tbIndex !== -1)
                    existingVals[tbIndex] = transactionBlockedFlag;
                if (commentsIndex !== -1)
                    existingVals[commentsIndex] = commentsValue;
                // Fill or update other columns with OData values if available
                for (var j = 0; j < columns.length; j++) {
                    if (j !== seqIndex && j !== toIndex && j !== sdIndex && j !== tbIndex && j !== commentsIndex) {
                        if (this.checkOdataSap && odataData) {
                            existingVals[j] = getODataValue(columns[j]);
                        }
                    }
                }
            }
            else {
                // Add new line
                var nextSeqNum = 1;
                var seqFormatLength = 4; // default padding like "0001"
                if (lineValuesArray.length > 0) {
                    var maxSeq = 0;
                    for (var _i = 0, lineValuesArray_1 = lineValuesArray; _i < lineValuesArray_1.length; _i++) {
                        var vals = lineValuesArray_1[_i];
                        var seqStr = vals[seqIndex] || "";
                        var seqNum = parseInt(seqStr, 10);
                        if (!isNaN(seqNum)) {
                            if (seqNum > maxSeq) {
                                maxSeq = seqNum;
                            }
                            if (seqStr.length > 0) {
                                seqFormatLength = seqStr.length;
                            }
                        }
                    }
                    nextSeqNum = maxSeq + 1;
                }
                var nextSeqStr = nextSeqNum.toString();
                while (nextSeqStr.length < seqFormatLength) {
                    nextSeqStr = "0" + nextSeqStr;
                }
                var newVals = [];
                for (var j = 0; j < columns.length; j++) {
                    if (j === seqIndex) {
                        newVals.push(nextSeqStr);
                    }
                    else if (j === toIndex) {
                        newVals.push(transportOrderValue);
                    }
                    else if (j === sdIndex) {
                        newVals.push(systemDownFlag);
                    }
                    else if (j === tbIndex) {
                        newVals.push(transactionBlockedFlag);
                    }
                    else if (j === commentsIndex) {
                        newVals.push(commentsValue);
                    }
                    else {
                        if (this.checkOdataSap && odataData) {
                            newVals.push(getODataValue(columns[j]));
                        }
                        else {
                            newVals.push("");
                        }
                    }
                }
                lineValuesArray.push(newVals);
            }
            var updatedLines = lineValuesArray.map(function (vals) { return vals.join(";"); });
            var updatedTransportOrderData = updatedLines.join("\n");
            return service.setFieldValue(this.transportOrderDataField, updatedTransportOrderData).then(function () {
                alert("Operación completada con éxito. Datos de orden de transporte actualizados.");
            });
        };
        // Entity set OData de SAP contra el que se verifica la orden de transporte
        Model.ODATA_ENTITY_SET = "ZBC_OD_TRANSPORT_ORDER_STATUS";
        return Model;
    }());
    exports.Model = Model;
});
