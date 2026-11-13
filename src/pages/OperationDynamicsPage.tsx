import { useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, CalendarDays, Construction, Download,
  FileText, Filter, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useNavigate } from 'react-router'
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'

type PageId = 'dynamics' | 'weekly'
type RiskLevel = '一级' | '二级' | '三级'

interface OperationWell {
  name: string
  company: string
  region: string
  platform: string
  size: string
  runId: string
  bha: string
  engineer: string
  risk: RiskLevel
  footage: number
  depth: number
  designDepth: number
  faulty: boolean
}

const pageLabels: Record<PageId, string> = {
  dynamics: '作业动态',
  weekly: 'Q部周报',
}

const regions = ['全部', '塘沽', '湛江', '深圳', '上海', '海南', '陆地', '海外']
const chartColors = ['#4f80e8', '#36c4bf', '#5279df', '#f4ce45', '#42a5d9', '#ed5c68', '#48bf7a', '#35b5d8']

const riskData = [
  { name: '一级风险井', value: 3, percent: '37.50%', color: '#ef6570' },
  { name: '二级风险井', value: 3, percent: '37.50%', color: '#6b8ee8' },
  { name: '三级风险井', value: 2, percent: '25.00%', color: '#65c68b' },
]

const holeData = [
  { name: '20"', value: 6 }, { name: '17.5"', value: 6 }, { name: '12.25"', value: 4 },
  { name: '10"', value: 7 }, { name: '8.5"', value: 7 }, { name: '8"', value: 4 },
  { name: '6.5"', value: 6 }, { name: '5"', value: 7 },
]

const instrumentData = [
  { name: '导向', value: 6 }, { name: '高速率', value: 5 }, { name: '探边', value: 4 },
  { name: '中子/密度', value: 2 }, { name: '随压', value: 7 }, { name: '声波', value: 4 },
]

const footageData = [
  { name: 'XJ-TLF001-A1H6', value: 95 }, { name: 'XJ-TLF001-A1H7', value: 87 },
  { name: 'XJ-TLF001-A1H8', value: 87 }, { name: 'XJ-TLF001-A1H9', value: 66 },
  { name: 'XJ-TLF001-A1H10', value: 55 }, { name: 'XJ-TLF001-A1H11', value: 55 },
  { name: 'XJ-TLF001-A1H12', value: 48 }, { name: 'XJ-TLF001-A1H13', value: 46 },
  { name: 'XJ-TLF001-A1H14', value: 40 }, { name: 'XJ-TLF001-A1H15', value: 36 },
]

const operationWells: OperationWell[] = [
  { name: 'XJ101-444井', company: '塘沽作业公司', region: '塘沽', platform: '深海981', size: '12.25', runId: '100', bha: 'BCPM+ABC+DSM+DIMI+DWPR+RSS', engineer: '张三、李四', risk: '二级', footage: 120, depth: 999, designDepth: 2100, faulty: false },
  { name: 'XJ101-445井', company: '塘沽作业公司', region: '塘沽', platform: '深海981', size: '12.25', runId: '100', bha: 'BCPM+ABC+DSM+DIMI+DWPR+RSS', engineer: '张三', risk: '一级', footage: 120, depth: 999, designDepth: 2100, faulty: false },
  { name: 'XJ101-446井', company: '湛江作业公司', region: '湛江', platform: '深海981', size: '12.25', runId: '100', bha: 'BCPM+ABC+DSM+DIMI+DWPR+RSS', engineer: '张三', risk: '一级', footage: 120, depth: 999, designDepth: 2100, faulty: false },
  { name: 'XJ101-447井', company: '深圳作业公司', region: '深圳', platform: '深海981', size: '12.25', runId: '100', bha: 'BCPM+ABC+DSM+DIMI+DWPR+RSS', engineer: '张三', risk: '三级', footage: 120, depth: 999, designDepth: 2100, faulty: false },
  { name: 'XJ101-448井', company: '塘沽作业公司', region: '塘沽', platform: '深海981', size: '12.25', runId: '100', bha: 'BCPM+ABC+DSM+DIMI+DWPR+RSS', engineer: '张三', risk: '一级', footage: 120, depth: 999, designDepth: 2100, faulty: true },
  { name: 'XJ101-449井', company: '上海作业公司', region: '上海', platform: '深海981', size: '12.25', runId: '100', bha: 'BCPM+ABC+DSM+DIMI+DWPR+RSS', engineer: '张三', risk: '二级', footage: 120, depth: 999, designDepth: 2100, faulty: false },
  { name: 'XJ101-450井', company: '海南作业公司', region: '海南', platform: '深海981', size: '12.25', runId: '100', bha: 'BCPM+ABC+DSM+DIMI+DWPR+RSS', engineer: '张三', risk: '二级', footage: 120, depth: 999, designDepth: 2100, faulty: false },
  { name: 'XJ101-451井', company: '陆地作业公司', region: '陆地', platform: '深海981', size: '12.25', runId: '100', bha: 'BCPM+ABC+DSM+DIMI+DWPR+RSS', engineer: '张三', risk: '二级', footage: 120, depth: 999, designDepth: 2100, faulty: false },
]

const weeklyColumns = ['直属单位', '井别', '作业者', '项目名称', '自营/合营', '钻机', '井名', '井型', '定向工具类型', '测量类型', '基础测量', '高端测量']
const weeklyRows = [
  ['缅甸', '领眼井', 'SK', 'JX1-1', '自营', '海洋石油906', 'cai0721', '定向井', '指向式导向', '随钻测量', '无', ''],
  ['深圳', '领眼井', 'SK', 'JX1-1', '', '海洋石油906', 'fuyi_1.0_test_bohai', '定向井', '', '', '', ''],
  ['深圳', '领眼井', '中澳', 'JX1-1', '自营', 'COSL7', 'fuyi_bohai_0713', '定向井', '', '随钻测井', '无', ''],
  ['贝克休斯', '调整井', 'CCLD', '', '自营', '', 'z260720', '大斜度定向井', '', '随钻测井', '随钻四条线（自研）', ''],
  ['贝克休斯', '调整井', 'CCLD', '', '自营', '', 'z260720', '大斜度定向井', '', '随钻测井', '近钻头伽马（旋转导向）', ''],
  ['缅甸', '领眼井', 'SK', 'JX1-1', '自营', 'COSL7', 'z260722', '定向井', '', '随钻测井', '无', ''],
]

function downloadCsv(filename: string, columns: string[], rows: (string | number)[][]) {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
  const content = [columns, ...rows].map(row => row.map(escape).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="stats-section-title"><span>◆</span>{children}</h2>
}

function OperationDashboard() {
  const [region, setRegion] = useState('全部')
  const [range, setRange] = useState('24小时')
  const [date, setDate] = useState('2025-03-10')
  const [showFilters, setShowFilters] = useState(false)
  const [wellName, setWellName] = useState('')
  const [risk, setRisk] = useState('全部')

  const visibleWells = useMemo(() => operationWells.filter(well =>
    (region === '全部' || well.region === region)
    && (!wellName || well.name.toLowerCase().includes(wellName.toLowerCase()))
    && (risk === '全部' || well.risk === risk),
  ), [region, risk, wellName])

  const exportRows = () => downloadCsv(
    '作业动态.csv',
    ['井名', '作业公司', '平台', '井眼尺寸(in)', 'RunID', 'BHA', '带队工程师', '风险等级', `${range}进尺(m)`, '当前深度(m)', '井段设计深度(m)', '是否故障'],
    visibleWells.map(well => [well.name, well.company, well.platform, well.size, well.runId, well.bha, well.engineer, well.risk, well.footage, well.depth, well.designDepth, well.faulty ? '故障' : '正常']),
  )

  return (
    <div className="operation-dashboard">
      <div className="operation-filterbar">
        <div className="operation-regions" aria-label="作业区域">
          {regions.map(item => <button className={region === item ? 'active' : ''} key={item} onClick={() => setRegion(item)}>{item}</button>)}
        </div>
        <label className="operation-range"><span>动态范围</span><select value={range} onChange={event => setRange(event.target.value)}><option>24小时</option><option>48小时</option><option>7天</option></select></label>
        <input className="operation-date" type="date" value={date} onChange={event => setDate(event.target.value)} aria-label="动态日期" />
      </div>

      <div className="operation-dashboard-top">
        <div className="operation-dashboard-left">
          <div className="operation-summary-risk">
            <section className="stats-panel operation-status-panel" aria-label="作业状态概览">
              <div className="operation-status-grid">
                <article className="operation-status-card operation-status-card--working"><Construction /><strong>8</strong><span>作业中</span></article>
                <article className="operation-status-card operation-status-card--fault"><AlertTriangle /><strong>3</strong><span>故障井</span></article>
                <article className="operation-metric-card"><span>{range}累计进尺（m）</span><strong>1,234</strong></article>
                <article className="operation-metric-card operation-metric-card--purple"><span>{range}最大进尺（m）</span><strong>210</strong></article>
              </div>
            </section>

            <section className="stats-panel operation-risk-panel">
              <SectionTitle>作业风险</SectionTitle>
              <div className="operation-risk-content">
                <div className="operation-risk-chart">
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={riskData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={46} paddingAngle={1} stroke="none">{riskData.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                  <div><span>风险提示</span><strong>8</strong></div>
                </div>
                <div className="operation-risk-legend">{riskData.map(item => <div key={item.name}><i style={{ background: item.color }} /><strong>{item.value}</strong><span>{item.percent}</span><small>{item.name}</small></div>)}</div>
              </div>
            </section>
          </div>

          <div className="operation-small-charts">
            <section className="stats-panel operation-chart-panel">
              <SectionTitle>井眼尺寸</SectionTitle><span className="operation-chart-unit">单位：井次</span>
              <div className="operation-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={holeData} margin={{ top: 18, right: 8, bottom: 0, left: -22 }}><CartesianGrid vertical={false} stroke="#e8eef2" /><XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#b8c4cb' }} tick={{ fontSize: 10, fill: '#526571' }} /><YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#526571' }} /><Tooltip /><Bar dataKey="value" maxBarSize={9}>{holeData.map((item, index) => <Cell key={item.name} fill={chartColors[index]} />)}<LabelList dataKey="value" position="top" fontSize={10} fill="#435761" /></Bar></BarChart></ResponsiveContainer></div>
            </section>
            <section className="stats-panel operation-chart-panel">
              <SectionTitle>重点仪器</SectionTitle><span className="operation-chart-unit">单位：次</span>
              <div className="operation-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={instrumentData} margin={{ top: 18, right: 8, bottom: 0, left: -22 }}><CartesianGrid vertical={false} stroke="#e8eef2" /><XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#b8c4cb' }} tick={{ fontSize: 10, fill: '#526571' }} /><YAxis domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#526571' }} /><Tooltip /><Bar dataKey="value" maxBarSize={9}>{instrumentData.map((item, index) => <Cell key={item.name} fill={chartColors[index]} />)}<LabelList dataKey="value" position="top" fontSize={10} fill="#435761" /></Bar></BarChart></ResponsiveContainer></div>
            </section>
          </div>
        </div>

        <section className="stats-panel operation-footage-panel">
          <SectionTitle>作业进尺</SectionTitle><span className="operation-footage-unit">单位：m</span>
          <div className="operation-footage-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={footageData} layout="vertical" margin={{ top: 12, right: 28, bottom: 0, left: 4 }}><CartesianGrid horizontal={false} stroke="#e8eef2" /><XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} orientation="top" tickLine={false} axisLine={{ stroke: '#b8c4cb' }} tick={{ fontSize: 10, fill: '#526571' }} /><YAxis type="category" dataKey="name" width={102} interval={0} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#526571' }} /><Tooltip /><Bar dataKey="value" fill="#48c798" maxBarSize={9}><LabelList dataKey="value" position="right" fontSize={10} fill="#435761" /></Bar></BarChart></ResponsiveContainer></div>
        </section>
      </div>

      <section className="stats-panel operation-table-panel">
        <div className="operation-table-actions">
          <button className={showFilters ? 'active' : ''} onClick={() => setShowFilters(value => !value)}><Filter />筛选</button>
          <button onClick={exportRows}><Download />导出</button>
        </div>
        {showFilters && <div className="operation-advanced-filters">
          <label><span>井名</span><input value={wellName} onChange={event => setWellName(event.target.value)} placeholder="请输入井名" /></label>
          <label><span>风险等级</span><select value={risk} onChange={event => setRisk(event.target.value)}><option>全部</option><option>一级</option><option>二级</option><option>三级</option></select></label>
          <button onClick={() => { setWellName(''); setRisk('全部'); setRegion('全部') }}>重置</button>
        </div>}
        <div className="operation-table-scroll">
          <table className="operation-table">
            <thead><tr><th>井名</th><th>作业公司</th><th>平台</th><th>井眼尺寸(in)</th><th>RunID</th><th>BHA</th><th>带队工程师</th><th>风险等级</th><th>{range}进尺(m)</th><th>当前深度(m)</th><th>井段设计深度(m)</th><th>是否故障</th></tr></thead>
            <tbody>{visibleWells.map(well => <tr className={well.faulty ? 'faulty' : ''} key={well.name}>
              <td><span className={`operation-well-name ${well.faulty ? 'faulty' : ''}`}>{well.faulty ? <AlertTriangle /> : <Construction />}{well.name}</span></td>
              <td>{well.company}</td><td>{well.platform}</td><td>{well.size}</td><td>{well.runId}</td><td>{well.bha}</td><td>{well.engineer}</td>
              <td><span className={`operation-risk-badge operation-risk-badge--${well.risk === '一级' ? 'high' : well.risk === '二级' ? 'medium' : 'low'}`}>{well.risk}</span></td>
              <td>{well.footage}</td><td>{well.depth}</td><td>{well.designDepth}</td><td className={well.faulty ? 'operation-fault-text' : ''}>{well.faulty ? '故障' : '正常'}</td>
            </tr>)}</tbody>
          </table>
          {visibleWells.length === 0 && <div className="operation-empty">暂无符合筛选条件的作业井</div>}
        </div>
        <div className="operation-table-footer"><span>共 <b>{visibleWells.length}</b> 口作业井</span><span>数据日期：{date}</span></div>
      </section>
    </div>
  )
}

function QWeeklyReport() {
  const [year, setYear] = useState('2026年')
  const [week, setWeek] = useState('2026年第44周（10.29-11.04）')
  const [filters, setFilters] = useState({ unit: '全部', xuanji: '是' })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const periodMatches = year === '2026年' && week === '2026年第44周（10.29-11.04）'
  const visibleRows = periodMatches ? weeklyRows.filter(row =>
    (appliedFilters.unit === '全部' || row[0] === appliedFilters.unit)
    && appliedFilters.xuanji !== '否',
  ) : []

  return (
    <section className="stats-data-page operation-weekly-page">
      <div className="operation-weekly-filterbar">
        <div className="operation-weekly-basic-filters">
          <label><span>直属单位</span><select value={filters.unit} onChange={event => setFilters(current => ({ ...current, unit: event.target.value }))}><option>全部</option><option>缅甸</option><option>深圳</option><option>贝克休斯</option></select></label>
          <label><span>璇玑作业井</span><select value={filters.xuanji} onChange={event => setFilters(current => ({ ...current, xuanji: event.target.value }))}><option>是</option><option>否</option></select></label>
        </div>
        <div className="operation-weekly-period-filters">
          <button className="stats-secondary-button" onClick={() => setAppliedFilters({ ...filters })}><Filter />筛选</button>
          <label className="operation-weekly-period"><CalendarDays /><select value={year} onChange={event => setYear(event.target.value)} aria-label="周报年份"><option>2026年</option><option>2025年</option></select></label>
          <label className="operation-weekly-period operation-weekly-period--week"><CalendarDays /><select value={week} onChange={event => setWeek(event.target.value)} aria-label="周报周次"><option>2026年第44周（10.29-11.04）</option><option>2026年第43周（10.22-10.28）</option></select></label>
          <button className="stats-secondary-button" onClick={() => downloadCsv('Q部周报.csv', weeklyColumns, visibleRows)}><Download />导出</button>
        </div>
      </div>
      <div className="stats-data-panel operation-weekly-table-panel">
        <div className="stats-table-scroll stats-table-scroll--weekly"><table className="stats-data-table operation-weekly-table"><thead><tr>{weeklyColumns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>
          {visibleRows.map((row, rowIndex) => <tr key={`${row[0]}-${row[6]}-${rowIndex}`}>{row.map((cell, index) => <td key={`${index}-${cell}`}>{index === 6 ? <span className="operation-weekly-well">{cell}</span> : cell}</td>)}</tr>)}
          {visibleRows.length === 0 && <tr><td className="stats-no-data" colSpan={weeklyColumns.length}>暂无符合筛选条件的周报</td></tr>}
        </tbody></table></div>
        <div className="operation-weekly-pagination"><span>共 {visibleRows.length} 条</span><select aria-label="每页条数" defaultValue="20"><option value="20">20条/页</option></select><button disabled aria-label="上一页">‹</button><strong>1</strong><button disabled aria-label="下一页">›</button><span>前往</span><input value="1" readOnly aria-label="页码" /><span>页</span></div>
      </div>
    </section>
  )
}

export default function OperationDynamicsPage() {
  const navigate = useNavigate()
  const [openTabs, setOpenTabs] = useState<PageId[]>(['dynamics'])
  const [activeTab, setActiveTab] = useState<PageId | null>('dynamics')

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
    <div className="stats-page operation-page">
      <header className="stats-header">
        <button className="stats-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>作业动态</strong></button>
        <HeaderUser />
      </header>
      <div className="stats-shell">
        <aside className="stats-sidebar">
          <nav className="stats-nav operation-nav" aria-label="作业动态导航">
            <button className={activeTab === 'dynamics' ? 'active' : ''} onClick={() => openPage('dynamics')}><Activity />作业动态</button>
            <button className={activeTab === 'weekly' ? 'active' : ''} onClick={() => openPage('weekly')}><FileText />Q部周报</button>
          </nav>
        </aside>
        <main className={`stats-main operation-main ${openTabs.length === 0 ? 'stats-main--empty' : ''}`}>
          {openTabs.length > 0 && <div className="stats-tabs" role="tablist" aria-label="已打开的作业动态页面">
            {openTabs.map(pageId => <div className={`stats-tab ${activeTab === pageId ? 'active' : ''}`} key={pageId}>
              <button className="stats-tab-label" role="tab" aria-selected={activeTab === pageId} onClick={() => setActiveTab(pageId)}>{pageLabels[pageId]}</button>
              <button className="stats-tab-close" aria-label={`关闭${pageLabels[pageId]}`} onClick={() => closePage(pageId)}><X /></button>
            </div>)}
          </div>}
          {activeTab === 'dynamics' && <OperationDashboard />}
          {activeTab === 'weekly' && <QWeeklyReport />}
        </main>
      </div>
    </div>
  )
}
