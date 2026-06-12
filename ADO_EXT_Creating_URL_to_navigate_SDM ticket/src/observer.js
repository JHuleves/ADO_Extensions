
// Feature URL Concatenator - JavaScript only
// Lógica: concatena Custom.StaticUrl + Custom.VariableURL en Custom.NavegableURL para Work Items tipo Feature

(async function() {
  try {
    // Inicializa SDK y handshake con el host
    SDK.init({ loaded: false });
    await SDK.ready();
    SDK.notifyLoadSucceeded();

    const workItemFormService = await SDK.getService('ms.vss-work-web.work-item-form');

    const hasWi = await workItemFormService.hasActiveWorkItem();
    if (!hasWi) {
      console.warn('[Feature URL Concat] No hay Work Item activo.');
      return;
    }

    const wiType = await workItemFormService.getFieldValue('System.WorkItemType');
    if (wiType !== 'Feature') {
      // Solo aplica a Features
      return;
    }

    async function concatAndSet() {
      try {
        const staticUrl = await workItemFormService.getFieldValue('Custom.StaticUrl', true);
        const variableUrl = await workItemFormService.getFieldValue('Custom.VariableURL', true);

        if (typeof staticUrl !== 'string' || typeof variableUrl !== 'string') {
          console.warn('[Feature URL Concat] Campos no son string o no existen.');
          return;
        }

        const result = `${staticUrl}${variableUrl}`;
        await workItemFormService.setFieldValue('Custom.NavegableURL', result);
      } catch (e) {
        console.error('[Feature URL Concat] Error al concatenar:', e);
        try { workItemFormService.setError && workItemFormService.setError('No se pudo generar Custom.NavegableURL. Verifique existencia de campos y permisos.'); } catch(_){ }
      }
    }

    // Observer: reacciona a cambios y guardado
    const observer = {
      onFieldChanged: async (args) => {
        const changed = (args && args.changedFields) || [];
        if (changed.includes('Custom.StaticUrl') || changed.includes('Custom.VariableURL')) {
          await concatAndSet();
        }
      },
      onSaving: async () => {
        await concatAndSet();
      }
    };

    // Registra el objeto para que el host invoque los callbacks
    try {
      const contributionId = SDK.getContributionId && SDK.getContributionId();
      if (contributionId) {
        SDK.register(contributionId, observer);
      } else {
        // Fallback (muy raro que ocurra)
        SDK.register('feature-url-concat-observer', observer);
      }
    } catch (e) {
      console.warn('[Feature URL Concat] No se pudo registrar observer:', e);
    }

    // Ejecuta una vez al cargar
    await concatAndSet();

  } catch (err) {
    console.error('[Feature URL Concat] Error de carga:', err);
    try { SDK.notifyLoadFailed && SDK.notifyLoadFailed(err?.message || String(err)); } catch (_){ }
  }
})();
