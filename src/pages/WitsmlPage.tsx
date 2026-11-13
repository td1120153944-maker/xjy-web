import { useMemo, useState } from 'react'
import { Edit, FileText, List, Play, Plus, Square, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import HeaderUser from '../components/HeaderUser'
import { curves } from '../data'
import type { WitsmlInstance } from '../types'

interface WitsmlPageProps {
  instances: WitsmlInstance[]
  setInstances: React.Dispatch<React.SetStateAction<WitsmlInstance[]>>
}

export default function WitsmlPage({ instances, setInstances }: WitsmlPageProps) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(instances[0]?.id || '')
  const [wellFilter, setWellFilter] = useState('CHANGQING01')
  const [runFilter, setRunFilter] = useState('100')
  const [logTab, setLogTab] = useState('TimeLogSet#1')
  const [logsFor, setLogsFor] = useState<string | null>(null)
  const [deleteFor, setDeleteFor] = useState<WitsmlInstance | null>(null)
  const selected = instances.find(item => item.id === selectedId) || instances[0]
  const filtered = useMemo(() => instances.filter(item => (!wellFilter || item.well === wellFilter) && (!runFilter || item.run === runFilter)), [instances, wellFilter, runFilter])

  const toggleStatus = (instance: WitsmlInstance) => {
    const nextStatus = instance.status === '传输中' ? '已结束' : '传输中'
    setInstances(current => current.map(item => item.id === instance.id ? { ...item, status: nextStatus } : item))
    toast.success(nextStatus === '传输中' ? '实例已开始传输' : '实例已停止传输')
  }
  const remove = () => {
    if (!deleteFor) return
    setInstances(current => current.filter(item => item.id !== deleteFor.id))
    setDeleteFor(null)
    toast.success('实例已删除')
  }

  return (
    <div className="stats-page witsml-page">
      <header className="stats-header">
        <button className="stats-brand" onClick={() => navigate('/portal')} aria-label="返回门户">
          <img src="/images/stats-logo.png" alt="璇玑云" /><strong>WITSML</strong>
        </button>
        <HeaderUser />
      </header>
      <div className="stats-shell witsml-workspace">
        <aside className="stats-sidebar witsml-sidebar">
          <nav className="stats-nav operation-nav" aria-label="WITSML导航">
            <button className="active" onClick={() => { setWellFilter(''); setRunFilter('') }}><List />WITSML实例</button>
          </nav>
        </aside>
        <main className="stats-main operation-main witsml-content">
          <div className="stats-tabs witsml-tabs" role="tablist" aria-label="已打开的WITSML页面">
            <div className="stats-tab active">
              <button className="stats-tab-label" role="tab" aria-selected="true" onClick={() => { setWellFilter(''); setRunFilter('') }}>WITSML实例</button>
              <button className="stats-tab-close" aria-label="关闭并返回井列表" onClick={() => navigate('/support')}><X /></button>
            </div>
          </div>
          <section className="witsml-panel">
            <div className="witsml-panel-heading">
              <h1>WITSML拉取实例监控列表</h1>
              <div className="witsml-filters">
                <label><span>井名</span><select aria-label="按井名筛选" value={wellFilter} onChange={e => setWellFilter(e.target.value)}><option value="">全部</option><option>CHANGQING01</option></select></label>
                <label><span>Run</span><select aria-label="按Run筛选" value={runFilter} onChange={e => setRunFilter(e.target.value)}><option value="">全部</option><option>100</option></select></label>
              </div>
              <button className="new-instance" onClick={() => navigate('/witsml/new')}><Plus />新建</button>
            </div>
            <div className="instance-list">
              {filtered.map((instance, index) => (
                <article key={instance.id} className={`instance-card instance-card--${instance.status === '传输中' ? 'active' : instance.status === '已结束' ? 'finished' : 'idle'} ${selected?.id === instance.id ? 'selected' : ''}`} onClick={() => setSelectedId(instance.id)} tabIndex={0} role="button" aria-pressed={selected?.id === instance.id} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelectedId(instance.id) } }}>
                  <p>名称：<strong>{instance.name}</strong></p>
                  <p>创建人：<strong>{instance.creator}</strong></p>
                  <p>创建时间：<strong>{instance.createdAt}</strong></p>
                  <p>传输状态：<strong className={`instance-status instance-status--${instance.status === '传输中' ? 'active' : instance.status === '已结束' ? 'finished' : 'idle'}`}>{instance.status}</strong></p>
                  <div className="instance-actions">
                    <button title={instance.status === '传输中' ? '停止传输' : '开始传输'} aria-label={instance.status === '传输中' ? '停止传输' : '开始传输'} onClick={e => { e.stopPropagation(); toggleStatus(instance) }}>{instance.status === '传输中' ? <Square /> : <Play />}</button>
                    <button title="编辑实例" aria-label="编辑实例" onClick={e => { e.stopPropagation(); navigate(`/witsml/new?edit=${instance.id}`) }}><Edit /></button>
                    <button title="查看实例日志" aria-label="查看实例日志" onClick={e => { e.stopPropagation(); setLogsFor(instance.name) }}><FileText /></button>
                    <button title="删除实例" aria-label="删除实例" onClick={e => { e.stopPropagation(); setDeleteFor(instance) }}><Trash2 /></button>
                  </div>
                  <span className="instance-index">{index + 1}</span>
                </article>
              ))}
              {filtered.length === 0 && <div className="empty-state"><strong>没有匹配的实例</strong><button onClick={() => { setWellFilter(''); setRunFilter('') }}>清除筛选</button></div>}
            </div>
          </section>
          <section className="witsml-panel transmission-panel">
            <div className="transmission-meta"><h2>传输详情</h2><span>本地井名：<b>{selected?.well || '—'}</b></span><span>本地Run名：<b>{selected?.run || '—'}</b></span><span>第三方井名：<b>{selected?.well || '—'}</b></span><span>第三方Wellbore名：<b>{selected?.run || '—'}</b></span></div>
            <div className="log-tabs" role="tablist" aria-label="传输日志集">{['TimeLogSet#1', 'TimeLogSet#2'].map(tab => <button role="tab" aria-selected={logTab === tab} className={logTab === tab ? 'active' : ''} onClick={() => setLogTab(tab)} key={tab}>{tab}</button>)}</div>
            <div className="witsml-table-wrap"><table className="witsml-table"><thead><tr>{['序号', '第三方曲线名称', '本地曲线名称', '最后接收时间', '开始索引', '结束索引', '当前传输索引', '已传输曲线条数', '值', '单位'].map(head => <th key={head}>{head}</th>)}</tr></thead><tbody>{curves.map((curve, index) => <tr key={curve}><td>{index + 1}</td><td>{curve}</td><td>{curve}</td><td>2025/10/11 10:00:00</td><td>2025/10/11 10:00:00</td><td>2025/10/10 09:55:00</td><td>2025/10/10 09:55:00</td><td>{logTab === 'TimeLogSet#1' ? '1000' : '860'}</td><td>0</td><td>API</td></tr>)}</tbody></table></div>
          </section>
        </main>
      </div>
      {logsFor && <div className="modal-backdrop data-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setLogsFor(null)}><section className="data-editor witsml-log-modal" role="dialog" aria-modal="true" aria-labelledby="witsml-log-title"><header><h2 id="witsml-log-title">{logsFor} · 运行日志</h2><button onClick={() => setLogsFor(null)} aria-label="关闭日志"><X /></button></header><div className="witsml-log-body"><div className="log-view"><p>10:00:00 实例配置加载完成</p><p>10:00:01 第三方 WITSML 连接成功</p><p>10:00:02 TimeLogSet#1 曲线映射完成</p><p>10:00:03 等待下一次数据传输</p></div></div><footer><button className="data-primary-button" onClick={() => setLogsFor(null)}>关闭</button></footer></section></div>}
      {deleteFor && <div className="modal-backdrop data-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setDeleteFor(null)}><section className="data-editor data-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="witsml-delete-title"><header><h2 id="witsml-delete-title">删除实例</h2><button onClick={() => setDeleteFor(null)} aria-label="关闭删除确认"><X /></button></header><div className="data-confirm-body"><p>确认删除<strong>“{deleteFor.name}”</strong>？</p><span>删除后，该实例的配置与传输状态将无法恢复。</span></div><footer><button className="data-primary-button data-danger-button" onClick={remove}>确认删除</button><button onClick={() => setDeleteFor(null)}>取消</button></footer></section></div>}
    </div>
  )
}
