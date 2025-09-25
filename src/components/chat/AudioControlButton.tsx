"use client";
import React from 'react';

interface AudioControlButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const AudioControlButton: React.FC<AudioControlButtonProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      aria-label={label}
      className={`size-[72px] rounded-[36px] flex items-center justify-center transition-colors p-6 bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 ${active ? 'ring ring-blue-500' : ''}`}
    >
      {icon}
    </button>
  );
};
