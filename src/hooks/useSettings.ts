import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'language_app_settings';

interface AppSettings {
  apiKey: string;
}

/**
 * Custom hook for managing application settings, such as API keys.
 * Persists settings to localStorage.
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({ apiKey: '' });

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const storedData = window.localStorage.getItem(SETTINGS_KEY);
      if (storedData) {
        setSettings(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }, []);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      setSettings(newSettings);
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      alert('Failed to save settings.');
    }
  }, []);

  return { settings, saveSettings };
};