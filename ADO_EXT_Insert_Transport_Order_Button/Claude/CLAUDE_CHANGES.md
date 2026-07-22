# Cambios de Claude sobre el proyecto original

Base: ZIP subido de `ADO_EXT_Insert_Transport_Order_Button` (manifest ya en versión 1.0.4).
La lógica de negocio en `model.ts` (validaciones, reset de campos, concatenación con
secuencia) ya estaba correctamente implementada y se ha mantenido casi intacta. Cambios:

## Corregido / añadido

1. **`vss-extension.json` — faltaban los `inputs` de la contribución.**
   Sin esto no había forma de configurar los 10 parámetros (ButtonText, TransportOrderField,
   NeedSystemDownField, NeedTransactionBlockedField, CommentsField, TransportOrderDataField,
   CheckOdataSap, OdataUri, SapUser, SapPassword) al añadir el control a un layout de work
   item: el control se instalaba pero era imposible de configurar desde la UI de Azure DevOps.
   Añadidos con tipo, `workItemFieldTypes` y validación (`isRequired`) para cada uno.

2. **`vss-extension.json` — metadatos de Marketplace ausentes**: `description`, `icons`
   (`img/logo.png`), `content.details` (→ `details.md`), `content.license`, `content.privacy`,
   `tags`. Necesarios para una publicación decente en el Marketplace.

3. **`scripts/model.ts` — la URL OData no incluía el entity set.** Se consultaba
   `{OdataUri}('{orden}')` directamente; ahora se añade `/ZBC_OD_TRANSPORT_ORDER_STATUS` si la
   URI configurada no lo incluye ya, tal y como se especificó (el flag "Check Odata SAP"
   verifica explícitamente contra esa entidad).

4. **`scripts/workitemControl.ts` — bug de parseo de `CheckOdataSap`.** `inputs["CheckOdataSap"]
   ? true : false` trataba el string `"false"` como verdadero (string no vacío = truthy en JS).
   Se sustituyó por un parseo robusto que acepta boolean real o texto `"true"/"false"/"1"/"0"`.

5. **`details.md` y `README.md` reescritos.** Ambos describían aún la plantilla base
   "Action Button Control" (botón "Convert work item", widget de dashboard, capturas que no
   existen en el proyecto) en vez de la funcionalidad real de Transport Order.

6. **Ficheros huérfanos de la plantilla base excluidos del manifest y de esta carpeta**:
   `configActionButton.html`, `configCreateTaskButton.html`, `widgetActionButton.html`,
   `widgetConfiguration.html`, `widgetCreateTaskButton.html`, `src/logo.png` (duplicado de
   `img/logo.png`). Referenciaban scripts inexistentes (`appConfig`, `appWidget`,
   `appWidgetConfiguration`) y no forman parte de esta extensión (son restos de copiar
   `Action_Button_Control-master` / `ADO_Create_task_button`). Si quieres conservarlos en el
   repo por referencia no hay problema, pero no deben ir en el `files` del manifest.

7. **VSIX generado**: `VSIX_Files/Insert_Transport_Order_Button-1.0.4.vsix`, empaquetado con
   `tfx-cli` y `configs/release.json` (id `insert-transport-order-button`, publisher
   `JHuelves`, público). Verificado: contiene el manifest con los `inputs`, el icono y los
   ficheros de contenido, sin los ficheros huérfanos.

## No modificado

- Lógica de validación y concatenación en `model.ts` (tamaño 10, `;` en Comments, reset de
  campos, incremento de secuencia, actualización de línea existente): ya cumplía la
  especificación y se ha dejado igual salvo el punto 3.
- `gruntfile.js`, `karma.conf.js`, `tsconfig.json`, `configs/dev.json`, `configs/release.json`.

## Pendiente de decidir (no es código, es una decisión operativa)

`SapUser`/`SapPassword` se guardan como inputs de configuración del control, en texto plano,
dentro del layout/proceso del work item — es el mecanismo estándar de este tipo de control, sin
cifrado propio. Si la política de seguridad lo requiere, usa un usuario de servicio SAP de solo
lectura sobre el OData en vez de credenciales personales.
