import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '7xl' | 'full' | '1600px';
}

export default function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = '7xl' 
}: ResponsiveContainerProps) {
  const maxWidthClass = {
    '7xl': 'max-w-7xl',
    '1600px': 'max-w-[1600px]',
    'full': 'max-w-full'
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}>
      {children}
    </div>
  );
}
