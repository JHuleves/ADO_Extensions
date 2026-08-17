const assert = require("assert");

function formatFlagValue(val) {
    if (!val) return "";
    let s = val.toString().toLowerCase().trim();
    if (s === "true" || s === "1" || s === "x" || s === "yes" || s === "si" || val === true) {
        return "X";
    }
    return "";
}

function processTransportOrderData(
    transportOrderValue,
    needSystemDownValue,
    needTransactionBlockedValue,
    commentsValue,
    transportOrderDataValue,
    structureOrderDataStr,
    odataData,
    checkOdataSap
) {
    if (structureOrderDataStr === "") {
        structureOrderDataStr = "Sequence;TransportOrder;NeedSystemDown;NeedTransactionBlocked;Status;User;Date;Time;Comments";
    }

    let columns = structureOrderDataStr.split(";").map(c => c.trim());

    let seqIndex = -1;
    let toIndex = -1;
    let sdIndex = -1;
    let tbIndex = -1;
    let commentsIndex = -1;

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
    let lineValuesArray = [];
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

    let systemDownFlag = formatFlagValue(needSystemDownValue);
    let transactionBlockedFlag = formatFlagValue(needTransactionBlockedValue);

    let getODataValue = (colName) => {
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
        let existingVals = lineValuesArray[existingLineIndex];
        existingVals[toIndex] = transportOrderValue;
        if (sdIndex !== -1) existingVals[sdIndex] = systemDownFlag;
        if (tbIndex !== -1) existingVals[tbIndex] = transactionBlockedFlag;
        if (commentsIndex !== -1) existingVals[commentsIndex] = commentsValue;

        for (let j = 0; j < columns.length; j++) {
            if (j !== seqIndex && j !== toIndex && j !== sdIndex && j !== tbIndex && j !== commentsIndex) {
                if (checkOdataSap && odataData) {
                    existingVals[j] = getODataValue(columns[j]);
                }
            }
        }
    } else {
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

        let newVals = [];
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
                if (checkOdataSap && odataData) {
                    newVals.push(getODataValue(columns[j]));
                } else {
                    newVals.push("");
                }
            }
        }
        lineValuesArray.push(newVals);
    }

    let updatedLines = lineValuesArray.map(vals => vals.join(";"));
    return updatedLines.join("\n");
}

console.log("Running logic unit tests...");

let result1 = processTransportOrderData(
    "TR10000000",
    true,
    false,
    "My comment",
    "",
    "Sequence;TransportOrder;NeedSystemDown;NeedTransactionBlocked;Status;User;Date;Time;Comments",
    { Status: "Released", User: "SAP_USER", Date: "20260721", Time: "123000" },
    true
);
console.log("Result 1:\n" + result1);
assert.strictEqual(result1, "0001;TR10000000;X;;Released;SAP_USER;20260721;123000;My comment");

let initialData2 = "0001;TR10000000;;;Created;DEV_USER;20260720;100000;Old comment";
let result2 = processTransportOrderData(
    "TR10000000",
    true,
    true,
    "Updated comment",
    initialData2,
    "Sequence;TransportOrder;NeedSystemDown;NeedTransactionBlocked;Status;User;Date;Time;Comments",
    { Status: "Released", User: "SAP_USER", Date: "20260721", Time: "123000" },
    true
);
console.log("Result 2:\n" + result2);
assert.strictEqual(result2, "0001;TR10000000;X;X;Released;SAP_USER;20260721;123000;Updated comment");

let initialData3 = "0001;TR10000000;X;;Released;SAP_USER;20260721;123000;My comment";
let result3 = processTransportOrderData(
    "TR20000000",
    false,
    true,
    "Second comment",
    initialData3,
    "Sequence;TransportOrder;NeedSystemDown;NeedTransactionBlocked;Status;User;Date;Time;Comments",
    { Status: "Modifiable", User: "DEV2", Date: "20260722", Time: "091500" },
    true
);
console.log("Result 3:\n" + result3);
assert.strictEqual(result3, "0001;TR10000000;X;;Released;SAP_USER;20260721;123000;My comment\n0002;TR20000000;;X;Modifiable;DEV2;20260722;091500;Second comment");

let result4 = processTransportOrderData(
    "TR30000000",
    true,
    false,
    "No odata check",
    "",
    "Sequence;TransportOrder;NeedSystemDown;NeedTransactionBlocked;Status;User;Date;Time;Comments",
    null,
    false
);
console.log("Result 4:\n" + result4);
assert.strictEqual(result4, "0001;TR30000000;X;;;;;;No odata check");

console.log("All unit tests passed successfully!");
