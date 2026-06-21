'use client';

import { Flag } from 'lucide-react';

interface FlagButtonProps {
  onClick: () => void;
}

export function FlagButton({ onClick }: FlagButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5
        text-xs font-medium text-gray-400 hover:border-red-300 hover:text-red-500
        transition-colors"
      aria-label="Flag this step as incorrect"
    >
      <Flag size={12} />
      Flag step
    </button>
  );
}
