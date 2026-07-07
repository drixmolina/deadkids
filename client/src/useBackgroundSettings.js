import { useEffect, useState } from 'react';
import { request } from './api.js';
import { defaultBackgroundSettings, mergeBackgroundSettings } from './backgroundConfig.js';

let cachedSettings = defaultBackgroundSettings;

export function useBackgroundSettings() {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await request('/api/background-settings');
      cachedSettings = mergeBackgroundSettings(data);
      setSettings(cachedSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const save = async next => {
    const merged = mergeBackgroundSettings(next);
    const saved = await request('/api/background-settings', { method: 'PUT', body: JSON.stringify(merged) });
    cachedSettings = mergeBackgroundSettings(saved.background_settings || merged);
    setSettings(cachedSettings);
    window.dispatchEvent(new CustomEvent('background-settings-updated', { detail: cachedSettings }));
    return cachedSettings;
  };

  const reset = async () => save(defaultBackgroundSettings);

  return { settings, setSettings, loading, load, save, reset };
}
