/// <reference types="vss-web-extension-sdk" />

import RestClient = require("TFS/WorkItemTracking/RestClient");

export class Diagnostics {
    private requiredFields = [
        "Custom.CSV_Data_hours_incurred",
        "Custom.INCUR_NAME",
        "Custom.INCUR_DATE",
        "Custom.INCUR_HOURS",
        "Microsoft.VSTS.Scheduling.CompletedWork"
    ];

    constructor() {
        this.runChecks();
    }

    private async runChecks() {
        const container = $("#status-container");
        container.empty();

        try {
            const context = VSS.getWebContext();
            const client = RestClient.getClient();
            const fields = await client.getFields();
            const fieldRefs = fields.map(f => f.referenceName.toLowerCase());

            let html = "<h3>Field Verification</h3><ul>";
            let allOk = true;

            this.requiredFields.forEach(field => {
                const exists = fieldRefs.indexOf(field.toLowerCase()) !== -1;
                const status = exists ? "<span style='color:green'>Found</span>" : "<span style='color:red'>MISSING</span>";
                html += `<li><b>${field}</b>: ${status}</li>`;
                if (!exists) allOk = false;
            });
            html += "</ul>";

            const statusClass = allOk ? "ok" : "error";
            const summary = allOk 
                ? "All required fields are present in the organization." 
                : "Some required fields are missing. Please ensure they are added to the process template.";
            
            container.append(`<div class="status-box ${statusClass}"><h4>${summary}</h4>${html}</div>`);

        } catch (e) {
            container.append(`<div class="status-box error"><h4>Fatal error during diagnostics</h4><p>${e.message}</p></div>`);
        }
    }
}

new Diagnostics();
