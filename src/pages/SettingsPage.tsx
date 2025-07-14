import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

export const SettingsPage: React.FC = () => {
  const { settings, saveSettings } = useSettings();
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ apiKey });
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      {message && <p className="settings-success-message">{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <label htmlFor="apiKey" className="settings-label">
            OpenAI API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="settings-input"
            placeholder="Enter your OpenAI API key"
          />
          <p className="settings-help-text">
            You can get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI's platform</a>.
          </p>
        </div>
        <button type="submit" className="settings-submit-btn">Save Settings</button>
      </form>
    </div>
  );
};