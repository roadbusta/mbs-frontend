/**
 * Main application entry point
 * 
 * This file bootstraps the React application and renders it to the DOM.
 * It sets up the root component and any global providers needed.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Get the root element from index.html
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has a div with id="root"');
}

// Create React root and render the app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);