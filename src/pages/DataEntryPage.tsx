import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowDown, ArrowUp, Bell, Box, Check, ChevronDown, ChevronUp, ClipboardList,
  CreditCard, FileText, Flag, List, Monitor,
  Pencil, Plus, Radio, Trash2, UserRound, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useConfirm } from '../components/ConfirmContext'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import type { Well } from '../types'

interface DataEntryPageProps {
  wells: Well[]
}

type EditorKind = 'equipment' | 'personnel' | 'run' | 'bha' | 'weekly' | 'event'
interface EditorState { kind: EditorKind; index: number | null }
interface EditorField { key: string; label: string; required?: boolean; options?: string[]; type?: string }
interface InfoItem extends EditorField { readOnly?: boolean; wide?: boolean; range?: boolean; multiline?: boolean }
type Values = Record<string, string>
type EquipmentRow = Values & { id: string }
type PersonnelRow = Values & { id: string }
type RunRow = Values & { id: string }
type WeeklyRow = Values & { id: string }
type EventRow = Values & { id: string }

const mainSections = [
  { name: '井基本信息', icon: CreditCard },
  { name: '平台信息', icon: Box },
  { name: '设备动态', icon: Flag },
  { name: '人员动态', icon: UserRound },
]
const equipmentTabs = ['工具动态', '马达信息', '钻头信息', '放射源信息', '脉冲器信息', '地面设备']
const equipmentFields: EditorField[] = [
  { key: '仪器类别', label: '仪器类别', required: true },
  { key: '仪器尺寸', label: '仪器尺寸', required: true },
  { key: '序列号', label: '序列号', required: true },
  { key: '名称', label: '名称', required: true },
  { key: '仪器版本号', label: '仪器版本号' },
  { key: '硬件版本号', label: '硬件版本号' },
  { key: '位置', label: '位置', options: ['已入井', '平台', '地面'] },
  { key: '入井状态', label: '入井状态', options: ['已入井', '已出井'] },
  { key: '长度(m)', label: '长度(m)' },
  { key: '测点位置', label: '测点位置' },
  { key: '外径(in)', label: '外径(in)' },
  { key: '内径(mm)', label: '内径(mm)' },
]
const personnelFields: EditorField[] = [
  { key: '姓名', label: '姓名', required: true },
  { key: '岗位', label: '岗位', required: true },
  { key: '是否带队', label: '是否带队', options: ['带队工程师', '值班工程师', '辅助/实习工程师'] },
  { key: '班次', label: '班次', options: ['白班', '夜班'] },
  { key: '累计上平台时间(day)', label: '累计上平台时间(day)' },
  { key: '公司', label: '公司' },
  { key: '部门', label: '部门' },
  { key: '性别', label: '性别', options: ['男', '女'] },
  { key: '电话', label: '电话' },
  { key: '邮箱', label: '邮箱' },
  { key: '上平台时间', label: '上平台时间', type: 'date' },
  { key: '备注', label: '备注' },
]
const runFields: EditorField[] = [
  { key: 'RunID', label: 'RunID', required: true },
  { key: '井眼尺寸(in)', label: '井眼尺寸(in)', required: true },
  { key: '仪器入井时间', label: '仪器入井时间' },
  { key: '设计深度(m)', label: '设计深度(m)' },
  { key: '起始井深(m)', label: '起始井深(m)' },
  { key: '作业模式', label: '作业模式', options: ['马达', '旋转导向', '随钻测量'] },
  { key: '测量类型', label: '测量类型', options: ['随钻测井', '随钻测量', '电缆测井'] },
  { key: '定向井工具类型', label: '定向井工具类型', options: ['马达', '旋转导向'] },
  { key: '随钻工具', label: '随钻工具' },
  { key: '定向工具', label: '定向工具' },
  { key: '作业类别', label: '作业类别', options: ['钻进', '复测', '完井'] },
  { key: '工具归属', label: '工具归属', options: ['自研', '外购', '租赁'] },
]
const bhaFields: EditorField[] = [
  { key: '仪器类别', label: '仪器类别', required: true },
  { key: '序列号', label: '序列号', required: true },
  { key: '仪器名称', label: '仪器名称', required: true },
  { key: '外径(in)', label: '外径(in)' },
  { key: '内径(mm)', label: '内径(mm)' },
  { key: '工具长度(m)', label: '工具长度(m)' },
  { key: '测点零长(m)', label: '测点零长(m)' },
  { key: '检查人', label: '检查人' },
  { key: '失效时间(h)', label: '失效时间(h)' },
  { key: '状态', label: '状态', options: ['正常', '异常', '已失效'] },
  { key: '仪器尺寸', label: '仪器尺寸' },
  { key: '仪器版本', label: '仪器版本' },
]
const weeklyFields: EditorField[] = [
  { key: '井名', label: '井名', required: true },
  { key: '井眼尺寸(in)', label: '井眼尺寸(in)' },
  { key: '作业公司', label: '作业公司' },
  { key: '井型', label: '井型' },
  { key: '作业者', label: '作业者' },
  { key: '自营/合营', label: '自营/合营', options: ['自营', '合营'] },
  { key: '钻机', label: '钻机' },
  { key: '测量类型', label: '测量类型' },
  { key: '基础测量', label: '基础测量' },
  { key: '高端测量', label: '高端测量' },
  { key: '组合类型', label: '组合类型' },
  { key: '设计井深(m)', label: '设计井深(m)' },
  { key: '难度类型', label: '难度类型' },
]
const eventFields: EditorField[] = [
  { key: '开始时间', label: '开始时间', required: true },
  { key: '结束时间', label: '结束时间', required: true },
  { key: '事件描述', label: '事件描述', required: true },
  { key: '持续时长', label: '持续时长' },
  { key: '事件等级', label: '事件等级', options: ['一般', '重要', '重大'] },
]
const editorFields: Record<EditorKind, EditorField[]> = {
  equipment: equipmentFields,
  personnel: personnelFields,
  run: runFields,
  bha: bhaFields,
  weekly: weeklyFields,
  event: eventFields,
}
const editorTitles: Record<EditorKind, string> = {
  equipment: '设备信息', personnel: '人员信息', run: 'Run信息', bha: 'BHA仪器', weekly: '陀螺周报', event: '关键事件',
}

const platformItems: InfoItem[] = [
  { key: '钻机', label: '钻机', options: ['海洋石油906', 'ZJ70', 'ZJ50'] },
  { key: '平台名称', label: '平台名称', required: true },
  { key: '平台类型', label: '平台类型', required: true, options: ['自升式钻井平台', '半潜式钻井平台', '陆地钻机'] },
  { key: '补心高(m)', label: '补心高(m)', required: true },
  { key: '泥浆泵能力', label: '泥浆泵能力' },
  { key: '传感器接口', label: '传感器接口' },
  { key: '录井IP', label: '录井IP' },
  { key: '钻井总监', label: '钻井总监' },
  { key: '钻井总监电话', label: '钻井总监电话' },
  { key: '测井总监', label: '测井总监' },
  { key: '测井总监电话', label: '测井总监电话' },
  { key: '监督办电话', label: '监督办电话' },
  { key: '值班监督', label: '值班监督' },
  { key: '报房电话', label: '报房电话' },
  { key: '报房位置', label: '报房位置' },
  { key: '泥浆泵厂家', label: '泥浆泵厂家' },
  { key: '泥浆泵系列号', label: '泥浆泵系列号' },
  { key: '泥浆泵缸套厂家', label: '泥浆泵缸套厂家' },
  { key: '泥浆泵缸套尺寸(in)', label: '泥浆泵缸套尺寸(in)' },
]
const mudItems: InfoItem[] = [
  { key: '泥浆类型', label: '泥浆类型', required: true, options: ['水基泥浆', '油基泥浆', '合成基泥浆'] },
  { key: '泥浆比重(g/cm³)', label: '泥浆比重(g/cm³)', required: true, range: true },
  { key: '泥浆电阻率值(ohmm)', label: '泥浆电阻率值(ohmm)' },
  { key: '泥浆矿化度(mg/L)', label: '泥浆矿化度(mg/L)' },
  { key: 'PH值', label: 'PH值' },
  { key: '漏斗粘度(s/qt)', label: '漏斗粘度(s/qt)' },
  { key: '塑性粘度(mpa·s)', label: '塑性粘度(mpa·s)' },
  { key: '屈服值(pa)', label: '屈服值(pa)' },
  { key: '切力10s/10min(pa)', label: '切力10s/10min(pa)' },
  { key: '含沙量(%)', label: '含沙量(%)' },
  { key: '失水(ml)', label: '失水(ml)' },
  { key: '泥饼(mm)', label: '泥饼(mm)' },
]
const workItems: InfoItem[] = [
  { key: '钻压(Ton)', label: '钻压(Ton)', required: true, range: true },
  { key: '排量(L/min)', label: '排量(L/min)', required: true, range: true },
  { key: '转速(RPM)', label: '转速(RPM)', required: true, range: true },
  { key: '泵压(Mpa)', label: '泵压(Mpa)', required: true, range: true },
  { key: '扭矩(Kn·M)', label: '扭矩(Kn·M)', required: true, range: true },
  { key: '振动量级(g)', label: '振动量级(g)', range: true },
  { key: 'ROP(m/h)', label: 'ROP(m/h)', required: true, range: true },
  { key: '循环最高温度(℃)', label: '循环最高温度(℃)', required: true },
  { key: '仪器入井时间', label: '仪器入井时间' },
  { key: '24h进尺(m)', label: '24h进尺(m)', required: true },
  { key: '本趟钻循环时间(h)', label: '本趟钻循环时间(h)', required: true },
  { key: '本趟钻纯钻时间(h)', label: '本趟钻纯钻时间(h)', required: true },
  { key: '当前作业模式', label: '当前作业模式', required: true, options: ['钻进', '划眼', '循环', '起下钻'] },
  { key: '指令成功率', label: '指令成功率', required: true },
]
const noteItems: InfoItem[] = [
  { key: '交接班记录(注意事项)', label: '交接班记录(注意事项)', wide: true, multiline: true },
  { key: '当前作业描述', label: '当前作业描述', wide: true, multiline: true },
  { key: '下步作业计划', label: '下步作业计划', required: true, wide: true, multiline: true },
  { key: '24h重要事件', label: '24h重要事件', required: true, wide: true, multiline: true },
  { key: '材料及人员需求', label: '材料及人员需求', wide: true, multiline: true },
]
const runSummaryItems: InfoItem[] = [
  { key: 'RunID', label: 'RunID', readOnly: true },
  { key: '井眼尺寸(in)', label: '井眼尺寸(in)', readOnly: true },
  { key: '仪器入井时间', label: '仪器入井时间', readOnly: true },
  { key: '起始井深(m)', label: '起始井深(m)', readOnly: true },
  { key: '设计深度(m)', label: '设计深度(m)', readOnly: true },
  { key: '作业模式', label: '作业模式', readOnly: true },
  { key: '测量类型', label: '测量类型', readOnly: true },
  { key: '定向井工具类型', label: '定向井工具类型', readOnly: true },
  { key: '随钻工具', label: '随钻工具', readOnly: true },
  { key: '定向工具', label: '定向工具', readOnly: true },
  { key: '作业类别', label: '作业类别', readOnly: true },
  { key: '上层套管鞋尺寸及深度', label: '上层套管鞋尺寸及深度', readOnly: true },
  { key: '工具归属', label: '工具归属', readOnly: true },
  { key: '工具类型', label: '工具类型', readOnly: true },
  { key: '实钻/复测', label: '实钻/复测', readOnly: true },
  { key: '创建时间', label: '创建时间', readOnly: true },
  { key: '仪器出井时间', label: '仪器出井时间', required: true },
  { key: '结束井深(m)', label: '结束井深(m)', required: true },
  { key: '仪器井下时间(h)', label: '仪器井下时间(h)', required: true },
  { key: '循环时间(h)', label: '循环时间(h)', required: true },
  { key: '纯钻时间(h)', label: '纯钻时间(h)', required: true },
  { key: '进尺(m)', label: '进尺(m)', required: true },
  { key: '是否成功', label: '是否成功', required: true, options: ['是', '否'] },
  { key: '工具状态', label: '工具状态', options: ['正常', '异常'] },
  { key: 'Run完成情况', label: 'Run完成情况', required: true, options: ['作业完成', '部分完成', '未完成'] },
  { key: '作业完成情况（定向井）', label: '作业完成情况（定向井）', required: true, options: ['完成', '部分完成', '未完成'] },
  { key: '作业完成情况（随钻）', label: '作业完成情况（随钻）', required: true, options: ['完成', '部分完成', '未完成'] },
]

function loadStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function today() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function RecordEditor({ title, fields, initial, onClose, onSave }: {
  title: string
  fields: EditorField[]
  initial: Values
  onClose: () => void
  onSave: (values: Values) => void
}) {
  const [values, setValues] = useState<Values>(initial)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const missing = fields.find(field => field.required && !values[field.key]?.trim())
    if (missing) {
      toast.error(`请填写${missing.label}`)
      return
    }
    onSave(values)
  }
  return (
    <div className="modal-backdrop data-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <form className="data-editor" onSubmit={submit}>
        <header><h2>{title}</h2><button type="button" aria-label="关闭" onClick={onClose}><X /></button></header>
        <div className="data-editor-grid">
          {fields.map(field => (
            <label key={field.key}>
              <span>{field.required && <b>*</b>}{field.label}</span>
              {field.options ? (
                <select aria-label={field.label} value={values[field.key] || ''} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}>
                  <option value="">请选择</option>
                  {field.options.map(option => <option key={option}>{option}</option>)}
                </select>
              ) : (
                <input aria-label={field.label} type={field.type || 'text'} value={values[field.key] || ''} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))} placeholder={`请输入${field.label}`} />
              )}
            </label>
          ))}
        </div>
        <footer><button className="data-primary-button" type="submit"><Check />确定</button><button type="button" onClick={onClose}>取消</button></footer>
      </form>
    </div>
  )
}

function InfoGrid({ items, values, onChange, readOnly = false }: {
  items: InfoItem[]
  values: Values
  onChange?: (key: string, value: string) => void
  readOnly?: boolean
}) {
  return (
    <div className="data-info-grid">
      {items.map(item => {
        const disabled = readOnly || item.readOnly
        return (
          <label className={`data-info-item ${item.wide ? 'data-info-item--wide' : ''} ${disabled ? 'is-readonly' : ''}`} key={item.key}>
            <span>{item.required && <b>*</b>}{item.label}</span>
            {item.range && !disabled ? (
              <div className="data-range-inputs">
                <input aria-label={`${item.label}最小值`} value={values[`${item.key}Min`] || ''} onChange={event => onChange?.(`${item.key}Min`, event.target.value)} placeholder="Min" />
                <i>-</i>
                <input aria-label={`${item.label}最大值`} value={values[`${item.key}Max`] || ''} onChange={event => onChange?.(`${item.key}Max`, event.target.value)} placeholder="Max" />
              </div>
            ) : item.options && !disabled ? (
              <select aria-label={item.label} value={values[item.key] || ''} onChange={event => onChange?.(item.key, event.target.value)}>
                <option value="">请选择</option>
                {item.options.map(option => <option key={option}>{option}</option>)}
              </select>
            ) : item.multiline && !disabled ? (
              <textarea aria-label={item.label} value={values[item.key] || ''} onChange={event => onChange?.(item.key, event.target.value)} placeholder={`请输入${item.label}`} />
            ) : (
              <input aria-label={item.label} readOnly={disabled} value={values[item.key] || ''} onChange={event => onChange?.(item.key, event.target.value)} placeholder={disabled ? '' : `请输入${item.label}`} />
            )}
          </label>
        )
      })}
    </div>
  )
}

function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return <div className="data-row-actions"><button title="编辑" aria-label="编辑" onClick={onEdit}><Pencil /></button><button title="删除" aria-label="删除" onClick={onDelete}><Trash2 /></button></div>
}

function ReportSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section className="data-report-section" id={`daily-report-${id}`}><h2>{title}</h2>{children}</section>
}

function ReportTable({ columns, rows, minWidth = 900 }: { columns: string[]; rows: Values[]; minWidth?: number }) {
  return (
    <div className="data-table-scroll data-report-table-scroll">
      <table className="data-table data-report-table" style={{ minWidth }}><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row.id || index}>{columns.map(column => <td key={column}>{row[column] || '-'}</td>)}</tr>)}</tbody>
      </table>
      {!rows.length && <div className="data-empty data-empty--small">暂无数据</div>}
    </div>
  )
}

const fullReportSections = ['井信息', '平台信息', 'Run信息', 'BHA信息', '人员信息', '工具信息', '关键事件', '作业工况', '轨迹信息', '泥浆信息', '效果评价', '故障情况']

export default function DataEntryPage({ wells }: DataEntryPageProps) {
  const { wellId } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const well = wells.find(item => item.id === wellId) || wells[0]
  const storageKey = `sws-data-entry-${well?.id || wellId || 'unknown'}`
  const [active, setActive] = useState('井基本信息')
  const [tabs, setTabs] = useState(['井基本信息'])
  const [operationOpen, setOperationOpen] = useState(true)
  const [runOpen, setRunOpen] = useState(true)
  const [equipmentTab, setEquipmentTab] = useState('工具动态')
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([])
  const [dailyRun, setDailyRun] = useState(well?.run || '100')
  const [dailyDate, setDailyDate] = useState(today())
  const [dailySubmitted, setDailySubmitted] = useState(false)
  const [runSubmitted, setRunSubmitted] = useState(true)
  const [reportMode, setReportMode] = useState<'brief' | 'full'>('full')
  const [reportDate, setReportDate] = useState(today())
  const [fullReportSection, setFullReportSection] = useState('井信息')
  const reportAnchorTarget = useRef<string | null>(null)
  const reportAnchorTimer = useRef<number | null>(null)

  const [platformValues, setPlatformValues] = useState<Values>(() => loadStored(`${storageKey}-platform`, {
    钻机: '海洋石油906', 平台名称: '海洋石油906', 平台类型: '自升式钻井平台', '补心高(m)': '0',
  }))
  const [dailyValues, setDailyValues] = useState<Values>(() => loadStored(`${storageKey}-daily`, {
    泥浆类型: '水基泥浆', 仪器入井时间: well?.startTime || '', 当前作业模式: '钻进', 指令成功率: '100%',
  }))
  const [runValues, setRunValues] = useState<Values>(() => loadStored(`${storageKey}-run-summary`, {
    RunID: well?.run || '100', '井眼尺寸(in)': well?.holeSize || '12.25', 仪器入井时间: well?.startTime || '',
    '起始井深(m)': '1', '设计深度(m)': String(well?.designDepth || 3600), 作业模式: '马达', 测量类型: '随钻测井',
    定向井工具类型: '马达', 随钻工具: '1', 定向工具: '2', 作业类别: '钻进', 上层套管鞋尺寸及深度: '1-2',
    工具归属: '自研', 工具类型: '基本型', '实钻/复测': '实钻', 创建时间: well?.startTime || '', '循环时间(h)': '5', '纯钻时间(h)': '3',
  }))
  const [equipment, setEquipment] = useState<Record<string, EquipmentRow[]>>(() => loadStored(`${storageKey}-equipment`, {
    工具动态: [
      { id: 'tool-1', 仪器类别: 'ABC', 仪器尺寸: '6-3/4"', 序列号: '123456', 名称: '6-3/4"ABC#123456', 仪器版本号: '1.0', 硬件版本号: 'A', 位置: '已入井', 入井状态: '已入井', '长度(m)': '3.2', 测点位置: '1.25', '外径(in)': '6.75', '内径(mm)': '' },
      { id: 'tool-2', 仪器类别: 'IDMP', 仪器尺寸: '6-3/4"', 序列号: '123456', 名称: '6-3/4"IDMP#123456', 仪器版本号: '1.0', 硬件版本号: 'A', 位置: '已入井', 入井状态: '已入井', '长度(m)': '2.8', 测点位置: '0.85', '外径(in)': '6.75', '内径(mm)': '' },
    ],
    马达信息: [], 钻头信息: [], 放射源信息: [], 脉冲器信息: [], 地面设备: [],
  }))
  const [personnel, setPersonnel] = useState<PersonnelRow[]>(() => loadStored(`${storageKey}-personnel`, [
    { id: 'person-1', 姓名: '符艺', 岗位: '定向井工程师', 是否带队: '辅助/实习工程师', 班次: '白班', '累计上平台时间(day)': '31', 公司: '缅甸作业公司', 部门: '定向随钻作业中心', 性别: '男', 电话: '', 邮箱: '', 上平台时间: '2026-10-01', 下平台时间: '', 备注: '' },
    { id: 'person-2', 姓名: '王一', 岗位: '支持工程师', 是否带队: '值班工程师', 班次: '白班', '累计上平台时间(day)': '31', 公司: '缅甸作业公司', 部门: '定向随钻作业中心', 性别: '男', 电话: '', 邮箱: '', 上平台时间: '2026-10-01', 下平台时间: '', 备注: '' },
  ]))
  const [runs, setRuns] = useState<RunRow[]>(() => loadStored(`${storageKey}-runs`, [
    { id: 'run-100', RunID: '100', '井眼尺寸(in)': well?.holeSize || '12.25', 仪器入井时间: well?.startTime || '', '设计深度(m)': String(well?.designDepth || 3600), '起始井深(m)': '1', 作业模式: '马达', 测量类型: '随钻测井', 定向井工具类型: '马达', 随钻工具: '1', 定向工具: '2', 作业类别: '钻进', 工具归属: '自研', '实钻/复测': '实钻' },
  ]))
  const [bha, setBha] = useState<EquipmentRow[]>(() => loadStored(`${storageKey}-bha`, [
    { id: 'bha-1', 仪器类别: 'ABC', 序列号: '123456', 仪器名称: '6-3/4"ABC#123456', '外径(in)': '6.75', '内径(mm)': '', '工具长度(m)': '3.2', '测点零长(m)': '1.25', 检查人: '张三', '失效时间(h)': '200', 状态: '正常', 仪器尺寸: '6-3/4"', 仪器版本: '1.0' },
    { id: 'bha-2', 仪器类别: 'IDMP', 序列号: '123456', 仪器名称: '6-3/4"IDMP#123456', '外径(in)': '6.75', '内径(mm)': '', '工具长度(m)': '2.8', '测点零长(m)': '0.85', 检查人: '李四', '失效时间(h)': '200', 状态: '正常', 仪器尺寸: '6-3/4"', 仪器版本: '1.0' },
  ]))
  const [weekly, setWeekly] = useState<WeeklyRow[]>(() => loadStored(`${storageKey}-weekly`, []))
  const [events, setEvents] = useState<EventRow[]>(() => loadStored(`${storageKey}-events`, []))

  useEffect(() => { localStorage.setItem(`${storageKey}-equipment`, JSON.stringify(equipment)) }, [equipment, storageKey])
  useEffect(() => { localStorage.setItem(`${storageKey}-personnel`, JSON.stringify(personnel)) }, [personnel, storageKey])
  useEffect(() => { localStorage.setItem(`${storageKey}-runs`, JSON.stringify(runs)) }, [runs, storageKey])
  useEffect(() => { localStorage.setItem(`${storageKey}-bha`, JSON.stringify(bha)) }, [bha, storageKey])
  useEffect(() => { localStorage.setItem(`${storageKey}-weekly`, JSON.stringify(weekly)) }, [weekly, storageKey])
  useEffect(() => { localStorage.setItem(`${storageKey}-events`, JSON.stringify(events)) }, [events, storageKey])

  const openSection = (section: string) => {
    setActive(section)
    setTabs(current => current.includes(section) ? current : [...current, section])
    if (mainSections.some(item => item.name === section)) setOperationOpen(true)
    if (runs.some(run => run.RunID === section)) {
      setRunOpen(true)
      const run = runs.find(item => item.RunID === section)
      setRunValues(current => ({ ...current, ...run, RunID: section }))
      setRunSubmitted(false)
    }
  }
  const closeTab = (tab: string) => {
    if (tabs.length === 1) return
    const index = tabs.indexOf(tab)
    const next = tabs.filter(item => item !== tab)
    setTabs(next)
    if (active === tab) setActive(next[Math.max(0, index - 1)])
  }
  const saveValues = (name: string, values: Values) => {
    localStorage.setItem(`${storageKey}-${name}`, JSON.stringify(values))
  }
  const updateDaily = (key: string, value: string) => setDailyValues(current => ({ ...current, [key]: value }))
  const currentEquipment = equipment[equipmentTab] || []
  const isRunDetail = runs.some(run => run.RunID === active)

  const basicValues: Values = {
    井名: well?.name || '', 国家: '中国', 区域: well?.region || '', 区块: '金县', 作业公司: '研究院', 油田: '金县1-1',
    井型: '定向井', 作业者: '中海油服', 设计井深: String(well?.designDepth || ''), 难度类型: '其他',
    时区: '(UTC+08:00) 北京，重庆，香港特别行政区，乌鲁木齐', 井作业状态: well?.status || '', 井别: '生产井', 平台: '海洋石油906',
    风险等级: '一级', 目标井斜: well?.inc || '', 目标方位: well?.azi || '', '起始井深(m)': '1', 是否为测试井: '否',
    是否为璇玑作业: '是', 创建时间: well?.startTime || '',
  }
  const basicOrder = ['井名', '国家', '区域', '区块', '作业公司', '油田', '井型', '作业者', '设计井深', '难度类型', '时区', '井作业状态', '井别', '平台', '风险等级', '目标井斜', '目标方位', '起始井深(m)', '是否为测试井', '是否为璇玑作业', '创建时间']

  const editorInitial = (): Values => {
    if (!editor) return {}
    const { kind, index } = editor
    if (index !== null) {
      const source = kind === 'equipment' ? currentEquipment : kind === 'personnel' ? personnel : kind === 'run' ? runs : kind === 'bha' ? bha : kind === 'weekly' ? weekly : events
      return { ...source[index] }
    }
    if (kind === 'weekly') return { 井名: well?.name || '', '井眼尺寸(in)': well?.holeSize || '', 作业公司: '研究院', 井型: '定向井', 作业者: '中海油服', '自营/合营': '自营', 钻机: '海洋石油906', 测量类型: '随钻测井', '设计井深(m)': String(well?.designDepth || ''), 难度类型: '其他' }
    if (kind === 'run') return { RunID: String((runs.length + 1) * 100), '井眼尺寸(in)': well?.holeSize || '', '设计深度(m)': String(well?.designDepth || ''), '起始井深(m)': '1', 作业模式: '马达', 测量类型: '随钻测井', 定向井工具类型: '马达', 作业类别: '钻进', 工具归属: '自研' }
    if (kind === 'equipment') return { 仪器类别: equipmentTab === '工具动态' ? 'ABC' : equipmentTab.replace('信息', ''), 位置: '平台', 入井状态: '已出井' }
    if (kind === 'personnel') return { 班次: '白班', 公司: '缅甸作业公司', 部门: '定向随钻作业中心', 上平台时间: today() }
    if (kind === 'bha') return { 状态: '正常', 仪器版本: '1.0' }
    if (kind === 'event') return { 开始时间: `${dailyDate} 08:00`, 结束时间: `${dailyDate} 09:00`, 事件等级: '一般' }
    return {}
  }

  const saveEditor = (values: Values) => {
    if (!editor) return
    const { kind, index } = editor
    if (kind === 'run' && index === null && runs.some(run => run.RunID === values.RunID)) {
      toast.error('RunID已存在，请更换编号')
      return
    }
    const id = `${kind}-${Date.now()}`
    if (kind === 'equipment') {
      setEquipment(current => {
        const list = [...(current[equipmentTab] || [])]
        if (index === null) list.push({ ...values, id })
        else list[index] = { ...list[index], ...values }
        return { ...current, [equipmentTab]: list }
      })
    } else if (kind === 'personnel') {
      setPersonnel(current => index === null ? [...current, { ...values, id }] : current.map((row, rowIndex) => rowIndex === index ? { ...row, ...values } : row))
    } else if (kind === 'run') {
      setRuns(current => index === null ? [...current, { ...values, id }] : current.map((row, rowIndex) => rowIndex === index ? { ...row, ...values } : row))
    } else if (kind === 'bha') {
      setBha(current => index === null ? [...current, { ...values, id }] : current.map((row, rowIndex) => rowIndex === index ? { ...row, ...values } : row))
    } else if (kind === 'weekly') {
      setWeekly(current => index === null ? [...current, { ...values, id }] : current.map((row, rowIndex) => rowIndex === index ? { ...row, ...values } : row))
    } else {
      setEvents(current => index === null ? [...current, { ...values, id }] : current.map((row, rowIndex) => rowIndex === index ? { ...row, ...values } : row))
    }
    setEditor(null)
    toast.success(index === null ? '新建成功' : '修改已保存')
  }

  const removeRow = (kind: EditorKind, index: number) => {
    const title = kind === 'equipment' ? '删除设备' : kind === 'personnel' ? '删除人员' : kind === 'bha' ? '删除BHA仪器' : kind === 'weekly' ? '删除陀螺周报' : kind === 'event' ? '删除关键事件' : '删除记录'
    const name = kind === 'equipment' ? currentEquipment[index]?.名称 || currentEquipment[index]?.序列号 || equipmentTab : kind === 'personnel' ? personnel[index]?.姓名 || '当前人员' : kind === 'bha' ? bha[index]?.仪器名称 || bha[index]?.序列号 || '当前仪器' : kind === 'weekly' ? weekly[index]?.井名 || '当前周报' : kind === 'event' ? events[index]?.事件描述 || '当前关键事件' : '当前记录'
    confirm({
      title,
      name,
      description: '删除后，该记录及其填报信息将无法恢复。',
      onConfirm: () => {
        if (kind === 'equipment') setEquipment(current => ({ ...current, [equipmentTab]: (current[equipmentTab] || []).filter((_, rowIndex) => rowIndex !== index) }))
        if (kind === 'personnel') setPersonnel(current => current.filter((_, rowIndex) => rowIndex !== index))
        if (kind === 'bha') setBha(current => current.filter((_, rowIndex) => rowIndex !== index))
        if (kind === 'weekly') setWeekly(current => current.filter((_, rowIndex) => rowIndex !== index))
        if (kind === 'event') setEvents(current => current.filter((_, rowIndex) => rowIndex !== index))
        toast.success('已删除')
      },
    })
  }
  const moveRow = (kind: 'equipment' | 'bha', index: number, direction: -1 | 1) => {
    const reorder = <T,>(list: T[]) => {
      const target = index + direction
      if (target < 0 || target >= list.length) return list
      const next = [...list]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    }
    if (kind === 'equipment') setEquipment(current => ({ ...current, [equipmentTab]: reorder(current[equipmentTab] || []) }))
    else setBha(current => reorder(current))
  }

  const savePlatform = () => {
    if (!platformValues['平台名称']?.trim() || !platformValues['平台类型']?.trim()) {
      toast.error('请完善平台名称和平台类型')
      return
    }
    saveValues('platform', platformValues)
    toast.success('平台信息已保存')
  }
  const saveDaily = () => {
    saveValues('daily', dailyValues)
    localStorage.setItem(`${storageKey}-daily-meta`, JSON.stringify({ run: dailyRun, date: dailyDate }))
    setDailySubmitted(false)
    toast.success('每日填报已保存')
  }
  const submitDaily = () => {
    const required = [...mudItems, ...workItems, ...noteItems].filter(item => item.required)
    const missing = required.find(item => item.range ? !dailyValues[`${item.key}Min`] && !dailyValues[`${item.key}Max`] : !dailyValues[item.key]?.trim())
    if (missing) {
      toast.error(`提交前请完善${missing.label}`)
      return
    }
    saveValues('daily', dailyValues)
    setDailySubmitted(true)
    toast.success(`${dailyDate} 每日填报已提交`)
  }
  const saveRun = () => {
    saveValues('run-summary', runValues)
    setRunSubmitted(false)
    toast.success(`Run ${active} 已保存`)
  }
  const submitRun = () => {
    const required = runSummaryItems.filter(item => item.required)
    const missing = required.find(item => !runValues[item.key]?.trim())
    if (missing) {
      toast.error(`提交前请完善${missing.label}`)
      return
    }
    saveValues('run-summary', runValues)
    setRunSubmitted(true)
    toast.success(`Run ${active} 总结已提交`)
  }

  const renderBasic = () => (
    <section className="data-panel">
      <div className="data-panel-heading"><h1>井信息</h1></div>
      <InfoGrid items={basicOrder.map(key => ({ key, label: key }))} values={basicValues} readOnly />
    </section>
  )

  const renderPlatform = () => (
    <section className="data-panel">
      <div className="data-panel-heading"><h1>平台信息</h1><button className="data-secondary-button" onClick={savePlatform}>保存</button></div>
      <InfoGrid items={platformItems} values={platformValues} onChange={(key, value) => setPlatformValues(current => ({ ...current, [key]: value }))} />
    </section>
  )

  const renderEquipment = () => {
    const columns = ['仪器类别', '仪器尺寸', '序列号', '名称', '仪器版本号', '硬件版本号', '位置', '入井状态', '长度(m)', '测点位置', '外径(in)', '内径(mm)']
    const allSelected = currentEquipment.length > 0 && selectedEquipment.length === currentEquipment.length
    return (
      <section className="data-panel data-table-panel">
        <div className="data-subtabs">{equipmentTabs.map(tab => <button className={equipmentTab === tab ? 'active' : ''} key={tab} onClick={() => { setEquipmentTab(tab); setSelectedEquipment([]) }}>{tab}</button>)}</div>
        <div className="data-panel-heading data-panel-heading--overlay"><div /><div className="data-toolbar"><button className="data-secondary-button" onClick={() => setEditor({ kind: 'equipment', index: null })}>新建</button><button className="data-primary-button" onClick={() => toast.success(`${equipmentTab}已同步`)}>同步</button><button className="data-primary-button" onClick={() => {
          if (!selectedEquipment.length) { toast.info('请先选择设备'); return }
          setEquipment(current => ({ ...current, [equipmentTab]: (current[equipmentTab] || []).map(row => selectedEquipment.includes(row.id) ? { ...row, 位置: '平台', 入井状态: '已出井' } : row) }))
          setSelectedEquipment([])
          toast.success('所选设备已批量下平台')
        }}>批量下平台</button></div></div>
        <div className="data-table-scroll">
          <table className="data-table data-equipment-table"><thead><tr><th><input type="checkbox" aria-label="全选设备" checked={allSelected} onChange={event => setSelectedEquipment(event.target.checked ? currentEquipment.map(row => row.id) : [])} /></th>{columns.map(column => <th key={column}>{column}</th>)}<th className="data-sticky-action">操作</th></tr></thead>
            <tbody>{currentEquipment.map((row, index) => <tr key={row.id}><td><input type="checkbox" aria-label={`选择${row.名称}`} checked={selectedEquipment.includes(row.id)} onChange={event => setSelectedEquipment(current => event.target.checked ? [...current, row.id] : current.filter(id => id !== row.id))} /></td>{columns.map(column => <td key={column}>{row[column] || '-'}</td>)}<td className="data-sticky-action"><div className="data-row-actions"><button title="编辑" aria-label="编辑" onClick={() => setEditor({ kind: 'equipment', index })}><Pencil /></button><button title="删除" aria-label="删除" onClick={() => removeRow('equipment', index)}><Trash2 /></button><button title="上移" aria-label="上移" onClick={() => moveRow('equipment', index, -1)}><ArrowUp /></button><button title="下移" aria-label="下移" onClick={() => moveRow('equipment', index, 1)}><ArrowDown /></button></div></td></tr>)}</tbody>
          </table>
          {!currentEquipment.length && <div className="data-empty">暂无{equipmentTab}数据，点击“新建”添加</div>}
        </div>
      </section>
    )
  }

  const renderPersonnel = () => {
    const columns = ['姓名', '岗位', '是否带队', '班次', '累计上平台时间(day)', '公司', '部门', '性别', '电话', '邮箱', '上平台时间', '下平台时间', '备注']
    const allSelected = personnel.length > 0 && selectedPersonnel.length === personnel.length
    return (
      <section className="data-panel data-table-panel">
        <div className="data-panel-heading"><h1>人员动态</h1><div className="data-toolbar"><button className="data-secondary-button" onClick={() => setEditor({ kind: 'personnel', index: null })}>新建</button><button className="data-primary-button" onClick={() => toast.success('人员动态已同步')}>同步</button><button className="data-primary-button" onClick={() => {
          if (!selectedPersonnel.length) { toast.info('请先选择人员'); return }
          setPersonnel(current => current.map(row => selectedPersonnel.includes(row.id) ? { ...row, 下平台时间: today() } : row))
          setSelectedPersonnel([])
          toast.success('所选人员已批量下平台')
        }}>批量下平台</button></div></div>
        <div className="data-table-scroll"><table className="data-table data-personnel-table"><thead><tr><th><input type="checkbox" aria-label="全选人员" checked={allSelected} onChange={event => setSelectedPersonnel(event.target.checked ? personnel.map(row => row.id) : [])} /></th>{columns.map(column => <th key={column}>{column}</th>)}<th className="data-sticky-action">操作</th></tr></thead>
          <tbody>{personnel.map((row, index) => <tr key={row.id}><td><input type="checkbox" aria-label={`选择${row.姓名}`} checked={selectedPersonnel.includes(row.id)} onChange={event => setSelectedPersonnel(current => event.target.checked ? [...current, row.id] : current.filter(id => id !== row.id))} /></td>{columns.map(column => <td key={column}>{row[column] || '-'}</td>)}<td className="data-sticky-action"><ActionButtons onEdit={() => setEditor({ kind: 'personnel', index })} onDelete={() => removeRow('personnel', index)} /></td></tr>)}</tbody>
        </table>{!personnel.length && <div className="data-empty">暂无人员数据，点击“新建”添加</div>}</div>
      </section>
    )
  }

  const renderRuns = () => {
    const columns = ['RunID', '井眼尺寸(in)', '仪器入井时间', '设计深度(m)', '起始井深(m)', '作业模式', '测量类型', '定向井工具类型', '随钻工具', '定向工具', '作业类别', '工具归属', '实钻/复测']
    return (
      <section className="data-panel data-table-panel">
        <div className="data-panel-heading"><h1>Run信息</h1><button className="data-secondary-button" onClick={() => setEditor({ kind: 'run', index: null })}>新建</button></div>
        <div className="data-table-scroll"><table className="data-table data-run-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}<th className="data-sticky-action">操作</th></tr></thead><tbody>
          {runs.map((row, index) => <tr key={row.id}>{columns.map(column => <td key={column}>{row[column] || '-'}</td>)}<td className="data-sticky-action"><div className="data-row-actions"><button title="Run总结" aria-label="Run总结" onClick={() => openSection(row.RunID)}><ClipboardList /></button><button title="编辑" aria-label="编辑" onClick={() => setEditor({ kind: 'run', index })}><Pencil /></button></div></td></tr>)}
        </tbody></table>{!runs.length && <div className="data-empty">暂无Run信息</div>}</div>
      </section>
    )
  }

  const renderRunDetail = () => {
    const columns = ['仪器类别', '序列号', '仪器名称', '外径(in)', '内径(mm)', '工具长度(m)', '测点零长(m)', '检查人', '失效时间(h)', '状态', '仪器尺寸', '仪器版本']
    return (
      <div className="data-run-detail">
        <div className="data-panel-heading data-run-actions"><span className={runSubmitted ? 'data-submit-tip' : ''}>{runSubmitted ? 'Run总结已提交，可重新提交更新数据。' : `Run ${active} 总结填报`}</span><div className="data-toolbar"><button className="data-secondary-button" onClick={saveRun}>保存</button><button className="data-primary-button" onClick={submitRun}>提交</button></div></div>
        <section className="data-panel data-bha-panel">
          <div className="data-panel-heading"><h1>BHA信息 <small>（可通过在RUN管理界面修改工具出入井时间，自动判断工具未入井或工具已出井）</small></h1><button className="data-secondary-button" onClick={() => setEditor({ kind: 'bha', index: null })}>新增</button></div>
          <div className="data-table-scroll data-bha-scroll"><table className="data-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}<th className="data-sticky-action">操作</th></tr></thead><tbody>
            {bha.map((row, index) => <tr key={row.id}>{columns.map(column => <td key={column}>{row[column] || '-'}</td>)}<td className="data-sticky-action"><div className="data-row-actions"><button title="编辑" aria-label="编辑" onClick={() => setEditor({ kind: 'bha', index })}><Pencil /></button><button title="删除" aria-label="删除" onClick={() => removeRow('bha', index)}><Trash2 /></button><button title="上移" aria-label="上移" onClick={() => moveRow('bha', index, -1)}><ArrowUp /></button><button title="下移" aria-label="下移" onClick={() => moveRow('bha', index, 1)}><ArrowDown /></button></div></td></tr>)}
          </tbody></table>{!bha.length && <div className="data-empty">暂无BHA仪器，点击“新增”添加</div>}</div>
        </section>
        <section className="data-panel data-run-summary"><div className="data-panel-heading"><h1>Run总结</h1></div><InfoGrid items={runSummaryItems} values={runValues} onChange={(key, value) => setRunValues(current => ({ ...current, [key]: value }))} /></section>
      </div>
    )
  }

  const renderDaily = () => (
    <div className="data-daily-page">
      <div className="data-daily-filter"><label>Run<select aria-label="填报Run" value={dailyRun} onChange={event => setDailyRun(event.target.value)}>{runs.map(run => <option key={run.id}>{run.RunID}</option>)}</select></label><label>日期<input aria-label="填报日期" type="date" value={dailyDate} onChange={event => setDailyDate(event.target.value)} /></label><button className="data-secondary-button" onClick={saveDaily}>保存</button><button className="data-primary-button" onClick={() => { setDailyValues(current => ({ ...current, 仪器入井时间: well?.startTime || current.仪器入井时间 })); toast.success('已同步当前井作业数据') }}>同步</button><button className="data-primary-button" onClick={submitDaily}>提交</button></div>
      {dailySubmitted && <div className="data-inline-success">本日填报已提交，可修改后重新提交。</div>}
      <section className="data-panel data-daily-section"><div className="data-panel-heading"><h1>泥浆</h1><button className="data-secondary-button" onClick={() => toast.info('当前为手工录入泥浆数据')}>无泥浆数据</button></div><InfoGrid items={mudItems} values={dailyValues} onChange={updateDaily} /></section>
      <section className="data-panel data-daily-section"><div className="data-panel-heading"><h1>工况参数</h1><button className="data-secondary-button" onClick={() => toast.info('当前为手工录入工况参数')}>无工况参数</button></div><InfoGrid items={workItems} values={dailyValues} onChange={updateDaily} /><InfoGrid items={noteItems} values={dailyValues} onChange={updateDaily} /></section>
      <section className="data-panel data-daily-section data-table-panel"><div className="data-panel-heading"><h1>关键事件</h1><button className="data-secondary-button" onClick={() => setEditor({ kind: 'event', index: null })}>新建</button></div><div className="data-table-scroll"><table className="data-table data-event-table"><thead><tr>{['开始时间', '结束时间', '事件描述', '持续时长', '事件等级'].map(column => <th key={column}>{column}</th>)}<th>操作</th></tr></thead><tbody>{events.map((row, index) => <tr key={row.id}>{['开始时间', '结束时间', '事件描述', '持续时长', '事件等级'].map(column => <td key={column}>{row[column] || '-'}</td>)}<td><ActionButtons onEdit={() => setEditor({ kind: 'event', index })} onDelete={() => removeRow('event', index)} /></td></tr>)}</tbody></table>{!events.length && <div className="data-empty data-empty--small">暂无关键事件</div>}</div></section>
    </div>
  )

  const reportRange = (key: string) => [dailyValues[`${key}Min`], dailyValues[`${key}Max`]].filter(Boolean).join(' - ') || '-'
  const reportItems: Values = {
    '平台@井名': `${platformValues['平台名称'] || '海洋石油906'}@${well?.name || ''}`,
    '作业井段@RunID': `${well?.holeSize || ''}@${dailyRun}`,
    BHA: well?.bha || '', 工具状态: '正常', '井深(m)': String(well?.currentDepth || ''),
    '24h进尺@本趟累计进尺(m)': `${dailyValues['24h进尺(m)'] || '0'}m@${dailyValues['24h进尺(m)'] || '0'}m`,
    '最大井斜(°)': well?.inc || '', '设计完钻井深@设计中完井深(m)': `${well?.designDepth || ''}m@${well?.designDepth || ''}m`,
    最近测斜: `MD:${well?.md || '0.00'} AZI:${well?.azi || '0.00'} INC:${well?.inc || '0.00'}`,
    '排量(L/min)': reportRange('排量(L/min)'),
    '垂深/循环最高温度(m/℃)': `${well?.currentDepth || 0}m/${dailyValues['循环最高温度(℃)'] || '-'}℃`,
    指令成功率: dailyValues['指令成功率'] || '-',
    'rop(m/h)': reportRange('ROP(m/h)'),
    '钻压(Ton)': reportRange('钻压(Ton)'),
    '转速(RPM)': reportRange('转速(RPM)'),
    '造斜率(°/30m)': dailyValues['造斜率(°/30m)'] || '-',
    本趟入井时间: dailyValues['仪器入井时间'] || well?.startTime || '',
    '本趟钻循环时间@纯钻时间(h)': dailyValues['本趟钻循环时间(h)'] || dailyValues['本趟钻纯钻时间(h)'] ? `${dailyValues['本趟钻循环时间(h)'] || '-'}h@${dailyValues['本趟钻纯钻时间(h)'] || '-'}h` : '-',
    当前作业: dailyValues['当前作业描述'] || dailyValues['当前作业模式'] || '-',
    下步作业: dailyValues['下步作业计划'] || '-',
  }
  const reportDates = [today(), '2026-10-30', '2026-10-29', '2026-10-28'].filter((date, index, array) => array.indexOf(date) === index)
  const selectedReportRun = runs.find(run => run.RunID === dailyRun)
  const fullRunValues: Values = {
    ...runValues, ...selectedReportRun,
    Run名称: dailyRun,
    '本井段设计井深(m)': selectedReportRun?.['设计深度(m)'] || runValues['设计深度(m)'] || '-',
    '仪器下井时间(h)': runValues['仪器井下时间(h)'] || '-',
    损失时间: runValues['损失时间(h)'] || '-',
    损失原因: runValues['损失原因'] || '-',
    定向工具类型: selectedReportRun?.定向井工具类型 || runValues['定向井工具类型'] || '-',
    使用工具归属: selectedReportRun?.工具归属 || runValues['工具归属'] || '-',
    '自营/合营': runValues['自营/合营'] || '自营',
    作业简述: dailyValues['当前作业描述'] || '-',
    重要事件: dailyValues['24h重要事件'] || '-',
    创建日期: selectedReportRun?.创建时间 || runValues['创建时间'] || well?.startTime || '-',
    起钻原因: runValues['起钻原因'] || '-',
  }
  const fullWorkValues: Values = {
    ...dailyValues,
    '24h进尺(m)': dailyValues['24h进尺(m)'] || '-',
    'ROP(m/h)': reportRange('ROP(m/h)'), '钻压(Ton)': reportRange('钻压(Ton)'),
    '排量(L/min)': reportRange('排量(L/min)'), '转速(RPM)': reportRange('转速(RPM)'),
    '泵压(Mpa)': reportRange('泵压(Mpa)'), '扭矩(Kn·M)': reportRange('扭矩(Kn·M)'),
    '振动量级(g)': reportRange('振动量级(g)'),
  }
  const fullWellItems: InfoItem[] = ['井名', '区域', '区块', '作业公司', '油田', '井型', '井别', '作业者', '设计井深', '难度类型'].map(key => ({ key, label: key }))
  const fullPlatformItems: InfoItem[] = ['平台名称', '平台类型', '补心高(m)', '泥浆泵能力', '传感器接口', '钻井总监', '钻井总监电话', '测井总监', '测井总监电话', '监督办电话', '值班监督', '报房电话', '报房位置', '泥浆泵厂家', '泥浆泵系列号', '泥浆泵缸套厂家', '泥浆泵缸套尺寸(in)', '钻机'].map(key => ({ key, label: key }))
  const fullRunItems: InfoItem[] = ['Run名称', '井眼尺寸(in)', '仪器入井时间', '仪器出井时间', '本井段设计井深(m)', '起始井深(m)', '结束井深(m)', '仪器下井时间(h)', '循环时间(h)', '纯钻时间(h)', '进尺(m)', '损失时间', '损失原因', '作业模式', '测量类型', '定向工具类型', '是否成功', '工具状态', 'Run完成情况', '作业类别', '上层套管鞋尺寸及深度', '使用工具归属', '自营/合营', '工具类型', '实钻/复测', '作业简述', '重要事件', '创建日期', '起钻原因'].map(key => ({ key, label: key }))
  const fullWorkItems: InfoItem[] = ['下步作业计划', '24h进尺(m)', '当前作业描述', 'ROP(m/h)', '24h重要事件', '本趟钻纯钻时间(h)', '本趟钻循环时间(h)', '钻压(Ton)', '排量(L/min)', '转速(RPM)', '泵压(Mpa)', '扭矩(Kn·M)', '振动量级(g)', '循环最高温度(℃)', '交接班记录(注意事项)', '当前作业模式'].map(key => ({ key, label: key }))
  fullWorkItems.push({ key: '材料及人员需求', label: '材料及人员需求', wide: true })
  const fullTrackValues: Values = {
    中靶信息: dailyValues['中靶信息'] || '-', '当前井深(m)': String(well?.currentDepth || '-'),
    '最大井斜(°)': well?.inc || '-', '垂深(m)': dailyValues['垂深(m)'] || '-',
    '造斜率(°/30m)': dailyValues['造斜率(°/30m)'] || '-',
  }
  const fullMudValues: Values = { ...dailyValues, '泥浆比重(g/cm³)': reportRange('泥浆比重(g/cm³)'), 时间: reportDate }
  const fullEffectValues: Values = {
    指令发送次数: dailyValues['指令发送次数'] || '-', 造斜率描述: dailyValues['造斜率描述'] || '-',
    '实际造斜率(°/30m)': dailyValues['实际造斜率(°/30m)'] || dailyValues['造斜率(°/30m)'] || '-',
    效果评价RSS: dailyValues['效果评价RSS'] || '-', 效果评价LWD: dailyValues['效果评价LWD'] || '-', 效果评价MWD: dailyValues['效果评价MWD'] || '-',
  }
  const bhaReportRows = bha.map(row => {
    const tool = equipment['工具动态']?.find(item => item.序列号 === row.序列号 && item.仪器类别 === row.仪器类别)
    return { ...row, SN: row.序列号, 仪器版本号: tool?.仪器版本号 || row.仪器版本 || '-', 硬件版本号: tool?.硬件版本号 || '-', 备注: row.备注 || '-' }
  })
  const personnelReportRows = personnel.map(row => ({ ...row, 人员: row.姓名, 是否分包: row.是否分包 || '否' }))
  const toolReportRows = currentEquipment.map(row => ({ ...row, '本趟钻循环时间(h)': dailyValues['本趟钻循环时间(h)'] || '-', '本趟钻纯钻时间(h)': dailyValues['本趟钻纯钻时间(h)'] || '-' }))
  const eventReportRows = events.map(row => ({ ...row, '持续时长(h)': row['持续时长'] || row['持续时长(h)'] || '-' }))
  const goToReportSection = (section: string) => {
    reportAnchorTarget.current = section
    if (reportAnchorTimer.current !== null) window.clearTimeout(reportAnchorTimer.current)
    reportAnchorTimer.current = window.setTimeout(() => {
      reportAnchorTarget.current = null
      reportAnchorTimer.current = null
      setFullReportSection(section)
    }, 900)
    setFullReportSection(section)
    document.getElementById(`daily-report-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  useEffect(() => {
    if (active !== '定向井日报' || reportMode !== 'full') return
    const scroller = document.querySelector<HTMLElement>('.data-content-body')
    if (!scroller) return
    let frame: number | null = null
    const updateActiveSection = () => {
      frame = null
      if (reportAnchorTarget.current) return
      const scrollerTop = scroller.getBoundingClientRect().top
      let current = fullReportSections[0]
      fullReportSections.forEach(section => {
        const element = document.getElementById(`daily-report-${section}`)
        if (element && element.getBoundingClientRect().top - scrollerTop <= 120) current = section
      })
      if (scroller.scrollTop > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) {
        current = fullReportSections[fullReportSections.length - 1]
      }
      setFullReportSection(previous => previous === current ? previous : current)
    }
    const scheduleUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(updateActiveSection)
    }
    updateActiveSection()
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      scroller.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame !== null) cancelAnimationFrame(frame)
      if (reportAnchorTimer.current !== null) window.clearTimeout(reportAnchorTimer.current)
      reportAnchorTimer.current = null
      reportAnchorTarget.current = null
    }
  }, [active, reportMode])
  const renderReportDates = () => <div className="data-report-dates">{reportDates.map(date => <button className={reportDate === date ? 'active' : ''} key={date} onClick={() => setReportDate(date)}>{date}</button>)}</div>

  const renderReport = () => (
    <div className="data-report-page">
      <div className="data-report-actions"><button className={`data-secondary-button ${reportMode === 'brief' ? 'is-active' : ''}`} onClick={() => setReportMode('brief')}><FileText />日报简报</button><button className={`data-secondary-button ${reportMode === 'full' ? 'is-active' : ''}`} onClick={() => setReportMode('full')}><ClipboardList />完整日报</button></div>
      {reportMode === 'brief' ? (
        <div className="data-report-sheet data-report-brief"><InfoGrid items={Object.keys(reportItems).map(key => ({ key, label: key, wide: true }))} values={reportItems} readOnly />{renderReportDates()}</div>
      ) : (
        <div className="data-report-sheet data-report-full">
          <div className="data-report-full-layout">
            <div className="data-report-full-content">
              <ReportSection id="井信息" title="井信息"><InfoGrid items={fullWellItems} values={basicValues} readOnly /></ReportSection>
              <ReportSection id="平台信息" title="平台信息"><InfoGrid items={fullPlatformItems} values={platformValues} readOnly /></ReportSection>
              <ReportSection id="Run信息" title="Run信息"><InfoGrid items={fullRunItems} values={fullRunValues} readOnly /></ReportSection>
              <ReportSection id="BHA信息" title="BHA信息"><ReportTable columns={['仪器类别', 'SN', '仪器名称', '仪器版本号', '硬件版本号', '外径(in)', '内径(mm)', '工具长度(m)', '测点零长(m)', '检查人', '失效时间', '状态', '备注']} rows={bhaReportRows} minWidth={1500} /></ReportSection>
              <ReportSection id="人员信息" title="人员信息"><ReportTable columns={['是否带队', '人员', '岗位', '班次', '上平台时间', '累计上平台时间(day)', '公司', '部门', '性别', '电话', '邮箱', '是否分包', '下平台时间', '备注']} rows={personnelReportRows} minWidth={1600} /></ReportSection>
              <ReportSection id="工具信息" title="工具信息"><div className="data-subtabs data-report-tool-tabs">{equipmentTabs.map(tab => <button className={equipmentTab === tab ? 'active' : ''} key={tab} onClick={() => setEquipmentTab(tab)}>{tab}</button>)}</div><ReportTable columns={['仪器尺寸', '仪器类别', '序列号', '名称', '位置', '入井状态', '仪器版本号', '长度(m)', '测点位置', '外径(in)', '内径(mm)', '硬件版本号', '本趟钻循环时间(h)', '本趟钻纯钻时间(h)']} rows={toolReportRows} minWidth={1700} /></ReportSection>
              <ReportSection id="关键事件" title="关键事件"><ReportTable columns={['开始时间', '结束时间', '事件描述', '持续时长(h)', '事件等级']} rows={eventReportRows} minWidth={1000} /></ReportSection>
              <ReportSection id="作业工况" title="作业工况"><InfoGrid items={fullWorkItems} values={fullWorkValues} readOnly /></ReportSection>
              <ReportSection id="轨迹信息" title="轨迹信息"><InfoGrid items={['中靶信息', '当前井深(m)', '最大井斜(°)', '垂深(m)', '造斜率(°/30m)'].map(key => ({ key, label: key }))} values={fullTrackValues} readOnly /></ReportSection>
              <ReportSection id="泥浆信息" title="泥浆信息"><InfoGrid items={[...mudItems.slice(0, 3).map(item => ({ key: item.key, label: item.label })), { key: '时间', label: '时间' }, ...mudItems.slice(3).map(item => ({ key: item.key, label: item.label }))]} values={fullMudValues} readOnly /></ReportSection>
              <ReportSection id="效果评价" title="效果评价"><InfoGrid items={['指令发送次数', '造斜率描述', '实际造斜率(°/30m)', '效果评价RSS', '效果评价LWD', '效果评价MWD'].map(key => ({ key, label: key }))} values={fullEffectValues} readOnly /></ReportSection>
              <ReportSection id="故障情况" title="故障情况"><ReportTable columns={['发生时间', '故障仪器名称', '故障仪器尺寸', '故障仪器类别', '故障仪器SN', '是否产生NPT', 'NPT时间(h)', 'NPT归属', '是否起钻', '故障定位', '现场措施', '现场情况描述']} rows={[]} minWidth={1600} /></ReportSection>
            </div>
            <nav className="data-report-anchor-nav" aria-label="完整日报章节导航">{fullReportSections.map(section => <button className={fullReportSection === section ? 'active' : ''} key={section} onClick={() => goToReportSection(section)}>{section}</button>)}</nav>
          </div>
          {renderReportDates()}
        </div>
      )}
    </div>
  )

  const renderWeekly = () => {
    const columns = ['井名', '井眼尺寸(in)', '作业公司', '井型', '作业者', '自营/合营', '钻机', '测量类型', '基础测量', '高端测量', '组合类型', '设计井深(m)', '难度类型']
    return (
      <section className="data-panel data-table-panel data-weekly-panel">
        <div className="data-panel-heading"><h1>陀螺周报</h1><button className="data-secondary-button" onClick={() => setEditor({ kind: 'weekly', index: null })}><Plus />新增</button></div>
        <div className="data-table-scroll"><table className="data-table data-weekly-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}<th className="data-sticky-action">操作</th></tr></thead><tbody>{weekly.map((row, index) => <tr key={row.id}>{columns.map(column => <td key={column}>{row[column] || '-'}</td>)}<td className="data-sticky-action"><ActionButtons onEdit={() => setEditor({ kind: 'weekly', index })} onDelete={() => removeRow('weekly', index)} /></td></tr>)}</tbody></table>{!weekly.length && <div className="data-empty data-empty--weekly">暂无周报数据，点击“新增”创建</div>}</div>
        <footer className="data-pagination"><span>共 {weekly.length} 条</span><select aria-label="每页条数" defaultValue="50"><option>50条/页</option><option>20条/页</option></select><button disabled>‹</button><strong>1</strong><button disabled>›</button><span>前往</span><input aria-label="页码" value="1" readOnly /><span>页</span></footer>
      </section>
    )
  }

  const renderContent = () => {
    if (active === '井基本信息') return renderBasic()
    if (active === '平台信息') return renderPlatform()
    if (active === '设备动态') return renderEquipment()
    if (active === '人员动态') return renderPersonnel()
    if (active === 'Run管理') return renderRuns()
    if (isRunDetail) return renderRunDetail()
    if (active === '每日填报') return renderDaily()
    if (active === '定向井日报') return renderReport()
    if (active === '陀螺周报') return renderWeekly()
    return null
  }

  return (
    <main className="data-page">
      <header className="data-header">
        <button className="data-brand" onClick={() => navigate('/support')} title="返回作业支持列表"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>数据填报</strong></button>
        <span>井名：{well?.name || '未选择井'}</span>
        <HeaderUser />
      </header>
      <div className="data-workspace">
        <aside className="data-sidebar">
          <button className="data-sidebar-section" onClick={() => setOperationOpen(!operationOpen)}><Monitor /><span>作业管理</span>{operationOpen ? <ChevronUp /> : <ChevronDown />}</button>
          {operationOpen && <div className="data-sidebar-children">{mainSections.map(({ name, icon: Icon }) => <button className={active === name ? 'active' : ''} key={name} onClick={() => openSection(name)}><Icon /><span>{name}</span></button>)}</div>}
          <div className={`data-sidebar-run ${active === 'Run管理' || isRunDetail ? 'active-parent' : ''}`}><button className="data-sidebar-section" onClick={() => openSection('Run管理')}><Radio /><span>Run管理</span></button><button className="data-sidebar-toggle" aria-label={runOpen ? '收起Run列表' : '展开Run列表'} onClick={() => setRunOpen(!runOpen)}>{runOpen ? <ChevronUp /> : <ChevronDown />}</button></div>
          {runOpen && <div className="data-sidebar-children data-run-links">{runs.map(run => <button className={active === run.RunID ? 'active' : ''} key={run.id} onClick={() => openSection(run.RunID)}><Radio /><span>{run.RunID}</span></button>)}</div>}
          {[{ name: '每日填报', icon: List }, { name: '定向井日报', icon: FileText }, { name: '陀螺周报', icon: Bell }].map(({ name, icon: Icon }) => <button className={`data-sidebar-standalone ${active === name ? 'active' : ''}`} key={name} onClick={() => openSection(name)}><Icon /><span>{name}</span></button>)}
        </aside>
        <section className="data-content">
          <div className="data-tabs" role="tablist" aria-label="数据填报页签">{tabs.map(tab => <div key={tab} className={`data-tab ${active === tab ? 'active' : ''}`}><button role="tab" aria-selected={active === tab} className="data-tab-select" onClick={() => setActive(tab)}>{tab}</button>{tabs.length > 1 && <button className="data-tab-close" aria-label={`关闭${tab}`} onClick={() => closeTab(tab)}><X /></button>}</div>)}</div>
          <div className="data-content-body">{renderContent()}</div>
        </section>
      </div>
      {editor && <RecordEditor title={`${editor.index === null ? '新建' : '编辑'}${editorTitles[editor.kind]}`} fields={editorFields[editor.kind]} initial={editorInitial()} onClose={() => setEditor(null)} onSave={saveEditor} />}
    </main>
  )
}
