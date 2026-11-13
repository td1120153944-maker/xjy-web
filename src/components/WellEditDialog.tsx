import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { toast } from 'sonner'
import type { WellFormValues } from '../types'
import { detailLeftFields, detailRightFields, gyroHiddenFields, wellFieldLabels, wellSelectOptions } from './wellFormConfig'

interface WellEditDialogProps {
  mode: 'create' | 'update'
  initialValues: WellFormValues
  onClose: () => void
  onSubmit: (values: WellFormValues) => void
}

type WorkMode = 'regular' | 'gyro'

export default function WellEditDialog({ mode, initialValues, onClose, onSubmit }: WellEditDialogProps) {
  const [form, setForm] = useState<WellFormValues>(initialValues)
  const [workMode, setWorkMode] = useState<WorkMode>('regular')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const updateField = (key: keyof WellFormValues, value: string) => setForm(current => ({ ...current, [key]: value }))

  const leftFields = useMemo(
    () => (workMode === 'regular' ? detailLeftFields : detailLeftFields.filter(key => !gyroHiddenFields.includes(key))),
    [workMode],
  )
  const rightFields = useMemo(
    () => (workMode === 'regular' ? detailRightFields : detailRightFields.filter(key => !gyroHiddenFields.includes(key))),
    [workMode],
  )

  const renderField = (key: keyof WellFormValues) => {
    const options = wellSelectOptions[key]
    return (
      <label className="well-form-field required" key={key}>
        <span>{wellFieldLabels[key]}</span>
        {options ? (
          <select aria-label={wellFieldLabels[key]} value={form[key]} onChange={e => updateField(key, e.target.value)}>
            <option value="">请选择</option>
            {options.map(option => <option key={option}>{option}</option>)}
          </select>
        ) : (
          <input ref={key === 'name' ? inputRef : undefined} aria-label={wellFieldLabels[key]} value={form[key]} onChange={e => updateField(key, e.target.value)} />
        )}
      </label>
    )
  }

  const submit = () => {
    if (!form.name.trim()) {
      toast.error('请填写井名')
      return
    }
    onSubmit({ ...form, name: form.name.trim() })
  }

  return (
    <div className="modal-backdrop well-edit-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="well-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="well-edit-title">
        <header className="well-edit-header">
          <h2 id="well-edit-title">{mode === 'create' ? '创建井' : '更新井'}</h2>
          <button onClick={onClose} aria-label="关闭井编辑弹窗"><X /></button>
        </header>
        <div className="well-mode-row" role="radiogroup" aria-label="作业模式">
          {([['regular', '常规井'], ['gyro', '仅陀螺作业井']] as const).map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="well-work-mode" checked={workMode === value} onChange={() => setWorkMode(value)} />
              {label}
            </label>
          ))}
        </div>
        <div className="well-edit-columns">
          <div>{leftFields.map(renderField)}</div>
          <div>{rightFields.map(renderField)}</div>
        </div>
        <div className="well-edit-meta">
          <label className="well-form-field">
            <span>{wellFieldLabels.createdAt}</span>
            <span className="created-input">
              <Calendar size={14} />
              <input aria-label="创建时间" placeholder="2026-10-28 12:00:00" value={form.createdAt} onChange={e => updateField('createdAt', e.target.value)} />
            </span>
          </label>
          <label className="well-form-field required">
            <span>{wellFieldLabels.gyroReportWell}</span>
            <select aria-label="陀螺周报井" value={form.gyroReportWell} onChange={e => updateField('gyroReportWell', e.target.value)}>
              <option value="">请选择</option>
              {wellSelectOptions.gyroReportWell?.map(option => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>
        <footer className="well-edit-actions">
          <button className="confirm" onClick={submit}>确定</button>
          <button className="cancel" onClick={onClose}>取消</button>
        </footer>
      </section>
    </div>
  )
}
