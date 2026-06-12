# Time Sheet Entry - Azure DevOps Extension

This extension provides a dynamic "Action Button" for Azure DevOps work item forms that allows users to concatenate multiple fields into a single multi-line text field.

## Features

- **Dynamic Concatenation**: Specify any number of fields to be joined.
- **Configurable UI**: Customize the button text directly from the work item form configuration.
- **Validation**:
  - Ensures all source fields are populated before processing.
  - Verifies that the target field is a multi-line field (PlainText or HTML).
- **Auto-Cleanup**: Automatically clears the source input fields after a successful concatenation.
- **Detailed Logging**: Optional console logging for troubleshooting and execution tracking.

## Configuration Parameters

When adding the "Time Sheet Entry Control" to your work item form, you must configure the following inputs in the **Options** tab:

1.  **Fields to Concatenate** (`FieldsToConcat`): A semicolon-separated list of field reference names to join.
    *   *Example*: `Custom.EmployeeName;Custom.EntryDate;Custom.LoggedHours`
2.  **Target Field** (`TargetField`): The reference name of the multi-line field where the result will be stored.
    *   *Example*: `Custom.CSV_Data_hours_incurred`
3.  **Button Text** (`ButtonText`): The text to be displayed on the button.
    *   *Example*: `Submit Time Entry`
4.  **Log** (`Log`): A checkbox to enable or disable console logging.

## Execution Logic

1.  **Validate Config**: Checks if fields are specified.
2.  **Read Values**: Fetches the current values of all source fields.
3.  **Check Completion**: If any source field is empty, it stops and shows an alert.
4.  **Concatenate**: Joins the values with `;`.
5.  **Append**: Adds the new string to the end of the target field, preceded by a newline if it's not empty.
6.  **Clear**: Resets the source fields to empty.
7.  **Error Handling**: If any step fails, a descriptive alert and console error are generated.

## Development and Build

### Prerequisites
- Node.js and npm
- Grunt CLI (`npm install -g grunt-cli`)
- TFX CLI (`npm install -g tfx-cli`)

### Build Instructions
1.  Navigate to the project directory.
2.  Install dependencies:
    ```bash
    npm install --ignore-scripts
    ```
3.  Compile TypeScript and copy assets:
    ```bash
    grunt build
    ```
4.  Package the extension:
    ```bash
    npx tfx-cli extension create --manifest-globs vss-extension.json --output-path ADO_Time_Sheet_Entry_2.5.0.vsix
    ```

---
**Publisher**: JHuelves  
**Extension ID**: ado-time-sheet-entry  
**Version**: 2.5.0
