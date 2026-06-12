# Feature URL Concatenator (Azure DevOps Extension)

**Publisher:** Jhuelves  
**Descripción:** Concatena `Custom.StaticUrl` + `Custom.VariableURL` en `Custom.NavegableURL` para Work Items de tipo **Feature**.

## Requisitos
- Node.js y npm
- TFX CLI (`npm i -g tfx-cli`)

## Estructura
- `vss-extension.json` (manifiesto)
- `src/observer.html` + `src/observer.js` (lógica)
- `images/icon.png`

## Empaquetar
```powershell
npm i
# (opcional) npm i -g tfx-cli
# crear VSIX
powershell ./build-package.ps1 -RevPatch
```

El VSIX quedará en `./dist`.

## Instalación
Sube el `.vsix` al publisher **Jhuelves** en el Marketplace e instálalo en tu organización.

## Uso
En Work Items tipo **Feature**, al modificar `Custom.StaticUrl` o `Custom.VariableURL` (o al guardar),
`Custom.NavegableURL` se actualizará automáticamente.
