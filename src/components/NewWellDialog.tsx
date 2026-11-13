import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { emptyWellForm, wellHierarchy } from '../data'
import type { BlockNode, OilfieldNode, RegionNode, WellFormValues } from '../types'
import WellEditDialog from './WellEditDialog'
import { detailLeftFields, detailRightFields, wellFieldLabels } from './wellFormConfig'

const levelIcon = (level: 'region' | 'block' | 'oilfield' | 'well') => (
  <img src={`/images/well-tree/${level}.png`} alt="" className={`node-icon ${level}`} draggable={false} />
)

interface NewWellDialogProps {
  onClose: () => void
  onCreate: (values: WellFormValues) => void
  onUpdate: (values: WellFormValues) => void
}

type Selection =
  | { level: 'region'; region: RegionNode }
  | { level: 'block'; region: RegionNode; block: BlockNode }
  | { level: 'oilfield'; region: RegionNode; block: BlockNode; oilfield: OilfieldNode }
  | { level: 'well'; region: RegionNode; block: BlockNode; oilfield: OilfieldNode; well: WellFormValues }

const firstWell = (): Selection => {
  const region = wellHierarchy[0]
  const block = region.blocks[0]
  const oilfield = block.oilfields[0]
  return { level: 'well', region, block, oilfield, well: oilfield.wells[0] }
}

export default function NewWellDialog({ onClose, onCreate, onUpdate }: NewWellDialogProps) {
  const [selection, setSelection] = useState<Selection>(firstWell)
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [editMode, setEditMode] = useState<'create' | 'update' | null>(null)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !editMode) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, editMode])

  const filteredRegions = useMemo<RegionNode[]>(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return wellHierarchy
    return wellHierarchy
      .map(region => ({
        ...region,
        blocks: region.blocks
          .map(block => ({
            ...block,
            oilfields: block.oilfields
              .map(oilfield => ({ ...oilfield, wells: oilfield.wells.filter(well => well.name.toLowerCase().includes(keyword)) }))
              .filter(oilfield => oilfield.wells.length > 0),
          }))
          .filter(block => block.oilfields.length > 0),
      }))
      .filter(region => region.blocks.length > 0)
  }, [query])

  const toggleNode = (key: string) => setCollapsed(current => {
    const next = new Set(current)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  const isNodeOpen = (key: string) => query.trim() !== '' || !collapsed.has(key)

  const nodeButton = (
    key: string,
    depth: number,
    icon: React.ReactNode,
    label: string,
    select: () => void,
    selected: boolean,
    expandable: boolean,
  ) => (
    <button
      className={`tree-node${selected ? ' selected' : ''}`}
      style={{ paddingLeft: 4 + depth * 18 }}
      onClick={select}
      aria-expanded={expandable ? isNodeOpen(key) : undefined}
    >
      {expandable ? (
        <span
          className="node-caret"
          onClick={e => {
            e.stopPropagation()
            toggleNode(key)
          }}
        >
          {isNodeOpen(key) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
      ) : (
        <span className="node-caret" />
      )}
      {icon}
      <span>{label}</span>
    </button>
  )

  const renderWell = (region: RegionNode, block: BlockNode, oilfield: OilfieldNode, well: WellFormValues, depth: number) => {
    const selected = selection.level === 'well' && selection.well.name === well.name && selection.oilfield.name === oilfield.name
    return (
      <div key={`${region.name}/${block.name}/${oilfield.name}/${well.name}`}>
        {nodeButton(`well:${well.name}`, depth, levelIcon('well'), well.name, () => setSelection({ level: 'well', region, block, oilfield, well }), selected, false)}
      </div>
    )
  }

  const renderOilfield = (region: RegionNode, block: BlockNode, oilfield: OilfieldNode, depth: number) => {
    const key = `oilfield:${region.name}/${block.name}/${oilfield.name}`
    const selected = selection.level === 'oilfield' && selection.region.name === region.name && selection.block.name === block.name && selection.oilfield.name === oilfield.name
    return (
      <div key={key}>
        {nodeButton(key, depth, levelIcon('oilfield'), oilfield.name, () => setSelection({ level: 'oilfield', region, block, oilfield }), selected, true)}
        {isNodeOpen(key) && oilfield.wells.map(well => renderWell(region, block, oilfield, well, depth + 1))}
      </div>
    )
  }

  const renderBlock = (region: RegionNode, block: BlockNode, depth: number) => {
    const key = `block:${region.name}/${block.name}`
    const selected = selection.level === 'block' && selection.region.name === region.name && selection.block.name === block.name
    return (
      <div key={key}>
        {nodeButton(key, depth, levelIcon('block'), block.name, () => setSelection({ level: 'block', region, block }), selected, true)}
        {isNodeOpen(key) && block.oilfields.map(oilfield => renderOilfield(region, block, oilfield, depth + 1))}
      </div>
    )
  }

  const renderRegion = (region: RegionNode) => {
    const key = `region:${region.name}`
    const selected = selection.level === 'region' && selection.region.name === region.name
    return (
      <div key={key}>
        {nodeButton(key, 0, levelIcon('region'), region.name, () => setSelection({ level: 'region', region }), selected, true)}
        {isNodeOpen(key) && region.blocks.map(block => renderBlock(region, block, 1))}
      </div>
    )
  }

  const detailValues = selection.level === 'well' ? selection.well : emptyWellForm

  const renderDetail = (key: keyof WellFormValues) => (
    <label className="well-form-field" key={key}>
      <span>{wellFieldLabels[key]}</span>
      <input readOnly tabIndex={-1} aria-label={wellFieldLabels[key]} value={detailValues[key]} />
    </label>
  )

  const openEditor = (mode: 'create' | 'update') => {
    if (mode === 'update' && selection.level === 'well') {
      setEditMode('update')
      return
    }
    setEditMode('create')
  }

  const editInitialValues: WellFormValues = editMode === 'update' && selection.level === 'well'
    ? { ...selection.well }
    : {
        ...emptyWellForm,
        region: selection.region.name,
        block: selection.level === 'region' ? '' : selection.block.name,
        oilfield: selection.level === 'oilfield' ? selection.oilfield.name : '',
      }

  const handleSubmit = (values: WellFormValues) => {
    if (editMode === 'update') onUpdate(values)
    else onCreate(values)
  }

  return (
    <div className="modal-backdrop new-well-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="new-well-dialog" role="dialog" aria-modal="true" aria-labelledby="new-well-title">
        <header className="new-well-header"><h2 id="new-well-title">云端井</h2><button onClick={onClose} aria-label="关闭新建井弹窗"><X /></button></header>
        <div className="new-well-body">
          <aside className="well-tree">
            <label className="tree-search"><Search size={15} /><input aria-label="过滤井" placeholder="请输入关键字搜索" value={query} onChange={e => setQuery(e.target.value)} /></label>
            <div className="tree-scroll">{filteredRegions.map(renderRegion)}</div>
          </aside>
          <div className="well-detail-columns">
            <div>
              {detailLeftFields.map(renderDetail)}
              <label className="created-at-field"><span>创建时间</span><input readOnly tabIndex={-1} aria-label="创建时间" value={detailValues.createdAt} /></label>
            </div>
            <div>{detailRightFields.map(renderDetail)}</div>
          </div>
        </div>
        <footer className="new-well-footer">
          {selection.level === 'well'
            ? <button onClick={() => openEditor('update')}>更新井</button>
            : <button onClick={() => openEditor('create')}>创建井</button>}
          <button onClick={onClose}>关闭</button>
        </footer>
      </section>
      {editMode && <WellEditDialog mode={editMode} initialValues={editInitialValues} onClose={() => setEditMode(null)} onSubmit={handleSubmit} />}
    </div>
  )
}
