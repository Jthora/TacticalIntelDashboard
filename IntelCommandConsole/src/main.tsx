import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { displaySettings } from './utils/DisplaySettingsManager';

// Import CSS files for styling - tactical-ui.css contains critical base styles
import './assets/styles/tactical-ui.css';

// Import main CSS which includes layout styles
import './assets/styles/layout.css';
import './assets/styles/main.css';

// Import component-specific styles
import './assets/styles/components/settings-page.css';
import './assets/styles/components/settings-error.css';
import './assets/styles/components/loading-indicator.css';
import './assets/styles/components/settings-feedback.css';
import './assets/styles/components/cors-settings.css';
import './assets/styles/components/protocol-settings.css';
import './assets/styles/components/verification-settings.css';
import './assets/styles/components/general-settings.css';

// Import new components styles
import './components/settings/SettingsChangeIndicator.css';
import './components/settings/ConfirmationDialog.css';
import './components/settings/SettingsTooltip.css';

// Apply display settings from user preferences
// displaySettings.apply(); // DISABLED: This was applying blue alliance theme

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}