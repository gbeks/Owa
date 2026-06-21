'use client';

import { CheckCircle, XCircle, X } from 'lucide-react';
import type { Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl p-4 shadow-lg text-white text-sm max-w-sm w-full
        ${toast.type === 'success' ? 'bg-owa-green' : 'bg-red-600'}`}
    >
      {toast.type === 'success' ? (
        <CheckCircle size={18} className="mt-0.5 shrink-0" />
      ) : (
        <XCircle size={18} className="mt-0.5 shrink-0" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
