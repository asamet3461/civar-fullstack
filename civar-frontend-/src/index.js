import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MessageHubProvider } from './context/MessageHubContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MessageHubProvider>
      <App />
    </MessageHubProvider>
  </React.StrictMode>
);




reportWebVitals();
