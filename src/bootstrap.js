import React from 'react';
import { globalInit } from './preset';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

const renderRoot = async App => {
  const globalPreset = await globalInit();
  root.render(
    <React.StrictMode>
      <App themeToken={globalPreset.themeToken} globalPreset={globalPreset} />
    </React.StrictMode>
  );
};

renderRoot(App);
