import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 w-full ${className}`}>
      {children}
    </div>
  );
}