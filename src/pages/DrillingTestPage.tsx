import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Activity, AlertTriangle, Archive, BarChart3, BriefcaseBusiness, CalendarDays,
  CheckCircle2, ChevronDown, Clock3, Download, FileText, Gauge, HardHat,
  PackageCheck, Search, UsersRound, Wrench, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Bar, BarChart, CartesianGrid, LabelList, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  initialTestReports, maintenanceRecords, testGallery, testInstruments, testPersonnel,
  testWells, trialChanges, yearlySummary,
} from '../drillingTestData'
import type { TestReport } from '../drillingTestData'
import { buildMetricDetails, runDetails } from '../metricDetailData'
import type { MetricDetailKind } from '../metricDetailData'

type PageId = 'status' | 'operation' | 'instruments' | 'reports' | 'analysis'
type YearFilter = '全部' | '2026' | '2025' | '2024'

const pageLabels: Record<PageId, string> = {
  status: '试验总体状态', operation: '作业', instruments: '仪器', reports: '试验报告', analysis: '统计分析',
}
const navItems = [
  { id: 'status' as PageId, icon: Gauge }, { id: 'operation' as PageId, icon: BriefcaseBusiness },
  { id: 'instruments' as PageId, icon: Wrench }, { id: 'reports' as PageId, icon: FileText }, { id: 'analysis' as PageId, icon: BarChart3 },
]
const number = (value: number, digits = 0) => value.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const filterByYear = <T extends { year: number }>(rows: T[], year: YearFilter) => year === '全部' ? rows : rows.filter(row => row.year === Number(year))

function YearSelect({ value, onChange }: { value: YearFilter, onChange: (year: YearFilter) => void }) {
  return <label className="dt-year-filter">统计范围<select aria-label="统计范围" value={value} onChange={event => onChange(event.target.value as YearFilter)}>{(['全部', '2026', '2025', '2024'] as YearFilter[]).map(year => <option key={year} value={year}>{year === '全部' ? '全部年度' : `${year}年`}</option>)}</select></label>
}
function SectionTitle({ children, extra }: { children: ReactNode, extra?: ReactNode }) {
  return <div className="dt-section-title"><h2>{children}</h2>{extra && <div className="dt-section-actions">{extra}</div>}</div>
}
function Metric({ label, value, unit, note, icon: Icon, tone = 'blue', onClick }: { label: string, value: string | number, unit?: string, note?: string, icon: typeof Gauge, tone?: string, onClick?: () => void }) {
  const content = <><div><span>{label}</span><strong>{value}<small>{unit}</small></strong>{note && <em>{note}</em>}</div><Icon /></>
  if (onClick) return <button type="button" className={`dt-metric dt-metric--${tone} dt-metric--interactive`} onClick={onClick} aria-label={`查看${label}详情`}>{content}</button>
  return <article className={`dt-metric dt-metric--${tone}`}>{content}</article>
}
function StatusBadge({ children }: { children: ReactNode }) {
  const text = String(children)
  return <span className={`dt-status dt-status--${text === '作业中' || text === '正常' || text === '试验中' || text === '已归档' ? 'green' : text === '作业完成' || text === '已完成' ? 'blue' : text === '准备作业' || text === '维保中' || text === '审核中' ? 'orange' : 'gray'}`}>{children}</span>
}
function DataTable({ columns, rows, empty = '暂无数据' }: { columns: string[], rows: ReactNode[][], empty?: string }) {
  return <div className="dt-table-wrap"><table className="dt-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>{!rows.length && <div className="dt-empty">{empty}</div>}</div>
}
function InfoGrid({ items }: { items: [string, ReactNode][] }) {
  return <div className="dt-info-grid">{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
}

function OverallPage() {
  const [year, setYear] = useState<YearFilter>('2026')
  const [detailKind, setDetailKind] = useState<MetricDetailKind | null>(null)
  const wells = filterByYear(testWells, year)
  const wellIds = wells.map(well => well.id)
  const instruments = testInstruments.filter(instrument => instrument.wellIds.some(id => wellIds.includes(id)))
  const maintenance = filterByYear(maintenanceRecords, year)
  const changes = filterByYear(trialChanges, year)
  const gallery = filterByYear(testGallery, year)
  const sum = (key: 'run' | 'footage' | 'cycle' | 'loss') => wells.reduce((total, well) => total + well[key], 0)
  const personnel = wells.reduce((total, well) => total + (testPersonnel[well.id] || 0), 0)
  const faults = instruments.reduce((total, instrument) => total + instrument.faults, 0)
  const getPeriod = (yearWells: typeof testWells) => {
    const starts = yearWells.map(well => well.start).sort()
    const startTime = starts[0] || '—'
    const ongoing = yearWells.some(well => well.status === '作业中' || well.status === '准备作业')
    const ends = yearWells.map(well => well.end).sort()
    const endTime = ongoing ? null : ends[ends.length - 1] || null
    const startDate = startTime === '—' ? null : new Date(`${startTime}T00:00:00`)
    const endDate = endTime ? new Date(`${endTime}T00:00:00`) : new Date()
    const duration = startDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1) : 0
    return { startTime, endTime, duration }
  }
  const { startTime, endTime, duration } = getPeriod(wells)
  const yearlyPeriods = [...new Set(wells.map(well => well.year))].sort((a, b) => b - a).map(trialYear => ({ trialYear, ...getPeriod(wells.filter(well => well.year === trialYear)) }))
  const forceChanges = changes.filter(item => item.type === '不可抗力').length
  const metricDetails = buildMetricDetails(wells, instruments, maintenance, changes)
  const activeDetail = detailKind ? metricDetails[detailKind] : null
  return <div className="dt-page dt-overall-page">
    <div className="dt-page-toolbar dt-page-toolbar--end"><YearSelect value={year} onChange={setYear} /></div>
    <section className="dt-panel dt-overview-section"><SectionTitle>总体概况</SectionTitle>{year === '全部' ? <div className="dt-year-periods"><DataTable columns={['年度', '试验开始时间', '试验结束时间', '持续时长（天）']} rows={yearlyPeriods.map(period => [`${period.trialYear}年`, period.startTime, period.endTime || '待定（试验进行中）', period.duration])} /></div> : <div className="dt-period-grid"><article><CalendarDays /><div><span>试验开始时间</span><strong>{startTime}</strong></div></article><article><CalendarDays /><div><span>试验结束时间</span><strong>{endTime || '待定（试验进行中）'}</strong></div></article><article><Clock3 /><div><span>持续时长（天）</span><strong>{duration}</strong></div></article></div>}<div className="dt-overview-metrics"><Metric label="总人次（人次）" value={personnel} icon={UsersRound} onClick={() => setDetailKind('personnel')} /><Metric label="参试仪器数量（支）" value={instruments.length} icon={Wrench} onClick={() => setDetailKind('instruments')} /><Metric label="故障情况（次）" value={faults} icon={AlertTriangle} tone="orange" onClick={() => setDetailKind('faults')} /><Metric label="仪器新疆维保情况（次）" value={maintenance.length} icon={PackageCheck} tone="green" onClick={() => setDetailKind('maintenance')} /><Metric label="试验变更情况（次）" value={changes.length} icon={FileText} tone={forceChanges ? 'orange' : 'blue'} onClick={() => setDetailKind('changes')} /></div></section>
    <section className="dt-panel"><SectionTitle>钻井情况</SectionTitle><div className="dt-drilling-metrics"><Metric label="钻井数量（井次）" value={wells.length} icon={HardHat} onClick={() => setDetailKind('wells')} /><Metric label="总Run数（趟）" value={sum('run')} icon={Activity} onClick={() => setDetailKind('runs')} /><Metric label="总进尺（m）" value={number(sum('footage'))} icon={BarChart3} onClick={() => setDetailKind('footage')} /><Metric label="总循环时间（h）" value={number(sum('cycle'), 1)} icon={Clock3} onClick={() => setDetailKind('cycle')} /><Metric label="损失时间（h）" value={number(sum('loss'), 1)} icon={AlertTriangle} tone="orange" onClick={() => setDetailKind('loss')} /></div></section>
    <section className="dt-panel"><SectionTitle>试验采风</SectionTitle><div className="dt-photo-grid">{gallery.map(item => <article key={item.title}><img src={item.image} alt={item.title} /><div><span>{item.recordedAt}</span><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div></section>
    {activeDetail && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setDetailKind(null) }}><section className="dt-report-modal dt-metric-modal" role="dialog" aria-modal="true" aria-labelledby="metric-detail-title"><header><div><h2 id="metric-detail-title">{activeDetail.title}</h2></div><button aria-label="关闭详情" onClick={() => setDetailKind(null)}><X /></button></header><div className="dt-metric-modal-body"><DataTable columns={activeDetail.columns} rows={activeDetail.rows} empty="当前统计范围暂无明细数据" /></div><footer><button onClick={() => setDetailKind(null)}>关闭</button></footer></section></div>}
  </div>
}

const reportDates = ['2026-11-02', '2026-11-01', '2026-10-31', '2026-10-30']
const dailyFootage = [86, 92, 74, 88]

interface CurveDefinition {
  name: string
  alias: string
  value: string
  unit: string
}

const realtimeCurveGroups: Record<string, CurveDefinition[]> = {
  Survey: [
    { name: 'SDIM_INCx', alias: '井斜', value: '71.25', unit: '°' },
    { name: 'SDIM_AZIx', alias: '方位', value: '121.36', unit: '°' },
    { name: 'SDIM_TVDx', alias: '垂深', value: '3157.82', unit: 'm' },
    { name: 'SDIM_DOGx', alias: '狗腿度', value: '5.82', unit: '°/30m' },
  ],
  Downlink: [
    { name: 'LOGM_ACTCx', alias: '工况', value: '旋转导向', unit: '—' },
    { name: 'LOGM_DLSTx', alias: '下发指令', value: '保持井斜', unit: '—' },
    { name: 'LOGM_DLSUx', alias: '指令成功率', value: '98.6', unit: '%' },
  ],
  Log: [
    { name: 'LOGM_ROPAx', alias: '机械钻速', value: '22.46', unit: 'm/h' },
    { name: 'LOGM_BPOSx', alias: '大钩高度', value: '18.62', unit: 'm' },
    { name: 'LOGM_MFIAx', alias: '入口流量', value: '31.80', unit: 'L/min' },
    { name: 'LOGM_MFOAx', alias: '出口流量', value: '31.62', unit: 'L/min' },
    { name: 'LOGM_RPMAx', alias: '地面转速', value: '120', unit: 'rpm' },
    { name: 'VSM_VRPMx', alias: '钻头转速', value: '126', unit: 'rpm' },
  ],
  Correction: [
    { name: 'CORR_DECLx', alias: '磁偏角', value: '3.26', unit: '°' },
    { name: 'CORR_DIPx', alias: '磁倾角', value: '59.42', unit: '°' },
    { name: 'CORR_GTFx', alias: '重力工具面', value: '128.36', unit: '°' },
    { name: 'CORR_MTFx', alias: '磁工具面', value: '96.18', unit: '°' },
  ],
  Environmental: [
    { name: 'ENV_TEMPx', alias: '循环温度', value: '86.5', unit: '℃' },
    { name: 'ENV_PRESSx', alias: '泵压', value: '18.6', unit: 'MPa' },
    { name: 'ENV_MUDx', alias: '泥浆密度', value: '1.28', unit: 'g/cm³' },
    { name: 'ENV_FLOWx', alias: '排量', value: '32.4', unit: 'L/min' },
  ],
  BHA: [
    { name: 'BHA_WOBx', alias: '钻压', value: '132.5', unit: 'kN' },
    { name: 'BHA_TORQx', alias: '扭矩', value: '18.6', unit: 'kN·m' },
    { name: 'BHA_VIBx', alias: '振动量级', value: '1.26', unit: 'g' },
    { name: 'BHA_RPMx', alias: '井下转速', value: '124', unit: 'rpm' },
  ],
  TIME: [
    { name: 'TIME_UTC', alias: 'UTC时间', value: '2026-11-02 02:22:00', unit: '—' },
    { name: 'TIME_LOCAL', alias: '本地时间', value: '2026-11-02 10:22:00', unit: '—' },
    { name: 'TIME_RECEIVE', alias: '接收时间', value: '2026-11-02 10:22:02', unit: '—' },
  ],
  depth_tripout: [
    { name: 'TRIP_OUT_Dx', alias: '起钻深度', value: '3650.20', unit: 'm' },
    { name: 'TRIP_OUT_Tx', alias: '起钻时间', value: '2026-11-02 08:16:00', unit: '—' },
  ],
  time_triplog: [
    { name: 'TRIP_LOG_Tx', alias: '测井时间', value: '2026-11-02 09:46:00', unit: '—' },
    { name: 'TRIP_LOG_Dx', alias: '测井深度', value: '3662.48', unit: 'm' },
  ],
  depth_tripin: [
    { name: 'TRIP_IN_Dx', alias: '下钻深度', value: '3667.68', unit: 'm' },
    { name: 'TRIP_IN_Tx', alias: '下钻时间', value: '2026-11-02 10:02:00', unit: '—' },
  ],
  DEPTH: [
    { name: 'BitDepth', alias: 'BitDepth', value: '3667.68', unit: 'm' },
    { name: 'HoleDepth', alias: '井眼深度', value: '3667.68', unit: 'm' },
  ],
}

function RealtimeCurveBrowser() {
  const [selectedGroup, setSelectedGroup] = useState('DEPTH')
  const curves = realtimeCurveGroups[selectedGroup]
  return <div className="dt-curve-browser">
    <nav className="dt-curve-types" aria-label="实时数据类型">{Object.keys(realtimeCurveGroups).map(group => <button className={selectedGroup === group ? 'active' : ''} key={group} onClick={() => setSelectedGroup(group)}>{group}</button>)}</nav>
    <div className="dt-curve-table"><DataTable columns={['Index', 'Curve Name', 'Alias Name', 'Send Time', 'Time', 'Value', 'Unit', 'Level', 'Status']} rows={curves.map((curve, index) => [index + 1, curve.name, curve.alias, `2026-11-02 10:22:${String(index * 2).padStart(2, '0')}`, `2026-11-02 10:22:${String(index * 2 + 2).padStart(2, '0')}`, curve.value, curve.unit, '一级', '有效'])} /></div>
  </div>
}

function OperationPage() {
  const [year, setYear] = useState<YearFilter>('2026')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('w1')
  const [tab, setTab] = useState('基础信息')
  const [dataTab, setDataTab] = useState('实时数据')
  const [reportDate, setReportDate] = useState(reportDates[0])
  const wells = filterByYear(testWells, year).filter(well => well.name.toLowerCase().includes(search.toLowerCase()))
  const selected = wells.find(well => well.id === selectedId) || wells[0]
  const reportIndex = reportDates.indexOf(reportDate)
  const reportDepth = selected ? Math.max(0, selected.depth - reportIndex * 82) : 0
  const reportFootage = dailyFootage[reportIndex] || dailyFootage[0]
  return <div className="dt-page dt-operation-page"><div className="dt-page-toolbar dt-page-toolbar--end"><YearSelect value={year} onChange={setYear} /></div><div className="dt-master-layout"><aside className="dt-master-list"><label className="dt-search"><Search /><input aria-label="搜索试验井" value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索井名" /></label><div className="dt-master-items dt-operation-wells">{wells.map(well => <button className={selected?.id === well.id ? 'active' : ''} key={well.id} onClick={() => { setSelectedId(well.id); setTab('基础信息') }}><strong>{well.name}</strong><div><span>当前作业 {well.run ? `Run ${well.run}` : 'Run 待安排'}</span><StatusBadge>{well.status}</StatusBadge></div></button>)}{!wells.length && <div className="dt-empty">未找到试验井</div>}</div></aside>{selected ? <section className="dt-detail"><div className="dt-detail-header"><h2>{selected.name}</h2></div><div className="dt-detail-metrics dt-operation-metrics"><span>井眼尺寸 <b>{selected.holeSize}</b></span><span>开始时间 <b>{selected.start} 08:00</b></span><span>BHA <b>{selected.bha}</b></span><span>最后测点 <b>{selected.lastSurvey}</b></span><span>当前/设计井深 <b>{number(selected.depth)}/{number(selected.designDepth)} m</b></span><span>带队工程师 <b>{selected.engineers}</b></span></div><div className="dt-detail-tabs">{['基础信息', '仪器组合', '日报与工况', '试验数据', '作业记录'].map(item => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div><div className="dt-detail-body">
    {tab === '基础信息' && <div className="dt-tab-scroll"><InfoGrid items={[
      ['井名', selected.name], ['国家', selected.country], ['区域', selected.region], ['区块', selected.block],
      ['作业公司', selected.company], ['油田', selected.oilfield], ['井型', selected.wellType], ['作业者', selected.operator],
      ['设计井深', `${number(selected.designDepth)} m`], ['难度类型', selected.difficulty], ['时区', selected.timezone],
      ['井作业状态', <StatusBadge>{selected.status}</StatusBadge>], ['井别', selected.category], ['平台', selected.platform],
      ['风险等级', selected.risk], ['目标井斜(°)', selected.targetInc], ['目标方位(°)', selected.targetAzi],
      ['起始井深(m)', selected.startDepth], ['是否为测试井', selected.isTest], ['是否为璇玑作业', selected.isXuanji], ['创建时间', selected.createdAt],
    ]} /></div>}
    {tab === '仪器组合' && <div className="dt-tab-scroll"><div className="dt-instrument-table"><DataTable columns={['仪器类别', '序列号', '仪器名称', '外径(in)', '内径(in)', '工具长度(m)', '测点零长(m)', '检查人', '失效时间', '状态', '仪器尺寸', '仪器版本', '仪器硬件版本', '备注']} rows={selected.instrumentIds.map((id, index) => {
      const instrument = testInstruments.find(item => item.id === id)!
      const category = id.split('-')[0]
      const size = instrument.model.match(/[\d-]+\/[\d]+"|6-3\/4"/)?.[0] || '6-3/4"'
      return [category, `XJ-${id.replace('-', '')}-026`, `${size}${category}#XJ026`, category === 'RSS' || category === 'ARC' ? '8.50' : '6.75', '2.25', (3.2 + index * 0.45).toFixed(2), (1.25 - index * 0.2).toFixed(2), ['张磊', '王工', '刘工'][index % 3], '2027-03-31 23:59', <StatusBadge>正常</StatusBadge>, size, `V${index + 1}.2.0`, `HW-${String.fromCharCode(65 + index)}`, index === 0 ? '本趟组合首支仪器' : '检查合格，已入井']
    })} /></div></div>}
    {tab === '日报与工况' && <div className="dt-daily-brief"><div className="dt-tab-scroll dt-daily-brief-scroll"><InfoGrid items={[
      ['平台@井名', `${selected.platform}@${selected.name}`],
      ['作业井段@RunID', `${selected.holeSize}@${selected.run ? `Run ${selected.run}` : '待安排'}`],
      ['BHA', selected.bha],
      ['工具状态', '正常'],
      ['井深(m)', number(reportDepth)],
      ['24h进尺@本趟累计进尺(m)', `${reportFootage}m@${number(Math.max(0, selected.footage - reportIndex * reportFootage))}m`],
      ['最大井斜(°)', selected.targetInc],
      ['设计完钻井深@设计中完井深(m)', `${number(selected.designDepth)}m@${number(selected.designDepth)}m`],
      ['最近测斜', `MD:${selected.lastSurvey.replace(' m', '')} AZI:${selected.targetAzi} INC:${selected.targetInc}`],
      ['排量(L/min)', '30.8 - 32.6'],
      ['垂深/循环最高温度(m/℃)', `${number(reportDepth * 0.86)}m/${(86.5 - reportIndex * 0.4).toFixed(1)}℃`],
      ['指令成功率', `${(98.6 - reportIndex * 0.3).toFixed(1)}%`],
      ['rop(m/h)', '18.6 - 24.2'],
      ['钻压(Ton)', '11.2 - 16.8'],
      ['转速(RPM)', '95 - 135'],
      ['造斜率(°/30m)', '5.82'],
      ['本趟入井时间', `${selected.start} 08:00`],
      ['本趟钻循环时间@纯钻时间(h)', `${number(Math.max(0, selected.cycle - reportIndex * 6), 1)}h@${number(Math.max(0, selected.pureTime - reportIndex * 3.5), 1)}h`],
      ['当前作业', [
        '旋转导向钻进，仪器工作正常，持续跟踪井斜与方位变化。',
        '复合钻进，完成通信稳定性测试，数据回传正常。',
        '循环及短起下检查，完成工具状态复核。',
        '按设计井轨迹钻进，完成旋转导向指令验证。',
      ][reportIndex]],
      ['下步作业', [
        '继续钻进至 3,750 m，完成后进行测斜复核。',
        '继续本趟钻进，跟踪仪器温度与泵压变化。',
        '恢复钻进，执行下一组旋转导向指令。',
        '进行循环检查，确认工具状态后继续钻进。',
      ][reportIndex]],
    ]} /></div><div className="dt-report-date-switch" aria-label="日报日期切换">{reportDates.map(date => <button className={reportDate === date ? 'active' : ''} key={date} onClick={() => setReportDate(date)}>{date}</button>)}</div></div>}
    {tab === '试验数据' && <div className="dt-data-content"><div className="dt-detail-tabs dt-detail-tabs--inner">{['实时数据', '内存数据', '数据库数据'].map(item => <button className={dataTab === item ? 'active' : ''} key={item} onClick={() => setDataTab(item)}>{item}</button>)}</div><div className={`dt-tab-scroll dt-data-scroll ${dataTab === '实时数据' ? 'dt-data-scroll--curves' : ''}`}>{dataTab === '实时数据' ? <RealtimeCurveBrowser /> : <DataTable columns={['文件名', '文件大小', '创建时间', '上传用户名称']} rows={dataTab === '内存数据' ? [
      ['Run6_20261102_102200.mem', '128.6 MB', '2026-11-02 10:22:00', 'tangdong'],
      ['Run6_20261102_095800.mem', '126.4 MB', '2026-11-02 09:58:00', 'tangdong'],
      ['Run6_20261102_094500.mem', '125.8 MB', '2026-11-02 09:45:00', '张磊'],
    ] : [
      ['KLMY-2026-01_Run6_20261102.witsml', '86.2 MB', '2026-11-02 10:20:00', 'admin'],
      ['KLMY-2026-01_Run6_20261101.witsml', '82.5 MB', '2026-11-01 18:30:00', 'tangdong'],
      ['KLMY-2026-01_Run5_20261031.witsml', '79.8 MB', '2026-10-31 17:45:00', '张磊'],
    ]} />}</div></div>}
    {tab === '作业记录' && <div className="dt-tab-scroll"><div className="dt-timeline">{['2026-11-02 完成当前Run阶段验证', '2026-10-22 增加RSS旋转导向验证工况', '2026-10-12 完成ABC-01新疆现场维保', `${selected.start} 试验井正式启动`].map((item, index) => <article key={item}><i className={index === 0 ? 'active' : ''} /><div><strong>{item.slice(0, 10)}</strong><span>{item.slice(11)}</span></div></article>)}</div></div>}
  </div></section> : <div className="dt-empty">请选择试验井</div>}</div></div>
}

const instrumentDisplay: Record<string, { category: string, size: '475' | '675' | '800/950' }> = {
  'ABC-01': { category: 'SFU', size: '675' },
  'IDMP-03': { category: 'WelleaderPivot', size: '675' },
  'RSS-02': { category: 'WelleaderExpress', size: '800/950' },
  'PWD-05': { category: 'ADP', size: '475' },
  'LWD-02': { category: 'TOP', size: '675' },
  'ARC-01': { category: 'HSVP', size: '800/950' },
}

function InstrumentsPage() {
  const [year, setYear] = useState<YearFilter>('2026')
  const [search, setSearch] = useState('')
  const [size, setSize] = useState('全部')
  const [selectedId, setSelectedId] = useState('ABC-01')
  const [tab, setTab] = useState('综合表现')
  const [dataTab, setDataTab] = useState('实时数据')
  const wellIds = filterByYear(testWells, year).map(well => well.id)
  const instruments = testInstruments.filter(item => {
    const display = instrumentDisplay[item.id]
    return item.wellIds.some(id => wellIds.includes(id)) && (size === '全部' || display.size === size) && display.category.toLowerCase().includes(search.trim().toLowerCase())
  })
  const selected = instruments.find(item => item.id === selectedId) || instruments[0]
  const selectedWells = selected ? testWells.filter(well => selected.wellIds.includes(well.id)) : []
  const selectedRuns = selectedWells.flatMap(runDetails)
  const selectedStart = selectedWells[0]?.start || '2026-11-02'
  return <div className="dt-page dt-instruments-page">
    <div className="dt-page-toolbar dt-page-toolbar--end"><YearSelect value={year} onChange={setYear} /></div>
    <div className="dt-master-layout">
      <aside className="dt-master-list">
        <label className="dt-search"><Search /><input aria-label="搜索仪器" value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索仪器类别" /></label>
        <label className="dt-instrument-size-filter"><span>仪器尺寸</span><select aria-label="仪器尺寸筛选" value={size} onChange={event => setSize(event.target.value)}>{['全部', '475', '675', '800/950'].map(option => <option key={option} value={option}>{option === '全部' ? '全部尺寸' : option}</option>)}</select></label>
        <div className="dt-master-items">{instruments.map(item => {
          const display = instrumentDisplay[item.id]
          return <button className={selected?.id === item.id ? 'active' : ''} key={item.id} onClick={() => { setSelectedId(item.id); setTab('综合表现') }}><strong>{display.category}</strong><span>{display.size}</span></button>
        })}{!instruments.length && <div className="dt-empty">未找到仪器</div>}</div>
      </aside>
      {selected ? <section className="dt-detail">
        <div className="dt-detail-header"><div><h2>{instrumentDisplay[selected.id].category} · {instrumentDisplay[selected.id].size}</h2></div></div>
        <div className="dt-detail-metrics"><span>首次参试 <b>{selected.firstYear} 年</b></span><span>参试井数 <b>{selectedWells.length} 口</b></span><span>累计进尺 <b>{number(selected.footage)} m</b></span><span>累计循环 <b>{number(selected.cycle, 1)} h</b></span><span>故障 <b>{selected.faults} 次</b></span></div>
        <div className="dt-detail-tabs">{['综合表现', '井列表', '仪器数据', '故障信息', '维保记录'].map(item => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
        <div className="dt-detail-body">
    {tab === '综合表现' && <div className="dt-tab-scroll"><div className="dt-performance"><div className="dt-performance-score"><strong>{selected.performance}</strong><span>综合评分</span></div><div className="dt-performance-bars">{[['评价维度1', 96], ['评价维度2', 98], ['评价维度3', selected.performance], ['评价维度4', 92]].map(([label, value]) => <div key={label}><span>{label}</span><div><i style={{ width: `${value}%` }} /></div><b>{value}%</b></div>)}</div></div><SectionTitle>表现结论</SectionTitle><p className="dt-conclusion">具体结论待生成。</p></div>}
    {tab === '井列表' && <div className="dt-tab-scroll"><DataTable columns={['井名', 'Run名', '开始时间', '结束时间', '持续时长', '进尺', '循环时间', '是否故障']} rows={selectedRuns.map((run, index) => [run.well, run.run, run.start, run.end, `${run.duration} 天`, `${number(run.footage)} m`, `${number(run.cycle, 1)} h`, selected.faults > 0 && index === 0 ? '是' : '否'])} /></div>}
    {tab === '仪器数据' && <div className="dt-data-content"><div className="dt-detail-tabs dt-detail-tabs--inner">{['实时数据', '内存数据'].map(item => <button className={dataTab === item ? 'active' : ''} key={item} onClick={() => setDataTab(item)}>{item}</button>)}</div><div className="dt-tab-scroll dt-data-scroll">{dataTab === '实时数据' ? <DataTable columns={['Curve', 'Alias Name', 'Start Time', 'End Time', 'Status']} rows={[
      ['LOGM_ACTCx', '工况', `${selectedStart} 08:00`, '2026-11-02 10:22:00', 'Drilling'],
      ['SDIM_INCx', '井斜', `${selectedStart} 08:00`, '2026-11-02 10:22:00', 'Drilling'],
      ['SDIM_AZIx', '方位', `${selectedStart} 08:00`, '2026-11-02 10:22:00', 'Drilling'],
      ['LOGM_ROPAx', '机械钻速', `${selectedStart} 08:00`, '2026-11-02 10:22:00', 'Drilling'],
      ['BHA_TEMPx', '仪器温度', `${selectedStart} 08:00`, '2026-11-02 10:22:00', 'Drilling'],
    ]} /> : <DataTable columns={['文件名', '文件大小', '创建时间', '上传用户名称']} rows={[
      [`${selected.id}_20261102_102200.mem`, '68.6 MB', '2026-11-02 10:22:00', 'tangdong'],
      [`${selected.id}_20261102_095800.mem`, '66.4 MB', '2026-11-02 09:58:00', 'tangdong'],
      [`${selected.id}_20261102_094500.mem`, '65.8 MB', '2026-11-02 09:45:00', '张磊'],
    ]} />}</div></div>}
    {tab === '故障信息' && <div className="dt-tab-scroll"><DataTable columns={['发生时间', '是否产生NPT', 'NPT时间(h)', '是否起钻', '故障定位', '现场措施', '现场情况描述']} rows={Array.from({ length: selected.faults }, (_, index) => [
      `2026-10-${String(25 - index).padStart(2, '0')} 09:36`, '是', (1.5 + index).toFixed(1), index % 2 === 0 ? '是' : '否',
      index % 2 === 0 ? '通信接头及线缆' : '仪器采样单元', index % 2 === 0 ? '检查接头并更换通信线缆，测试恢复' : '重新标定并复核数据',
      index % 2 === 0 ? '通信间歇异常，数据短时中断，处理后恢复正常' : '采样数据波动，部分数据无效，标定后数据恢复稳定',
    ])} empty="试验期间未记录故障" /></div>}
    {tab === '维保记录' && <div className="dt-tab-scroll"><DataTable columns={['开始时间', '结束时间', '持续时长', '维保状态', '维保责任人', '下次维保计划时间']} rows={[[
      '2026-10-12 08:00', selected.status === '维保中' ? '—' : '2026-10-12 16:00', selected.status === '维保中' ? '进行中' : '8.0 h', selected.status === '维保中' ? '维保中' : '已完成', '新疆维保组', selected.status === '维保中' ? '2026-11-05 08:00' : '2026-12-15 08:00',
    ]]} /></div>}
  </div></section> : <div className="dt-empty">请选择仪器</div>}</div></div>
}

function ReportsPage() {
  const [type, setType] = useState<TestReport['type']>('仪器报告')
  const [year, setYear] = useState<YearFilter>('全部')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(initialTestReports[0]?.id ?? '')
  const visible = filterByYear(initialTestReports, year).filter(report => report.type === type && `${report.title}${report.well}${report.instrument}`.toLowerCase().includes(search.toLowerCase()))
  const preview = visible.find(report => report.id === selectedId) ?? visible[0] ?? null
  const previewWell = preview ? testWells.find(well => well.name === preview.well) : null
  const previewInstruments = preview ? testInstruments.filter(instrument => preview.instrument.includes(instrument.id)) : []
  const faultCount = previewInstruments.reduce((total, instrument) => total + instrument.faults, 0)
  const averagePerformance = previewInstruments.length ? previewInstruments.reduce((total, instrument) => total + instrument.performance, 0) / previewInstruments.length : 0
  const dataRate = Math.max(95, 100 - faultCount * 0.7).toFixed(1)
  const completion = previewWell ? Math.min(100, previewWell.depth / previewWell.designDepth * 100).toFixed(1) : '—'
  const download = (report: TestReport) => {
    const content = `${report.title}\n报告类型：${report.type}\n关联井：${report.well}\n关联仪器：${report.instrument}\n归档日期：${report.date}\n状态：${report.status}`
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.title}.txt`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('报告已导出')
  }
  return <div className="dt-page dt-reports-page">
    <div className="dt-report-filters">
      <div className="dt-detail-tabs">{(['仪器报告', '项目报告'] as const).map(item => <button className={type === item ? 'active' : ''} key={item} onClick={() => setType(item)}>{item}</button>)}</div>
      <YearSelect value={year} onChange={setYear} />
    </div>
    <div className="dt-report-workspace">
      <section className="dt-panel dt-report-list-panel">
        <SectionTitle>报告列表 <span className="dt-count">{visible.length} 份</span></SectionTitle>
        <label className="dt-search dt-report-list-search"><Search /><input aria-label="搜索报告" value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索报告名称、井或仪器" /></label>
        <div className="dt-report-list">
          {visible.map(report => <article className={preview?.id === report.id ? 'active' : ''} key={report.id}>
            <button className="dt-report-select" onClick={() => setSelectedId(report.id)} aria-pressed={preview?.id === report.id} aria-label={`预览${report.title}`}>
              <FileText /><strong>{report.title}</strong>
            </button>
            <button className="dt-report-download" aria-label={`下载${report.title}`} title="下载报告" onClick={() => download(report)}><Download /></button>
          </article>)}
          {!visible.length && <div className="dt-empty">暂无符合条件的报告</div>}
        </div>
      </section>
      <section className="dt-panel dt-report-preview-panel">
        <SectionTitle>报告预览</SectionTitle>
        {preview ? <div className="dt-report-preview-scroll">
          <div className="dt-report-paper">
            <span className="dt-report-kicker">实钻试验专区 · {preview.type}</span>
            <h1>{preview.title}</h1>
            <InfoGrid items={[
              ["报告编号", `XJYSY-${preview.year}-${preview.id.slice(1).padStart(3, '0')}`], ["报告类型", preview.type], ["年度", preview.year],
              ["关联井", preview.well], ["参试仪器", preview.instrument], ["试验区域", previewWell?.region ?? '—'],
              ["试验周期", previewWell ? `${previewWell.start} 至 ${previewWell.end}` : '—'], ["归档日期", preview.date], ["报告状态", <StatusBadge>{preview.status}</StatusBadge>],
            ]} />
            <div className="dt-report-metrics">
              <article><BarChart3 /><div><span>累计进尺</span><strong>{previewWell ? number(previewWell.footage) : '—'}<small>m</small></strong></div></article>
              <article><Activity /><div><span>总 Run 数</span><strong>{previewWell?.run ?? '—'}<small>趟</small></strong></div></article>
              <article><Clock3 /><div><span>循环时间</span><strong>{previewWell ? number(previewWell.cycle, 1) : '—'}<small>h</small></strong></div></article>
              <article><Gauge /><div><span>纯钻时间</span><strong>{previewWell ? number(previewWell.pureTime, 1) : '—'}<small>h</small></strong></div></article>
            </div>
            <h3><span>01</span>试验目标与概况</h3>
            <p>本次试验围绕 {preview.instrument} 在{preview.well}的实钻适配性、测量稳定性与作业可靠性开展验证。试验井设计井深 {previewWell ? number(previewWell.designDepth) : '—'} m，当前完钻井深 {previewWell ? number(previewWell.depth) : '—'} m，累计完成进尺 {previewWell ? number(previewWell.footage) : '—'} m，形成了完整的作业与仪器运行记录。</p>
            <h3><span>02</span>仪器组合与作业过程</h3>
            <p>试验采用 {previewWell?.bha ?? preview.instrument} 仪器组合，累计完成 {previewWell?.run ?? '—'} 趟钻，循环时间 {previewWell ? number(previewWell.cycle, 1) : '—'} h，纯钻时间 {previewWell ? number(previewWell.pureTime, 1) : '—'} h，损失时间 {previewWell ? number(previewWell.loss, 1) : '—'} h。各趟钻的数据采集、工况记录和现场处置均已纳入报告归档。</p>
            <h3><span>03</span>关键指标与综合评估</h3>
            <div className="dt-report-result-table">
              <div className="dt-report-result-head"><span>评估项目</span><span>试验结果</span><span>评价</span></div>
              <div><span>数据有效率</span><strong>{dataRate}%</strong><em>满足试验要求</em></div>
              <div><span>仪器综合评分</span><strong>{averagePerformance.toFixed(1)} 分</strong><em>综合表现稳定</em></div>
              <div><span>故障与异常记录</span><strong>{faultCount} 次</strong><em>{faultCount ? '处置记录已闭环' : '试验期间运行正常'}</em></div>
              <div><span>井深完成度</span><strong>{completion}%</strong><em>{previewWell?.status === '作业完成' ? '试验作业已完成' : '按试验阶段推进'}</em></div>
            </div>
            <h3><span>04</span>仪器运行与维保记录</h3>
            <div className="dt-report-instruments">{previewInstruments.map(instrument => <article key={instrument.id}>
              <div><Wrench /><strong>{instrument.name}</strong><span>{instrument.model}</span><b>{instrument.performance} 分</b></div>
              <p>{instrument.maintenance}</p>
            </article>)}</div>
            <h3><span>05</span>试验结论与建议</h3>
            <div className="dt-report-conclusion"><CheckCircle2 /><p>综合实钻数据与现场记录，{preview.instrument} 整体运行稳定，关键指标满足本阶段试验要求。建议结合后续实钻任务持续开展跨井对比，重点跟踪异常工况下的数据完整性和仪器可靠性，并按计划落实试验后检测与维保。</p></div>
          </div>
        </div> : <div className="dt-empty dt-report-preview-empty">暂无可预览的报告</div>}
      </section>
    </div>
  </div>
}

function AnalysisPage() {
  const [dimension, setDimension] = useState('作业维度')
  const analysisSizes = ['475', '675', '800/950']
  const analysisCategories = [...new Set(testInstruments.map(item => instrumentDisplay[item.id].category))]
  const [selectedAnalysisSizes, setSelectedAnalysisSizes] = useState<string[]>(analysisSizes)
  const [selectedAnalysisCategories, setSelectedAnalysisCategories] = useState<string[]>(analysisCategories)
  const [instrumentPickerOpen, setInstrumentPickerOpen] = useState<'size' | 'category' | null>(null)
  const selectedAnalysisInstruments = testInstruments.filter(item => selectedAnalysisSizes.includes(instrumentDisplay[item.id].size) && selectedAnalysisCategories.includes(instrumentDisplay[item.id].category))
  const analysisYears = yearlySummary.map(item => item.year)
  const instrumentChartColors = ['#487fc6', '#72b787', '#d7a34b', '#9278e8', '#4c9abc', '#e58585']
  const buildInstrumentChartData = (metric: 'participation' | 'footage' | 'cycle' | 'faults') => analysisYears.map(year => {
    const row: Record<string, string | number> = { year }
    selectedAnalysisInstruments.forEach(item => {
      const wells = item.wellIds.map(id => testWells.find(well => well.id === id)).filter(well => well?.year === Number(year))
      if (metric === 'participation') row[item.id] = wells.length
      else if (metric === 'footage') row[item.id] = wells.reduce((total, well) => total + (well?.footage ?? 0), 0)
      else if (metric === 'cycle') row[item.id] = Number(wells.reduce((total, well) => total + (well?.cycle ?? 0), 0).toFixed(1))
      else {
        const instrumentYears = [...new Set(item.wellIds.map(id => testWells.find(well => well.id === id)?.year ?? 0))]
        const yearIndex = instrumentYears.indexOf(Number(year))
        row[item.id] = yearIndex >= 0 && yearIndex < item.faults ? 1 : 0
      }
    })
    return row
  })
  const renderInstrumentFilter = (kind: 'size' | 'category') => {
    const label = kind === 'size' ? '仪器尺寸' : '仪器类别'
    const options = kind === 'size' ? analysisSizes : analysisCategories
    const selected = kind === 'size' ? selectedAnalysisSizes : selectedAnalysisCategories
    const setSelected = kind === 'size' ? setSelectedAnalysisSizes : setSelectedAnalysisCategories
    const allSelected = selected.length === options.length
    return <div className="dt-instrument-picker" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInstrumentPickerOpen(null) }}>
      <button className="dt-instrument-picker-trigger" aria-label={`选择${label}`} aria-expanded={instrumentPickerOpen === kind} onClick={() => setInstrumentPickerOpen(current => current === kind ? null : kind)}>{label}：{allSelected ? '全部' : `已选 ${selected.length} 项`}<ChevronDown /></button>
      {instrumentPickerOpen === kind && <div className="dt-instrument-picker-menu">
        <label className="dt-instrument-picker-select-all"><input type="checkbox" aria-label={`全选${label}`} checked={allSelected} onChange={event => setSelected(event.target.checked ? options : [])} /><strong>全选</strong><span>{selected.length} / {options.length}</span></label>
        <div className="dt-instrument-picker-options">{options.map(option => <label key={option}><input type="checkbox" aria-label={`选择${label}${option}`} checked={selected.includes(option)} onChange={() => setSelected(current => current.includes(option) ? current.filter(item => item !== option) : [...current, option])} /><span>{option}</span></label>)}</div>
      </div>}
    </div>
  }
  const renderInstrumentChart = (id: string, title: string, unit: string, metric: 'participation' | 'footage' | 'cycle' | 'faults') => <section className="dt-panel" data-chart={id}>
    <SectionTitle>{title}</SectionTitle>
    <div className="dt-chart dt-chart--analysis"><span className="dt-chart-axis-unit">单位：{unit}</span><ResponsiveContainer width="100%" height="100%"><BarChart data={buildInstrumentChartData(metric)} margin={{ top: 26, right: 16, left: -8, bottom: 12 }}><CartesianGrid vertical={false} stroke="#e7edf2" /><XAxis dataKey="year" tickLine={false} /><YAxis allowDecimals={metric === 'cycle'} tickLine={false} axisLine={false} /><Tooltip /><Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ fontSize: 11, color: '#607785', paddingTop: 4 }} />{selectedAnalysisInstruments.map(item => <Bar key={item.id} dataKey={item.id} name={`${instrumentDisplay[item.id].category} · ${instrumentDisplay[item.id].size}`} fill={instrumentChartColors[testInstruments.findIndex(instrument => instrument.id === item.id)]} maxBarSize={26} />)}</BarChart></ResponsiveContainer></div>
  </section>
  const summary = yearlySummary
  const totals = summary.reduce((result, item) => ({ wells: result.wells + item.wells, runs: result.runs + item.runs, footage: result.footage + item.footage, cycle: result.cycle + item.cycle, pureTime: result.pureTime + item.pureTime, instruments: result.instruments + item.instruments, newInstruments: result.newInstruments + item.newInstruments, reports: result.reports + item.reports }), { wells: 0, runs: 0, footage: 0, cycle: 0, pureTime: 0, instruments: 0, newInstruments: 0, reports: 0 })
  return <div className="dt-page">
    <div className="dt-detail-tabs dt-analysis-tabs">{['作业维度', '单支仪器维度', '试验报告'].map(item => <button className={dimension === item ? 'active' : ''} key={item} onClick={() => setDimension(item)}>{item}</button>)}</div>
    {dimension === '作业维度' && <>
      <div className="dt-metric-grid dt-metric-grid--six"><Metric label="井次" value={totals.wells} unit="口" icon={HardHat} /><Metric label="Run次" value={totals.runs} unit="次" icon={Activity} /><Metric label="进尺" value={number(totals.footage)} unit="m" icon={BarChart3} /><Metric label="循环时间" value={number(totals.cycle, 1)} unit="h" icon={Clock3} /><Metric label="纯钻时间" value={number(totals.pureTime, 1)} unit="h" icon={Gauge} /><Metric label="参试仪器" value={totals.instruments} unit="支" icon={Wrench} /></div>
      <div className="dt-analysis-chart-grid">
        <section className="dt-panel" data-chart="wells">
          <SectionTitle>作业井次</SectionTitle>
          <div className="dt-chart dt-chart--analysis"><span className="dt-chart-axis-unit">单位：口</span><ResponsiveContainer width="100%" height="100%"><BarChart data={summary} margin={{ top: 30, right: 16, left: -12, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e7edf2" /><XAxis dataKey="year" tickLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="wells" name="作业井次" fill="#487fc6" maxBarSize={46}><LabelList dataKey="wells" position="top" /></Bar></BarChart></ResponsiveContainer></div>
        </section>
        <section className="dt-panel" data-chart="runs">
          <SectionTitle>Run次</SectionTitle>
          <div className="dt-chart dt-chart--analysis"><span className="dt-chart-axis-unit">单位：次</span><ResponsiveContainer width="100%" height="100%"><BarChart data={summary} margin={{ top: 30, right: 16, left: -12, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e7edf2" /><XAxis dataKey="year" tickLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="runs" name="Run次" fill="#72b787" maxBarSize={46}><LabelList dataKey="runs" position="top" /></Bar></BarChart></ResponsiveContainer></div>
        </section>
        <section className="dt-panel" data-chart="footage">
          <SectionTitle>进尺</SectionTitle>
          <div className="dt-chart dt-chart--analysis"><span className="dt-chart-axis-unit">单位：m</span><ResponsiveContainer width="100%" height="100%"><LineChart data={summary} margin={{ top: 30, right: 22, left: 2, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e7edf2" /><XAxis dataKey="year" tickLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="footage" name="进尺" stroke="#487fc6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div>
        </section>
        <section className="dt-panel dt-analysis-chart--wide" data-chart="time">
          <SectionTitle>循环时间 & 纯钻时间</SectionTitle>
          <div className="dt-chart dt-chart--analysis"><span className="dt-chart-axis-unit">单位：h</span><ResponsiveContainer width="100%" height="100%"><LineChart data={summary} margin={{ top: 30, right: 22, left: -4, bottom: 34 }}><CartesianGrid vertical={false} stroke="#e7edf2" /><XAxis dataKey="year" tickLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Legend verticalAlign="bottom" align="center" iconType="line" wrapperStyle={{ fontSize: 12, color: '#607785', paddingTop: 12 }} /><Line type="monotone" dataKey="cycle" name="循环时间" stroke="#487fc6" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="pureTime" name="纯钻时间" stroke="#d7a34b" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>
        </section>
        <section className="dt-panel dt-analysis-chart--wide" data-chart="instruments">
          <SectionTitle extra={<span className="dt-chart-total">参试仪器 <b>{totals.instruments}</b> 支 · 新仪器 <b>{totals.newInstruments}</b> 支</span>}>参试仪器 & 新仪器数量</SectionTitle>
          <div className="dt-chart dt-chart--analysis"><span className="dt-chart-axis-unit">单位：支</span><ResponsiveContainer width="100%" height="100%"><BarChart data={summary} margin={{ top: 30, right: 22, left: -12, bottom: 34 }}><CartesianGrid vertical={false} stroke="#e7edf2" /><XAxis dataKey="year" tickLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ fontSize: 12, color: '#607785', paddingTop: 12 }} /><Bar dataKey="instruments" name="参试仪器" fill="#4c9abc" maxBarSize={38}><LabelList dataKey="instruments" position="top" /></Bar><Bar dataKey="newInstruments" name="参试新仪器" fill="#9278e8" maxBarSize={38}><LabelList dataKey="newInstruments" position="top" /></Bar></BarChart></ResponsiveContainer></div>
        </section>
      </div>
    </>}
    {dimension === '单支仪器维度' && <>
      <div className="dt-metric-grid">
        <Metric label="参试仪器" value={selectedAnalysisInstruments.length} unit="支" icon={Wrench} />
        <Metric label="累计进尺" value={number(selectedAnalysisInstruments.reduce((sum, item) => sum + item.footage, 0))} unit="m" icon={BarChart3} />
        <Metric label="累计循环时间" value={number(selectedAnalysisInstruments.reduce((sum, item) => sum + item.cycle, 0), 1)} unit="h" icon={Clock3} />
        <Metric label="故障仪器" value={selectedAnalysisInstruments.filter(item => item.faults > 0).length} unit="支" icon={AlertTriangle} tone="orange" />
      </div>
      <div className="dt-instrument-analysis-toolbar">
        <h2>仪器年度统计</h2>
        <div className="dt-instrument-filters">{renderInstrumentFilter('size')}{renderInstrumentFilter('category')}</div>
      </div>
      {selectedAnalysisInstruments.length ? <div className="dt-instrument-chart-grid">
        {renderInstrumentChart('participation', '年度参试次数', '次', 'participation')}
        {renderInstrumentChart('instrument-footage', '年度进尺', 'm', 'footage')}
        {renderInstrumentChart('instrument-cycle', '年度循环时间', 'h', 'cycle')}
        {renderInstrumentChart('instrument-faults', '年度故障次数', '次', 'faults')}
      </div> : <div className="dt-empty dt-instrument-chart-empty">请选择需要展示的仪器</div>}
    </>}
    {dimension === '试验报告' && <><div className="dt-metric-grid dt-report-analysis-metrics"><Metric label="报告总数" value={initialTestReports.length} unit="份" icon={Archive} /><Metric label="仪器报告" value={initialTestReports.filter(item => item.type === '仪器报告').length} unit="份" icon={Wrench} /><Metric label="项目报告" value={initialTestReports.filter(item => item.type === '项目报告').length} unit="份" icon={BriefcaseBusiness} /></div><section className="dt-panel" data-chart="reports"><SectionTitle>年度试验报告统计</SectionTitle><div className="dt-chart dt-chart--analysis"><ResponsiveContainer width="100%" height="100%"><BarChart data={yearlySummary.map(item => ({ year: item.year, instrumentReports: initialTestReports.filter(report => report.year === Number(item.year) && report.type === '仪器报告').length, projectReports: initialTestReports.filter(report => report.year === Number(item.year) && report.type === '项目报告').length }))} margin={{ top: 24, right: 12, left: -8, bottom: 30 }}><CartesianGrid vertical={false} stroke="#e7edf2" /><XAxis dataKey="year" tickLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ fontSize: 12, color: '#607785', paddingTop: 10 }} /><Bar dataKey="instrumentReports" name="仪器报告" fill="#487fc6" maxBarSize={42}><LabelList dataKey="instrumentReports" position="top" /></Bar><Bar dataKey="projectReports" name="项目报告" fill="#72b787" maxBarSize={42}><LabelList dataKey="projectReports" position="top" /></Bar></BarChart></ResponsiveContainer></div></section></>}
  </div>
}

function ActivePage({ id }: { id: PageId }) {
  if (id === 'status') return <OverallPage />
  if (id === 'operation') return <OperationPage />
  if (id === 'instruments') return <InstrumentsPage />
  if (id === 'reports') return <ReportsPage />
  return <AnalysisPage />
}

export default function DrillingTestPage() {
  const navigate = useNavigate()
  const [openTabs, setOpenTabs] = useState<PageId[]>(['status'])
  const [activeTab, setActiveTab] = useState<PageId | null>('status')
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
  return <div className="stats-page drilling-test-page"><header className="stats-header"><button className="stats-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>实钻试验</strong></button><HeaderUser /></header><div className="stats-shell"><aside className="stats-sidebar"><nav className="stats-nav operation-nav" aria-label="实钻试验导航">{navItems.map(({ id, icon: Icon }) => <button className={activeTab === id ? 'active' : ''} key={id} onClick={() => openPage(id)}><Icon />{pageLabels[id]}</button>)}</nav></aside><main className={`stats-main operation-main ${openTabs.length === 0 ? 'stats-main--empty' : ''}`}>{openTabs.length > 0 && <div className="stats-tabs" role="tablist" aria-label="已打开的实钻试验页面">{openTabs.map(pageId => <div className={`stats-tab ${activeTab === pageId ? 'active' : ''}`} key={pageId}><button className="stats-tab-label" role="tab" aria-selected={activeTab === pageId} onClick={() => setActiveTab(pageId)}>{pageLabels[pageId]}</button><button className="stats-tab-close" aria-label={`关闭${pageLabels[pageId]}`} onClick={() => closePage(pageId)}><X /></button></div>)}</div>}{activeTab && <ActivePage id={activeTab} />}</main></div></div>
}
