'use client';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, getSettings, saveSettings, type SettingsRow } from './db';
import { FONT_SIZE_DELTA } from './i18n';

export function useSettings() {
  const [settings, setSettings] = useState<SettingsRow>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings().then((s) => {
      if (!cancelled) {
        setSettings(s);
        setLoaded(true);
        applyFontSize(s.fontSize);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(
    async (patch: Partial<Omit<SettingsRow, 'id'>>) => {
      const next = await saveSettings(patch);
      setSettings(next);
      if (patch.fontSize) applyFontSize(next.fontSize);
    },
    [],
  );

  return { settings, loaded, update };
}

function applyFontSize(size: SettingsRow['fontSize']) {
  if (typeof document === 'undefined') return;
  const delta = FONT_SIZE_DELTA[size];
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const base = isMobile ? 17 : 16;
  document.documentElement.style.setProperty('--font-size-body', `${base + delta}px`);
}
