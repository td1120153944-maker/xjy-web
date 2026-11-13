import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  BarChart3, BookOpen, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CirclePlus,
  Copy, KeyRound, LayoutDashboard, ListTree, Menu as MenuIcon, Monitor, PanelTop,
  Pencil, Plus, RefreshCw, Save, Search, ShieldCheck, Trash2, UserCheck,
  Users, UsersRound, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useConfirm } from '../components/ConfirmContext'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

type PageId = 'groups' | 'users' | 'functions' | 'roles' | 'userRoles' | 'fs' | 'platforms' | 'dictionary' | 'menus' | 'dashboard' | 'stats' | 'entrances' | 'sso'
type Values = Record<string, string>
interface EditorField { key: string, label: string, required?: boolean, options?: string[] }
interface EditorConfig { title: string, fields: EditorField[], initial?: Values, onSave: (values: Values) => void }

const labels: Record<PageId, string> = {
  groups: '群组管理', users: '用户管理', functions: '功能管理', roles: '角色权限', userRoles: '用户角色管理', fs: 'FS管理', platforms: '平台管理',
  dictionary: '字典管理', menus: '菜单配置', dashboard: '大屏配置', stats: '统计数据管理', entrances: '入口配置', sso: '第三方 SSO 配置',
}
const mainPages: { id: PageId, icon: typeof Users }[] = [
  { id: 'groups', icon: UsersRound }, { id: 'users', icon: Users }, { id: 'functions', icon: ListTree }, { id: 'roles', icon: ShieldCheck }, { id: 'userRoles', icon: UserCheck },
]
const otherPages: { id: PageId, icon: typeof Users }[] = [
  { id: 'menus', icon: MenuIcon }, { id: 'dashboard', icon: LayoutDashboard }, { id: 'stats', icon: BarChart3 }, { id: 'entrances', icon: PanelTop }, { id: 'sso', icon: KeyRound },
]

function useEditor() {
  const [config, setConfig] = useState<EditorConfig | null>(null)
  return { open: setConfig, modal: config ? <Editor key={config.title} config={config} onClose={() => setConfig(null)} /> : null }
}
function Editor({ config, onClose }: { config: EditorConfig, onClose: () => void }) {
  const [values, setValues] = useState<Values>(config.initial || {})
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const missing = config.fields.find(field => field.required && !values[field.key]?.trim())
    if (missing) { toast.error(`请填写${missing.label}`); return }
    config.onSave(values)
    onClose()
  }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><form className="ops-editor" onSubmit={submit}><header><h2>{config.title}</h2><button type="button" onClick={onClose} aria-label="关闭"><X /></button></header><div className="ops-editor-grid">{config.fields.map(field => <label key={field.key}><span>{field.required && <b>*</b>}{field.label}</span>{field.options ? <select aria-label={field.label} value={values[field.key] || ''} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}><option value="">请选择</option>{field.options.map(option => <option key={option}>{option}</option>)}</select> : <input aria-label={field.label} value={values[field.key] || ''} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))} placeholder={`请输入${field.label}`} />}</label>)}</div><footer><button type="submit" className="ops-primary">确定</button><button type="button" onClick={onClose}>取消</button></footer></form></div>
}
function Table({ columns, rows, empty = '暂无数据' }: { columns: string[], rows: ReactNode[][], empty?: string }) {
  return <div className="ops-table-wrap"><table className="ops-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>{!rows.length && <div className="ops-empty">{empty}</div>}</div>
}
function Heading({ title, children }: { title: string, children?: ReactNode }) {
  return <div className="ops-panel-heading"><h2>{title}</h2><div className="ops-toolbar">{children}</div></div>
}
function Actions({ onEdit, onDelete, onAdd, onCopy }: { onEdit?: () => void, onDelete?: () => void, onAdd?: () => void, onCopy?: () => void }) {
  const confirm = useConfirm()
  const requestDelete = () => onDelete && confirm({ title: '删除记录', description: '删除后，该记录及其相关配置将无法恢复。', onConfirm: onDelete })
  return <div className="ops-row-actions">{onAdd && <button title="新增子项" aria-label="新增子项" onClick={onAdd}><CirclePlus /></button>}{onCopy && <button title="复制" aria-label="复制" onClick={onCopy}><Copy /></button>}{onEdit && <button title="编辑" aria-label="编辑" onClick={onEdit}><Pencil /></button>}{onDelete && <button title="删除" aria-label="删除" onClick={requestDelete}><Trash2 /></button>}</div>
}
function Pagination({ count, size = 20 }: { count: number, size?: number }) {
  return <footer className="ops-pagination"><span>共 {count} 条</span><select aria-label="每页条数" defaultValue={String(size)}><option value="20">20条/页</option><option value="50">50条/页</option></select><button disabled><ChevronLeft /></button><strong>1</strong><button disabled={count <= size}><ChevronRight /></button><span>前往</span><input aria-label="页码" value="1" readOnly /><span>页</span></footer>
}
function SearchInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (value: string) => void, placeholder: string }) {
  return <label className="sys-search"><Search /><input aria-label={label} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>
}

const groupNames = ['墨西哥', 'paste', '重庆', '重庆', '重庆', '重庆', '重庆', '重庆', '重庆', '重庆', '重庆', 'x', 'test', '墨西哥', 'paste']
function GroupsPage() {
  const { open, modal } = useEditor()
  const confirm = useConfirm()
  const [tab, setTab] = useState('普通群组')
  const [search, setSearch] = useState('')
  const [groups, setGroups] = useState(() => Array.from({ length: 98 }, (_, index) => ({ id: String(index + 1), name: groupNames[index % groupNames.length] })))
  const visible = groups.filter(group => group.name.toLowerCase().includes(search.toLowerCase())).slice(0, 50)
  return <section className="ops-page-panel"><Heading title=""><SearchInput label="搜索群组" value={search} onChange={setSearch} placeholder="请输入群组名称" /><button onClick={() => open({ title: `新建${tab}`, fields: [{ key: 'name', label: '群组名称', required: true }], onSave: values => { setGroups(current => [{ id: String(Date.now()), name: values.name }, ...current]); toast.success('群组已新增') } })}><Plus />新建{tab}</button></Heading><div className="ops-subtabs">{['普通群组', '特殊群组', '曲线群组'].map(item => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div><Table columns={['序号', '群组名称', '操作']} rows={visible.map((group, index) => [index + 1, group.name, <div className="ops-text-actions"><button onClick={() => toast.info(`${group.name}成员配置`)}>成员</button><button onClick={() => toast.info(`${group.name}详情`)}>详情</button><button onClick={() => open({ title: '编辑群组', fields: [{ key: 'name', label: '群组名称', required: true }], initial: group, onSave: values => { setGroups(current => current.map(item => item.id === group.id ? { ...item, name: values.name } : item)); toast.success('群组已保存') } })}>编辑</button><button onClick={() => confirm({ title: '删除群组', name: group.name, description: '删除后，该群组及其成员配置将无法恢复。', onConfirm: () => setGroups(current => current.filter(item => item.id !== group.id)) })}>删除</button></div>])} /><Pagination count={groups.length} size={50} />{modal}</section>
}

const initialUsers = [
  ['evget', 'evget', '系统管理员', ''], ['cosl', 'cosl', '系统管理员', ''], ['zhaolei', '赵磊', '系统管理员', '哈里伯顿'], ['zhangdy', '张殿洋', '系统管理员', '哈里伯顿'],
  ['xiezxa', '谢梓溪', '系统管理员', '研究院'], ['fuyitest', '测试', '系统管理员', '深圳作业公司'], ['yangya', 'yay', '技术支持', '缅甸作业公司'], ['zfy_test_1', 'zfy_test_1', '技术支持,作业经理', '缅甸作业公司'],
  ['fuyi_normal', 'fuyi_normal', '工程师', '深圳作业公司'], ['ztr', '湛兴凸测试', '技术支持', '缅甸作业公司'], ['yangy_ptyh', '杨颜普通', '技术支持,作业经理', '缅甸作业公司'], ['zhanxt', '湛兴凸', '系统管理员', '陆地作业公司'],
  ['liyang', '李杨', '系统管理员', '陆地作业公司'], ['test', 'test', '系统管理员', '深圳作业公司'], ['test3', 'test3', '', '深圳作业公司'], ['test_public', 'test_public', '工程师', '深圳作业公司'],
]
function UsersPage() {
  const { open, modal } = useEditor()
  const confirm = useConfirm()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(initialUsers)
  const fields: EditorField[] = [{ key: '0', label: '用户名', required: true }, { key: '1', label: '姓名', required: true }, { key: '2', label: '角色', options: ['系统管理员', '技术支持', '工程师', '作业经理'] }, { key: '3', label: '公司' }]
  const edit = (index?: number) => open({ title: index === undefined ? '新建用户' : '编辑用户', fields, initial: index === undefined ? {} : Object.fromEntries(users[index].map((value, key) => [String(key), value])), onSave: values => { const row = [values['0'], values['1'], values['2'] || '', values['3'] || '']; if (index === undefined) setUsers(current => [row, ...current]); else setUsers(current => current.map((item, rowIndex) => rowIndex === index ? row : item)); toast.success('用户信息已保存') } })
  return <section className="ops-page-panel"><Heading title=""><SearchInput label="搜索用户" value={search} onChange={setSearch} placeholder="请输入姓名或用户名" /><button onClick={() => edit()}><Plus />新建用户</button></Heading><Table columns={['', '用户名', '姓名', '角色', '公司', '创建时间', '操作']} rows={users.filter(row => `${row[0]}${row[1]}`.toLowerCase().includes(search.toLowerCase())).map((row, index) => [index + 1, ...row, `2026-10-${String(31 - index).padStart(2, '0')} 12:00:00`, <div className="ops-text-actions"><button onClick={() => edit(index)}>编辑</button><button onClick={() => toast.success(`${row[0]}密码已重置`)}>重置密码</button><button onClick={() => confirm({ title: '删除用户', name: `${row[1]}（${row[0]}）`, description: '删除后，该用户及其角色绑定关系将无法恢复。', onConfirm: () => setUsers(current => current.filter(item => item[0] !== row[0])) })}>删除</button></div>])} /><Pagination count={users.length} size={50} />{modal}</section>
}

const permissionRows = [['作业支持-建井', 'JOB_SUPPORT_CREATE'], ['作业支持-工程分析', 'JOB_SUPPORT_ANALYSIS'], ['作业支持-质量统计', 'JOB_SUPPORT_QUALITY'], ['作业支持-WITSML拉取', 'JOB_SUPPORT_WITSLML_PULL'], ['作业支持-数据填报', 'JOB_SUPPORT_DATA_FILL'], ['作业支持-实时监控', 'JOB_SUPPORT_MONITOR'], ['作业支持-数字孪生', 'JOB_SUPPORT_DIGITAL'], ['作业支持-Live', 'JOB_SUPPORT_LIVE']]
function FunctionsPage() {
  const { open, modal } = useEditor()
  const [selected, setSelected] = useState('作业支持')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState(permissionRows)
  const tree = ['人员访问统计', '个人榜单', '璇玑云应用情况统计', '用户活动监控', '系统管理', '群组管理', '用户管理', '功能管理', '角色权限', 'FS', 'FS管理', '平台管理', '用户角色管理', '元数据管理', '字典管理', '菜单配置', '大屏配置', '统计数据管理', '入口配置', '数据填报', 'Run管理', '每日填报', '作业支持'].filter(item => item.includes(search))
  const edit = (index?: number) => open({ title: index === undefined ? '新增操作权限' : '编辑操作权限', fields: [{ key: '0', label: '操作权限名称', required: true }, { key: '1', label: '权限编码', required: true }], initial: index === undefined ? {} : { '0': rows[index][0], '1': rows[index][1] }, onSave: values => { if (index === undefined) setRows(current => [...current, [values['0'], values['1']]]); else setRows(current => current.map((row, rowIndex) => rowIndex === index ? [values['0'], values['1']] : row)); toast.success('操作权限已保存') } })
  return <div className="ops-function-page"><div className="ops-directory"><label>目录：<select aria-label="目录"><option>Web</option></select></label><button onClick={() => toast.success('功能列表已刷新')}><RefreshCw />刷新</button></div><div className="ops-function-content"><aside className="ops-inner-tree"><Heading title="功能列表" /><SearchInput label="搜索功能" value={search} onChange={setSearch} placeholder="搜索功能名称" />{tree.map(item => <button className={selected === item ? 'active' : ''} key={item} onClick={() => setSelected(item)}>{item}</button>)}</aside><section className="ops-function-detail"><Heading title={`功能详情 / ${selected}`} /><Heading title="操作权限"><SearchInput label="搜索操作权限" value={search} onChange={setSearch} placeholder="搜索操作名称 / 权限编码" /><button className="ops-primary" onClick={() => edit()}><Plus />新增操作权限</button></Heading><Table columns={['', '操作权限名称', '权限编码', '操作']} rows={rows.map((row, index) => [index + 1, row[0], row[1], <Actions onEdit={() => edit(index)} onDelete={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))} />])} /></section></div>{modal}</div>
}

const rolePermissions = ['人员访问统计', '个人榜单', '璇玑云应用情况统计', '用户活动监控', '系统管理', '群组管理', '用户管理', '功能管理', '角色权限', 'FS', 'FS管理', '平台管理', '用户角色管理', '元数据管理', '字典管理', '菜单配置', '大屏配置', '统计数据管理', '入口配置', '数据填报', 'Run管理', '每日填报']
function RolesPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => Object.fromEntries(rolePermissions.slice(0, 4).map(item => [item, true])))
  const [saved, setSaved] = useState<Record<string, boolean>>(() => Object.fromEntries(rolePermissions.slice(0, 4).map(item => [item, true])))
  const [search, setSearch] = useState('')
  const [changedOnly, setChangedOnly] = useState(false)
  const added = rolePermissions.filter(item => checked[item] && !saved[item]).length
  const removed = rolePermissions.filter(item => !checked[item] && saved[item]).length
  return <div className="ops-role-page"><div className="ops-directory"><label>目录：<select aria-label="目录"><option>Web</option></select></label><button onClick={() => { setSaved(checked); toast.success('角色权限已保存') }}><Save />保存</button></div><div className="ops-role-content"><aside className="ops-inner-tree"><Heading title="角色列表"><button onClick={() => toast.info('新增角色')}><Plus /></button><button onClick={() => toast.info('编辑角色')}><Pencil /></button><button onClick={() => toast.info('删除角色')}><Trash2 /></button></Heading>{['工程师', '管理人员', '技术支持', '区域管理员', '作业经理'].map((item, index) => <button className={index === 0 ? 'active' : ''} key={item}>{item}</button>)}</aside><section className="ops-permission-panel"><Heading title="功能权限配置" /><div className="ops-permission-filter"><SearchInput label="搜索角色权限" value={search} onChange={setSearch} placeholder="搜索功能或权限名称" /><button className={!changedOnly ? 'active' : ''} onClick={() => setChangedOnly(false)}>全部</button><button className={changedOnly ? 'active' : ''} onClick={() => setChangedOnly(true)}>本次修改</button><span>本次变更 <b>+{added}</b> <i>-{removed}</i></span></div><div className="ops-permission-tree">{rolePermissions.filter(item => item.includes(search) && (!changedOnly || checked[item] !== saved[item])).map((item, index) => <label key={item} style={{ paddingLeft: 12 + (index % 4 === 0 ? 0 : 32) }}><input type="checkbox" checked={Boolean(checked[item])} onChange={event => setChecked(current => ({ ...current, [item]: event.target.checked }))} />{item}</label>)}</div></section></div></div>
}

type UserRow = { id: string, username: string, name: string, company: string }
const boundUsers: UserRow[] = [['zhuofy', 'zhuofy', '缅甸作业公司'], ['fuyi_normal', 'fuyi_normal', '深圳作业公司'], ['td-TEST', 'Tangdong', '墨西哥项目组'], ['test_public', 'test_public', '深圳作业公司']].map((row, index) => ({ id: `b${index}`, username: row[0], name: row[1], company: row[2] }))
const availableUsers: UserRow[] = [['hzxn1', 'hzx', '研究院'], ['fuyitest', '测试', '深圳作业公司'], ['Huangpy', '黄鹏宇', '缅甸作业公司'], ['liyang', '李杨', '陆地作业公司'], ['xiezxa', '谢梓溪', '研究院'], ['zfy_test_1', 'zfy_test_1', '缅甸作业公司'], ['zjj02', '张剑君', '哈里伯顿'], ['yangya', 'yay', '缅甸作业公司'], ['tangdong', 'tangdong', ''], ['zhangdy', '张殿洋', '哈里伯顿'], ['huqza', 'hqz', '陆地作业公司'], ['zhaolei', '赵磊', '哈里伯顿'], ['yangy_ptyh', '杨颜普通', '缅甸作业公司'], ['evget', 'evget', ''], ['zhanxt', '湛兴凸', '陆地作业公司'], ['cosl', 'cosl', ''], ['test', 'test', '深圳作业公司']].map((row, index) => ({ id: `a${index}`, username: row[0], name: row[1], company: row[2] }))
function UserRolesPage() {
  const [bound, setBound] = useState(boundUsers)
  const [available, setAvailable] = useState(availableUsers)
  const [leftSelected, setLeftSelected] = useState<string[]>([])
  const [rightSelected, setRightSelected] = useState<string[]>([])
  const move = (right: boolean) => {
    const selected = right ? rightSelected : leftSelected
    if (!selected.length) { toast.info('请先选择用户'); return }
    const source = right ? available : bound
    const moving = source.filter(row => selected.includes(row.id))
    if (right) { setBound(current => [...current, ...moving]); setAvailable(current => current.filter(row => !selected.includes(row.id))); setRightSelected([]) }
    else { setAvailable(current => [...current, ...moving]); setBound(current => current.filter(row => !selected.includes(row.id))); setLeftSelected([]) }
  }
  const panel = (title: string, rows: UserRow[], selected: string[], setSelected: (ids: string[]) => void) => <section className="ops-transfer-panel"><Heading title={title}><label>公司<select aria-label={`${title}公司`}><option>请选择</option><option>深圳作业公司</option><option>缅甸作业公司</option></select></label><label>姓名<input aria-label={`${title}姓名`} placeholder="请输入用户名或姓名" /></label></Heading><Table columns={['', '用户名', '姓名', '公司']} rows={rows.map((row, index) => [<span className="ops-transfer-index">{index + 1}<input type="checkbox" aria-label={`选择${row.username}`} checked={selected.includes(row.id)} onChange={event => setSelected(event.target.checked ? [...selected, row.id] : selected.filter(id => id !== row.id))} /></span>, row.username, row.name, row.company])} /><Pagination count={rows.length} /></section>
  return <div className="ops-transfer-page sys-user-roles"><aside className="ops-inner-tree"><h2>角色列表</h2>{['工程师', '管理人员', '技术支持', '区域管理员', '作业经理'].map((item, index) => <button className={index === 0 ? 'active' : ''} key={item}>{item}</button>)}</aside>{panel('已绑定用户', bound, leftSelected, setLeftSelected)}<div className="ops-transfer-actions"><button aria-label="绑定用户" onClick={() => move(true)}><ChevronRight /></button><button aria-label="解绑用户" onClick={() => move(false)}><ChevronLeft /></button></div>{panel('可绑定用户', available, rightSelected, setRightSelected)}</div>
}

function FsPage() {
  const { open, modal } = useEditor()
  const [tab, setTab] = useState('台账')
  const [rows, setRows] = useState<Values[]>([])
  return <section className="ops-page-panel"><div className="sys-info-banner">欢迎使用FS管理，可提前录入FS编号，FS上线后会自动更新该FS信息，如果该FS长期未上线也可做台账管理！</div><Heading title=""><div className="ops-subtabs sys-inline-tabs">{['台账', '其他'].map(item => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div><label>主机名<input aria-label="主机名" placeholder="请输入主机名" /></label><label>公司<input aria-label="FS公司" placeholder="请输入公司" /></label><label>状态<select aria-label="FS状态"><option>全部</option><option>在线</option><option>离线</option></select></label><button onClick={() => open({ title: '新增FS', fields: [{ key: 'host', label: '主机名', required: true }, { key: 'company', label: '公司' }, { key: 'platform', label: '平台名称' }, { key: 'ip', label: 'IP', required: true }], onSave: values => { setRows(current => [...current, values]); toast.success('FS已新增') } })}><Plus />新增</button></Heading><Table columns={['主机名', '公司', '平台名称', 'IP', '最后上线时间', '状态', '操作']} rows={rows.map((row, index) => [row.host, row.company, row.platform, row.ip, '-', '离线', <Actions onDelete={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))} />])} /><Pagination count={rows.length} size={50} />{modal}</section>
}
function PlatformsPage() {
  const { open, modal } = useEditor()
  const [rows, setRows] = useState<Values[]>([])
  return <section className="ops-page-panel"><Heading title=""><button onClick={() => open({ title: '新增平台', fields: [{ key: 'ip', label: 'IP段', required: true }, { key: 'name', label: '平台名称', required: true }], onSave: values => { setRows(current => [...current, values]); toast.success('平台已新增') } })}><Plus />新增</button></Heading><Table columns={['IP段', '平台名称', '操作']} rows={rows.map((row, index) => [row.ip, row.name, <Actions onDelete={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))} />])} /><Pagination count={rows.length} size={50} />{modal}</section>
}

const dictionaryRows = [['Jack-upDrillingRig', '自升式钻井平台', 'Jack-up Drilling Rig'], ['SemiSubmersibleDrillingPlatform', '半潜式钻井平台', 'Semi-Submersible Drilling Rig'], ['ModularizedDrillingRig', '模块钻机（导管架）', 'Modular Drilling Rig'], ['LandDrillingRig', '陆地钻机', 'ludizuanji'], ['DrillingShip', '钻井船', 'DrillShip']]
function DictionaryPage() {
  const { open, modal } = useEditor()
  const [selected, setSelected] = useState('平台类型')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState(dictionaryRows)
  const categories = ['作业模式', '平台类型', '定向工具类型', '测量类型', '完成情况', 'RUN完成情况', '实钻/复测', '工具类型', '当前作业模式', '岗位级别', '部门', '井眼尺寸', '服务类型', 'Run信息-作业模式', '作业类别', '井次作业完成情况']
  const edit = (index?: number) => open({ title: index === undefined ? '新增字典项' : '编辑字典项', fields: [{ key: '0', label: '编码', required: true }, { key: '1', label: '名称', required: true }, { key: '2', label: '英文名' }], initial: index === undefined ? {} : { '0': rows[index][0], '1': rows[index][1], '2': rows[index][2] }, onSave: values => { if (index === undefined) setRows(current => [...current, [values['0'], values['1'], values['2'] || '']]); else setRows(current => current.map((row, rowIndex) => rowIndex === index ? [values['0'], values['1'], values['2'] || ''] : row)); toast.success('字典项已保存') } })
  return <div className="sys-dictionary-page"><div className="ops-directory"><label>字典分类：<input aria-label="字典分类搜索" placeholder="请输入字典分类" /></label><button onClick={() => edit()}><Plus />新增</button></div><div className="ops-function-content"><aside className="ops-inner-tree"><Heading title="字典分类"><button onClick={() => toast.info('新增字典分类')}><Plus /></button><button onClick={() => toast.info('编辑字典分类')}><Pencil /></button><button onClick={() => toast.info('删除字典分类')}><Trash2 /></button></Heading>{categories.map(item => <button className={selected === item ? 'active' : ''} key={item} onClick={() => setSelected(item)}>{item}</button>)}</aside><section className="ops-function-detail"><Heading title={selected}><SearchInput label="搜索字典" value={search} onChange={setSearch} placeholder="请输入模糊搜索内容" /></Heading><Table columns={['', '编码', '名称', '英文名', '排序', '操作']} rows={rows.filter(row => row.join('').toLowerCase().includes(search.toLowerCase())).map((row, index) => [index + 1, ...row, index + 1, <Actions onEdit={() => edit(index)} onDelete={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))} />])} /><Pagination count={rows.length} size={50} /></section></div>{modal}</div>
}

const initialMenus = [['人员访问统计', 'Visits', '是', '否', '路由', '/personstat', '0'], ['系统管理', 'System', '是', '是', '路由', '/systemmanage', '1'], ['数据填报', 'Data Report', '是', '是', '路由', '/datafilling', '5'], ['witsml拉取', 'witsml拉取', '是', '是', '路由', '/witsml', '25'], ['运维管理', 'ops', '是', '是', '新标签页', '/ommanage', '100'], ['IDEAS注册申请', 'IDEAS', '是', '是', '路由', '/ideas-registration', '101'], ['网站主页', 'Website Home', '是', '否', '微前端嵌入', 'Website Home', '110'], ['移动端', 'Mobile', '是', '是', '微前端嵌入', '/mobile/appEntry', '111']]
function MenusPage() {
  const { open, modal } = useEditor()
  const [rows, setRows] = useState(initialMenus)
  const fields: EditorField[] = [{ key: '0', label: '菜单名称', required: true }, { key: '1', label: '英文名称', required: true }, { key: '4', label: '显示方式', options: ['路由', '新标签页', '微前端嵌入'] }, { key: '5', label: '路径', required: true }, { key: '6', label: '排序' }]
  const edit = (index?: number) => open({ title: index === undefined ? '新增菜单' : '编辑菜单', fields, initial: index === undefined ? {} : Object.fromEntries(rows[index].map((value, key) => [String(key), value])), onSave: values => { const row = [values['0'], values['1'], '是', '是', values['4'] || '路由', values['5'], values['6'] || '0']; if (index === undefined) setRows(current => [...current, row]); else setRows(current => current.map((item, rowIndex) => rowIndex === index ? row : item)); toast.success('菜单配置已保存') } })
  return <section className="ops-page-panel"><Heading title=""><button onClick={() => edit()}><Plus />新增菜单</button></Heading><Table columns={['菜单名称', '英文名称', '是否显示', '是否可点击', '显示方式', '路径', '排序', '操作']} rows={rows.map((row, index) => [...row, <Actions onAdd={() => edit()} onEdit={() => edit(index)} onDelete={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))} />])} />{modal}</section>
}

const regionRows = [['Region_XinJiang', '新疆', '87.6', '43.8'], ['Region_DQ', '大庆', '125', '46.58'], ['YJ', '燕郊', '116.81', '39.94'], ['dh', '东海', '123', '28'], ['Region_Liaohe', '辽河', '122.07', '41.12'], ['bohai', '渤海', '120', '38'], ['Region_neimeng', '内蒙古', '111.75', '40.84'], ['Region_Indonesia', '印尼', '120', '-5'], ['Region_DongGu', '天津市滨海新区东沽', '117.72', '39.02'], ['Region_Misang', '米桑', '47.07', '31.9'], ['Region_Shengli', '胜利', '118.58', '37.45'], ['Region_nhx', '南海西部', '109', '19'], ['Region_shenzhen', '南海东部', '115', '21'], ['Country_Mexico', '墨西哥', '-102', '23'], ['CH', '中国', '105', '35'], ['Region_CQ', '重庆', '106.56', '29.56']]
function DashboardPage() {
  const { open, modal } = useEditor()
  const [selected, setSelected] = useState('作业区域管理')
  const modules = ['基础配置', '作业区域管理', '地图与统计', '作业地图', '全球作业统计', '仪器类型', '仪器校准', '仪器故障动态列', '大屏设置', '用户大屏关联', '大屏配置']
  return <div className="sys-dashboard-page"><Heading title=""><button onClick={() => toast.success('数据结构已更新')}>更新数据结构</button><button onClick={() => toast.success('当前数据已初始化')}>初始化当前数据</button><button onClick={() => toast.success('全部数据已初始化')}>初始化全部数据</button><button className="ops-primary" onClick={() => toast.info('区域标签设置')}>区域标签设置</button></Heading><div className="ops-function-content"><aside className="ops-inner-tree"><h2>模块</h2>{modules.map(item => <button className={selected === item ? 'active' : ''} key={item} onClick={() => setSelected(item)}>{item}</button>)}</aside><section className="ops-function-detail"><Heading title={selected} /><Table columns={['', '区域编码', '作业区域', '经度', '纬度', '是否在海上', '是否国内', '操作']} rows={selected === '作业区域管理' ? regionRows.map((row, index) => [index + 1, ...row, '否', index === 7 || index === 13 ? '否' : '是', <Actions onEdit={() => open({ title: '编辑作业区域', fields: [{ key: '0', label: '区域编码', required: true }, { key: '1', label: '作业区域', required: true }, { key: '2', label: '经度' }, { key: '3', label: '纬度' }], initial: Object.fromEntries(row.map((value, key) => [String(key), value])), onSave: () => toast.success('作业区域已保存') })} />]) : []} /></section></div>{modal}</div>
}

const totalFields = ['总井次(次)', '总进尺(m)', '作业成功率(%)', '累计循环时间(h)', '累计入井时间(h)', '累计纯钻时间(h)']
const yearFields = ['年份', '璇玑作业成功率(%)', '一次入成功率(%)', '总井次(次)', '总进尺(m)', '作业成功率(%)', '累计循环时间(h)', '累计入井时间(h)', '累计纯钻时间(h)', '最大循环时间(h)', '最大入井时间(h)', '最大纯钻时间(h)', '最大进尺(m)', '最高循环温度(℃)', '最大井深(m)', '最大泥浆比重(g/cm³)']
function StatsPage() {
  const [enabled, setEnabled] = useState(false)
  const [values, setValues] = useState<Values>({ 年份: '2026' })
  const [companies, setCompanies] = useState([{ id: '1', name: '缅甸作业公司', wells: '12', footage: '36520.5' }])
  const update = (key: string, value: string) => setValues(current => ({ ...current, [key]: value }))
  const fields = (items: string[]) => <div className="sys-stats-fields">{items.map(item => <label key={item}><span>{item}</span><input aria-label={item} value={values[item] || (item === '年份' ? '2026' : '0')} onChange={event => update(item, event.target.value)} /></label>)}</div>
  return <div className="sys-stats-page"><div className="sys-stats-toolbar"><button>手机端统计数据刷新</button><label>统计年份：<input aria-label="统计年份" value="2026年" readOnly /></label><div><span>禁用</span><button role="switch" aria-checked={enabled} aria-label="启用统计" className={`sys-switch ${enabled ? 'active' : ''}`} onClick={() => setEnabled(!enabled)}><i /></button><span>启用</span><button className="ops-primary" onClick={() => toast.success('统计数据已保存')}><Save />保存</button></div></div><section className="sys-stats-section"><h2>总统计</h2>{fields(totalFields)}</section><section className="sys-stats-section"><h2>周统计</h2>{fields(totalFields.slice(0, 2))}</section><section className="sys-stats-section"><h2>年度统计</h2>{fields(yearFields)}</section><section className="sys-stats-section"><Heading title="公司统计"><button onClick={() => { setCompanies([]); toast.success('公司统计已初始化') }}>初始化</button><button onClick={() => { setCompanies(current => [...current, { id: String(Date.now()), name: '新作业公司', wells: '0', footage: '0' }]); toast.success('公司已新增') }}>新增</button></Heading><Table columns={['公司名称', '井次', '进尺(m)', '操作']} rows={companies.map(company => [company.name, company.wells, company.footage, <Actions onDelete={() => setCompanies(current => current.filter(item => item.id !== company.id))} />])} /></section></div>
}

type EntranceRow = { id: string, name: string, english: string, type: string, target: string, visible: boolean, disabled: boolean, source: string, image: string }
const entranceSeed = [
  ['作业支持', 'Drilling Support', '内部页面', '/jobsupport', 'operation-support.png'], ['作业动态', 'Well Dynamics', '内部页面', '/workdynamic', 'operation-dynamics.png'], ['工具动态', 'Instrument Dynamics', '内部页面', '/tooldynamic', 'tool-dynamics.png'], ['人员动态', 'Engineer Dynamics', '内部页面', '/persondynamic', 'personnel-dynamics.png'],
  ['统计分析', 'Statistical Analysis', '内部页面', '/statanalysis', 'statistics.png'], ['故障跟踪', 'Fault Tracking', '接口获取', '/identity/auth/getThirdPartyRedirectUrl', 'fault-tracking.png'], ['大屏显示', 'Analysis Dashboard', '内部页面', '/scrollLargeScreen', 'large-screen.png'], ['随钻定向产品线周报', 'Knowledge Base', '接口获取', '/identity/auth/getThirdPartyRedirectUrl', 'weekly-report.png'],
  ['产品手册', 'Product Manual', '接口获取', '/identity/auth/getThirdPartyRedirectUrl', 'product-manual.png'], ['钻井优化', 'Drilling Optimization', '接口获取', '/identity/auth/getThirdPartyRedirectUrl', 'smart-factory.png'], ['智能测试', 'Intelligent Test', '接口获取', '/identity/auth/getThirdPartyRedirectUrl', 'smart-testing.png'], ['工程师助手', 'Assistant', '接口获取', '/identity/auth/getThirdPartyRedirectUrl', 'engineer-assistant.png'],
]
function EntrancesPage() {
  const { open, modal } = useEditor()
  const [tab, setTab] = useState('主站首页导航')
  const [preview, setPreview] = useState(true)
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<EntranceRow[]>(entranceSeed.map((row, index) => ({ id: String(index), name: row[0], english: row[1], type: row[2], target: row[3], visible: true, disabled: false, source: '自定义', image: `/images/modules/${row[4]}` })))
  const update = (id: string, key: 'visible' | 'disabled') => setRows(current => current.map(row => row.id === id ? { ...row, [key]: !row[key] } : row))
  const toggle = (checked: boolean, onClick: () => void, label: string) => <button role="switch" aria-checked={checked} aria-label={label} className={`sys-switch ${checked ? 'active' : ''}`} onClick={onClick}><i /></button>
  return <div className="sys-entrances-page"><div className="ops-subtabs"><button className={tab === '主站首页导航' ? 'active' : ''} onClick={() => setTab('主站首页导航')}>主站首页导航</button><button className={tab === '手机工作台' ? 'active' : ''} onClick={() => setTab('手机工作台')}>手机工作台</button></div><div className="sys-entrance-layout"><section className="sys-entrance-list"><Heading title=""><SearchInput label="搜索入口" value={search} onChange={setSearch} placeholder="搜索入口名称" /><select aria-label="入口状态"><option>全部显示状态</option><option>显示</option><option>隐藏</option></select><div className="sys-preview-actions">{toggle(preview, () => setPreview(!preview), '布局预览')}<span>布局预览</span><button onClick={() => open({ title: '新增入口', fields: [{ key: 'name', label: '入口名称', required: true }, { key: 'english', label: '英文名称' }, { key: 'target', label: '跳转目标', required: true }], onSave: values => { setRows(current => [...current, { id: String(Date.now()), name: values.name, english: values.english || '', type: '内部页面', target: values.target, visible: true, disabled: false, source: '自定义', image: '/images/modules/operation-support.png' }]); toast.success('入口已新增') } })}><Plus />新增入口</button></div></Heading><Table columns={['序号', '图标', '入口名称', '英文名称', '跳转类型', '跳转目标', '是否显示', '是否禁用', '来源', '操作']} rows={rows.filter(row => row.name.includes(search)).map((row, index) => [index + 1, <img className="sys-entry-icon" src={row.image} alt="" />, row.name, row.english, row.type, row.target, toggle(row.visible, () => update(row.id, 'visible'), `显示${row.name}`), toggle(row.disabled, () => update(row.id, 'disabled'), `禁用${row.name}`), row.source, <Actions onEdit={() => toast.info(`编辑${row.name}`)} onDelete={() => setRows(current => current.filter(item => item.id !== row.id))} />])} /><Pagination count={rows.length} /></section>{preview && <aside className="sys-entry-preview"><h2>主站首页预览</h2><div className="sys-preview-grid">{rows.filter(row => row.visible).slice(0, 12).map(row => <article className={row.disabled ? 'disabled' : ''} key={row.id}><img src={row.image} alt="" /><span>{row.name}</span></article>)}</div><p>拖动入口可排序，靠近上下边缘可跨页移动。</p></aside>}</div>{modal}</div>
}

const ssoSeed = [
  ['sso-fuyi', '符艺测试', 'https://fuyi.com', 'fuyitest2026', 'bYQvHUTUESvxp0YMzLy0E1IY/REm0KVxe...', '启用', '2026-10-28 09:45:12'],
  ['sso-zb', '周报', '—', '—', 'Ao1/pFcAYWT02ymEss1bmDIGou1wyYPd9...', '禁用', '2026-10-19 10:14:48'],
  ['sso-xzs', '小助手', 'https://x.com/sso', '—', '—', '禁用', '2026-10-19 10:12:09'],
  ['sso-jxdlx', '井下动力学测试', 'http://localhost:5190/sso-demo', '—', 'To1/pFcAYWT02ymEss1bmDIGou1wyYPd9...', '启用', '2026-10-16 00:00:00'],
  ['sso-test-client', 'SSO测试客户端', 'http://192.168.28.203:5501/auth/...', '—', '—', '启用', '2026-08-04 16:47:53'],
  ['1', '1', '—', 'rqrqr45q4r5qwr5q4r2qwr1eqwqweq...', 'U9rIL76DXOGFf5PHzqBlX4nJ01J7nS8v2...', '启用', '2026-10-27 09:16:28'],
]
function SsoPage() {
  const { open, modal } = useEditor()
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState(ssoSeed)
  const fields: EditorField[] = [{ key: '0', label: '客户端标识', required: true }, { key: '1', label: '客户端名称', required: true }, { key: '2', label: '回调地址' }, { key: '3', label: '明文密钥' }, { key: '4', label: 'AESKey' }, { key: '5', label: '状态', options: ['启用', '禁用'] }]
  const edit = (index?: number) => open({ title: index === undefined ? '新增SSO配置' : '编辑SSO配置', fields, initial: index === undefined ? {} : Object.fromEntries(rows[index].map((value, key) => [String(key), value])), onSave: values => { const row = [values['0'], values['1'], values['2'] || '—', values['3'] || '—', values['4'] || '—', values['5'] || '启用', '2026-10-31 23:56:00']; if (index === undefined) setRows(current => [row, ...current]); else setRows(current => current.map((item, rowIndex) => rowIndex === index ? row : item)); toast.success('SSO配置已保存') } })
  return <section className="ops-page-panel"><Heading title=""><SearchInput label="搜索SSO" value={search} onChange={setSearch} placeholder="搜索客户端标识或名称" /><button onClick={() => edit()}><Plus />新增配置</button></Heading><Table columns={['客户端标识', '客户端名称', '回调地址', '明文密钥', 'AESKey', '状态', '创建时间', '操作']} rows={rows.filter(row => `${row[0]}${row[1]}`.toLowerCase().includes(search.toLowerCase())).map((row, index) => [row[0], row[1], row[2], <span className="sys-secret">{row[3]}<button aria-label="复制明文密钥" onClick={() => { navigator.clipboard?.writeText(row[3]); toast.success('已复制') }}><Copy /></button></span>, <span className="sys-secret">{row[4]}<button aria-label="复制AESKey" onClick={() => { navigator.clipboard?.writeText(row[4]); toast.success('已复制') }}><Copy /></button></span>, <span className={`sys-sso-status ${row[5] === '启用' ? 'enabled' : ''}`}>{row[5]}</span>, row[6], <Actions onEdit={() => edit(index)} onDelete={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))} />])} /><div className="sys-sso-footer"><span>SSO 回调地址区分大小写，回调地址、明文密钥和 AESKey 均支持复制。</span><Pagination count={rows.length} /></div>{modal}</section>
}

function ActivePage({ id }: { id: PageId }) {
  if (id === 'groups') return <GroupsPage />
  if (id === 'users') return <UsersPage />
  if (id === 'functions') return <FunctionsPage />
  if (id === 'roles') return <RolesPage />
  if (id === 'userRoles') return <UserRolesPage />
  if (id === 'fs') return <FsPage />
  if (id === 'platforms') return <PlatformsPage />
  if (id === 'dictionary') return <DictionaryPage />
  if (id === 'menus') return <MenusPage />
  if (id === 'dashboard') return <DashboardPage />
  if (id === 'stats') return <StatsPage />
  if (id === 'entrances') return <EntrancesPage />
  return <SsoPage />
}

export default function SystemManagementPage() {
  const navigate = useNavigate()
  const [tabs, setTabs] = useState<PageId[]>(['groups'])
  const [active, setActive] = useState<PageId | null>('groups')
  const [fsOpen, setFsOpen] = useState(true)
  const [metadataOpen, setMetadataOpen] = useState(true)
  const openPage = (id: PageId) => { setTabs(current => current.includes(id) ? current : [...current, id]); setActive(id) }
  const closePage = (id: PageId) => {
    const index = tabs.indexOf(id)
    const next = tabs.filter(item => item !== id)
    setTabs(next)
    if (active === id) setActive(next[index] ?? next[index - 1] ?? null)
  }
  const navButton = ({ id, icon: Icon }: { id: PageId, icon: typeof Users }, child = false) => <button className={`${active === id ? 'active' : ''} ${child ? 'ops-nav-child' : ''}`} key={id} onClick={() => openPage(id)}><Icon />{labels[id]}</button>
  return <div className="stats-page ops-page sys-page"><header className="stats-header"><button className="stats-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>系统管理</strong></button><HeaderUser /></header><div className="stats-shell"><aside className="stats-sidebar"><nav className="stats-nav operation-nav" aria-label="系统管理导航">{mainPages.map(page => navButton(page))}<div className={`ops-nav-group ${active === 'fs' || active === 'platforms' ? 'active-parent' : ''}`}><button onClick={() => setFsOpen(!fsOpen)}><Monitor />FS{fsOpen ? <ChevronUp /> : <ChevronDown />}</button></div>{fsOpen && navButton({ id: 'fs', icon: Monitor }, true)}{fsOpen && navButton({ id: 'platforms', icon: PanelTop }, true)}<div className={`ops-nav-group ${active === 'dictionary' ? 'active-parent' : ''}`}><button onClick={() => setMetadataOpen(!metadataOpen)}><BookOpen />元数据管理{metadataOpen ? <ChevronUp /> : <ChevronDown />}</button></div>{metadataOpen && navButton({ id: 'dictionary', icon: BookOpen }, true)}{otherPages.map(page => navButton(page))}</nav></aside><main className={`stats-main operation-main ${tabs.length === 0 ? 'stats-main--empty' : ''}`}>{tabs.length > 0 && <div className="stats-tabs" role="tablist" aria-label="已打开的系统管理页面">{tabs.map(id => <div className={`stats-tab ${active === id ? 'active' : ''}`} key={id}><button className="stats-tab-label" role="tab" aria-selected={active === id} onClick={() => setActive(id)}>{labels[id]}</button><button className="stats-tab-close" aria-label={`关闭${labels[id]}`} onClick={() => closePage(id)}><X /></button></div>)}</div>}{active && <ActivePage id={active} />}</main></div></div>
}
