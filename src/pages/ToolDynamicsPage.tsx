import { useMemo, useRef, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import {
  Activity, AlertTriangle, Box, ClipboardList, Clock3,
  Database, Download, FileUp, Filter, Pencil, Plus, Trash2, Wrench, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

type PageId = 'overview' | 'usage' | 'standby' | 'library'

interface ToolItem {
  id: number
  owner: string
  category: string
  size: string
  serial: string
  name: string
  version: string
  hardware: string
  firmware: string
  od: string
  inner: string
}

interface ToolStatusRow {
  name: string
  platform: string
  well: string
  runId: string
  faulty: boolean
  status: '已入井' | '已出井' | '未入井'
  circulation: number
  drilling: number
  owner: string
  company: string
  region: string
  hardware: string
  firmware: string
  position: string
  lastCycle: number
  category: string
}

interface RecordFilters {
  category: string
  size: string
  serial: string
  start: string
  end: string
}

const pageLabels: Record<PageId, string> = {
  overview: '作业工具动态',
  usage: '工具使用记录',
  standby: '工具待命时间',
  library: '工具库',
}

const navItems: { id: PageId, label: string, icon: typeof Activity }[] = [
  { id: 'overview', label: '作业工具动态', icon: Activity },
  { id: 'usage', label: '工具使用记录', icon: ClipboardList },
  { id: 'standby', label: '工具待命时间', icon: Clock3 },
  { id: 'library', label: '工具库', icon: Database },
]

const regions = ['全部', '塘沽', '湛江', '深圳', '上海', '海南', '陆地', '海外']
const categories = ['全部', '300W', 'ACPR', 'DSM', 'DIM', 'ABC', 'WelleaderPivot', 'BCPM']
const sizes = ['全部', '4-3/4"', '6-3/4"', '8"', '475', '800']
const emptyFilters: RecordFilters = { category: '全部', size: '全部', serial: '', start: '', end: '' }

const statusData = [
  { name: '已入井', value: 80, color: '#38c875' },
  { name: '已出井', value: 28, color: '#2294dc' },
  { name: '未入井', value: 20, color: '#f4ce45' },
  { name: '在甲板', value: 50, color: '#f2aa4b' },
  { name: '立钻台', value: 47, color: '#42b7d9' },
]

const companyData = [
  { name: '塘沽', value: 17 }, { name: '湛江', value: 72 }, { name: '深圳', value: 65 },
  { name: '上海', value: 57 }, { name: '海南', value: 87 }, { name: '陆地', value: 22 },
  { name: '海外', value: 35 },
]

const sizeData = [
  { name: '导向', large: 93, medium: 55, small: 66 },
  { name: '高速率', large: 32, medium: 24, small: 76 },
  { name: '探边', large: 56, medium: 77, small: 89 },
  { name: '中子/密度', large: 10, medium: 46, small: 29 },
  { name: '随压', large: 11, medium: 59, small: 66 },
  { name: '声波', large: 46, medium: 91, small: 66 },
]

const toolStatusRows: ToolStatusRow[] = [
  { name: '475ACPR#123', platform: '981', well: 'ZJ101-13H16', runId: '100', faulty: false, status: '已入井', circulation: 50, drilling: 100, owner: '自研', company: '湛江', region: '湛江', hardware: 'A', firmware: '1.0', position: '立钻台', lastCycle: 50, category: 'ACPR' },
  { name: '475ACPR#124', platform: '981', well: 'ZJ101-13H16', runId: '100', faulty: false, status: '已入井', circulation: 50, drilling: 100, owner: '自研', company: '湛江', region: '湛江', hardware: 'A', firmware: '1.0', position: '已入井', lastCycle: 50, category: 'ACPR' },
  { name: '675DSM#036', platform: '981', well: 'ZJ101-13H16', runId: '100', faulty: false, status: '已入井', circulation: 50, drilling: 100, owner: '自研', company: '深圳', region: '深圳', hardware: 'A', firmware: '1.0', position: '立钻台', lastCycle: 50, category: 'DSM' },
  { name: '675DIM#082', platform: '981', well: 'ZJ101-13H16', runId: '100', faulty: false, status: '已入井', circulation: 50, drilling: 100, owner: '自研', company: '上海', region: '上海', hardware: 'A', firmware: '1.0', position: '立钻台', lastCycle: 50, category: 'DIM' },
  { name: '475ABC#018', platform: '981', well: 'ZJ101-13H16', runId: '100', faulty: true, status: '已出井', circulation: 50, drilling: 100, owner: '自研', company: '海南', region: '海南', hardware: 'A', firmware: '1.0', position: '立钻台', lastCycle: 50, category: 'ABC' },
  { name: '800300W#011', platform: '981', well: 'ZJ101-13H16', runId: '100', faulty: false, status: '已入井', circulation: 50, drilling: 100, owner: '自研', company: '塘沽', region: '塘沽', hardware: 'A', firmware: '1.0', position: '立钻台', lastCycle: 50, category: '300W' },
  { name: '675BCPM#025', platform: '981', well: 'ZJ101-13H16', runId: '100', faulty: false, status: '未入井', circulation: 50, drilling: 100, owner: '自研', company: '陆地', region: '陆地', hardware: 'A', firmware: '1.0', position: '在甲板', lastCycle: 50, category: 'BCPM' },
  { name: '475Welleader#007', platform: '981', well: 'ZJ101-13H16', runId: '100', faulty: false, status: '已出井', circulation: 50, drilling: 100, owner: '自研', company: '海外', region: '海外', hardware: 'A', firmware: '1.0', position: '在甲板', lastCycle: 50, category: 'WelleaderPivot' },
]

const usageColumns = ['序号', '作业井名', '所属作业公司', '仪器尺寸', '仪器类别', '序列号', '仪器版本号', '硬件版本号', '固件版本号', '作业RunID', '开始时间']
const usageRows = [
  ['z260717_test', '贝克休斯', '4-3/4"', 'DSM', '补全', '', '', '', '100', '2026-07-17 00:00:00'],
  ['z260717_test', '贝克休斯', '4-3/4"', 'ACPR', 'BHA_SN', 'BHA_Version3', '', '', '100', '2026-07-17 00:00:00'],
  ['z260717_test', '贝克休斯', '4-3/4"', 'F/V', 'BHA_SN', 'BHA_Version5', '', '', '100', '2026-07-17 00:00:00'],
  ['z260717_test', '贝克休斯', '4-3/4"', 'DIM', 'BHA_SN', 'BHA_Version2', '', '', '100', '2026-07-17 00:00:00'],
  ['z260717_test', '贝克休斯', '4-3/4"', 'ABC', 'BHA_SN', 'BHA_Version1', '', '', '100', '2026-07-17 00:00:00'],
  ['h_260928', '研究院', '6-3/4"', 'ABC', '123456', '1.0', 'A', '', '100', '2026-09-28 17:13:30'],
  ['h_260928', '研究院', '6-3/4"', 'IDMP', '123456', '1.0', 'A', '', '100', '2026-09-28 17:13:30'],
  ['fuyi_2.0_test_bohai', '深圳作业公司', '4-3/4"', 'DSM', '补全', '', '', '', '100', '2026-09-03 00:00:00'],
  ['fuyi_2.0_test_bohai', '深圳作业公司', '6-3/4"', 'ACPR', '1101', '1.0', 'A', '', '100', '2026-09-03 00:00:00'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '6-3/4"', 'DIM', '补全', 'ToolVersion_2.5', '', '', '200', '2026-09-15 00:00:00'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '800', 'ACPR', '111111', '1.0', 'A', '', '200', '2026-09-15 00:00:00'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '6-3/4"', 'WelleaderPivot', '12121', '1.0', 'A', '', '200', '2026-09-15 00:00:00'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '6-3/4"', 'DSM', '补全', '', '', '', '200', '2026-09-15 00:00:00'],
  ['test0916', '缅甸作业公司', '4-3/4"', 'DIM', 'BHA_SN', 'BHA_Version2', '', '', '100', '2026-09-16 00:00:00'],
]

const standbyColumns = ['序号', '作业井名', '所属作业公司', '仪器尺寸', '仪器类别', '序列号', '仪器版本号', '待命时长(day)']
const standbyRows = [
  ['caitest', '缅甸作业公司', '6-3/4"', '300W', '0035', 'ToolVersion_1.0', '107'],
  ['caitest', '缅甸作业公司', '4-3/4"', '300W', 'a1', '1.0', '107'],
  ['cai0721', '缅甸作业公司', '4-3/4"', '300W', 'a1', '1.0', '103'],
  ['cai0721', '缅甸作业公司', '8"', '300W', '0006', 'ToolVersion_1.0', '102'],
  ['test0916', '缅甸作业公司', '6-3/4"', 'ACPR', '0053', '1.0', '23'],
  ['test0916', '缅甸作业公司', '6-3/4"', 'ABC', '23013', 'ToolVersion_1.0', '25'],
  ['test0916', '缅甸作业公司', '6-3/4"', 'DIM', '23016', 'ToolVersion_2.5', '25'],
  ['fuyi_bohai_0903', '深圳作业公司', '475', 'ACPR', 'AP987456', '1.0', '59'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '800', 'ACPR', '111111', '1.0', '48'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '6-3/4"', 'Welleader2.0', '123456', '1.0', '48'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '6-3/4"', 'WelleaderExpress', '123456', '1.0', '48'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '6-3/4"', 'WelleaderPivot', '12121', '1.0', '48'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '6-3/4"', 'DSM2', '123456', '1.0', '48'],
  ['fuyi_1.0_test_bohai', '深圳作业公司', '6-3/4"', 'NBIG', '123', '1.0', '48'],
  ['cai0721', '缅甸作业公司', '6-3/4"', 'ABC', '123456', '1.0', '104'],
]

const initialTools: ToolItem[] = [
  { id: 1, owner: '自研', category: '300W', size: '6-3/4"', serial: '999', name: '6-3/4"300W#999', version: '1.0', hardware: 'A', firmware: '', od: '6.75', inner: '' },
  { id: 2, owner: '自研', category: '300W', size: '4-3/4"', serial: 'a1', name: '4-3/4"300W#a1', version: '1.0', hardware: 'A', firmware: 'xa', od: '4.75', inner: '4' },
  { id: 3, owner: '自研', category: 'DIM3.0', size: '6-3/4"', serial: 'a1', name: '6-3/4"DIM3.0#a1', version: '1.0', hardware: 'A', firmware: 'xa', od: '6.75', inner: '6' },
  { id: 4, owner: '自研', category: 'MRIT675-WFLX-A', size: '6-3/4"', serial: 'a1', name: '6-3/4"MRIT675-WFLX-A#a1', version: '1.0', hardware: 'A', firmware: 'x', od: '6.75', inner: '6.1' },
  { id: 5, owner: '自研', category: '300W', size: '6-3/4"', serial: 'cai111', name: '6-3/4"300W#cai111', version: '无', hardware: 'B', firmware: '', od: '6.75', inner: '' },
  { id: 6, owner: '自研', category: 'MRIT675-SENSOR-A', size: '4-3/4"', serial: '2222-9999', name: '4-3/4"MRIT675-SENSOR-A#2222-9999', version: '2.0', hardware: 'B', firmware: '', od: '4.75', inner: '' },
  { id: 7, owner: '自研', category: 'MRIT675-SENSOR-A', size: '4-3/4"', serial: '2222', name: '4-3/4"MRIT675-SENSOR-A#2222', version: '2.0', hardware: 'B', firmware: '', od: '4.75', inner: '' },
  { id: 8, owner: '自研', category: 'MRIT675-SENSOR-A', size: '4-3/4"', serial: '1111111', name: '4-3/4"MRIT675-SENSOR-A#1111111', version: '1.0', hardware: 'C', firmware: '', od: '4.75', inner: '' },
  { id: 9, owner: '自研', category: 'MRIT675-WFLX-A', size: '6-3/4"', serial: '1', name: '6-3/4"MRIT675-WFLX-A#1', version: '1.0', hardware: 'A', firmware: '', od: '6.75', inner: '' },
  { id: 10, owner: '自研', category: 'MRIT675-SENSOR-A', size: '8"', serial: '1', name: '8"MRIT675-SENSOR-A#1', version: '1.0', hardware: 'B', firmware: '', od: '8', inner: '' },
  { id: 11, owner: '自研', category: 'ACPR', size: '4-3/4"', serial: '0825', name: '4-3/4"ACPR#0825', version: '1.0', hardware: 'A', firmware: '', od: '4.75', inner: '' },
  { id: 12, owner: '自研', category: 'BCPM', size: '4-3/4"', serial: '0825', name: '4-3/4"BCPM#0825', version: '1.0', hardware: 'A', firmware: '', od: '4.75', inner: '' },
  { id: 13, owner: '自研', category: 'DIM', size: '4-3/4"', serial: '0825', name: '4-3/4"DIM#0825', version: '1.0', hardware: 'A', firmware: '', od: '4.75', inner: '' },
  { id: 14, owner: '自研', category: 'ABC', size: '4-3/4"', serial: '0825', name: '4-3/4"ABC#0825', version: '1.0', hardware: 'A', firmware: '', od: '4.75', inner: '' },
  { id: 15, owner: '自研', category: 'WelleaderPivot', size: '6-3/4"', serial: '12121', name: '6-3/4"WelleaderPivot#12121', version: '1.0', hardware: 'A', firmware: '', od: '6.75', inner: '3' },
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

function TablePagination({ total }: { total: number }) {
  return <div className="tool-pagination"><span>共 {total} 条</span><select aria-label="每页条数" defaultValue="50"><option value="50">50条/页</option></select><button disabled aria-label="上一页">‹</button><strong>1</strong><button disabled aria-label="下一页">›</button><span>前往</span><input value="1" readOnly aria-label="页码" /><span>页</span></div>
}

function ToolOverview() {
  const [region, setRegion] = useState('全部')
  const [owner, setOwner] = useState('全部')
  const [category, setCategory] = useState('全部')
  const [showFilters, setShowFilters] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('全部')

  const visibleRows = useMemo(() => toolStatusRows.filter(row =>
    (region === '全部' || row.region === region)
    && (owner === '全部' || row.owner === owner)
    && (category === '全部' || row.category === category)
    && (status === '全部' || row.status === status)
    && (!keyword || `${row.name}${row.well}`.toLowerCase().includes(keyword.toLowerCase())),
  ), [category, keyword, owner, region, status])

  const columns = ['名称', '所在平台', '作业井名', '最后入井RunID', '是否故障', '入井状态', '累计循环时间(h)', '累计纯钻时间(h)', '仪器归属', '使用作业公司', '硬件版本号', '固件版本号', '位置', '最后作业Run循环时间(h)']
  const exportRows = () => downloadCsv('作业工具动态.csv', columns, visibleRows.map(row => [row.name, row.platform, row.well, row.runId, row.faulty ? '是' : '否', row.status, row.circulation, row.drilling, row.owner, row.company, row.hardware, row.firmware, row.position, row.lastCycle]))

  return <div className="tool-overview">
    <div className="operation-filterbar tool-overview-filterbar">
      <div className="operation-regions" aria-label="作业区域">{regions.map(item => <button className={region === item ? 'active' : ''} key={item} onClick={() => setRegion(item)}>{item}</button>)}</div>
      <label className="operation-range"><span>仪器归属</span><select value={owner} onChange={event => setOwner(event.target.value)}><option>全部</option><option>自研</option><option>外购</option></select></label>
      <label className="operation-range"><span>仪器类型</span><select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
    </div>

    <div className="tool-dashboard-grid">
      <section className="stats-panel tool-summary-panel" aria-label="作业仪器概览">
        <article className="tool-summary-card"><Box /><strong>1,288</strong><span>作业仪器</span></article>
        <article className="tool-summary-card"><Wrench /><strong>588</strong><span>入井仪器</span></article>
        <article className="tool-summary-card tool-summary-card--fault"><AlertTriangle /><strong>3</strong><span>故障仪器</span></article>
      </section>
      <section className="stats-panel tool-status-chart-panel">
        <SectionTitle>作业仪器状态</SectionTitle>
        <div className="tool-status-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={32} outerRadius={60} paddingAngle={1} stroke="none">{statusData.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="tool-chart-center"><strong>225</strong><span>仪器总数</span></div></div>
        <div className="tool-status-legend">{statusData.map(item => <div key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{item.value}</strong></div>)}</div>
      </section>
      <section className="stats-panel tool-company-panel">
        <SectionTitle>作业公司分布</SectionTitle><span className="tool-chart-unit">单位：只</span>
        <div className="tool-company-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={companyData} margin={{ top: 14, right: 8, bottom: 0, left: -20 }}><CartesianGrid vertical={false} stroke="#e8eef2" /><XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#b8c4cb' }} tick={{ fontSize: 10, fill: '#526571' }} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#526571' }} /><Tooltip /><Bar dataKey="value" fill="#9278e8" maxBarSize={13}><LabelList dataKey="value" position="top" fontSize={10} fill="#435761" /></Bar></BarChart></ResponsiveContainer></div>
      </section>
    </div>

    <section className="stats-panel tool-size-panel">
      <SectionTitle>重点仪器尺寸种类</SectionTitle><span className="tool-chart-unit">单位：只</span>
      <div className="tool-size-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={sizeData} margin={{ top: 16, right: 16, bottom: 0, left: -12 }}><CartesianGrid vertical={false} stroke="#e8eef2" /><XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#b8c4cb' }} tick={{ fontSize: 11, fill: '#526571' }} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#526571' }} /><Tooltip /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} /><Bar name="800/950" dataKey="large" fill="#9278e8" maxBarSize={14}><LabelList dataKey="large" position="top" fontSize={10} fill="#435761" /></Bar><Bar name="675" dataKey="medium" fill="#f38b9b" maxBarSize={14}><LabelList dataKey="medium" position="top" fontSize={10} fill="#435761" /></Bar><Bar name="475" dataKey="small" fill="#43b6d3" maxBarSize={14}><LabelList dataKey="small" position="top" fontSize={10} fill="#435761" /></Bar></BarChart></ResponsiveContainer></div>
    </section>

    <section className="stats-panel operation-table-panel tool-overview-table-panel">
      <div className="operation-table-actions"><button className={showFilters ? 'active' : ''} onClick={() => setShowFilters(value => !value)}><Filter />筛选</button><button onClick={exportRows}><Download />导出</button></div>
      {showFilters && <div className="operation-advanced-filters"><label><span>仪器名称 / 井名</span><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="请输入关键字" /></label><label><span>入井状态</span><select value={status} onChange={event => setStatus(event.target.value)}><option>全部</option><option>已入井</option><option>已出井</option><option>未入井</option></select></label><button onClick={() => { setKeyword(''); setStatus('全部'); setRegion('全部'); setOwner('全部'); setCategory('全部') }}>重置</button></div>}
      <div className="operation-table-scroll"><table className="operation-table tool-status-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>
        {visibleRows.map(row => <tr className={row.faulty ? 'faulty' : ''} key={row.name}><td>{row.name}</td><td>{row.platform}</td><td>{row.well}</td><td>{row.runId}</td><td className={row.faulty ? 'operation-fault-text' : ''}>{row.faulty ? '是' : '否'}</td><td><span className={`tool-well-status tool-well-status--${row.status === '已入井' ? 'in' : row.status === '已出井' ? 'out' : 'wait'}`}>{row.status}</span></td><td>{row.circulation}</td><td>{row.drilling}</td><td>{row.owner}</td><td>{row.company}</td><td>{row.hardware}</td><td>{row.firmware}</td><td>{row.position}</td><td>{row.lastCycle}</td></tr>)}
      </tbody></table>{visibleRows.length === 0 && <div className="operation-empty">暂无符合筛选条件的仪器</div>}</div>
      <div className="operation-table-footer"><span>共 <b>{visibleRows.length}</b> 条仪器记录</span><span>统计数据更新至当前作业日</span></div>
    </section>
  </div>
}

function RecordFilterBar({ filters, setFilters }: { filters: RecordFilters, setFilters: Dispatch<SetStateAction<RecordFilters>> }) {
  const update = (key: keyof RecordFilters, value: string) => setFilters(current => ({ ...current, [key]: value }))
  return <div className="tool-record-filters">
    <label><span>仪器类别</span><select value={filters.category} onChange={event => update('category', event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
    <label><span>仪器尺寸</span><select value={filters.size} onChange={event => update('size', event.target.value)}>{sizes.map(item => <option key={item}>{item}</option>)}</select></label>
    <label><span>序列号</span><select value={filters.serial} onChange={event => update('serial', event.target.value)}><option value="">全部</option><option>123456</option><option>BHA_SN</option><option>111111</option><option>a1</option></select></label>
    <div className="tool-date-filter"><span>时间范围</span><input type="date" value={filters.start} onChange={event => update('start', event.target.value)} aria-label="开始日期" /><i>-</i><input type="date" value={filters.end} onChange={event => update('end', event.target.value)} aria-label="结束日期" /></div>
    <button className="stats-secondary-button" onClick={() => setFilters(emptyFilters)}>重置</button>
  </div>
}

function filterRecords(rows: string[][], filters: RecordFilters, categoryIndex: number, sizeIndex: number, serialIndex: number, dateIndex?: number) {
  return rows.filter(row => {
    const date = dateIndex === undefined ? '' : row[dateIndex].slice(0, 10)
    return (filters.category === '全部' || row[categoryIndex] === filters.category)
      && (filters.size === '全部' || row[sizeIndex] === filters.size)
      && (!filters.serial || row[serialIndex] === filters.serial)
      && (!filters.start || !date || date >= filters.start)
      && (!filters.end || !date || date <= filters.end)
  })
}

function ToolUsageRecords() {
  const [filters, setFilters] = useState<RecordFilters>(emptyFilters)
  const rows = useMemo(() => filterRecords(usageRows, filters, 3, 2, 4, 9), [filters])
  return <section className="stats-data-panel tool-record-panel"><RecordFilterBar filters={filters} setFilters={setFilters} /><div className="stats-table-scroll tool-record-scroll"><table className="stats-data-table tool-record-table"><thead><tr>{usageColumns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>
    {rows.map((row, index) => <tr key={`${row[0]}-${row[3]}-${index}`}><td>{index + 1}</td>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell || '-'}</td>)}</tr>)}
    {rows.length === 0 && <tr><td className="stats-no-data" colSpan={usageColumns.length}>暂无符合筛选条件的使用记录</td></tr>}
  </tbody></table></div><TablePagination total={rows.length} /></section>
}

function ToolStandbyRecords() {
  const [filters, setFilters] = useState<RecordFilters>(emptyFilters)
  const rows = useMemo(() => filterRecords(standbyRows, filters, 3, 2, 4), [filters])
  return <section className="stats-data-panel tool-record-panel"><RecordFilterBar filters={filters} setFilters={setFilters} /><div className="stats-table-scroll tool-record-scroll"><table className="stats-data-table tool-record-table tool-standby-table"><thead><tr>{standbyColumns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>
    {rows.map((row, index) => <tr key={`${row[0]}-${row[3]}-${index}`}><td>{index + 1}</td>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}</tr>)}
    {rows.length === 0 && <tr><td className="stats-no-data" colSpan={standbyColumns.length}>暂无符合筛选条件的待命记录</td></tr>}
  </tbody></table></div><TablePagination total={rows.length} /></section>
}

const blankTool: Omit<ToolItem, 'id'> = { owner: '自研', category: '300W', size: '6-3/4"', serial: '', name: '', version: '1.0', hardware: 'A', firmware: '', od: '6.75', inner: '' }

function ToolLibrary({ tools, setTools }: { tools: ToolItem[], setTools: Dispatch<SetStateAction<ToolItem[]>> }) {
  const [filters, setFilters] = useState({ owner: '全部', category: '全部', size: '全部', serial: '' })
  const [editing, setEditing] = useState<ToolItem | null>(null)
  const [deleting, setDeleting] = useState<ToolItem | null>(null)
  const [form, setForm] = useState<Omit<ToolItem, 'id'>>(blankTool)
  const fileRef = useRef<HTMLInputElement>(null)
  const visibleTools = tools.filter(tool => (filters.owner === '全部' || tool.owner === filters.owner) && (filters.category === '全部' || tool.category === filters.category) && (filters.size === '全部' || tool.size === filters.size) && (!filters.serial || tool.serial.toLowerCase().includes(filters.serial.toLowerCase())))
  const libraryCategories = ['全部', ...Array.from(new Set(tools.map(tool => tool.category)))]

  const openEditor = (tool?: ToolItem) => {
    setEditing(tool ?? { id: 0, ...blankTool })
    setForm(tool ? { owner: tool.owner, category: tool.category, size: tool.size, serial: tool.serial, name: tool.name, version: tool.version, hardware: tool.hardware, firmware: tool.firmware, od: tool.od, inner: tool.inner } : blankTool)
  }
  const updateForm = (key: keyof Omit<ToolItem, 'id'>, value: string) => setForm(current => ({ ...current, [key]: value }))
  const saveTool = (event: FormEvent) => {
    event.preventDefault()
    if (!form.category.trim() || !form.serial.trim()) { toast.error('请填写仪器类别和序列号'); return }
    const name = form.name.trim() || `${form.size}${form.category}#${form.serial}`
    if (editing?.id) setTools(current => current.map(tool => tool.id === editing.id ? { ...tool, ...form, name } : tool))
    else setTools(current => [...current, { ...form, name, id: Math.max(0, ...current.map(tool => tool.id)) + 1 }])
    toast.success(editing?.id ? '工具信息已更新' : '工具已新增')
    setEditing(null)
  }
  const deleteTool = () => {
    if (!deleting) return
    setTools(current => current.filter(item => item.id !== deleting.id))
    setDeleting(null)
    toast.success('工具已删除')
  }
  const importTools = async (file?: File) => {
    if (!file) return
    try {
      const lines = (await file.text()).replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
      const imported = lines.slice(1).map((line, index): ToolItem | null => {
        const cells = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        if (!cells[0] || !cells[2]) return null
        return { id: Date.now() + index, owner: '自研', category: cells[0], size: cells[1] || '6-3/4"', serial: cells[2], name: cells[3] || `${cells[1]}${cells[0]}#${cells[2]}`, version: cells[4] || '1.0', hardware: cells[5] || 'A', firmware: cells[6] || '', od: cells[7] || '', inner: cells[8] || '' }
      }).filter((tool): tool is ToolItem => tool !== null)
      if (!imported.length) { toast.error('未识别到有效工具数据'); return }
      setTools(current => [...current, ...imported])
      toast.success(`已导入 ${imported.length} 条工具数据`)
    } catch { toast.error('文件读取失败，请使用 CSV 格式') } finally { if (fileRef.current) fileRef.current.value = '' }
  }

  return <section className="stats-data-panel tool-record-panel tool-library-panel">
    <div className="tool-library-toolbar"><div className="tool-library-filters"><label><span>仪器归属</span><select value={filters.owner} onChange={event => setFilters(current => ({ ...current, owner: event.target.value }))}><option>全部</option><option>自研</option><option>外购</option></select></label><label><span>仪器类别</span><select value={filters.category} onChange={event => setFilters(current => ({ ...current, category: event.target.value }))}>{libraryCategories.map(item => <option key={item}>{item}</option>)}</select></label><label><span>仪器尺寸</span><select value={filters.size} onChange={event => setFilters(current => ({ ...current, size: event.target.value }))}>{sizes.map(item => <option key={item}>{item}</option>)}</select></label><label className="tool-sn-search"><span>SN</span><input value={filters.serial} onChange={event => setFilters(current => ({ ...current, serial: event.target.value }))} placeholder="请输入序列号" /></label></div><div className="tool-library-actions"><button onClick={() => openEditor()}><Plus />新增工具</button><button onClick={() => fileRef.current?.click()}><FileUp />导入工具</button><input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={event => importTools(event.target.files?.[0])} /></div></div>
    <div className="stats-table-scroll tool-record-scroll"><table className="stats-data-table tool-record-table tool-library-table"><thead><tr>{['仪器类别', '仪器尺寸', '序列号', '名称', '仪器版本号', '硬件版本号', '固件版本号', 'OD外径(in)', 'ID内径(mm)', '操作'].map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>
      {visibleTools.map(tool => <tr key={tool.id}><td>{tool.category}</td><td>{tool.size}</td><td>{tool.serial}</td><td title={tool.name}>{tool.name}</td><td>{tool.version}</td><td>{tool.hardware}</td><td>{tool.firmware || '-'}</td><td>{tool.od || '-'}</td><td>{tool.inner || '-'}</td><td><div className="stats-row-actions"><button onClick={() => openEditor(tool)} aria-label={`编辑${tool.name}`} title="编辑"><Pencil /></button><button onClick={() => setDeleting(tool)} aria-label={`删除${tool.name}`} title="删除"><Trash2 /></button></div></td></tr>)}
      {visibleTools.length === 0 && <tr><td className="stats-no-data" colSpan={10}>暂无符合筛选条件的工具</td></tr>}
    </tbody></table></div><TablePagination total={visibleTools.length} />
    {editing && <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setEditing(null)}><form className="tool-editor" onSubmit={saveTool} role="dialog" aria-modal="true" aria-labelledby="tool-editor-title"><div className="tool-editor-header"><h2 id="tool-editor-title">{editing.id ? '编辑工具' : '新增工具'}</h2><button type="button" onClick={() => setEditing(null)} aria-label="关闭"><X /></button></div><div className="tool-editor-grid">
      {([['owner', '仪器归属'], ['category', '仪器类别'], ['size', '仪器尺寸'], ['serial', '序列号'], ['name', '名称'], ['version', '仪器版本号'], ['hardware', '硬件版本号'], ['firmware', '固件版本号'], ['od', 'OD外径(in)'], ['inner', 'ID内径(mm)']] as [keyof Omit<ToolItem, 'id'>, string][]).map(([key, label]) => <label key={key}><span>{label}{['category', 'serial'].includes(key) && <b>*</b>}</span><input value={form[key]} onChange={event => updateForm(key, event.target.value)} placeholder={key === 'name' ? '留空将自动生成' : `请输入${label}`} /></label>)}
    </div><div className="tool-editor-footer"><button className="stats-primary-button" type="submit">保存</button><button type="button" onClick={() => setEditing(null)}>取消</button></div></form></div>}
    {deleting && <div className="modal-backdrop data-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setDeleting(null)}><section className="data-editor data-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="tool-delete-title"><header><h2 id="tool-delete-title">删除工具</h2><button onClick={() => setDeleting(null)} aria-label="关闭删除确认"><X /></button></header><div className="data-confirm-body"><p>确认删除工具<strong>“{deleting.name}”</strong>？</p><span>删除后，该工具的基础信息与版本配置将无法恢复。</span></div><footer><button className="data-primary-button data-danger-button" onClick={deleteTool}>确认删除</button><button onClick={() => setDeleting(null)}>取消</button></footer></section></div>}
  </section>
}

export default function ToolDynamicsPage() {
  const navigate = useNavigate()
  const [openTabs, setOpenTabs] = useState<PageId[]>(['overview'])
  const [activeTab, setActiveTab] = useState<PageId | null>('overview')
  const [tools, setTools] = useState<ToolItem[]>(initialTools)

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

  return <div className="stats-page tool-page">
    <header className="stats-header"><button className="stats-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>工具动态</strong></button><HeaderUser /></header>
    <div className="stats-shell"><aside className="stats-sidebar"><nav className="stats-nav operation-nav" aria-label="工具动态导航">{navItems.map(({ id, label, icon: Icon }) => <button className={activeTab === id ? 'active' : ''} key={id} onClick={() => openPage(id)}><Icon />{label}</button>)}</nav></aside>
      <main className={`stats-main operation-main tool-main ${openTabs.length === 0 ? 'stats-main--empty' : ''}`}>
        {openTabs.length > 0 && <div className="stats-tabs" role="tablist" aria-label="已打开的工具动态页面">{openTabs.map(pageId => <div className={`stats-tab ${activeTab === pageId ? 'active' : ''}`} key={pageId}><button className="stats-tab-label" role="tab" aria-selected={activeTab === pageId} onClick={() => setActiveTab(pageId)}>{pageLabels[pageId]}</button><button className="stats-tab-close" aria-label={`关闭${pageLabels[pageId]}`} onClick={() => closePage(pageId)}><X /></button></div>)}</div>}
        {activeTab === 'overview' && <ToolOverview />}
        {activeTab === 'usage' && <ToolUsageRecords />}
        {activeTab === 'standby' && <ToolStandbyRecords />}
        {activeTab === 'library' && <ToolLibrary tools={tools} setTools={setTools} />}
      </main>
    </div>
  </div>
}
