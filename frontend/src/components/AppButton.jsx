import React from 'react';

export default function AppButton({ title, onClick, type = 'primary', className = '' }) {
  const baseClasses = 'w-full text-lg font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark';
  const typeClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-accent text-primary hover:bg-primary-light/50',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      {title}
    </button>
  );
}