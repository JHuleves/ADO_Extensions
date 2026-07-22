# Insert Transport Order Button

Control de work item para Azure DevOps (VSS SDK / `ms.vss-work-web.work-item-form-control`)
que añade un botón para registrar y validar una orden de transporte, con verificación
opcional contra SAP mediante OData.

![Control](img/logo.png)

## Estructura del proyecto

```
/scripts              - Código TypeScript/JS del control
    app.ts/js          - Bootstrap: registra el provider en el formulario de work item
    workitemControl.ts/js - Lee VSS.getConfiguration().witInputs y crea Model/View
    model.ts/js         - Validaciones, consulta OData y actualización de campos
    view.ts/js           - Renderiza el botón
/styles                - CSS del control
/img                   - Icono de la extensión (usado también en el manifest)
/test, test-main.js, karma.conf.js - Infraestructura de test (karma/mocha/chai)
test_logic.js           - Smoke test de la lógica de parseo/concatenación (Node, standalone)
index.html               - Punto de entrada del IFrame del control
vss-extension.json        - Manifest de la extensión
configs/dev.json, configs/release.json - Overrides de id/publisher/public para tfx-cli
```

## Parámetros de configuración

Se definen como `inputs` de la contribución en `vss-extension.json` y se leen en
`workitemControl.ts` desde `VSS.getConfiguration().witInputs`:

| Id (witInputs) | Descripción |
|---|---|
| `ButtonText` | Texto del botón (por defecto "Insert Transport Order") |
| `TransportOrderField` | Refname del campo "Transport Order" |
| `NeedSystemDownField` | Refname del campo flag "Need System Down" |
| `NeedTransactionBlockedField` | Refname del campo flag "Need Transaction Blocked" |
| `CommentsField` | Refname del campo "Comments" |
| `TransportOrderDataField` | Refname del campo destino de la concatenación |
| `CheckOdataSap` | Boolean: activa la verificación contra SAP |
| `OdataUri` | URI base del servicio OData SAP (obligatorio) |
| `SapUser` / `SapPassword` | Credenciales Basic Auth para el OData |

> **Nota de seguridad**: `SapUser`/`SapPassword` se guardan como inputs del control en la
> configuración del proceso/layout del work item, sin cifrar. Es el mismo mecanismo que usa
> el resto de controles de work item de este tipo; si se requiere mayor seguridad, conviene
> usar un usuario de servicio con permisos mínimos (solo lectura del OData) en vez de
> credenciales personales.

## Lógica al pulsar el botón (`model.ts`)

1. `Transport Order` vacío → no hace nada.
2. `Transport Order` con longitud distinta de 10 → error de tamaño.
3. `Comments` con `;` → error (carácter reservado como separador).
4. Si `CheckOdataSap` está activo, se consulta
   `{OdataUri}/ZBC_OD_TRANSPORT_ORDER_STATUS('{TransportOrder}')` (si `OdataUri` ya incluye el
   entity set, no se duplica):
   - Fallo de comunicación (status distinto de 404) → error y no se continúa.
   - HTTP 404 (orden no existe) → aviso + se limpian `TransportOrderField`,
     `NeedSystemDownField`, `NeedTransactionBlockedField` y `CommentsField`.
   - Orden encontrada → continúa con los datos devueltos por SAP.
5. Se lee `TransportOrderDataField` (líneas separadas por `\n`, columnas separadas por `;`)
   y el campo de work item `StructureOrderData` (o `Custom.StructureOrderData`), que define el
   orden de columnas. Si `StructureOrderData` está vacío se usa por defecto:
   `Sequence;TransportOrder;NeedSystemDown;NeedTransactionBlocked;Status;User;Date;Time;Comments`.
6. Si la orden ya existe en los datos, se actualiza su línea con los valores leídos de los
   campos y (si aplica) del OData. Si no existe, se incrementa en 1 la secuencia (manteniendo
   el padding numérico detectado) y se añade una línea nueva.

## Compilar y empaquetar

```
npm install
npm install -g grunt-cli tfx-cli   # si no están ya instalados globalmente
grunt build            # compila scripts/*.ts -> scripts/*.js
grunt package-dev      # genera el .vsix de desarrollo (id/public según configs/dev.json)
grunt package-release  # genera el .vsix de release  (id/public según configs/release.json)
```

`tfx-cli` usa el manifest `vss-extension.json` como base y aplica el `--overrides-file`
correspondiente. El número de versión se toma de `vss-extension.json` (actualmente `1.0.4`).
Para publicar directamente al Marketplace: `grunt publish-dev` / `grunt publish-release`
(requiere estar autenticado con un PAT de Marketplace vía `tfx login`).

## Añadir el control a un work item type (TFS on-prem / WebLayout XML)

1. Exportar el WIT: `witadmin exportwitd /collection:CollectionURL /p:Project /n:TypeName /f:FileName`
2. Añadir la referencia a la extensión:
   ```xml
   <Extensions>
     <Extension Id="JHuelves.insert-transport-order-button" />
   </Extensions>
   ```
3. Añadir la contribución con sus inputs en el grupo/página deseado:
   ```xml
   <ControlContribution Label="Transport Order" Id="JHuelves.insert-transport-order-button.insert-transport-order-button-control">
     <Inputs>
       <Input Id="ButtonText" Value="Insert Transport Order" />
       <Input Id="TransportOrderField" Value="Custom.TransportOrder" />
       <Input Id="NeedSystemDownField" Value="Custom.NeedSystemDown" />
       <Input Id="NeedTransactionBlockedField" Value="Custom.NeedTransactionBlocked" />
       <Input Id="CommentsField" Value="Custom.Comments" />
       <Input Id="TransportOrderDataField" Value="Custom.TransportOrderData" />
       <Input Id="CheckOdataSap" Value="true" />
       <Input Id="OdataUri" Value="https://sap-host/sap/opu/odata/sap/ZBC_SRV_TRANSPORT_ORDER" />
       <Input Id="SapUser" Value="svc_ado_sap" />
       <Input Id="SapPassword" Value="********" />
     </Inputs>
   </ControlContribution>
   ```
4. Importar: `witadmin importwitd /collection:CollectionURL /p:Project /f:FileName`

En Azure DevOps Services / Server con el editor de proceso moderno, estos mismos `inputs` se
rellenan desde un diálogo al arrastrar el control al layout — no hace falta editar XML.

## Tests

`test_logic.js` reproduce en Node, de forma aislada, la lógica de parseo/concatenación de
`processTransportOrderData` como smoke test rápido (`node test_logic.js`). La infraestructura
`karma`/`mocha`/`chai` (`grunt test`) queda preparada para añadir tests `*.tests.ts` reales
sobre los módulos compilados.
