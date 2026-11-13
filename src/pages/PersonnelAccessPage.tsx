import { useMemo, useState } from 'react'
import {
  Activity, ArrowUpDown, BarChart3, ChevronLeft, ChevronRight, Clock3,
  History, LocateFixed, MoveVertical, Ruler, Search,
  UserRound, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useNavigate } from 'react-router'
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'

type PageId = 'ranking' | 'overview' | 'activity'
type TrendPeriod = '周' | '月' | '年'
type SortKey = 'userType' | 'role' | 'logins' | 'hours' | 'lastLogin'
interface ActivityRow {
  id: number
  name: string
  company: string
  userType: string
  role: string
  ip: string
  logins: number
  hours: number
  lastLogin: string
}
interface ActivityFilters {
  name: string
  company: string
  role: string
  userType: string
  start: string
  end: string
}

const pageLabels: Record<PageId, string> = {
  ranking: '个人榜单', overview: '璇玑云应用情况统计', activity: '用户活动监控',
}
const navItems = [
  { id: 'ranking' as PageId, label: '个人榜单', icon: UserRound },
  { id: 'overview' as PageId, label: '璇玑云应用情况统计', icon: BarChart3 },
  { id: 'activity' as PageId, label: '用户活动监控', icon: Activity },
]
const rankingRows = [
  { name: '杨颜普通', company: '缅甸作业公司', role: '作业经理', hours: 3.67, logins: 2, lastLogin: '2026-10-23 10:22:50' },
  { name: 'fuyi_normal', company: '深圳作业公司', role: '工程师', hours: 2.42, logins: 1, lastLogin: '2026-10-22 09:49:53' },
  { name: 'hzx', company: '研究院', role: '技术支持', hours: 0, logins: 2, lastLogin: '2026-10-14 15:19:25' },
]
const trendData: Record<TrendPeriod, { name: string, count: number, hours: number }[]> = {
  周: [
    { name: '09.21-09.27', count: 5, hours: 132.14 }, { name: '09.28-10.04', count: 3, hours: 65.47 },
    { name: '10.05-10.11', count: 5, hours: 125.03 }, { name: '10.12-10.18', count: 16, hours: 233.44 },
    { name: '10.19-10.25', count: 20, hours: 412.5 }, { name: '10.26-11.01', count: 24, hours: 289.49 },
  ],
  月: [
    { name: '2026-05', count: 38, hours: 836.2 }, { name: '2026-06', count: 42, hours: 968.4 },
    { name: '2026-07', count: 56, hours: 1260.5 }, { name: '2026-08', count: 61, hours: 1532.8 },
    { name: '2026-09', count: 76, hours: 1824.6 }, { name: '2026-10', count: 94, hours: 2356.7 },
  ],
  年: [
    { name: '2022', count: 186, hours: 4260.2 }, { name: '2023', count: 248, hours: 6824.5 },
    { name: '2024', count: 326, hours: 9852.6 }, { name: '2025', count: 418, hours: 12836.4 },
    { name: '2026', count: 526, hours: 16524.56 },
  ],
}
const companyUsage = [
  { name: '其他', value: 2604 }, { name: '缅甸', value: 2281 }, { name: '陆地', value: 811 },
  { name: '哈里伯顿', value: 394 }, { name: '墨西哥', value: 188 }, { name: '深圳', value: 417 },
  { name: '上海', value: 1107 }, { name: '斯伦贝谢', value: 337 }, { name: '研究院', value: 288 },
  { name: '有限湛江分公司', value: 3 },
]
const companyHours = [
  { name: '其他', value: 562.2 }, { name: '缅甸', value: 1052.18 }, { name: '陆地', value: 281.9 },
  { name: '哈里伯顿', value: 163.09 }, { name: '墨西哥', value: 343.77 }, { name: '深圳', value: 768.36 },
  { name: '上海', value: 3261.5 }, { name: '斯伦贝谢', value: 370.51 }, { name: '研究院', value: 77.7 },
  { name: '有限湛江分公司', value: 0 },
]
const activeUsers = [
  { name: '其他', value: 4, color: '#5577c8' }, { name: '缅甸作业公司', value: 1, color: '#8ac96b' },
  { name: '陆地作业公司', value: 2, color: '#f2cc63' }, { name: '哈里伯顿', value: 2, color: '#e46f73' },
  { name: '深圳作业公司', value: 1, color: '#68b8cc' }, { name: '上海作业公司', value: 1, color: '#43946f' },
  { name: '研究院', value: 1, color: '#ef9361' },
]
const baseActivityRows: ActivityRow[] = [
  { id: 1, name: 'zhuofy', company: '缅甸作业公司', userType: '超级管理员', role: '工程师', ip: '192.168.1.59', logins: 461, hours: 12433.9, lastLogin: '2026-08-19 16:01:04' },
  { id: 2, name: 'tangdong', company: '其他', userType: '超级管理员', role: '技术支持', ip: '192.168.1.19', logins: 720, hours: 7608.08, lastLogin: '2026-10-30 09:33:17' },
  { id: 3, name: '杨颜', company: '上海作业公司', userType: '超级管理员', role: '', ip: '127.0.0.1', logins: 979, hours: 6368.85, lastLogin: '2026-10-30 14:18:23' },
  { id: 4, name: 'hezx', company: '其他', userType: '超级管理员', role: '区域管理员', ip: '192.168.1.30', logins: 802, hours: 4503.54, lastLogin: '2026-10-30 10:00:45' },
  { id: 5, name: '罗寒松', company: '缅甸作业公司', userType: '超级管理员', role: '', ip: '192.168.1.38', logins: 455, hours: 3393.8, lastLogin: '2026-10-16 13:27:42' },
  { id: 6, name: 'yuanrou', company: '深圳作业公司', userType: '超级管理员', role: '区域管理员', ip: '192.168.1.208', logins: 392, hours: 2870.54, lastLogin: '2026-08-19 16:12:44' },
  { id: 7, name: 'test', company: '深圳作业公司', userType: '超级管理员', role: '区域管理员', ip: '192.168.1.59', logins: 4, hours: 1364.43, lastLogin: '2026-10-28 13:05:07' },
  { id: 8, name: '张薄', company: '哈里伯顿', userType: '超级管理员', role: '', ip: '192.168.1.71', logins: 139, hours: 1142.71, lastLogin: '2026-10-12 11:26:30' },
  { id: 9, name: '符艺', company: '陆地作业公司', userType: '超级管理员', role: '', ip: '192.168.1.146', logins: 55, hours: 750.86, lastLogin: '2026-06-13 09:13:06' },
  { id: 10, name: '李友华', company: '陆地作业公司', userType: '超级管理员', role: '', ip: '192.168.1.101', logins: 262, hours: 727.45, lastLogin: '2026-04-17 15:52:56' },
  { id: 11, name: '雷乔楚', company: '斯伦贝谢', userType: '超级管理员', role: '', ip: '192.168.1.82', logins: 209, hours: 641.17, lastLogin: '2026-10-09 08:20:16' },
  { id: 12, name: '刘毅', company: '研究院', userType: '超级管理员', role: '', ip: '192.168.1.92', logins: 178, hours: 607.07, lastLogin: '2026-09-18 17:42:31' },
  { id: 13, name: '冯乔于', company: '陆地作业公司', userType: '超级管理员', role: '', ip: '192.168.1.225', logins: 232, hours: 461.01, lastLogin: '2026-09-29 10:55:16' },
  { id: 14, name: '蔡明成', company: '缅甸作业公司', userType: '超级管理员', role: '', ip: '192.168.1.205', logins: 89, hours: 429.76, lastLogin: '2026-10-30 14:21:43' },
  { id: 15, name: '杨杰', company: '陆地作业公司', userType: '超级管理员', role: '', ip: '192.168.1.63', logins: 163, hours: 400.92, lastLogin: '2026-10-21 12:08:09' },
  { id: 16, name: 'Tangdong', company: '墨西哥项目组', userType: '普通用户', role: '工程师', ip: '192.168.1.36', logins: 188, hours: 343.77, lastLogin: '2026-10-26 15:36:22' },
  { id: 17, name: '张剑君', company: '其他', userType: '超级管理员', role: '', ip: '192.168.1.44', logins: 60, hours: 308.72, lastLogin: '2026-10-11 10:19:42' },
]
const activityRows: ActivityRow[] = Array.from({ length: 116 }, (_, index) => {
  const base = baseActivityRows[index % baseActivityRows.length]
  const group = Math.floor(index / baseActivityRows.length)
  return group === 0 ? base : {
    ...base, id: index + 1, name: `${base.name}_${group + 1}`, logins: Math.max(1, base.logins - group * 3),
    hours: Math.max(0, base.hours - group * 4.5), lastLogin: base.lastLogin,
  }
})
const emptyFilters: ActivityFilters = { name: '', company: '', role: '', userType: '全部', start: '', end: '' }

function RankingTable({ title, metric, period }: { title: string, metric: 'hours' | 'logins', period: string }) {
  const multiplier = period === '周榜' ? 0.5 : period === '年榜' ? 12 : period === '总榜' ? 48 : 1
  const rows = [...rankingRows].sort((a, b) => metric === 'hours' ? b.hours - a.hours : b.logins - a.logins)
  return (
    <section className="access-ranking-section">
      <h2>{title}</h2>
      <div className="access-table-wrap">
        <table className="access-table access-ranking-table">
          <thead><tr><th>排名</th><th>用户名</th><th>公司</th><th>角色</th><th>{metric === 'hours' ? '在线时长(h)' : '登录次数(次)'}</th><th>最后登录时间</th></tr></thead>
          <tbody>{rows.map((row, index) => <tr key={row.name}><td><span className={`access-medal access-medal--${index + 1}`} aria-label={`第${index + 1}名`}>{['🥇', '🥈', '🥉'][index]}</span></td><td>{row.name}</td><td>{row.company}</td><td>{row.role}</td><td>{metric === 'hours' ? (row.hours * multiplier).toFixed(2) : Math.max(1, Math.round(row.logins * multiplier))}</td><td>{row.lastLogin}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}

function RankingPage() {
  const [period, setPeriod] = useState('月榜')
  return (
    <div className="access-ranking-page">
      <div className="access-ranking-filter"><label>榜单类型<select aria-label="榜单类型" value={period} onChange={event => setPeriod(event.target.value)}>{['周榜', '月榜', '年榜', '总榜'].map(item => <option key={item}>{item}</option>)}</select></label></div>
      <RankingTable title="累计时长榜" metric="hours" period={period} />
      <RankingTable title="累计会话榜" metric="logins" period={period} />
    </div>
  )
}

function OverviewPage() {
  const [period, setPeriod] = useState<TrendPeriod>('周')
  const metrics = [
    { label: '用户数', value: '114', unit: '人次', icon: Ruler },
    { label: '累计在线时间', value: '46,524.56', unit: 'h', icon: Clock3 },
    { label: '人均在线时长', value: '51.24', unit: 'h', icon: LocateFixed },
    { label: '同时最高在线人数', value: '13', unit: '人次', icon: History },
    { label: '活跃用户数', value: '12', unit: '人次', icon: MoveVertical },
  ]
  return (
    <div className="access-overview-page">
      <div className="access-overview-top">
        <div className="access-metric-grid">{metrics.map(({ label, value, unit, icon: Icon }) => <article className="access-metric-card" key={label}><div><span>{label}</span><strong>{value}<small>{unit}</small></strong></div><Icon /></article>)}</div>
        <div className="access-device-summary"><div className="access-device-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ value: 2437 }]} dataKey="value" innerRadius={0} outerRadius={33} fill="#5577c8" stroke="none" /></PieChart></ResponsiveContainer></div><div><strong>手机端</strong><span>2437人次，17407.14%</span></div></div>
      </div>
      <section className="access-panel access-trend-panel">
        <h2>趋势图</h2>
        <div className="access-period-tabs">{(['周', '月', '年'] as TrendPeriod[]).map(item => <button className={period === item ? 'active' : ''} key={item} onClick={() => setPeriod(item)}>{item}</button>)}</div>
        <div className="access-chart-legend"><span><i style={{ background: '#5577c8' }} />使用人次</span><span><i style={{ background: '#8ac96b' }} />使用时长</span></div>
        <div className="access-trend-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData[period]} margin={{ top: 20, right: 8, bottom: 0, left: -12 }}><CartesianGrid vertical={false} stroke="#e8edf1" /><XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#c7d0d6' }} tick={{ fontSize: 11, fill: '#60717a' }} /><YAxis yAxisId="count" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#84929a' }} /><YAxis yAxisId="hours" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#84929a' }} /><Tooltip /><Bar yAxisId="count" dataKey="count" name="使用人次" fill="#5577c8" maxBarSize={24}><LabelList dataKey="count" position="top" fontSize={10} fill="#4c5e68" /></Bar><Bar yAxisId="hours" dataKey="hours" name="使用时长(h)" fill="#8ac96b" maxBarSize={24}><LabelList dataKey="hours" position="top" fontSize={10} fill="#4c5e68" /></Bar></BarChart></ResponsiveContainer></div>
      </section>
      <div className="access-company-grid">
        <section className="access-panel access-company-panel"><h2>公司使用人次</h2><div className="access-company-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={companyUsage} margin={{ top: 20, right: 4, bottom: 0, left: -10 }}><CartesianGrid vertical={false} stroke="#e8edf1" /><XAxis dataKey="name" interval={0} tickLine={false} axisLine={{ stroke: '#c7d0d6' }} tick={{ fontSize: 9, fill: '#60717a' }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#84929a' }} /><Tooltip /><Bar dataKey="value" name="使用人次" fill="#3e8edc" maxBarSize={22}><LabelList dataKey="value" position="top" fontSize={9} fill="#4c5e68" /></Bar></BarChart></ResponsiveContainer></div></section>
        <section className="access-panel access-company-panel"><h2>作业公司人均使用时长</h2><div className="access-company-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={companyHours} margin={{ top: 20, right: 4, bottom: 0, left: -10 }}><CartesianGrid vertical={false} stroke="#e8edf1" /><XAxis dataKey="name" interval={0} tickLine={false} axisLine={{ stroke: '#c7d0d6' }} tick={{ fontSize: 9, fill: '#60717a' }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#84929a' }} /><Tooltip /><Bar dataKey="value" name="人均使用时长(h)" fill="#3e8edc" maxBarSize={22}><LabelList dataKey="value" position="top" fontSize={9} fill="#4c5e68" /></Bar></BarChart></ResponsiveContainer></div></section>
        <section className="access-panel access-company-panel access-active-panel"><h2>活跃用户占比</h2><div className="access-active-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={activeUsers} dataKey="value" nameKey="name" innerRadius={43} outerRadius={68} cx="42%" cy="50%" stroke="#fff" label={({ name, value, percent }) => `${name} ${value}人 ${((percent || 0) * 100).toFixed(2)}%`} labelLine={{ stroke: '#a5b1b8' }} fontSize={9}>{activeUsers.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="access-active-legend">{activeUsers.map(item => <div key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span></div>)}</div></div></section>
      </div>
    </div>
  )
}

function ActivityPage() {
  const [draft, setDraft] = useState<ActivityFilters>(emptyFilters)
  const [filters, setFilters] = useState<ActivityFilters>(emptyFilters)
  const [hideIp, setHideIp] = useState(true)
  const [sort, setSort] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'hours', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [jumpPage, setJumpPage] = useState('1')
  const filtered = useMemo(() => {
    const start = filters.start.replace('T', ' ')
    const end = filters.end.replace('T', ' ')
    const rows = activityRows.filter(row =>
      (!filters.name || row.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.company || row.company.toLowerCase().includes(filters.company.toLowerCase())) &&
      (!filters.role || row.role.toLowerCase().includes(filters.role.toLowerCase())) &&
      (filters.userType === '全部' || row.userType === filters.userType) &&
      (!start || row.lastLogin >= start) && (!end || row.lastLogin <= end),
    )
    return rows.sort((a, b) => {
      const left = a[sort.key]
      const right = b[sort.key]
      const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), 'zh-CN')
      return sort.direction === 'asc' ? result : -result
    })
  }, [filters, sort])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const updateDraft = (key: keyof ActivityFilters, value: string) => setDraft(current => ({ ...current, [key]: value }))
  const changeSort = (key: SortKey) => {
    setSort(current => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }))
    setPage(1)
  }
  const sortable = (label: string, key: SortKey) => <button className="access-sort-button" onClick={() => changeSort(key)}>{label}<ArrowUpDown className={sort.key === key ? 'active' : ''} /></button>
  const goToPage = (target: number) => {
    const next = Math.min(pageCount, Math.max(1, target))
    setPage(next)
    setJumpPage(String(next))
  }
  const maskedIp = (ip: string) => {
    if (!hideIp) return ip
    const parts = ip.split('.')
    return parts.length === 4 ? `${parts[0]}.**.${parts[3]}` : '***'
  }

  return (
    <div className="access-activity-page">
      <div className="access-filterbar">
        <label>姓名<input aria-label="姓名筛选" value={draft.name} onChange={event => updateDraft('name', event.target.value)} placeholder="请输入姓名" /></label>
        <label>公司<input aria-label="公司筛选" value={draft.company} onChange={event => updateDraft('company', event.target.value)} placeholder="请输入公司" /></label>
        <label>角色<input aria-label="角色筛选" value={draft.role} onChange={event => updateDraft('role', event.target.value)} placeholder="请输入角色" /></label>
        <label>用户类型<select aria-label="用户类型筛选" value={draft.userType} onChange={event => updateDraft('userType', event.target.value)}><option>全部</option><option>超级管理员</option><option>普通用户</option></select></label>
        <label>开始时间<input aria-label="开始时间" type="datetime-local" value={draft.start} onChange={event => updateDraft('start', event.target.value)} /></label>
        <label>结束时间<input aria-label="结束时间" type="datetime-local" value={draft.end} onChange={event => updateDraft('end', event.target.value)} /></label>
        <div className="access-ip-switch"><span>隐藏IP</span><button role="switch" aria-checked={hideIp} aria-label="隐藏IP" className={hideIp ? 'active' : ''} onClick={() => setHideIp(!hideIp)}><i /></button></div>
        <button className="access-query-button" onClick={() => { setFilters(draft); setPage(1); setJumpPage('1') }}><Search />查询</button>
      </div>
      <div className="access-activity-table-wrap">
        <table className="access-table access-activity-table"><thead><tr><th>姓名</th><th>公司</th><th>{sortable('用户类型', 'userType')}</th><th>{sortable('角色', 'role')}</th><th>IP地址</th><th>{sortable('登录次数', 'logins')}</th><th>{sortable('在线时长(h)', 'hours')}</th><th>{sortable('最后登录时间', 'lastLogin')}</th></tr></thead>
          <tbody>{visibleRows.map(row => <tr key={row.id}><td>{row.name}</td><td>{row.company}</td><td>{row.userType}</td><td>{row.role || '-'}</td><td>{maskedIp(row.ip)}</td><td>{row.logins}</td><td>{row.hours.toFixed(2)}</td><td>{row.lastLogin}</td></tr>)}</tbody>
        </table>
        {!visibleRows.length && <div className="access-empty">未查询到符合条件的访问记录</div>}
      </div>
      <footer className="access-pagination"><span>共 {filtered.length} 条</span><select aria-label="每页条数" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); setJumpPage('1') }}><option value={20}>20条/页</option><option value={50}>50条/页</option><option value={100}>100条/页</option></select><button aria-label="上一页" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}><ChevronLeft /></button><div className="access-page-numbers">{Array.from({ length: pageCount }, (_, index) => index + 1).map(item => <button className={currentPage === item ? 'active' : ''} key={item} onClick={() => goToPage(item)}>{item}</button>)}</div><button aria-label="下一页" disabled={currentPage === pageCount} onClick={() => goToPage(currentPage + 1)}><ChevronRight /></button><span>前往</span><input aria-label="跳转页码" value={jumpPage} onChange={event => setJumpPage(event.target.value.replace(/\D/g, ''))} onKeyDown={event => { if (event.key === 'Enter' && jumpPage) goToPage(Number(jumpPage)) }} onBlur={() => { if (jumpPage) goToPage(Number(jumpPage)) }} /><span>页</span></footer>
    </div>
  )
}

export default function PersonnelAccessPage() {
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
    <main className="access-page">
      <header className="access-header"><button className="access-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>人员访问统计</strong></button><HeaderUser /></header>
      <div className="access-workspace">
        <aside className="access-sidebar"><nav aria-label="人员访问统计导航">{navItems.map(({ id, label, icon: Icon }) => <button className={activeTab === id ? 'active' : ''} key={id} onClick={() => openPage(id)}><Icon /><span>{label}</span></button>)}</nav></aside>
        <section className="access-main">
          {openTabs.length > 0 && <div className="access-tabs" role="tablist" aria-label="已打开的访问统计页面">{openTabs.map(pageId => <div className={`access-tab ${activeTab === pageId ? 'active' : ''}`} key={pageId}><button role="tab" aria-selected={activeTab === pageId} onClick={() => setActiveTab(pageId)}>{pageLabels[pageId]}</button><button aria-label={`关闭${pageLabels[pageId]}`} onClick={() => closePage(pageId)}><X /></button></div>)}</div>}
          <div className="access-content">{activeTab === 'ranking' && <RankingPage />}{activeTab === 'overview' && <OverviewPage />}{activeTab === 'activity' && <ActivityPage />}</div>
        </section>
      </div>
    </main>
  )
}
