# Insert Transport Order Button

Añade un botón configurable al formulario de work item de Azure DevOps para registrar,
validar y — opcionalmente — verificar contra SAP una **orden de transporte**.

## ¿Qué hace el botón?

Al pulsarlo:

1. Si el campo de **Transport Order** está vacío, no hace nada.
2. Si el contenido no tiene exactamente **10 caracteres**, muestra un error de tamaño.
3. Si el campo de **Comments** contiene un `;`, muestra un error (ese carácter está reservado
   como separador interno).
4. Si **Check OData SAP** está activo, consulta el servicio OData `ZBC_OD_TRANSPORT_ORDER_STATUS`:
   - Si no hay comunicación, muestra un error.
   - Si la orden no existe en SAP, avisa y limpia los campos de Transport Order, Need System
     Down, Need Transaction Blocked y Comments.
5. Si todo es correcto, actualiza el campo de concatenación (**TransportOrderData**): si la
   orden ya está en la lista, actualiza su línea; si no, añade una línea nueva incrementando la
   secuencia. La estructura de columnas de esa concatenación se define en el campo
   **StructureOrderData** del work item.

## Configuración del control

Al añadir el control a un layout de work item, se configuran estos parámetros:

| Parámetro | Descripción |
|---|---|
| Button text | Texto del botón |
| Transport Order field | Campo con la orden de transporte |
| Need System Down field | Campo flag "Need System Down" |
| Need Transaction Blocked field | Campo flag "Need Transaction Blocked" |
| Comments field | Campo de comentarios |
| Transport Order Data field | Campo destino de la concatenación |
| Check OData SAP | Activa la verificación contra SAP |
| OData URI | URI del servicio OData SAP (obligatorio) |
| SAP user / SAP password | Credenciales para la conexión OData |

## Fuente

Basado en el patrón de control de trabajo de Azure DevOps (VSS SDK) y en el resto de
extensiones del mismo publisher (`ADO_Create_task_button`, `ADO_Incur_hours_button`,
`ADO_Incur_hours_table`).
