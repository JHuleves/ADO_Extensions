/// <reference types="vss-web-extension-sdk" />

import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

interface ITimeEntry {
    originalIndex: number;
    name: string;
    date: string; // DD/MM/YYYY
    hours: string; // 0,00
    incurred: boolean;
    dateObj: Date;
}

export class TableControl {
    private entries: ITimeEntry[] = [];

    constructor() {
        this.initialize();
    }

    private async initialize() {
        // Register with lifecycle methods to prevent "failed to load" errors
        VSS.register(VSS.getContribution().id, {
            onFieldChanged: async (args: any) => {
                if (args.changedFields["Custom.CSV_Data_hours_incurred"] !== undefined) {
                    await this.refresh();
                }
            },
            onLoaded: async (args: any) => {
                await this.refresh();
            }
        });

        document.getElementById("delete-btn")?.addEventListener("click", () => {
            this.deleteSelected();
        });

        await this.refresh();
    }

    public async refresh() {
        try {
            const service = await WorkItemFormService.getService();
            const csvData = await service.getFieldValue("Custom.CSV_Data_hours_incurred") as string;
            this.entries = this.parseCSV(csvData);
            this.sortEntries();
            this.render();
            await this.updateTotalHours();
        } catch (e) {
            console.error("Error refreshing table:", e);
        }
    }

    private parseCSV(csv: string): ITimeEntry[] {
        if (!csv) return [];
        const lines = csv.split("\n").filter(line => line.trim().length > 0);
        return lines.map((line, index) => {
            const parts = line.split(";");
            const dateStr = parts[1] || "";
            const dateParts = dateStr.split("/");
            let dateObj = new Date(0);
            if (dateParts.length === 3) {
                dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
            }

            return {
                originalIndex: index,
                name: parts[0] || "",
                date: dateStr,
                hours: parts[2] || "0,00",
                incurred: parts[3] === "1",
                dateObj: dateObj
            };
        });
    }

    private sortEntries() {
        this.entries.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }

    private render() {
        const tbody = document.getElementById("table-body");
        if (!tbody) return;

        tbody.innerHTML = "";
        this.entries.forEach(entry => {
            const tr = document.createElement("tr");
            
            const tdCheck = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "row-selector";
            checkbox.dataset.index = entry.originalIndex.toString();
            if (entry.incurred) {
                checkbox.disabled = true;
            }
            checkbox.addEventListener("change", () => this.updateDeleteButtonState());
            tdCheck.appendChild(checkbox);
            tr.appendChild(tdCheck);

            const fields = [entry.name, entry.date, entry.hours, entry.incurred ? "✓" : ""];
            fields.forEach((text, i) => {
                const td = document.createElement("td");
                td.textContent = text;
                if (i === 3) td.className = "center-text";
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        this.updateDeleteButtonState();
    }

    private updateDeleteButtonState() {
        const anyChecked = $(".row-selector:checked").length > 0;
        const deleteBtn = document.getElementById("delete-btn") as HTMLButtonElement;
        if (deleteBtn) {
            deleteBtn.disabled = !anyChecked;
        }
    }

    public async deleteSelected() {
        const selectedIndices = $(".row-selector:checked").map(function() {
            return parseInt($(this).data("index"));
        }).get() as number[];

        if (selectedIndices.length === 0) return;

        try {
            const service = await WorkItemFormService.getService();
            const csvData = await service.getFieldValue("Custom.CSV_Data_hours_incurred") as string;
            if (!csvData) return;

            const lines = csvData.split("\n").filter(line => line.trim().length > 0);
            const filteredLines = lines.filter((_, index) => !selectedIndices.includes(index));
            
            const newValue = filteredLines.length > 0 ? filteredLines.join("\n") + "\n" : "";
            await service.setFieldValue("Custom.CSV_Data_hours_incurred", newValue);
            await this.refresh();
        } catch (e) {
            console.error("Error deleting entries:", e);
        }
    }

    public async updateTotalHours() {
        try {
            const service = await WorkItemFormService.getService();
            let total = 0;
            this.entries.forEach(entry => {
                const h = parseFloat(entry.hours.replace(",", "."));
                if (!isNaN(h)) {
                    total += h;
                }
            });

            // Update Completed Work field
            await service.setFieldValue("Microsoft.VSTS.Scheduling.CompletedWork", total);
            console.log("Completed Work updated to:", total);
        } catch (e) {
            console.error("Error updating total hours:", e);
        }
    }
}

new TableControl();
VSS.notifyLoadSucceeded();
