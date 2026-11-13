import { createContext, useContext } from 'react'

export interface ConfirmOptions {
  title: string
  name?: string
  message?: string
  description?: string
  confirmText?: string
  onConfirm: () => void
}

export type ConfirmRequest = (options: ConfirmOptions) => void

export const ConfirmContext = createContext<ConfirmRequest | null>(null)

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm必须在ConfirmProvider内使用')
  return confirm
}
