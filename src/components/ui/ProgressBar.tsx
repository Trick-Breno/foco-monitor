import React from 'react';

interface ProgressBarProps {
  progress: number; // Um número de 0 a 100
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress)); // Garante que o progresso fique entre 0 e 100

  return (
    <div className="w-full bg-gray-700 rounded-full h-6 relative overflow-hidden">
      <div
        className="bg-purple-600 h-6 rounded-full text-center text-white text-xs font-semibold flex items-center justify-end pr-2 transition-all duration-500"
        style={{ width: `${safeProgress}%` }}
      >
        {label || `${Math.round(safeProgress)}%`}
      </div>
    </div>
  );
}