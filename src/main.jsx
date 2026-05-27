import React from 'react'
import ReactDOM from 'react-dom/client'
import { db } from '@/api/base44Client'
import App from '@/App.jsx'
import '@/index.css'

globalThis.__B44_DB__ = db;

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
