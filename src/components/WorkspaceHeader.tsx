import { useState } from 'react'
import { CaseSensitive, ChevronDown, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

interface WorkspaceHeaderProps {
  title: string
  wellName?: string
  live?: boolean
  dark?: boolean
}

export default function WorkspaceHeader({ title, wellName = '泸203H76-4', live = false, dark = false }: WorkspaceHeaderProps) {
  const [menu, setMenu] = useState<'settings' | 'user' | null>(null)
  const navigate = useNavigate()

  const toggleText = () => {
    document.documentElement.classList.toggle('large-text')
    toast.success(document.documentElement.classList.contains('large-text') ? '已切换为大字号' : '已恢复标准字号')
  }

  return (
    <header className={`workspace-header ${dark ? 'workspace-header--dark' : ''}`}>
      <button className="workspace-brand" onClick={() => navigate('/portal')} aria-label="返回璇玑门户">
        <img src="/images/stats-logo.png" alt="璇玑云" />
        <strong>{title}</strong>
      </button>
      <div className="workspace-well-meta">
        <span>井名：{wellName}</span>
        {live && <span>当前作业Run：100</span>}
        <span>打钻状态：钻进</span>
        <span>开始作业时间：2024/8/14</span>
        <span>井状态：作业中</span>
      </div>
      <div className="workspace-actions">
        {live && <Link className="return-link" to="/support">返回井列表</Link>}
        <button className="icon-button" onClick={toggleText} aria-label="切换字号" title="切换字号"><CaseSensitive /></button>
        <div className="menu-anchor">
          <button className="icon-button" onClick={() => setMenu(menu === 'settings' ? null : 'settings')} aria-label="显示设置" aria-expanded={menu === 'settings'}><Settings /></button>
          {menu === 'settings' && (
            <div className="popover-menu">
              <button onClick={() => { document.documentElement.dataset.density = 'standard'; setMenu(null); toast.success('已使用标准密度') }}>标准密度</button>
              <button onClick={() => { document.documentElement.dataset.density = 'compact'; setMenu(null); toast.success('已使用紧凑密度') }}>紧凑密度</button>
            </div>
          )}
        </div>
        <div className="menu-anchor">
          <button className="user-button" onClick={() => setMenu(menu === 'user' ? null : 'user')} aria-expanded={menu === 'user'}>
            <span className="avatar">T</span><span>{dark ? 'Admin' : 'Tang'}</span><ChevronDown size={15} />
          </button>
          {menu === 'user' && (
            <div className="popover-menu popover-menu--right">
              <button onClick={() => navigate('/portal')}>返回门户</button>
              <button onClick={() => navigate('/')}>退出登录</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
