import { useState } from 'react'
import {
  Activity, BarChart3, BookOpen, Bot, ChevronDown, Factory, FileText, Monitor,
  Newspaper, Presentation, Settings, UserRound, Users, UsersRound, Wrench,
} from 'lucide-react'
import { useNavigate } from 'react-router'

const modules = [
  { title: '作业支持', icon: Users, image: '/images/modules/personnel-dynamics.png' },
  { title: '作业动态', icon: Newspaper, image: '/images/modules/tool-dynamics.png' },
  { title: '工具动态', icon: Activity, image: '/images/modules/operation-dynamics.png' },
  { title: '人员动态', icon: Presentation, image: '/images/modules/operation-support.png' },
  { title: '统计分析', icon: Factory, image: '/images/modules/smart-factory.png' },
  { title: '故障跟踪', icon: UsersRound, image: '/images/modules/engineer-assistant.png' },
  { title: '大屏显示', icon: Bot, image: '/images/modules/smart-testing.png' },
  { title: '随钻定向产品线周报', icon: BookOpen, image: '/images/modules/product-manual.png' },
  { title: '产品手册', icon: FileText, image: '/images/modules/weekly-report.png' },
  { title: '钻井优化', icon: Monitor, image: '/images/modules/large-screen.png' },
  { title: '实钻试验', icon: Wrench, image: '/images/modules/fault-tracking.png' },
  { title: '工程师助手', icon: BarChart3, image: '/images/modules/statistics.png' },
]

const disabledModules = new Set(['故障跟踪', '随钻定向产品线周报', '产品手册', '钻井优化', '工程师助手'])

export default function PortalPage() {
  const navigate = useNavigate()
  const [menu, setMenu] = useState<'user' | null>(null)

  const openModule = (title: string) => {
    if (title === '作业支持') navigate('/support')
    else if (title === '统计分析') navigate('/statistics')
    else if (title === '作业动态') navigate('/operation-dynamics')
    else if (title === '工具动态') navigate('/tool-dynamics')
    else if (title === '人员动态') navigate('/personnel-dynamics')
    else if (title === '实钻试验') navigate('/drilling-test')
    else if (title === '运维管理') navigate('/operations-management')
    else if (title === '系统设置') navigate('/system-management')
    else navigate(`/module/${encodeURIComponent(title)}`)
  }

  return (
    <main className="portal-page">
      <header className="portal-topbar">
        <span className="online-count"><UsersRound />在线人数：<b>10人</b></span>
        <div className="portal-tools">
          <button className="icon-button" aria-label="运维管理" title="运维管理" onClick={() => openModule('运维管理')}><Wrench /></button>
          <button className="icon-button" aria-label="人员访问统计" title="人员访问统计" onClick={() => navigate('/personnel-access')}><UserRound /></button>
          <button className="icon-button portal-language-button" aria-label="中英文切换" title="中英文切换"><img src="/images/language-switch.png" alt="" /></button>
          <button className="icon-button" aria-label="系统设置" title="系统设置" onClick={() => openModule('系统设置')}><Settings /></button>
          <div className="menu-anchor">
            <button className="user-button" onClick={() => setMenu(menu === 'user' ? null : 'user')} aria-expanded={menu === 'user'}><span className="avatar">T</span>Tang<ChevronDown size={15} /></button>
            {menu === 'user' && <div className="popover-menu popover-menu--right"><button onClick={() => { navigate('/personnel-access'); setMenu(null) }}>登录记录</button><button onClick={() => navigate('/')}>退出登录</button></div>}
          </div>
        </div>
      </header>
      <img className="portal-logo" src="/images/xuanjiyun-logo.png" alt="璇玑云 Any Sync" />
      <section className="portal-grid" aria-label="业务模块">
        {modules.map(({ title, icon: Icon, image }, index) => (
          <button className={`portal-card portal-card--${index % 4}`} key={title} onClick={() => openModule(title)} disabled={disabledModules.has(title)} title={disabledModules.has(title) ? '暂未开放' : title}>
            {image ? <img src={image} alt="" /> : <Icon strokeWidth={1.35} />}
            <span>{title}</span>
          </button>
        ))}
      </section>
      <span className="portal-version">版本号：2.2610.27.2</span>
    </main>
  )
}
