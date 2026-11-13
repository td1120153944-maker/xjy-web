import { ChevronDown, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import type { Well } from '../types'

interface WellCardProps {
  well: Well
  expanded: boolean
  onToggleExpanded: () => void
  onToggleFavorite: () => void
}

function SupportIcon({ id }: { id: string }) {
  return <img src={`/images/support-icons/${id}.png`} alt="" />
}

const companyIcons: Record<string, string> = {
  SLB: 'schlumberger_logo.png.png',
  BAKER: '贝克休斯.png',
  CNOOC: '01.png',
  HALLIBURTON: 'HALLIBURTON2.png',
}

function CompanyIcon({ provider }: { provider: string }) {
  const fileName = companyIcons[provider.toUpperCase()] ?? '其他公司.png'
  return <img src={`/images/support-icons/${fileName}`} alt={`${provider} 作业公司`} />
}

export default function WellCard({ well, expanded, onToggleExpanded, onToggleFavorite }: WellCardProps) {
  const navigate = useNavigate()
  const progress = Math.min(100, Math.round(well.currentDepth / well.designDepth * 100))
  const actions = [
    { id: '05', title: 'WITSML接收', onClick: () => navigate('/witsml') },
    { id: '06', title: '数据更新', onClick: () => toast.success(`${well.name} 数据已更新`) },
    { id: '07', title: '传输配置', onClick: () => toast.info('传输配置已就绪') },
    { id: '08', title: '订阅提醒', onClick: () => toast.success(`已订阅 ${well.name} 作业提醒`) },
    { id: '09', title: '数据填报', onClick: () => navigate(`/data/${well.id}`) },
    { id: '10', title: '实时监控（已禁用）', onClick: () => navigate(`/live/${well.id}`), disabled: true },
    { id: '12', title: '数字孪生（已禁用）', onClick: () => navigate(`/module/${encodeURIComponent('数字孪生')}`), disabled: true },
    { id: '13', title: '质量统计（已禁用）', onClick: () => navigate('/statistics'), disabled: true },
    { id: '14', title: '实况', onClick: () => navigate(`/live/${well.id}`) },
    { id: '15', title: 'WITSML', onClick: () => navigate('/witsml') },
  ]
  const runTools = actions.slice(4)

  return (
    <article className="well-card">
      <div className="well-row">
        <div className="well-fixed well-fixed--left">
          <button className="well-expand" onClick={onToggleExpanded} aria-label={`${expanded ? '收起' : '展开'}${well.name} Run列表`} aria-expanded={expanded}>{expanded ? <ChevronDown /> : <ChevronRight />}</button>
          <div className="well-status-group">
            <div className={`provider-badge provider-${well.provider.toLowerCase().replace(' ', '-')}`}>
              <CompanyIcon provider={well.provider} />
            </div>
            <div className="connection-icons"><SupportIcon id="02" /></div>
            <div className="drilling-status"><SupportIcon id="03" /></div>
            <span className="well-status-divider" aria-hidden="true" />
          </div>
          <button className={`favorite-button ${well.favorite ? 'active' : ''}`} onClick={onToggleFavorite} aria-label={well.favorite ? '取消收藏' : '收藏井'}><SupportIcon id="04" /></button>
          <div className="well-identity"><strong title={well.name}>{well.name}</strong><span>{well.run}</span></div>
        </div>
        <div className="well-middle-scroll" aria-label="井信息">
          <div className="well-middle-content">
            <div className="well-region"><span>区域：<b>{well.region}</b></span><span>井状态：<b className="status-working">{well.status}</b></span></div>
            <div className="well-hole"><span>井眼尺寸(in)：<b>{well.holeSize}</b></span><span title={well.bha}>BHA：{well.bha}</span></div>
            <div className="well-start">开始时间：{well.startTime}</div>
            <div className="well-survey">
              <span className="well-survey-values">最后测点：<b>MD: {well.md}&nbsp; INC: {well.inc}&nbsp; AZI: {well.azi}</b></span>
              <div className="depth-progress-row">
                <span className="depth-caption">当前/设计井深：</span>
                <div className="depth-progress"><div className="depth-track"><i style={{ width: `${progress}%` }} /><img className="depth-bit" src="/images/drill-bits/PDCS600.png" alt="当前井深位置" style={{ left: `${progress}%` }} /></div><div className="depth-labels"><span>0</span><span>{well.currentDepth}</span><span>{well.designDepth}</span></div></div>
              </div>
            </div>
            <div className="well-engineers">带队工程师：<strong>{well.engineers}</strong></div>
            <div className="well-action-group well-action-group--transfer well-transfer-group">{actions.slice(0, 3).map(action => <span className="well-status-action" key={action.id}><SupportIcon id={action.id} /></span>)}</div>
          </div>
        </div>
        <div className="well-fixed well-fixed--right">
          <span className="well-action-divider" aria-hidden="true" />
          <span className="well-status-action"><SupportIcon id="08" /></span>
          <div className="well-action-group well-action-group--tools">{actions.slice(4).map(action => <button key={action.id} title={action.title} aria-label={action.title} disabled={action.disabled} className={action.disabled ? 'action-disabled' : undefined} onClick={action.disabled ? undefined : action.onClick}><SupportIcon id={action.id} /></button>)}</div>
        </div>
      </div>
      {expanded && (
        <div className="run-table-wrap">
          <table className="run-table"><thead><tr><th>RunID</th><th>完成状态</th><th>井眼尺寸(in)</th><th>BHA</th><th>Sender传输状态</th><th>打钻状态</th><th>第三方WITSML</th><th>开始时间</th><th>操作</th></tr></thead><tbody>
            <tr><td>100</td><td>作业完成</td><td>20</td><td className="run-bha" title={well.bha}>{well.bha}</td><td></td><td></td><td></td><td>2025-10-08 13:40</td><td><div className="run-actions"><span className="run-status-icon"><SupportIcon id="08" /></span>{runTools.map(action => <button key={action.id} title={action.title} aria-label={`Run100${action.title}`} disabled={action.disabled} className={action.disabled ? 'action-disabled' : undefined} onClick={action.disabled ? undefined : action.onClick}><SupportIcon id={action.id} /></button>)}</div></td></tr>
            <tr><td>200</td><td className="status-working">作业中</td><td>20</td><td className="run-bha" title={well.bha}>{well.bha}</td><td><SupportIcon id="02" /></td><td><SupportIcon id="03" /></td><td></td><td>2025-10-10 08:40</td><td><div className="run-actions"><span className="run-status-icon"><SupportIcon id="08" /></span>{runTools.map(action => <button key={action.id} title={action.title} aria-label={`Run200${action.title}`} disabled={action.disabled} className={action.disabled ? 'action-disabled' : undefined} onClick={action.disabled ? undefined : action.onClick}><SupportIcon id={action.id} /></button>)}</div></td></tr>
          </tbody></table>
        </div>
      )}
    </article>
  )
}
