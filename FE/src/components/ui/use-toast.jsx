import * as React from 'react'

import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const TOAST_LIMIT = 3

const toastVariants = cva({
  variant: 'default',
  classVariants: {
    default: 'bg-white text-gray-900 border border-gray-200 shadow-lg',
    destructive: 'bg-red-600 text-white border-red-600',
    success: 'bg-green-600 text-white border-green-600',
  },
})

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastPrimitives.Provider>
      {toasts.map(function ({ id, title, description, variant, ...props }) {
        return (
          <Toast
            key={id}
            id={id}
            title={title}
            description={description}
            variant={variant}
            onDismiss={() => {}}
            {...props}
          />
        )
      })}
      <ToastPrimitives.Viewport className="fixed top-0 right-0 flex flex-col gap-2 w-full max-w-sm p-4 z-50" />
    </ToastPrimitives.Provider>
  )
}

export function useToast() {
  const [toasts, setToasts] = React.useState([])

  const toast = React.useCallback(
    ({ title, description, variant = 'default', duration = 5000 }) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast = {
        id,
        title,
        description,
        variant,
        duration,
      }

      setToasts(prev => {
        const filteredToasts = prev.filter(t => t.id !== id)
        return [...filteredToasts, newToast]
      })

      // Auto remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    },
    [toasts]
  )

  const dismiss = React.useCallback(
    (toastId) => {
      setToasts(prev => prev.filter(t => t.id !== toastId))
    },
    [toasts]
  )

  return {
    toast,
    dismiss,
    toasts,
  }
}

export { toastVariants }

export function Toast({ id, title, description, variant, onDismiss, ...props }) {
  return (
    <div className={cn(
      toastVariants({ variant }),
      'relative w-full rounded-lg p-4 shadow-lg border transition-all duration-300 ease-in-out',
      props.className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6L6 18z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
