import { useState } from 'react'
import { List, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import HeaderUser from '../components/HeaderUser'
import type { WitsmlInstance } from '../types'

interface WitsmlAddPageProps {
  instances: WitsmlInstance[]
  setInstances: React.Dispatch<React.SetStateAction<WitsmlInstance[]>>
}

const mappingCurves = ['CUAQ1', 'CUAQ2', 'TEMP1', 'TEMP2', 'RQTIMEP1', 'RQTIMEP2', 'CCL1', 'CCL2']

export default function WitsmlAddPage({ instances, setInstances }: WitsmlAddPageProps) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editing = instances.find(item => item.id === params.get('edit'))
  const [name, setName] = useState(editing?.name || 'CHANGQING01拉取实例')
  const [well, setWell] = useState(editing?.well || 'CHANGQING01')
  const [wellbore, setWellbore] = useState(editing?.run || '100')
  const [sets, setSets] = useState(['TimeLogSet', 'DepthLogSet'])
  const [activeLog, setActiveLog] = useState('TimeLogSet')
  const [survey, setSurvey] = useState(true)
  const [mode, setMode] = useState<'新增' | '覆盖'>('新增')
  const [mapping, setMapping] = useState<Record<string, string>>(() => Object.fromEntries(mappingCurves.map(curve => [curve, curve])))

  const toggleSet = (set: string) => setSets(current => current.includes(set) ? current.filter(item => item !== set) : [...current, set])
  const confirm = () => {
    if (!name.trim() || !well || !wellbore || sets.length === 0) {
      toast.error('请填写实例名称、选择外方井和至少一个曲线集')
      return
    }
    if (editing) {
      setInstances(current => current.map(item => item.id === editing.id ? { ...item, name: name.trim(), well, run: wellbore } : item))
      toast.success('实例配置已更新')
    } else {
      const instance: WitsmlInstance = { id: `instance-${Date.now()}`, name: name.trim(), creator: 'Admin', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }), status: '未传输', well, run: wellbore }
      setInstances(current => [instance, ...current])
      toast.success('WITSML实例已创建')
    }
    navigate('/witsml')
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
            <button className="active" onClick={() => navigate('/witsml')}><List />WITSML实例</button>
          </nav>
        </aside>
        <main className="stats-main operation-main witsml-content">
          <div className="stats-tabs witsml-tabs" role="tablist" aria-label="已打开的WITSML页面">
            <div className="stats-tab active">
              <button className="stats-tab-label" role="tab" aria-selected="true" onClick={() => navigate('/witsml')}>WITSML实例</button>
              <button className="stats-tab-close" aria-label="关闭并返回实例列表" onClick={() => navigate('/witsml')}><X /></button>
            </div>
          </div>
          <div className="witsml-add-form">
            <section className="add-section external-well"><h1>外方井选择</h1><label>实例名称<input aria-label="实例名称" value={name} onChange={e => setName(e.target.value)} /></label><label>外方井<select aria-label="外方井" value={well} onChange={e => setWell(e.target.value)}><option value="">请选择</option><option>CHANGQING01</option><option>泸203H76-4</option></select></label><label>外方Wellbore<select aria-label="外方Wellbore" value={wellbore} onChange={e => setWellbore(e.target.value)}><option value="">请选择</option><option>100</option><option>200</option></select></label></section>
            <section className="add-section curve-set-section"><h2>外方曲线集选择</h2><table className="curve-set-table"><thead><tr><th><input type="checkbox" aria-label="全选曲线集" checked={sets.length === 2} onChange={e => setSets(e.target.checked ? ['TimeLogSet', 'DepthLogSet'] : [])} /></th><th>序号</th><th>曲线集名称</th><th>曲线集类型</th><th>方向</th><th>曲线集描述</th></tr></thead><tbody>{[{ name: 'TimeLogSet', type: 'Time' }, { name: 'DepthLogSet', type: 'Depth' }].map((set, index) => <tr key={set.name}><td><input type="checkbox" aria-label={`选择${set.name}`} checked={sets.includes(set.name)} onChange={() => toggleSet(set.name)} /></td><td>{index + 1}</td><td>{set.name}</td><td>{set.type}</td><td>Increasing</td><td>这是XXXXXXXXXXXX曲线集</td></tr>)}</tbody></table></section>
            <section className="add-section data-pull-section"><h2>数据拉取</h2><div className="pull-tabs">{sets.map(set => <button key={set} className={activeLog === set ? 'active' : ''} onClick={() => setActiveLog(set)}>{set}</button>)}<label><input type="checkbox" checked={survey} onChange={e => setSurvey(e.target.checked)} />Survey数据</label></div><div className="pull-mode"><label><input type="radio" name="pull-mode" checked={mode === '新增'} onChange={() => setMode('新增')} />新增<input aria-label="新增数据集名称" value={`${activeLog}-Local`} readOnly /></label><label><input type="radio" name="pull-mode" checked={mode === '覆盖'} onChange={() => setMode('覆盖')} />覆盖<select aria-label="覆盖数据集" disabled={mode !== '覆盖'}><option>TimeLogSet-Local</option><option>DepthLogSet-Local</option></select></label></div><table className="mapping-table"><thead><tr><th>外方曲线名称</th><th>璇玑云曲线名称</th><th>外方曲线单位</th></tr></thead><tbody>{mappingCurves.map((curve, index) => <tr key={curve}><td>{activeLog === 'TimeLogSet' ? curve : curve.replace('TEMP', 'DEPTH')}</td><td><input aria-label={`${curve}本地映射`} value={mapping[curve]} onChange={e => setMapping(current => ({ ...current, [curve]: e.target.value }))} /></td><td><input aria-label={`${curve}单位`} defaultValue={index % 2 ? 'API' : ''} /></td></tr>)}</tbody></table></section>
            <footer className="witsml-add-footer"><span>{mode === '新增' ? '将创建新的本地曲线映射' : '将覆盖所选本地曲线映射'}{survey ? '，包含 Survey 数据' : ''}</span><button className="primary-button" onClick={confirm}>确认</button><button onClick={() => navigate('/witsml')}>取消</button></footer>
          </div>
        </main>
      </div>
    </div>
  )
}
