import { useMemo, useRef, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import {
  Download, FileUp, Filter, Pencil, Plus, Trash2, UserRound,
  UsersRound, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'

type PageId = 'overview' | 'library'

interface PersonItem {
  id: number
  owner: string
  company: string
  department: string
  role: string
  name: string
  gender: string
  email: string
  phone: string
  status: string
  category: string
}

interface PersonnelRow {
  name: string
  role: string
  platform: string
  onboard: string
  days: number
  well: string
  company: string
  run: string
  leader: boolean
  shift: string
  region: string
  type: string
}

const pageLabels: Record<PageId, string> = { overview: '作业人员动态', library: '人员库' }
const regions = ['全部', '塘沽', '湛江', '深圳', '上海', '海南', '陆地', '海外']
const regionData = [
  { name: '某某区块', value: 77, color: '#b8dc43' },
  { name: '某某区块A', value: 70, color: '#dc65c7' },
  { name: '某某区块B', value: 68, color: '#6dcc78' },
  { name: '某某区块C', value: 66, color: '#3bc6a0' },
  { name: '某某区块D', value: 65, color: '#b56bdd' },
  { name: '某某区块E', value: 37, color: '#9b626b' },
  { name: '某某区块F', value: 34, color: '#ef9b76' },
]
const roleData = [
  { name: '定向工程师', value: 40 }, { name: '随钻服务工程师', value: 13 },
  { name: '裸眼井工程师', value: 37 }, { name: '支持工程师', value: 43 },
  { name: '专家', value: 43 },
]
const personnelTypeData = [
  { name: '油服自有', value: 67, color: '#8874ed' },
  { name: '油服非自有', value: 44, color: '#f47f83' },
  { name: '非自有', value: 91, color: '#43bdd0' },
]

const personnelRows: PersonnelRow[] = [
  { name: '张三', role: '定向工程师', platform: '深海981', onboard: '2025-03-12', days: 1, well: '阳101H76-5', company: '塘沽', run: '100', leader: true, shift: '白班', region: '塘沽', type: '油服自有' },
  { name: '李四', role: '定向工程师', platform: '深海981', onboard: '2025-03-12', days: 1, well: '阳101H76-5', company: '塘沽', run: '100', leader: true, shift: '白班', region: '湛江', type: '油服自有' },
  { name: '王五', role: '定向工程师', platform: '深海981', onboard: '2025-03-12', days: 1, well: '阳101H76-5', company: '塘沽', run: '100', leader: true, shift: '白班', region: '深圳', type: '油服非自有' },
  { name: '王某某', role: '定向工程师', platform: '深海981', onboard: '2025-03-12', days: 1, well: '阳101H76-5', company: '塘沽', run: '100', leader: true, shift: '白班', region: '上海', type: '非自有' },
  { name: '王某某', role: '定向工程师', platform: '深海981', onboard: '2025-02-12', days: 30, well: '阳101H76-5', company: '塘沽', run: '100', leader: false, shift: '白班', region: '海南', type: '油服自有' },
  { name: '王某某', role: '随钻服务工程师', platform: '深海981', onboard: '2025-03-12', days: 1, well: '阳101H76-5', company: '塘沽', run: '100', leader: false, shift: '夜班', region: '陆地', type: '油服非自有' },
  { name: '赵六', role: '支持工程师', platform: '深海981', onboard: '2025-03-12', days: 1, well: '阳101H76-5', company: '塘沽', run: '100', leader: false, shift: '白班', region: '海外', type: '非自有' },
  { name: '陈工', role: '裸眼井工程师', platform: '深海981', onboard: '2025-03-12', days: 1, well: '阳101H76-5', company: '塘沽', run: '100', leader: false, shift: '夜班', region: '塘沽', type: '油服自有' },
]

const initialPeople: PersonItem[] = [
  { id: 1, owner: '缅甸', company: '缅甸作业公司', department: '定向随钻作业中心', role: '定向井工程师', name: 'Tr1ple Xz', gender: '女', email: 'lecalyan68@gmail.com', phone: '', status: '在岗', category: '域账户人员' },
  { id: 2, owner: '缅甸', company: '缅甸作业公司', department: '定向工程作业中心', role: '定向井工程师', name: '杨颜', gender: '男', email: '1232313@gmail.com', phone: '13812526956', status: '在岗', category: '域账户人员' },
  { id: 3, owner: '深圳', company: '深圳作业公司', department: '定向随钻作业中心', role: '随钻服务工程师', name: '何婷', gender: '女', email: 'heting@example.com', phone: '13088889999', status: '在岗', category: '域账户人员' },
  { id: 4, owner: '伊拉克', company: '伊拉克项目组', department: '定向随钻作业中心', role: '定向井工程师', name: '一拉', gender: '男', email: 'yila@163.com', phone: '13657698451', status: '在岗', category: '非域账户人员' },
]

const blankPerson: Omit<PersonItem, 'id'> = {
  owner: '深圳', company: '深圳作业公司', department: '定向随钻作业中心', role: '定向井工程师',
  name: '', gender: '男', email: '', phone: '', status: '在岗', category: '域账户人员',
}

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

function PersonnelOverview() {
  const [region, setRegion] = useState('全部')
  const [type, setType] = useState('全部')
  const [showFilters, setShowFilters] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [shift, setShift] = useState('全部')
  const visibleRows = useMemo(() => personnelRows.filter(row =>
    (region === '全部' || row.region === region)
    && (type === '全部' || row.type === type)
    && (shift === '全部' || row.shift === shift)
    && (!keyword || `${row.name}${row.well}`.toLowerCase().includes(keyword.toLowerCase())),
  ), [keyword, region, shift, type])
  const columns = ['姓名', '岗位', '所在平台', '上平台时间', '累计上平台时间（Day）', '当前作业井名', '作业公司', '当前作业Run名', '是否带队', '班次']
  const exportRows = () => downloadCsv('作业人员动态.csv', columns, visibleRows.map(row => [row.name, row.role, row.platform, row.onboard, row.days, row.well, row.company, row.run, row.leader ? '是' : '否', row.shift]))

  return <div className="personnel-overview">
    <div className="operation-filterbar personnel-filterbar">
      <div className="operation-regions" aria-label="作业区域">{regions.map(item => <button className={region === item ? 'active' : ''} key={item} onClick={() => setRegion(item)}>{item}</button>)}</div>
      <label className="operation-range"><span>人员类型</span><select value={type} onChange={event => setType(event.target.value)}><option>全部</option><option>油服自有</option><option>油服非自有</option><option>非自有</option></select></label>
    </div>

    <div className="personnel-dashboard-grid">
      <section className="stats-panel personnel-summary-panel"><article className="personnel-summary-card"><UserRound /><strong>588</strong><span>作业人员总数</span></article></section>
      <section className="stats-panel personnel-region-panel"><SectionTitle>区块分布</SectionTitle><span className="tool-chart-unit">单位：人</span><div className="personnel-region-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={regionData} margin={{ top: 14, right: 8, bottom: 0, left: -20 }}><CartesianGrid vertical={false} stroke="#e8eef2" /><XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#b8c4cb' }} tick={{ fontSize: 9, fill: '#526571' }} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#526571' }} /><Tooltip /><Bar dataKey="value" maxBarSize={12}>{regionData.map(item => <Cell key={item.name} fill={item.color} />)}<LabelList dataKey="value" position="top" fontSize={10} fill="#435761" /></Bar></BarChart></ResponsiveContainer></div></section>
      <section className="stats-panel personnel-role-panel"><SectionTitle>岗位分布</SectionTitle><span className="personnel-role-unit">单位：人</span><div className="personnel-role-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={roleData} layout="vertical" margin={{ top: 5, right: 28, bottom: 0, left: 4 }}><CartesianGrid horizontal={false} stroke="#e8eef2" /><XAxis type="number" domain={[0, 50]} ticks={[0, 10, 20, 30, 40, 50]} orientation="top" tickLine={false} axisLine={{ stroke: '#b8c4cb' }} tick={{ fontSize: 9, fill: '#526571' }} /><YAxis type="category" dataKey="name" width={90} interval={0} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#526571' }} /><Tooltip /><Bar dataKey="value" fill="#9278e8" maxBarSize={10}><LabelList dataKey="value" position="right" fontSize={10} fill="#435761" /></Bar></BarChart></ResponsiveContainer></div></section>
      <section className="stats-panel personnel-type-panel"><SectionTitle>人员类型</SectionTitle><div className="personnel-type-content"><div className="personnel-type-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={personnelTypeData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} stroke="none">{personnelTypeData.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div><strong>202</strong><span>当前作业人员</span></div></div><div className="personnel-type-legend">{personnelTypeData.map(item => <div key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{item.value}</strong></div>)}</div></div></section>
    </div>

    <section className="stats-panel operation-table-panel personnel-table-panel">
      <div className="operation-table-actions"><button className={showFilters ? 'active' : ''} onClick={() => setShowFilters(value => !value)}><Filter />筛选</button><button onClick={exportRows}><Download />导出</button></div>
      {showFilters && <div className="operation-advanced-filters"><label><span>姓名 / 井名</span><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="请输入关键字" /></label><label><span>班次</span><select value={shift} onChange={event => setShift(event.target.value)}><option>全部</option><option>白班</option><option>夜班</option></select></label><button onClick={() => { setKeyword(''); setShift('全部'); setRegion('全部'); setType('全部') }}>重置</button></div>}
      <div className="operation-table-scroll"><table className="operation-table personnel-status-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>
        {visibleRows.map((row, index) => <tr key={`${row.name}-${index}`}><td>{row.name}</td><td>{row.role}</td><td>{row.platform}</td><td>{row.onboard}</td><td><span className={`personnel-days ${row.days >= 30 ? 'personnel-days--long' : ''}`}>{row.days}</span></td><td>{row.well}</td><td>{row.company}</td><td>{row.run}</td><td>{row.leader ? '是' : '否'}</td><td>{row.shift}</td></tr>)}
      </tbody></table>{visibleRows.length === 0 && <div className="operation-empty">暂无符合筛选条件的作业人员</div>}</div>
      <div className="operation-table-footer"><span>共 <b>{visibleRows.length}</b> 条作业人员记录</span><span>统计数据更新至当前作业日</span></div>
    </section>
  </div>
}

function PersonnelLibrary({ people, setPeople }: { people: PersonItem[], setPeople: Dispatch<SetStateAction<PersonItem[]>> }) {
  const [filters, setFilters] = useState({ owner: '全部', department: '全部', role: '全部', name: '' })
  const [editing, setEditing] = useState<PersonItem | null>(null)
  const [deleting, setDeleting] = useState<PersonItem | null>(null)
  const [form, setForm] = useState<Omit<PersonItem, 'id'>>(blankPerson)
  const fileRef = useRef<HTMLInputElement>(null)
  const owners = ['全部', ...Array.from(new Set(people.map(person => person.owner)))]
  const departments = ['全部', ...Array.from(new Set(people.map(person => person.department)))]
  const roles = ['全部', ...Array.from(new Set(people.map(person => person.role)))]
  const visiblePeople = people.filter(person => (filters.owner === '全部' || person.owner === filters.owner) && (filters.department === '全部' || person.department === filters.department) && (filters.role === '全部' || person.role === filters.role) && (!filters.name || person.name.toLowerCase().includes(filters.name.toLowerCase())))

  const openEditor = (person?: PersonItem) => {
    setEditing(person ?? { id: 0, ...blankPerson })
    setForm(person ? { owner: person.owner, company: person.company, department: person.department, role: person.role, name: person.name, gender: person.gender, email: person.email, phone: person.phone, status: person.status, category: person.category } : blankPerson)
  }
  const updateForm = (key: keyof Omit<PersonItem, 'id'>, value: string) => setForm(current => ({ ...current, [key]: value }))
  const savePerson = (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.company.trim()) { toast.error('请填写姓名和所在公司'); return }
    if (editing?.id) setPeople(current => current.map(person => person.id === editing.id ? { ...person, ...form } : person))
    else setPeople(current => [...current, { ...form, id: Math.max(0, ...current.map(person => person.id)) + 1 }])
    toast.success(editing?.id ? '人员信息已更新' : '人员已新增')
    setEditing(null)
  }
  const deletePerson = () => {
    if (!deleting) return
    setPeople(current => current.filter(item => item.id !== deleting.id))
    setDeleting(null)
    toast.success('人员已删除')
  }
  const importPeople = async (file?: File) => {
    if (!file) return
    try {
      const lines = (await file.text()).replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
      const imported = lines.slice(1).map((line, index): PersonItem | null => {
        const cells = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        if (!cells[0] || !cells[1]) return null
        return { id: Date.now() + index, name: cells[0], company: cells[1], department: cells[2] || '定向随钻作业中心', role: cells[3] || '定向井工程师', gender: cells[4] || '男', email: cells[5] || '', phone: cells[6] || '', status: cells[7] || '在岗', category: cells[8] || '域账户人员', owner: cells[1].replace('作业公司', '').replace('项目组', '') }
      }).filter((person): person is PersonItem => person !== null)
      if (!imported.length) { toast.error('未识别到有效人员数据'); return }
      setPeople(current => [...current, ...imported])
      toast.success(`已导入 ${imported.length} 条人员数据`)
    } catch { toast.error('文件读取失败，请使用 CSV 格式') } finally { if (fileRef.current) fileRef.current.value = '' }
  }

  return <section className="stats-data-panel tool-record-panel personnel-library-panel">
    <div className="tool-library-toolbar personnel-library-toolbar"><div className="tool-library-filters personnel-library-filters"><label><span>归属</span><select value={filters.owner} onChange={event => setFilters(current => ({ ...current, owner: event.target.value }))}>{owners.map(item => <option key={item}>{item}</option>)}</select></label><label><span>部门</span><select value={filters.department} onChange={event => setFilters(current => ({ ...current, department: event.target.value }))}>{departments.map(item => <option key={item}>{item}</option>)}</select></label><label><span>岗位</span><select value={filters.role} onChange={event => setFilters(current => ({ ...current, role: event.target.value }))}>{roles.map(item => <option key={item}>{item}</option>)}</select></label><label className="personnel-name-search"><span>姓名</span><input value={filters.name} onChange={event => setFilters(current => ({ ...current, name: event.target.value }))} placeholder="请输入姓名" /></label></div><div className="tool-library-actions"><button onClick={() => openEditor()}><Plus />新增人员</button><button onClick={() => fileRef.current?.click()}><FileUp />导入</button><input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={event => importPeople(event.target.files?.[0])} /></div></div>
    <div className="stats-table-scroll tool-record-scroll"><table className="stats-data-table tool-record-table personnel-library-table"><thead><tr>{['序号', '姓名', '所在公司', '所在部门', '岗位', '性别', '电子邮箱', '联系电话', '行政状态', '类别', '操作'].map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>
      {visiblePeople.map((person, index) => <tr key={person.id}><td>{index + 1}</td><td>{person.name}</td><td>{person.company}</td><td>{person.department}</td><td>{person.role}</td><td>{person.gender}</td><td>{person.email || '-'}</td><td>{person.phone || '-'}</td><td><span className="personnel-job-status">{person.status}</span></td><td>{person.category}</td><td><div className="stats-row-actions"><button onClick={() => openEditor(person)} aria-label={`编辑${person.name}`} title="编辑"><Pencil /></button><button onClick={() => setDeleting(person)} aria-label={`删除${person.name}`} title="删除"><Trash2 /></button></div></td></tr>)}
      {visiblePeople.length === 0 && <tr><td className="stats-no-data" colSpan={11}>暂无符合筛选条件的人员</td></tr>}
    </tbody></table></div><TablePagination total={visiblePeople.length} />
    {editing && <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setEditing(null)}><form className="tool-editor personnel-editor" onSubmit={savePerson} role="dialog" aria-modal="true" aria-labelledby="person-editor-title"><div className="tool-editor-header"><h2 id="person-editor-title">{editing.id ? '编辑人员' : '新增人员'}</h2><button type="button" onClick={() => setEditing(null)} aria-label="关闭"><X /></button></div><div className="tool-editor-grid">
      {([['name', '姓名'], ['company', '所在公司'], ['owner', '归属'], ['department', '所在部门'], ['role', '岗位'], ['gender', '性别'], ['email', '电子邮箱'], ['phone', '联系电话'], ['status', '行政状态'], ['category', '类别']] as [keyof Omit<PersonItem, 'id'>, string][]).map(([key, label]) => <label key={key}><span>{label}{['name', 'company'].includes(key) && <b>*</b>}</span><input value={form[key]} onChange={event => updateForm(key, event.target.value)} placeholder={`请输入${label}`} /></label>)}
    </div><div className="tool-editor-footer"><button className="stats-primary-button" type="submit">保存</button><button type="button" onClick={() => setEditing(null)}>取消</button></div></form></div>}
    {deleting && <div className="modal-backdrop data-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setDeleting(null)}><section className="data-editor data-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="person-delete-title"><header><h2 id="person-delete-title">删除人员</h2><button onClick={() => setDeleting(null)} aria-label="关闭删除确认"><X /></button></header><div className="data-confirm-body"><p>确认删除人员<strong>“{deleting.name}”</strong>？</p><span>删除后，该人员的基础信息与岗位配置将无法恢复。</span></div><footer><button className="data-primary-button data-danger-button" onClick={deletePerson}>确认删除</button><button onClick={() => setDeleting(null)}>取消</button></footer></section></div>}
  </section>
}

export default function PersonnelDynamicsPage() {
  const navigate = useNavigate()
  const [openTabs, setOpenTabs] = useState<PageId[]>(['overview'])
  const [activeTab, setActiveTab] = useState<PageId | null>('overview')
  const [people, setPeople] = useState<PersonItem[]>(initialPeople)

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

  return <div className="stats-page personnel-page">
    <header className="stats-header"><button className="stats-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>人员动态</strong></button><HeaderUser /></header>
    <div className="stats-shell"><aside className="stats-sidebar"><nav className="stats-nav operation-nav" aria-label="人员动态导航"><button className={activeTab === 'overview' ? 'active' : ''} onClick={() => openPage('overview')}><UserRound />作业人员动态</button><button className={activeTab === 'library' ? 'active' : ''} onClick={() => openPage('library')}><UsersRound />人员库</button></nav></aside>
      <main className={`stats-main operation-main personnel-main ${openTabs.length === 0 ? 'stats-main--empty' : ''}`}>
        {openTabs.length > 0 && <div className="stats-tabs" role="tablist" aria-label="已打开的人员动态页面">{openTabs.map(pageId => <div className={`stats-tab ${activeTab === pageId ? 'active' : ''}`} key={pageId}><button className="stats-tab-label" role="tab" aria-selected={activeTab === pageId} onClick={() => setActiveTab(pageId)}>{pageLabels[pageId]}</button><button className="stats-tab-close" aria-label={`关闭${pageLabels[pageId]}`} onClick={() => closePage(pageId)}><X /></button></div>)}</div>}
        {activeTab === 'overview' && <PersonnelOverview />}
        {activeTab === 'library' && <PersonnelLibrary people={people} setPeople={setPeople} />}
      </main>
    </div>
  </div>
}
