import {
  BarChart3, BookOpen, CalendarDays, ChartNoAxesColumn, Clock3,
  ListChecks, Wrench, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import StatsOverviewPage from './StatsOverviewPage'
import { JobStatsPage, StatsDataPage, ToolJobInfoPage, WeeklyStatsPage } from './StatsTablePages'

type PageId = 'overview' | 'stats-data' | 'tool-info' | 'job-stats' | 'weekly'

const pageLabels: Record<PageId, string> = {
  overview: '璇玑作业统计概览',
  'stats-data': '作业统计数据',
  'tool-info': '工具作业信息',
  'job-stats': '作业统计',
  weekly: '周数据统计',
}

const navItems: { label: string, icon: typeof BookOpen, pageId?: PageId }[] = [
  { label: '作业统计数据', icon: BookOpen, pageId: 'stats-data' },
  { label: '周数据统计', icon: CalendarDays, pageId: 'weekly' },
  { label: '年度作业统计', icon: BarChart3 },
  { label: '累计作业统计', icon: BarChart3 },
  { label: '年度工具统计', icon: BarChart3 },
  { label: '累计工具统计', icon: BarChart3 },
  { label: '工具作业信息', icon: Wrench, pageId: 'tool-info' },
  { label: '产品线周报2.0', icon: ListChecks },
  { label: '作业统计', icon: Clock3, pageId: 'job-stats' },
]

function ActivePage({ id }: { id: PageId }) {
  if (id === 'stats-data') return <StatsDataPage />
  if (id === 'tool-info') return <ToolJobInfoPage />
  if (id === 'job-stats') return <JobStatsPage />
  if (id === 'weekly') return <WeeklyStatsPage />
  return <StatsOverviewPage />
}

export default function StatsPage() {
  const navigate = useNavigate()
  const [openTabs, setOpenTabs] = useState<PageId[]>(['overview'])
  const [activeTab, setActiveTab] = useState<PageId | null>('overview')

  const openPage = (pageId: PageId) => {
    setOpenTabs(current => current.includes(pageId) ? current : [...current, pageId])
    setActiveTab(pageId)
  }

  const closePage = (pageId: PageId) => {
    const index = openTabs.indexOf(pageId)
    const next = openTabs.filter(item => item !== pageId)
    setOpenTabs(next)
    if (activeTab === pageId) setActiveTab(next[index] ?? next[index - 1] ?? null)
  }

  return (
    <div className="stats-page">
      <header className="stats-header">
        <button className="stats-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>统计分析</strong></button>
        <HeaderUser />
      </header>
      <div className="stats-shell">
        <aside className="stats-sidebar">
          <button className={`stats-overview-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => openPage('overview')} aria-pressed={activeTab === 'overview'}><ChartNoAxesColumn />璇玑作业统计概览</button>
          <nav className="stats-nav" aria-label="统计分析导航">
            {navItems.map(({ label, icon: Icon, pageId }) => pageId
              ? <button className={activeTab === pageId ? 'active' : ''} key={label} onClick={() => openPage(pageId)}><Icon />{label}</button>
              : <div className="stats-nav-disabled" aria-disabled="true" key={label}><Icon />{label}</div>)}
          </nav>
        </aside>
        <main className={`stats-main ${openTabs.length === 0 ? 'stats-main--empty' : ''}`}>
          {openTabs.length > 0 && <div className="stats-tabs" role="tablist" aria-label="已打开的统计页面">
            {openTabs.map(pageId => <div className={`stats-tab ${activeTab === pageId ? 'active' : ''}`} key={pageId}>
              <button className="stats-tab-label" role="tab" aria-selected={activeTab === pageId} onClick={() => setActiveTab(pageId)}>{pageLabels[pageId]}</button>
              <button className="stats-tab-close" aria-label={`关闭${pageLabels[pageId]}`} onClick={() => closePage(pageId)}><X /></button>
            </div>)}
          </div>}
          {activeTab && <ActivePage id={activeTab} />}
        </main>
      </div>
    </div>
  )
}
