import React from 'react';

// Este é o componente que estava causando o problema
export const WidgetStatus = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center justify-center h-40 bg-gray-800 rounded-lg">
      <p className="text-gray-400">{message}</p>
    </div>
  );
};