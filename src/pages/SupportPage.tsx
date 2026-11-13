import { useMemo, useState } from 'react'
import { ChevronLeft, Ruler } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import NewWellDialog from '../components/NewWellDialog'
import WellCard from '../components/WellCard'
import { supportStats } from '../data'
import type { Well, WellFormValues } from '../types'

interface SupportPageProps {
  wells: Well[]
  setWells: React.Dispatch<React.SetStateAction<Well[]>>
}

type WellTab = '全部井' | '实时井' | '井收藏'

export default function SupportPage({ wells, setWells }: SupportPageProps) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<WellTab>('全部井')
  const [showNewWell, setShowNewWell] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [compact, setCompact] = useState(false)
  const visibleWells = useMemo(() => wells.filter(well => tab === '全部井' || (tab === '实时井' ? well.status === '作业中' : well.favorite)), [wells, tab])

  const buildWell = (values: WellFormValues): Well => ({
    id: `well-${Date.now()}`,
    name: values.name,
    run: '100',
    region: values.region || '未分配',
    status: values.status,
    favorite: false,
    provider: 'CNOOC',
    startTime: values.createdAt || new Date().toLocaleString('zh-CN', { hour12: false }),
    holeSize: '12.25',
    bha: 'BCPM+ABC+DSM+DIMII+DWPR+RSS',
    md: '0.00',
    inc: '0.00',
    azi: '0.00',
    currentDepth: 0,
    designDepth: Number(values.designDepth) || 3600,
    engineers: values.operator || '待分配',
  })

  const createWell = (values: WellFormValues) => {
    if (wells.some(well => well.name === values.name)) {
      toast.error('井名已存在，请使用更新井')
      return
    }
    setWells(current => [buildWell(values), ...current])
    setShowNewWell(false)
    setTab('全部井')
    toast.success(`已创建 ${values.name}`)
  }

  const updateWell = (values: WellFormValues) => {
    const target = wells.find(well => well.name === values.name)
    if (!target) {
      setWells(current => [buildWell(values), ...current])
      setShowNewWell(false)
      toast.success(`已同步云端井 ${values.name} 到列表`)
      return
    }
    setWells(current => current.map(well => well.id === target.id ? {
      ...well,
      region: values.region || well.region,
      status: values.status,
      designDepth: Number(values.designDepth) || well.designDepth,
      engineers: values.operator || well.engineers,
      startTime: values.createdAt || well.startTime,
    } : well))
    setShowNewWell(false)
    toast.success(`已更新 ${values.name}`)
  }

  return (
    <main className={`support-page ${compact ? 'support-compact' : ''}`}>
      <header className="support-header">
        <button className="support-brand" onClick={() => navigate('/portal')} aria-label="返回璇玑门户"><img src="/assets/brand-welcome.png" alt="璇玑云" /><span>欢迎 <b>Tangdong</b> 登录！</span></button>
        <div className="support-stats">
          {supportStats.map(stat => <div className="stat-item" key={stat.label}><span><Ruler size={18} />{stat.label}</span><strong>{stat.value}</strong></div>)}
        </div>
      </header>
      <div className="well-tabbar">
        <button className="collapse-details" onClick={() => setCompact(!compact)} aria-label={compact ? '展开井详情' : '收起井详情'}><ChevronLeft className={compact ? 'rotated' : ''} /></button>
        <div className="well-tabs" role="tablist" aria-label="井列表筛选">
          {(['全部井', '实时井', '井收藏'] as WellTab[]).map(item => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}
        </div>
        <button className="new-well-button" onClick={() => setShowNewWell(true)} aria-label="新建井" title="新建井"><img src="/images/support-icons/00.png" alt="" /></button>
      </div>
      <section className="well-list" aria-label={`${tab}列表`}>
        {visibleWells.map(well => <WellCard key={well.id} well={well} expanded={expandedId === well.id} onToggleExpanded={() => setExpandedId(expandedId === well.id ? null : well.id)} onToggleFavorite={() => setWells(current => current.map(item => item.id === well.id ? { ...item, favorite: !item.favorite } : item))} />)}
        {visibleWells.length === 0 && <div className="empty-state"><strong>当前筛选下暂无井</strong><button onClick={() => setTab('全部井')}>查看全部井</button></div>}
      </section>
      {showNewWell && <NewWellDialog onClose={() => setShowNewWell(false)} onCreate={createWell} onUpdate={updateWell} />}
    </main>
  )
}
