'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type: ToastType, options?: { duration?: number; action?: Toast['action'] }) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const toastIconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = toastIcons[toast.type]
  
  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border shadow-lg
        transform transition-all duration-300 ease-out
        animate-slide-in-right
        ${toastStyles[toast.type]}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${toastIconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick()
              onDismiss(toast.id)
            }}
            className="mt-2 text-sm font-semibold underline underline-offset-2 hover:opacity-80"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 opacity-60" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((
    message: string, 
    type: ToastType, 
    options?: { duration?: number; action?: Toast['action'] }
  ) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = options?.duration ?? (type === 'error' ? 6000 : 4000)
    
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      action: options?.action,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Toast Container */}
      <div 
        className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-col gap-3 items-end pointer-events-auto max-w-sm ml-auto">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
