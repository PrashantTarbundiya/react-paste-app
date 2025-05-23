import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './store.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <div className="bg-gray-800 min-w-[600px]">
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>
  </div>
);
