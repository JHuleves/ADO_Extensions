/// <reference types="vss-web-extension-sdk" />

import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

export class Model {
    public buttonText: string;
    public transportOrderField: string;
    public needSystemDownField: string;
    public needTransactionBlockedField: string;
    public commentsField: string;
    public transportOrderDataField: string;
    public checkOdataSap: boolean;
    public odataUri: string;
    public sapUser: string;
    public sapPassword: string;

    constructor(
        buttonText: string,
        transportOrderField: string,
        needSystemDownField: string,
        needTransactionBlockedField: string,
        commentsField: string,
        transportOrderDataField: string,
        checkOdataSap: boolean,
        odataUri: string,
        sapUser: string,
        sapPassword: string
    ) {
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

    public buttonPressed(): void {
        this.executeLogic();
    }

    private executeLogic(): void {
        WorkItemFormService.getService().then((service) => {
            let fieldsToRead = [
                this.transportOrderField,
                this.needSystemDownField,
                this.needTransactionBlockedField,
                this.commentsField,
                this.transportOrderDataField,
                "StructureOrderData",
                "Custom.StructureOrderData"
            ];

            // Filter out empty or duplicate field names
            fieldsToRead = fieldsToRead.filter((f, idx) => f && f.trim() !== "" && fieldsToRead.indexOf(f) === idx);

            service.getFieldValues(fieldsToRead).then((values) => {
                let transportOrderValue = (values[this.transportOrderField] || "").toString().trim();
                let needSystemDownValue = values[this.needSystemDownField];
                let needTransactionBlockedValue = values[this.needTransactionBlockedField];
                let commentsValue = (values[this.commentsField] || "").toString().trim();
                let transportOrderDataValue = (values[this.transportOrderDataField] || "").toString().trim();

                let structureOrderDataValue = values["StructureOrderData"] || values["Custom.StructureOrderData"] || "";
                let structureOrderDataStr = structureOrderDataValue.toString().trim();

                // 1. Si el campo indicado como "Transport Order" está vacío, no se realiza ninguna acción.
                if (transportOrderValue === "") {
                    return;
                }

                // 2. Si el contenido del campo indicado como "Transport Order" no es de 10 caracteres,
                // se da un mensaje de error indicando que el tamaño es incorrecto.
                if (transportOrderValue.length !== 10) {
                    alert("Error: El tamaño del campo Transport Order es incorrecto. Debe tener exactamente 10 caracteres.");
                    return;
                }

                // 3. Revisar si el contenido del campo indicado como "Comments" contiene algún ";",
                // en cuyo caso, mostraremos un error indicando que no se permite su uso.
                if (commentsValue.indexOf(";") !== -1) {
                    alert("Error: El campo de comentarios no puede contener el carácter ';' (punto y coma).");
                    return;
                }

                let proceedWithODataAndInsert = (odataData?: any) => {
                    this.processTransportOrderData(
                        service,
                        transportOrderValue,
                        needSystemDownValue,
                        needTransactionBlockedValue,
                        commentsValue,
                        transportOrderDataValue,
                        structureOrderDataStr,
                        odataData
                    );
                };

                // 4. Si el parámetro "Check Odata SAP" está activo, se realiza la consulta al Odata.
                if (this.checkOdataSap) {
                    this.queryOData(transportOrderValue)
                        .then((odataResult) => {
                            if (!odataResult || odataResult.exists === false) {
                                // Si la consulta al Odata devuelve que la orden no existe,
                                // se muestra un mensaje y se inicializan los campos.
                                alert("Error: La orden de transporte " + transportOrderValue + " no existe en SAP.");
                                this.resetWorkItemFields(service);
                            } else {
                                proceedWithODataAndInsert(odataResult.data);
                            }
                        })
                        .catch((err) => {
                            // Si no se puede establecer la comunicación se muestra mensaje de error.
                            alert("Error: No se pudo establecer la comunicación con SAP mediante el servicio OData. Detalle: " + err);
                        });
                } else {
                    proceedWithODataAndInsert();
                }
            });
        });
    }

    private queryOData(transportOrder: string): Promise<{ exists: boolean; data?: any }> {
        return new Promise((resolve, reject) => {
            let odataUrl = this.odataUri.trim();
            if (odataUrl === "") {
                reject("URI de OData no configurada.");
                return;
            }

            if (odataUrl.endsWith("/")) {
                odataUrl = odataUrl.slice(0, -1);
            }

            // Consulta OData por clave
            let queryUrl = odataUrl + "('" + transportOrder + "')";
            if (queryUrl.indexOf("?") === -1) {
                queryUrl += "?$format=json";
            } else {
                queryUrl += "&$format=json";
            }

            let headers: any = {
                "Accept": "application/json"
            };

            if (this.sapUser && this.sapPassword) {
                headers["Authorization"] = "Basic " + btoa(this.sapUser + ":" + this.sapPassword);
            }

            $.ajax({
                url: queryUrl,
                type: "GET",
                headers: headers,
                dataType: "json",
                timeout: 15000,
                success: (response) => {
                    let data = response;
                    if (response && response.d) {
                        data = response.d;
                    }
                    resolve({ exists: true, data: data });
                },
                error: (xhr, textStatus, errorThrown) => {
                    if (xhr.status === 404) {
                        resolve({ exists: false });
                    } else {
                        let errorMsg = textStatus || errorThrown || "Error de red desconocido";
                        if (xhr.status) {
                            errorMsg += " (HTTP " + xhr.status + ")";
                        }
                        reject(errorMsg);
                    }
                }
            });
        });
    }

    private resetWorkItemFields(service: any): void {
        let updateData: any = {};
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

        service.setFieldValues(updateData).catch((err) => {
            // fallback si setFieldValues falla
            if (this.transportOrderField) {
                service.setFieldValue(this.transportOrderField, "");
            }
            if (this.needSystemDownField) {
                service.setFieldValue(this.needSystemDownField, "");
            }
            if (this.needTransactionBlockedField) {
                service.setFieldValue(this.needTransactionBlockedField, "");
            }
            if (this.commentsField) {
                service.setFieldValue(this.commentsField, "");
            }
        });
    }

    private processTransportOrderData(
        service: any,
        transportOrderValue: string,
        needSystemDownValue: any,
        needTransactionBlockedValue: any,
        commentsValue: string,
        transportOrderDataValue: string,
        structureOrderDataStr: string,
        odataData?: any
    ): void {
        if (structureOrderDataStr === "") {
            structureOrderDataStr = "Sequence;TransportOrder;NeedSystemDown;NeedTransactionBlocked;Status;User;Date;Time;Comments";
        }

        let columns = structureOrderDataStr.split(";").map(c => c.trim());

        let seqIndex = -1;
        let toIndex = -1;
        let sdIndex = -1;
        let tbIndex = -1;
        let commentsIndex = -1;

        // Búsqueda exacta de las columnas
        for (let i = 0; i < columns.length; i++) {
            let col = columns[i].toLowerCase();
            if (col === "sequence" || col === "seq" || col === "secuencia") {
                seqIndex = i;
            } else if (col === "transportorder" || col === "transport order" || col === "orden" || col === "trkorr") {
                toIndex = i;
            } else if (col === "needsystemdown" || col === "need system down" || col === "systemdown") {
                sdIndex = i;
            } else if (col === "needtransactionblocked" || col === "need transaction blocked" || col === "transactionblocked") {
                tbIndex = i;
            } else if (col === "comments" || col === "comment" || col === "comentarios") {
                commentsIndex = i;
            }
        }

        // Búsqueda parcial si no hay coincidencia exacta
        for (let i = 0; i < columns.length; i++) {
            let col = columns[i].toLowerCase();
            if (seqIndex === -1 && col.indexOf("seq") !== -1) seqIndex = i;
            if (toIndex === -1 && (col.indexOf("transport") !== -1 || col.indexOf("order") !== -1 || col.indexOf("tr") !== -1)) toIndex = i;
            if (sdIndex === -1 && (col.indexOf("system") !== -1 || col.indexOf("down") !== -1 || col.indexOf("sys") !== -1)) sdIndex = i;
            if (tbIndex === -1 && (col.indexOf("transaction") !== -1 || col.indexOf("blocked") !== -1 || col.indexOf("block") !== -1)) tbIndex = i;
            if (commentsIndex === -1 && col.indexOf("comment") !== -1) commentsIndex = i;
        }

        if (seqIndex === -1) seqIndex = 0;
        if (toIndex === -1) toIndex = 1;

        let lines = transportOrderDataValue.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
        let lineValuesArray: Array<Array<string>> = [];
        let existingLineIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            let vals = lines[i].split(";").map(v => v.trim());
            while (vals.length < columns.length) {
                vals.push("");
            }
            lineValuesArray.push(vals);

            if (vals[toIndex] && vals[toIndex].toLowerCase() === transportOrderValue.toLowerCase()) {
                existingLineIndex = i;
            }
        }

        let formatFlagValue = (val: any): string => {
            if (!val) return "";
            let s = val.toString().toLowerCase().trim();
            if (s === "true" || s === "1" || s === "x" || s === "yes" || s === "si" || val === true) {
                return "X";
            }
            return "";
        };

        let systemDownFlag = formatFlagValue(needSystemDownValue);
        let transactionBlockedFlag = formatFlagValue(needTransactionBlockedValue);

        let getODataValue = (colName: string): string => {
            if (!odataData) return "";
            let searchKey = colName.toLowerCase().replace(/[^a-z0-9]/g, "");
            for (let key in odataData) {
                let cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (cleanKey === searchKey) {
                    let val = odataData[key];
                    if (val !== null && val !== undefined) {
                        return val.toString().trim();
                    }
                }
            }
            return "";
        };

        if (existingLineIndex !== -1) {
            // Actualizar línea existente
            let existingVals = lineValuesArray[existingLineIndex];
            existingVals[toIndex] = transportOrderValue;
            if (sdIndex !== -1) existingVals[sdIndex] = systemDownFlag;
            if (tbIndex !== -1) existingVals[tbIndex] = transactionBlockedFlag;
            if (commentsIndex !== -1) existingVals[commentsIndex] = commentsValue;

            for (let j = 0; j < columns.length; j++) {
                if (j !== seqIndex && j !== toIndex && j !== sdIndex && j !== tbIndex && j !== commentsIndex) {
                    if (this.checkOdataSap && odataData) {
                        existingVals[j] = getODataValue(columns[j]);
                    }
                }
            }
        } else {
            // Añadir nueva línea
            let nextSeqNum = 1;
            let seqFormatLength = 4;

            if (lineValuesArray.length > 0) {
                let maxSeq = 0;
                for (let vals of lineValuesArray) {
                    let seqStr = vals[seqIndex] || "";
                    let seqNum = parseInt(seqStr, 10);
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

            let nextSeqStr = nextSeqNum.toString();
            while (nextSeqStr.length < seqFormatLength) {
                nextSeqStr = "0" + nextSeqStr;
            }

            let newVals: Array<string> = [];
            for (let j = 0; j < columns.length; j++) {
                if (j === seqIndex) {
                    newVals.push(nextSeqStr);
                } else if (j === toIndex) {
                    newVals.push(transportOrderValue);
                } else if (j === sdIndex) {
                    newVals.push(systemDownFlag);
                } else if (j === tbIndex) {
                    newVals.push(transactionBlockedFlag);
                } else if (j === commentsIndex) {
                    newVals.push(commentsValue);
                } else {
                    if (this.checkOdataSap && odataData) {
                        newVals.push(getODataValue(columns[j]));
                    } else {
                        newVals.push("");
                    }
                }
            }
            lineValuesArray.push(newVals);
        }

        let updatedLines = lineValuesArray.map(vals => vals.join(";"));
        let updatedTransportOrderData = updatedLines.join("\n");

        service.setFieldValue(this.transportOrderDataField, updatedTransportOrderData).then(() => {
            alert("Operación completada con éxito. Datos de orden de transporte actualizados.");
        });
    }
}
