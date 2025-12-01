'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{
        fontSize: '14px',
      }}
      toastStyle={{
        background: 'white',
        color: '#374151',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}
      progressStyle={{
        background: 'linear-gradient(to right, #2563eb, #3b82f6)',
      }}
    />
  );
}