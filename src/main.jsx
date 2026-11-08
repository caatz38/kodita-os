import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import './styles/tokens.css';
import './styles/global.css';
import App from './App.jsx';
import './styles/liquid.css'; // loaded last so it layers on top
import { installSpringVars } from './os/liquid.js';

installSpringVars();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
