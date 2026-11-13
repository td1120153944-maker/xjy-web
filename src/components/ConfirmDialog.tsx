import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { ConfirmContext } from './ConfirmContext'
import type { ConfirmOptions } from './ConfirmContext'

export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfirmOptions | null>(null)
  const confirm = useCallback((options: ConfirmOptions) => setConfig(options), [])
  const close = () => setConfig(null)
  const accept = () => {
    if (!config) return
    const onConfirm = config.onConfirm
    setConfig(null)
    onConfirm()
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {config && (
        <div className="modal-backdrop data-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close() }}>
          <section className="data-editor data-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="global-confirm-title">
            <header><h2 id="global-confirm-title">{config.title}</h2><button onClick={close} aria-label="关闭删除确认"><X /></button></header>
            <div className="data-confirm-body">
              <p>{config.message || (config.name ? <>确认删除<strong>“{config.name}”</strong>？</> : '确认删除当前记录？')}</p>
              {config.description && <span>{config.description}</span>}
            </div>
            <footer><button className="data-primary-button data-danger-button" onClick={accept}>{config.confirmText || '确认删除'}</button><button onClick={close}>取消</button></footer>
          </section>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
