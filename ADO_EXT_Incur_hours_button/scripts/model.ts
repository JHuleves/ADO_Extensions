import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

export interface documentBuild {
    op: string;
    path: string;
    value: any;
}

export class Model {

    public fieldsToConcat: string[];
    public targetField: string;
    public buttonNameList: string[];
    public buttonFunctionList: string[];
    private logEnabled: boolean;

    constructor(fieldsToConcat: string, targetField: string, buttonText: string, logEnabled: boolean = false) {
        this.logEnabled = logEnabled;
        this.fieldsToConcat = fieldsToConcat.split(";").map(f => f.trim()).filter(f => f !== "");
        this.targetField = targetField.trim();
        this.buttonNameList = [buttonText];
        this.buttonFunctionList = ["executeConcatenation"];
    }

    public buttonPressed(pressed: string, btnIndex: number): void {
        if (this.logEnabled) {
            console.log("Button pressed: " + pressed + " at index: " + btnIndex);
        }
        if (pressed === "executeConcatenation") {
            this.executeConcatenation();
        }
    }

    private executeConcatenation() {
        if (this.fieldsToConcat.length === 0 || !this.targetField) {
            const configError = "Error: Extension not correctly configured. Please provide fields to concatenate and a target field.";
            console.error(configError);
            alert(configError);
            return;
        }

        const fieldsToFetch = [...this.fieldsToConcat, this.targetField];

        WorkItemFormService.getService().then((service) => {
            // Check if target field is multi-line (PlainText or Html)
            service.getFields().then((fields) => {
                const targetFieldInfo = fields.filter(f => f.referenceName === this.targetField)[0];
                if (targetFieldInfo) {
                    // FieldType 5 is PlainText, 6 is Html. Both are multi-line.
                    if (targetFieldInfo.type !== 5 && targetFieldInfo.type !== 6) {
                        const typeError = `Error: Target field '${this.targetField}' is not a multi-line field (Type: ${targetFieldInfo.type}). Please use a PlainText or HTML field.`;
                        console.error(typeError);
                        alert(typeError);
                        return;
                    }
                } else {
                    console.warn(`Could not verify type for field '${this.targetField}'. Proceeding anyway.`);
                }

                service.getFieldValues(fieldsToFetch).then((values) => {
                    if (this.logEnabled) {
                        console.log("Fetched values:", values);
                    }

                    // 1. Validate fields exist and are not empty
                    let missingFields = [];
                    let valuesToConcat = [];

                    this.fieldsToConcat.forEach(field => {
                        const val = values[field];
                        if (val === undefined || val === null || val === "") {
                            missingFields.push(field);
                        } else {
                            valuesToConcat.push(val);
                        }
                    });

                    if (missingFields.length > 0) {
                        const errorMsg = "Error: Validation failed. The following fields are empty or could not be read: " + missingFields.join(", ");
                        console.error(errorMsg);
                        alert(errorMsg);
                        return;
                    }

                    // 2. Perform concatenation
                    const newEntry = valuesToConcat.join(";");
                    const currentData = values[this.targetField] || "";
                    let updatedData = currentData ? `${currentData}\n${newEntry}` : newEntry;

                    if (this.logEnabled) {
                        console.log("New Entry: " + newEntry);
                        console.log("Updated Target Data: " + updatedData);
                    }

                    // 3. Update target field
                    service.setFieldValue(this.targetField, updatedData).then(() => {
                        if (this.logEnabled) {
                            console.log(`Field '${this.targetField}' updated successfully.`);
                        }
                        // 4. Clear the input fields upon success
                        this.fieldsToConcat.forEach(field => {
                            service.setFieldValue(field, "");
                        });
                    }, (error) => {
                        const updateError = `Error updating '${this.targetField}': ` + JSON.stringify(error);
                        console.error(updateError);
                        alert(updateError);
                    });
                }, (error) => {
                    const fetchError = "Error: Could not read fields from Work Item. " + JSON.stringify(error);
                    console.error(fetchError);
                    alert(fetchError);
                });
            }, (error) => {
                const fieldsError = "Error: Could not retrieve work item fields metadata. " + JSON.stringify(error);
                console.error(fieldsError);
                alert(fieldsError);
            });
        });
    }
}
