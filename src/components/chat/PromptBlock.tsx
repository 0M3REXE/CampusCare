"use client";
import React from 'react';

interface PromptBlockProps {
  lines: string[];
}

export const PromptBlock: React.FC<PromptBlockProps> = ({ lines }) => {
  return (
    <div className="flex flex-col gap-8 items-center" data-name="PromptBlock">
      <div className="text-white text-center text-[32px] leading-[1.24] font-medium select-none" aria-live="polite">
        {lines.map((l, i) => (
          <p key={i} className="m-0">{l}</p>
        ))}
      </div>
    </div>
  );
};
