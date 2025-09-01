// src/components/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#393939] text-white hover:bg-gray-800 focus:ring-[#393939]',
    secondary: 'bg-white text-[#393939] border border-gray-300 hover:bg-gray-50 focus:ring-[#393939]',
    accent: 'bg-[#FFD700] text-[#393939] hover:bg-yellow-400 focus:ring-[#FFD700]',
    outline: 'border-2 border-[#393939] text-[#393939] hover:bg-[#393939] hover:text-white focus:ring-[#393939]'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
