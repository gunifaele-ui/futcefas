import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Lock screen to portrait on mobile (browsers that support the API)
if (screen?.orientation?.lock) {
  screen.orientation.lock('portrait').catch(() => {
    // Silently ignore — some browsers block this unless the app is in fullscreen/PWA mode
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
