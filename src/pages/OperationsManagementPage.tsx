import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Activity, ArchiveRestore, BookOpen, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, CirclePlus, Database, ListTree, Menu as MenuIcon, Network, Package,
  Pencil, Plus, RefreshCw, RotateCcw, Save, Search, Server, ShieldCheck, Trash2,
  UserCheck, UserRound, Users, UsersRound, X,
} from 'lucide-react'
import HeaderUser from '../components/HeaderUser'
import { useConfirm } from '../components/ConfirmContext'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

type PageId = 'regionUsers' | 'rolePermissions' | 'userRoles' | 'groups' | 'servers' | 'serverRegions' | 'functions' | 'menus' | 'upgrades' | 'monitoring' | 'backup' | 'master' | 'wellRecycle' | 'runRecycle'
type Values = Record<string, string>
interface EditorField { key: string, label: string, required?: boolean, options?: string[] }
interface EditorConfig { title: string, fields: EditorField[], initial?: Values, onSave: (values: Values) => void }

const pageLabels: Record<PageId, string> = {
  regionUsers: '区域用户', rolePermissions: '角色权限', userRoles: '用户角色', groups: '群组管理',
  servers: '区域服务器管理', serverRegions: '区域服务器区域管理', functions: '区域功能管理', menus: '区域菜单配置',
  upgrades: '升级包管理', monitoring: '服务监控', backup: '备份管理', master: '主数据管理', wellRecycle: '井回收站', runRecycle: 'Run回收站',
}
const adminPages: { id: PageId, icon: typeof Users }[] = [
  { id: 'regionUsers', icon: Users }, { id: 'rolePermissions', icon: ShieldCheck }, { id: 'userRoles', icon: UserCheck }, { id: 'groups', icon: UsersRound },
]
const systemPages: { id: PageId, icon: typeof Users }[] = [
  { id: 'servers', icon: Server }, { id: 'serverRegions', icon: Network }, { id: 'functions', icon: ListTree },
  { id: 'menus', icon: MenuIcon }, { id: 'upgrades', icon: Package }, { id: 'monitoring', icon: Activity }, { id: 'backup', icon: Database },
]
const masterPages: { id: PageId, icon: typeof Users }[] = [
  { id: 'master', icon: BookOpen }, { id: 'wellRecycle', icon: Trash2 }, { id: 'runRecycle', icon: ArchiveRestore },
]

function useEditor() {
  const [config, setConfig] = useState<EditorConfig | null>(null)
  const modal = config ? <EditorModal key={config.title} config={config} onClose={() => setConfig(null)} /> : null
  return { open: setConfig, modal }
}

function EditorModal({ config, onClose }: { config: EditorConfig, onClose: () => void }) {
  const [values, setValues] = useState<Values>(config.initial || {})
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const missing = config.fields.find(field => field.required && !values[field.key]?.trim())
    if (missing) { toast.error(`请填写${missing.label}`); return }
    config.onSave(values)
    onClose()
  }
  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <form className="ops-editor" onSubmit={submit}>
        <header><h2>{config.title}</h2><button type="button" aria-label="关闭" onClick={onClose}><X /></button></header>
        <div className="ops-editor-grid">{config.fields.map(field => <label key={field.key}><span>{field.required && <b>*</b>}{field.label}</span>{field.options ? <select aria-label={field.label} value={values[field.key] || ''} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}><option value="">请选择</option>{field.options.map(option => <option key={option}>{option}</option>)}</select> : <input aria-label={field.label} value={values[field.key] || ''} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))} placeholder={`请输入${field.label}`} />}</label>)}</div>
        <footer><button type="submit" className="ops-primary">确定</button><button type="button" onClick={onClose}>取消</button></footer>
      </form>
    </div>
  )
}

function SimpleTable({ columns, rows, className = '', empty = '暂无数据' }: { columns: string[], rows: ReactNode[][], className?: string, empty?: string }) {
  return (
    <div className={`ops-table-wrap ${className}`}><table className="ops-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <div className="ops-empty">{empty}</div>}</div>
  )
}

function ActionButtons({ onEdit, onDelete, onAdd }: { onEdit?: () => void, onDelete?: () => void, onAdd?: () => void }) {
  const confirm = useConfirm()
  const requestDelete = () => onDelete && confirm({ title: '删除记录', description: '删除后，该记录及其相关配置将无法恢复。', onConfirm: onDelete })
  return <div className="ops-row-actions">{onAdd && <button title="新增子项" aria-label="新增子项" onClick={onAdd}><CirclePlus /></button>}{onEdit && <button title="编辑" aria-label="编辑" onClick={onEdit}><Pencil /></button>}{onDelete && <button title="删除" aria-label="删除" onClick={requestDelete}><Trash2 /></button>}</div>
}

function Pagination({ count }: { count: number }) {
  return <footer className="ops-pagination"><span>共 {count} 条</span><select aria-label="每页条数" defaultValue="20"><option value="20">20条/页</option><option value="10">10条/页</option><option value="50">50条/页</option></select><button disabled><ChevronLeft /></button><strong>1</strong><button disabled><ChevronRight /></button><span>前往</span><input aria-label="页码" value="1" readOnly /><span>页</span></footer>
}

function PanelHeading({ title, children }: { title: string, children?: ReactNode }) {
  return <div className="ops-panel-heading"><h2>{title}</h2><div className="ops-toolbar">{children}</div></div>
}

interface TransferRow { id: string, cells: string[] }
const userRows: TransferRow[] = [
  ['admin', '系统管理员', '缅甸作业公司'], ['caimc', '蔡明成', '缅甸作业公司'], ['Development', '产业化布局', ''], ['hezx', 'hezx', '渤海'], ['liyang', '李杨', '陆地作业公司'],
  ['tangdong', 'tangdong', '大庆'], ['test', 'test', '深圳作业公司'], ['xiezxa', '谢梓溪', '研究院'], ['yinbo', 'yinbo', '渤海'], ['yuanrou', 'yuanrou', '深圳作业公司'], ['yuqw', 'yuqw', '东海'],
].map((cells, index) => ({ id: `user-${index}`, cells }))
const availableUsers: TransferRow[] = [
  ['AllLarge', '大璇全部', '东海'], ['cosl', 'cosl', ''], ['COSL-CHN', '陈浩南', ''], ['cosl_mqw', 'mengqing', '缅甸作业公司'], ['CQAdmin', 'CQAdmin', '研究院'],
  ['dengxl', 'dengxl', ''], ['evget', 'evget', ''], ['fengqy', '冯乔于', '陆地作业公司'], ['fengxyTest', 'fengxiaoyu', '缅甸作业公司'], ['fg123', 'fangqiaoyu', '研究院'], ['fuyi', '符艺', '陆地作业公司'],
].map((cells, index) => ({ id: `available-${index}`, cells }))
const regionRows: TransferRow[] = [
  ['渤海', 'BoHai'], ['新疆', 'XinJiang'], ['大庆', 'DaQing'], ['燕郊', 'YJ'], ['东海', 'DongHai'], ['辽河', 'LiaoHe'], ['内蒙古', 'NeiMeng'], ['西南（陆地）', 'Xinan（Ludi）'],
  ['印尼', 'Indonesia'], ['天津市滨海新区东沽', 'DongGu'], ['米桑', 'MiSang'], ['胜利', 'ShengLi'], ['南海西部', 'NanHaiXi'], ['南海东部', 'NanHaiDong'], ['青海', 'Qinghai'], ['重庆', 'CQ'], ['大港', 'Dagang'], ['南海西部（湛江）', 'zhanjiang'], ['南海西部（海南）', 'hainan'],
].map((cells, index) => ({ id: `region-${index}`, cells }))

function TransferPage({ kind }: { kind: 'regionUsers' | 'userRoles' | 'serverRegions' }) {
  const isRegion = kind === 'serverRegions'
  const [bound, setBound] = useState<TransferRow[]>(isRegion ? regionRows.slice(0, 1) : kind === 'regionUsers' ? userRows : [])
  const [available, setAvailable] = useState<TransferRow[]>(isRegion ? regionRows.slice(1) : availableUsers)
  const [boundSelected, setBoundSelected] = useState<string[]>([])
  const [availableSelected, setAvailableSelected] = useState<string[]>([])
  const [boundSearch, setBoundSearch] = useState('')
  const [availableSearch, setAvailableSearch] = useState('')
  const columns = isRegion ? ['名称', '英文名'] : ['用户名', '姓名', '公司']
  const leftTitle = isRegion ? '服务器列表' : kind === 'userRoles' ? '角色列表' : '区域列表'
  const leftRows = isRegion ? ['天津区域服务器', '测试区域服务器'] : ['天津区域服务器', '　渤海', '　　工程师', '　　管理人员', '　　技术支持', '　　区域管理员', '　　作业经理', '测试区域服务器', '　测试区域']
  const move = (toBound: boolean) => {
    const source = toBound ? available : bound
    const selected = toBound ? availableSelected : boundSelected
    if (!selected.length) { toast.info('请先选择数据'); return }
    const moving = source.filter(row => selected.includes(row.id))
    if (toBound) { setBound(current => [...current, ...moving]); setAvailable(current => current.filter(row => !selected.includes(row.id))); setAvailableSelected([]) }
    else { setAvailable(current => [...current, ...moving]); setBound(current => current.filter(row => !selected.includes(row.id))); setBoundSelected([]) }
  }
  const panel = (title: string, rows: TransferRow[], selected: string[], setSelected: (ids: string[]) => void, search: string, setSearch: (value: string) => void) => {
    const visible = rows.filter(row => row.cells.join('').toLowerCase().includes(search.toLowerCase()))
    return <section className="ops-transfer-panel"><PanelHeading title={title}><label>区域名<input aria-label={`${title}搜索`} value={search} onChange={event => setSearch(event.target.value)} placeholder="请输入名称" /></label>{isRegion && title === '可分配区域' && <button onClick={() => toast.success('区域分配已保存')}><Save />保存</button>}</PanelHeading><SimpleTable columns={['', ...columns]} rows={visible.map((row, index) => [<span className="ops-transfer-index">{index + 1}<input type="checkbox" aria-label={`选择${row.cells[0]}`} checked={selected.includes(row.id)} onChange={event => setSelected(event.target.checked ? [...selected, row.id] : selected.filter(id => id !== row.id))} /></span>, ...row.cells])} /><Pagination count={rows.length} /></section>
  }
  return <div className="ops-transfer-page"><aside className="ops-inner-tree"><h2>{leftTitle}</h2>{leftRows.map((row, index) => <button className={index === 0 || index === 2 ? 'active' : ''} key={`${row}-${index}`}>{row}</button>)}</aside>{panel(isRegion ? '已分配区域' : '已绑定用户', bound, boundSelected, setBoundSelected, boundSearch, setBoundSearch)}<div className="ops-transfer-actions"><button aria-label="绑定所选" onClick={() => move(true)}><ChevronRight /></button><button aria-label="解绑所选" onClick={() => move(false)}><ChevronLeft /></button></div>{panel(isRegion ? '可分配区域' : '可绑定用户', available, availableSelected, setAvailableSelected, availableSearch, setAvailableSearch)}</div>
}

const permissionItems = [
  { name: '数据填报', level: 0 }, { name: '作业管理', level: 1 }, { name: '井基本信息', level: 2 }, { name: '平台信息', level: 2 }, { name: '设备动态', level: 2 },
  { name: '人员动态', level: 2 }, { name: '每日填报', level: 1 }, { name: '邮件发送', level: 2 }, { name: 'Run管理', level: 1 }, { name: '定向井日报', level: 1 },
  { name: '陀螺周报', level: 1 }, { name: '删除陀螺周报', level: 2 }, { name: '原始文件', level: 1 }, { name: 'Live', level: 0 },
]
const initialPermissions: Values = { 数据填报: 'true', 每日填报: 'true', 邮件发送: 'true' }

function RolePermissionsPage() {
  const { open, modal } = useEditor()
  const confirm = useConfirm()
  const [roles, setRoles] = useState(['工程师', '管理人员', '技术支持', '区域管理员', '作业经理'])
  const [permissions, setPermissions] = useState<Values>(initialPermissions)
  const [saved, setSaved] = useState<Values>(initialPermissions)
  const [search, setSearch] = useState('')
  const [onlyChanged, setOnlyChanged] = useState(false)
  const added = Object.keys(permissions).filter(key => permissions[key] === 'true' && saved[key] !== 'true').length
  const removed = Object.keys(saved).filter(key => saved[key] === 'true' && permissions[key] !== 'true').length
  const visible = permissionItems.filter(item => (!search || item.name.includes(search)) && (!onlyChanged || permissions[item.name] !== saved[item.name]))
  return <div className="ops-role-page"><div className="ops-directory"><label>目录：<select aria-label="目录"><option>Web</option><option>Mobile</option></select></label><button onClick={() => { setSaved(permissions); toast.success('角色权限已保存') }}><Save />保存</button></div><div className="ops-role-content"><aside className="ops-inner-tree"><PanelHeading title="角色列表"><button aria-label="新增角色" onClick={() => open({ title: '新增角色', fields: [{ key: 'name', label: '角色名称', required: true }], onSave: values => { setRoles(current => [...current, values.name]); toast.success('角色已新增') } })}><Plus /></button><button aria-label="编辑角色" onClick={() => toast.info('请选择需要编辑的角色')}><Pencil /></button><button aria-label="删除角色" onClick={() => { if (roles.length > 1) confirm({ title: '删除角色', name: roles[roles.length - 1], description: '删除后，该角色及其权限配置将无法恢复。', onConfirm: () => { setRoles(current => current.slice(0, -1)); toast.success('已删除末尾角色') } }) }}><Trash2 /></button></PanelHeading><h3>天津区域服务器</h3><h4>渤海</h4>{roles.map((role, index) => <button className={index === 0 ? 'active' : ''} key={role}>{role}</button>)}<h3>测试区域服务器</h3><h4>测试区域</h4>{roles.map(role => <button key={`test-${role}`}>{role}</button>)}</aside><section className="ops-permission-panel"><PanelHeading title="功能权限配置" /><div className="ops-permission-filter"><label><Search /><input aria-label="搜索权限" value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索功能或权限名称" /></label><button className={!onlyChanged ? 'active' : ''} onClick={() => setOnlyChanged(false)}>全部</button><button className={onlyChanged ? 'active' : ''} onClick={() => setOnlyChanged(true)}>本次修改</button><span>本次变更 <b>+{added}</b> <i>-{removed}</i></span></div><div className="ops-permission-tree">{visible.map(item => <label key={item.name} style={{ paddingLeft: 12 + item.level * 42 }}><input type="checkbox" checked={permissions[item.name] === 'true'} onChange={event => setPermissions(current => ({ ...current, [item.name]: String(event.target.checked) }))} />{item.name}</label>)}</div></section></div>{modal}</div>
}

function GroupsPage() {
  const { open, modal } = useEditor()
  const confirm = useConfirm()
  const [tab, setTab] = useState('普通群组')
  const [groups, setGroups] = useState([{ id: '1', name: '全部', enabled: '启用', note: '' }])
  const [members, setMembers] = useState([{ id: '1', username: 'caimc', name: '蔡明成', company: '缅甸作业公司' }])
  const [scopes, setScopes] = useState([{ id: '1', block: '金县', field: '金县1-1' }, { id: '2', block: '渤中', field: '渤中34-2/4' }, { id: '3', block: '渤中', field: '渤中29-4' }, { id: '4', block: '渤中', field: '渤中28-2S' }])
  const deleteGroup = (group: typeof groups[number]) => confirm({ title: '删除群组', name: group.name, description: '删除后，该群组及其成员配置将无法恢复。', onConfirm: () => setGroups(current => current.filter(item => item.id !== group.id)) })
  const deleteMember = (member: typeof members[number]) => confirm({ title: '删除群组成员', name: `${member.name}（${member.username}）`, description: '删除后，该成员与当前群组的绑定关系将无法恢复。', onConfirm: () => setMembers(current => current.filter(item => item.id !== member.id)) })
  const deleteScope = (scope: typeof scopes[number]) => confirm({ title: '删除分配范围', name: `${scope.block} / ${scope.field}`, description: '删除后，该范围与当前群组的分配关系将无法恢复。', onConfirm: () => setScopes(current => current.filter(item => item.id !== scope.id)) })
  const deleteMembers = () => {
    if (!members.length) { toast.info('暂无群组成员可删除'); return }
    confirm({ title: '删除群组成员', message: '确认删除全部群组成员？', description: '将清空当前群组的所有成员，此操作无法恢复。', onConfirm: () => setMembers([]) })
  }
  const deleteScopes = () => {
    if (!scopes.length) { toast.info('暂无分配范围可删除'); return }
    confirm({ title: '删除分配范围', message: '确认删除全部分配范围？', description: '将清空当前群组的所有分配范围，此操作无法恢复。', onConfirm: () => setScopes([]) })
  }
  return (
    <div className="ops-groups-page">
      <aside className="ops-inner-tree"><h2>区域列表</h2><button>天津区域服务器</button><button className="active">渤海</button><button>测试区域服务器</button><button>测试区域</button></aside>
      <section className="ops-group-list">
        <PanelHeading title="群组列表"><label>群组<input aria-label="群组搜索" placeholder="请输入群组名称" /></label><button onClick={() => open({ title: '新增群组', fields: [{ key: 'name', label: '群组名称', required: true }, { key: 'note', label: '备注' }], onSave: values => { setGroups(current => [...current, { id: String(Date.now()), name: values.name, enabled: '启用', note: values.note || '' }]); toast.success('群组已新增') } })}>新增</button></PanelHeading>
        <div className="ops-subtabs">{['普通群组', '特殊群组', '曲线群组'].map(item => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
        <SimpleTable columns={['序号', '群组名称', '是否启用', '备注', '操作']} rows={groups.map((group, index) => [index + 1, group.name, <span className="ops-status-dot">{group.enabled}</span>, group.note, <div className="ops-text-actions"><button onClick={() => open({ title: '编辑群组', fields: [{ key: 'name', label: '群组名称', required: true }, { key: 'note', label: '备注' }], initial: group, onSave: values => { setGroups(current => current.map(item => item.id === group.id ? { ...item, name: values.name, note: values.note || '' } : item)); toast.success('群组已保存') } })}>编辑</button><button onClick={() => deleteGroup(group)}>删除</button></div>])} />
        <Pagination count={groups.length} />
      </section>
      <div className="ops-group-side">
        <section>
          <PanelHeading title="群组成员"><label>公司<select aria-label="成员公司"><option>请选择</option><option>缅甸作业公司</option></select></label><label>姓名<input aria-label="成员姓名" placeholder="请输入用户名或姓名" /></label><button onClick={deleteMembers}>删除</button><button onClick={() => { if (!members.length) setMembers([{ id: String(Date.now()), username: 'caimc', name: '蔡明成', company: '缅甸作业公司' }]); else toast.info('成员已存在') }}>新增</button></PanelHeading>
          <SimpleTable columns={['', '用户名', '姓名', '公司', '操作']} rows={members.map((member, index) => [<><span>{index + 1}</span><input type="checkbox" aria-label={`选择${member.name}`} /></>, member.username, member.name, member.company, <button className="ops-link" onClick={() => deleteMember(member)}>删除</button>])} />
          <Pagination count={members.length} />
        </section>
        <section>
          <PanelHeading title="已分配范围"><input aria-label="范围搜索" placeholder="请输入区块或油田名" /><button onClick={deleteScopes}>删除</button><button onClick={() => { setScopes(current => [...current, { id: String(Date.now()), block: '新区块', field: '新油田' }]); toast.success('已新增分配范围') }}>新增</button></PanelHeading>
          <SimpleTable columns={['', '区块', '油田', '操作']} rows={scopes.map((scope, index) => [<><span>{index + 1}</span><input type="checkbox" aria-label={`选择${scope.field}`} /></>, scope.block, scope.field, <button className="ops-link" onClick={() => deleteScope(scope)}>删除</button>])} />
        </section>
      </div>
      {modal}
    </div>
  )
}

const serverFields: EditorField[] = [{ key: 'code', label: '服务器编码', required: true }, { key: 'name', label: '服务器名称', required: true }, { key: 'url', label: '服务地址', required: true }, { key: 'note', label: '说明' }]
function ServersPage() {
  const { open, modal } = useEditor()
  const [rows, setRows] = useState([{ id: '1', code: 'estest', name: '测试区域服务器', url: 'https://192.168.28.203/estest', note: '' }, { id: '2', code: 'estj', name: '天津区域服务器', url: 'https://192.168.28.203/estj', note: '' }])
  const edit = (row?: typeof rows[number]) => open({ title: row ? '编辑服务器' : '新增服务器', fields: serverFields, initial: row, onSave: values => { if (row) setRows(current => current.map(item => item.id === row.id ? { ...item, ...values } : item)); else setRows(current => [...current, { id: String(Date.now()), code: values.code, name: values.name, url: values.url, note: values.note || '' }]); toast.success('服务器信息已保存') } })
  return <section className="ops-page-panel"><PanelHeading title="服务器管理列表"><button onClick={() => edit()}><Plus />新增</button></PanelHeading><SimpleTable columns={['序号', '服务器编码', '服务器名称', '服务地址', '说明', '操作']} rows={rows.map((row, index) => [index + 1, row.code, row.name, row.url, row.note, <ActionButtons onEdit={() => edit(row)} onDelete={() => { setRows(current => current.filter(item => item.id !== row.id)); toast.success('服务器已删除') }} />])} />{modal}</section>
}

function FunctionsPage() {
  const { open, modal } = useEditor()
  const [selected, setSelected] = useState('每日填报')
  const [search, setSearch] = useState('')
  const [permissionSearch, setPermissionSearch] = useState('')
  const [rows, setRows] = useState([{ id: '1', name: '邮件发送', code: 'DataFilling_EmailSend' }])
  const tree = ['数据填报', '菜单配置', '作业管理', '井基本信息', '平台信息', '设备动态', '人员动态', '每日填报', 'Run管理', '定向井日报', '陀螺周报', '原始文件', 'Live'].filter(item => item.includes(search))
  const edit = (row?: typeof rows[number]) => open({ title: row ? '编辑操作权限' : '新增操作权限', fields: [{ key: 'name', label: '操作权限名称', required: true }, { key: 'code', label: '权限编码', required: true }], initial: row, onSave: values => { if (row) setRows(current => current.map(item => item.id === row.id ? { ...item, ...values } : item)); else setRows(current => [...current, { id: String(Date.now()), name: values.name, code: values.code }]); toast.success('操作权限已保存') } })
  return <div className="ops-function-page"><div className="ops-directory"><label>目录：<select aria-label="目录"><option>Web</option></select></label><button onClick={() => toast.success('功能列表已刷新')}><RefreshCw />刷新</button></div><div className="ops-function-content"><aside className="ops-inner-tree"><PanelHeading title="功能列表" /><label className="ops-tree-search"><Search /><input aria-label="搜索功能" value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索功能名称" /></label>{tree.map(item => <button className={selected === item ? 'active' : ''} key={item} onClick={() => setSelected(item)}>{item}</button>)}</aside><section className="ops-function-detail"><PanelHeading title={`功能详情 / ${selected}`} /><PanelHeading title="操作权限"><label><input aria-label="权限搜索" value={permissionSearch} onChange={event => setPermissionSearch(event.target.value)} placeholder="搜索操作名称 / 权限编码" /></label><button className="ops-primary" onClick={() => edit()}><Plus />新增操作权限</button></PanelHeading><SimpleTable columns={['', '操作权限名称', '权限编码', '操作']} rows={rows.filter(row => `${row.name}${row.code}`.toLowerCase().includes(permissionSearch.toLowerCase())).map((row, index) => [index + 1, row.name, row.code, <ActionButtons onEdit={() => edit(row)} onDelete={() => setRows(current => current.filter(item => item.id !== row.id))} />])} /></section></div>{modal}</div>
}

const initialMenus = [
  ['数据填报', 'Data Report', '✎', '是', '是', '路由', '/datafilling', '11'], ['　作业管理', 'Management', '▣', '是', '否', '组件', 'WorkManage', '0'],
  ['　　Run管理', 'Run', '◉', '是', '是', '组件', 'RunManage', '1'], ['　　每日填报', 'Daily Report', '☷', '是', '是', '组件', 'DailySubmit', '1'], ['　　定向井日报', 'Daily', '▤', '是', '是', '组件', 'DirectionalWellDaily', '3'],
  ['　　陀螺周报', 'Gyro Report', '♟', '是', '是', '组件', 'GyroReport', '4'], ['　　原始文件', '原始文件', '▣', '是', '是', '组件', 'FileInfo', '10'], ['Live', 'Live', '◉', '是', '是', '路由', '/live', '13'],
]
function MenusPage() {
  const { open, modal } = useEditor()
  const [rows, setRows] = useState(initialMenus)
  const fields: EditorField[] = [{ key: '0', label: '菜单名称', required: true }, { key: '1', label: '英文名称', required: true }, { key: '5', label: '显示方式', options: ['组件', '路由'] }, { key: '6', label: '路径', required: true }, { key: '7', label: '排序' }]
  const edit = (index?: number) => open({ title: index === undefined ? '新增菜单' : '编辑菜单', fields, initial: index === undefined ? {} : Object.fromEntries(rows[index].map((value, key) => [String(key), value])), onSave: values => { const row = [values['0'], values['1'], '▣', '是', '是', values['5'] || '组件', values['6'], values['7'] || '0']; if (index === undefined) setRows(current => [...current, row]); else setRows(current => current.map((item, rowIndex) => rowIndex === index ? row : item)); toast.success('菜单配置已保存') } })
  return <section className="ops-page-panel"><PanelHeading title=""><button onClick={() => edit()}><Plus />新增菜单</button></PanelHeading><SimpleTable columns={['菜单名称', '英文名称', '菜单图标', '是否显示', '是否可点击', '显示方式', '路径', '排序', '操作']} rows={rows.map((row, index) => [...row, <ActionButtons onAdd={() => edit()} onEdit={() => edit(index)} onDelete={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))} />])} />{modal}</section>
}

function UpgradesPage() {
  const { open, modal } = useEditor()
  const [releases, setReleases] = useState([
    { id: '1', name: '区域服务器', version: '2.2606.10.1', description: '稳定版本', package: '区域服务器升级包', status: '是', time: '2026-07-17 15:37' },
    { id: '2', name: '区域服务器', version: '2.2606.5.1', description: '功能更新', package: '区域服务器升级包', status: '是', time: '2026-06-05 09:27' },
    { id: '3', name: '区域服务器', version: '2605.11.1', description: '测试版本', package: '区域服务器升级包', status: '否', time: '-' },
    { id: '4', name: '区域服务器', version: '2605.12.1', description: '缺陷修复', package: '区域服务器升级包', status: '是', time: '2026-05-12 10:21' },
  ])
  const [packages, setPackages] = useState([{ id: '1', name: '主服务', version: '2.2610.29.1' }, { id: '2', name: '数据同步', version: '2.2609.15.2' }, { id: '3', name: 'Witsml服务', version: '2.2607.8.1' }])
  const fields: EditorField[] = [{ key: 'name', label: '名称', required: true }, { key: 'version', label: '版本号', required: true }, { key: 'description', label: '版本描述' }, { key: 'package', label: '安装包名称' }]
  return <div className="ops-upgrades-page"><aside className="ops-inner-tree"><h3>区域服务器</h3>{['主服务', '数据同步', 'Grpc传输', 'Grpc中转', 'Witsml服务', 'Witsml服务(131)', '升级服务', '控制服务', '备份服务'].map(item => <button key={item}>{item}</button>)}<h3>井场服务器</h3>{['主服务', '数据同步', 'Grpc传输', 'Witsml服务', '升级服务', '远程支持服务'].map(item => <button key={`well-${item}`}>{item}</button>)}<h3>AnySync</h3><button>客户端</button></aside><div className="ops-upgrade-content"><section><PanelHeading title="发布管理列表"><button onClick={() => open({ title: '新增发布', fields, onSave: values => { setReleases(current => [...current, { id: String(Date.now()), name: values.name, version: values.version, description: values.description || '', package: values.package || '', status: '否', time: '-' }]); toast.success('发布已新增') } })}><Plus />新增</button></PanelHeading><SimpleTable columns={['序号', '名称', '版本号', '版本描述', '安装包名称', '是否发布', '发布时间', '操作']} rows={releases.map((row, index) => [index + 1, row.name, row.version, row.description, row.package, <span className={`ops-publish-status ${row.status === '是' ? 'yes' : ''}`}>{row.status}</span>, row.time, <ActionButtons onEdit={() => { setReleases(current => current.map(item => item.id === row.id ? { ...item, status: '是', time: '2026-10-31 23:00' } : item)); toast.success('版本已发布') }} onDelete={() => setReleases(current => current.filter(item => item.id !== row.id))} />])} /></section><section><PanelHeading title="包管理（当前包版本：2.2606.10.1）"><button onClick={() => toast.success('包信息已保存')}><Pencil />编辑</button></PanelHeading><SimpleTable columns={['序号', '名称', '版本', '描述', '是否基础版本', '操作']} rows={packages.map((row, index) => [index + 1, row.name, row.version, '服务安装包', '是', <ActionButtons onDelete={() => setPackages(current => current.filter(item => item.id !== row.id))} />])} /></section></div>{modal}</div>
}

const initialServices = [
  ['主服务', '10101', '2.2610.29.1'], ['数据同步', '10102', '2.2609.15.2'], ['Grpc传输', '10104', '2.2605.15.1'], ['Grpc中转', '10106', '2.2605.13.1'], ['Witsml服务', '10107', '2.2607.8.1'], ['升级服务', '10109', '2.2605.12.1'], ['备份服务', '10111', '2.2605.15.1'],
]
function MonitoringPage() {
  const [statuses, setStatuses] = useState<Record<number, boolean>>(() => Object.fromEntries(initialServices.map((_, index) => [index, true])))
  const change = (index: number, status: boolean, message: string) => { setStatuses(current => ({ ...current, [index]: status })); toast.success(message) }
  return <div className="ops-monitor-page"><aside className="ops-inner-tree"><h3>天津区域服务器</h3><button className="active">服务监控</button><button>服务升级</button><h3>测试区域服务器</h3><button>服务监控</button><button>服务升级</button></aside><section className="ops-monitor-content"><PanelHeading title="服务监控" /><SimpleTable columns={['序号', '服务名称', '端口', '版本', '状态', '操作']} rows={initialServices.map((row, index) => [index + 1, ...row, <span className={`ops-service-status ${statuses[index] ? '' : 'stopped'}`}>{statuses[index] ? '已连接' : '已停止'}</span>, <div className="ops-text-actions"><button onClick={() => change(index, false, `${row[0]}已停止`)}>停止</button><button onClick={() => change(index, true, `${row[0]}已开启`)}>开启</button><button onClick={() => change(index, true, `${row[0]}已重启`)}>重启</button></div>])} /></section></div>
}

function BackupPage() {
  const [selected, setSelected] = useState('天津区域服务器')
  const [automatic, setAutomatic] = useState(false)
  const [lastBackup, setLastBackup] = useState('--')
  const [count, setCount] = useState(0)
  const backup = () => { setLastBackup(new Date().toLocaleString('zh-CN', { hour12: false })); setCount(current => current + 1); toast.success('手动备份已完成') }
  return <div className="ops-backup-page"><aside className="ops-inner-tree">{['天津区域服务器', '测试区域服务器', '中央服务器', '备份记录'].map(item => <button className={selected === item ? 'active' : ''} key={item} onClick={() => setSelected(item)}><Database />{item}</button>)}</aside>{selected === '备份记录' ? <section className="ops-backup-content"><PanelHeading title="备份记录" /><SimpleTable columns={['序号', '服务器', '备份时间', '备份类型', '状态']} rows={Array.from({ length: count }, (_, index) => [index + 1, '天津区域服务器', lastBackup, '手动备份', '成功'])} /></section> : <div className="ops-backup-content"><div className="ops-backup-grid"><div><PanelHeading title="手动备份" /><div className="ops-manual-backup"><button onClick={backup}><RefreshCw />立即备份</button><span>备注：手动备份会将服务器里所有数据库全量备份，不受单个数据库备份设置影响</span></div><PanelHeading title="备份规则" /><div className="ops-backup-rules"><span>自动备份</span><label><input type="radio" name="auto" checked={automatic} onChange={() => setAutomatic(true)} />开启</label><label><input type="radio" name="auto" checked={!automatic} onChange={() => setAutomatic(false)} />关闭</label><label>备份间隔<select aria-label="备份间隔"><option>7天</option><option>15天</option><option>30天</option></select></label><label>备份时间<input aria-label="备份时间" type="time" defaultValue="00:00" /></label></div></div><div><PanelHeading title="备份统计" /><div className="ops-backup-stats"><article className="green"><strong>最近一次备份时间</strong><span>{lastBackup}</span></article><article className="blue"><strong>累计备份次数</strong><span>{count}</span></article><article className="orange"><strong>累计备份数据库份数</strong><span>{count * 8}</span></article></div></div></div><PanelHeading title="单数据库备份忽略列表" /><SimpleTable columns={['序号', '井名', '数据库名称', '是否忽略此数据库', '首次备份时间', '最近一次备份时间']} rows={[]} /></div>}</div>
}

const masterWells = [
  ['h_260928', '渤海', '金县', '金县1-1', '海洋石油906', '作业完成', '2026-09-28 17:12:15', 'hezx'], ['test0916', '测试区域', '测试区块', '测试专用', '海洋石油906', '作业完成', '2026-09-16 11:11:18', 'fuyitest'],
  ['fuyi_bohai_0903', '渤海', '金县', '金县1-1', 'COSL7', '作业完成', '2026-09-03 09:56:58', 'test'], ['fuyi_2.0_test_bohai', '渤海', '金县', '金县1-1', 'COSL7', '作业完成', '2026-09-02 10:06:06', 'test'],
  ['fuyi_1.0_test_bohai', '渤海', '金县', '金县1-1', '海洋石油906', '作业完成', '2026-09-02 08:55:03', 'zhuofy'], ['fuyi_1.0_test', '测试区域', '测试区块', '测试专用', '海洋石油906', '作业完成', '2026-09-01 17:54:51', 'zhuofy'],
  ['fuyi_test_0803', '测试区域', '测试区块', '测试专用', 'DrillingRig_40493JH', '作业完成', '2026-08-03 16:43:59', 'test'],
]
function WellFilters({ onSearch }: { onSearch: (value: string) => void }) {
  return <div className="ops-well-filters">{['区域', '区块', '平台', '测试井', '璇玑作业井'].map(label => <label key={label}>{label}<select aria-label={label}><option>全部</option><option>是</option><option>否</option></select></label>)}<label>井名<input aria-label="井名筛选" placeholder="请输入井名" onChange={event => onSearch(event.target.value)} /></label></div>
}
function MasterDataPage() {
  const [wells, setWells] = useState(masterWells)
  const [runs, setRuns] = useState([['100', '8.75', '2026-09-28 17:13:30', '100', '1', '2026-09-28 17:14:03', 'hezx']])
  const [search, setSearch] = useState('')
  return <div className="ops-master-page"><section><PanelHeading title="井列表"><button onClick={() => toast.success('填报数据已重置')}>重置填报数据</button></PanelHeading><WellFilters onSearch={setSearch} /><SimpleTable columns={['序号', '井名', '区域', '区块', '油田', '平台', '作业状态', '创建时间', '创建人', '操作']} rows={wells.filter(row => row[0].includes(search)).map((row, index) => [index + 1, ...row.slice(0, 5), <span className="ops-job-status">{row[5]}</span>, ...row.slice(6), <ActionButtons onDelete={() => setWells(current => current.filter(item => item[0] !== row[0]))} />])} /><Pagination count={wells.length} /></section><section><PanelHeading title="Run列表" /><SimpleTable columns={['序号', 'RunID', '井眼尺寸(in)', '仪器入井时间', '设计深度(m)', '起始深度(m)', '创建时间', '创建人', '操作']} rows={runs.map((row, index) => [index + 1, ...row, <ActionButtons onDelete={() => setRuns([])} />])} /></section></div>
}

function WellRecyclePage() {
  const [search, setSearch] = useState('')
  return <div className="ops-recycle-page"><section><PanelHeading title="井列表" /><WellFilters onSearch={setSearch} /><SimpleTable columns={['序号', '井名', '区域', '区块', '油田', '平台', '创建时间', '创建人', '删除时间', '删除人', '操作']} rows={[]} empty={search ? '未找到匹配数据' : '暂无数据'} /><Pagination count={0} /></section><section><PanelHeading title="Run列表" /><SimpleTable columns={['序号', 'RunID', '井眼尺寸(in)', '仪器入井时间', '设计深度(m)', '起始深度(m)', '创建时间', '创建人', '删除时间', '删除人']} rows={[]} /></section></div>
}
function RunRecyclePage() {
  const confirm = useConfirm()
  const [rows, setRows] = useState([{ id: '1', well: 'fuyi_1.0_test_bohai', run: '100', size: '7', start: '2026-09-03 00:00:00', depth: '1000', startDepth: '0', created: '2026-09-03 09:53:15', creator: 'test', deleted: '2026-09-09 09:06:01', deletedBy: 'test' }])
  const [search, setSearch] = useState('')
  return <section className="ops-page-panel"><PanelHeading title="Run列表"><label>井名<input aria-label="回收站井名" onChange={event => setSearch(event.target.value)} placeholder="请输入井名" /></label><label>RunID<input aria-label="回收站RunID" /></label><label>删除日期<input aria-label="删除开始日期" type="date" /><input aria-label="删除结束日期" type="date" /></label></PanelHeading><SimpleTable columns={['序号', '井名', 'RunID', '井眼尺寸(in)', '仪器入井时间', '设计深度(m)', '起始深度(m)', '创建时间', '创建人', '删除时间', '删除人', '操作']} rows={rows.filter(row => row.well.includes(search)).map((row, index) => [index + 1, row.well, row.run, row.size, row.start, row.depth, row.startDepth, row.created, row.creator, row.deleted, row.deletedBy, <div className="ops-row-actions"><button title="恢复" aria-label="恢复" onClick={() => { setRows(current => current.filter(item => item.id !== row.id)); toast.success('Run已恢复') }}><RotateCcw /></button><button title="彻底删除" aria-label="彻底删除" onClick={() => confirm({ title: '彻底删除Run', name: `${row.well} / Run ${row.run}`, description: '彻底删除后，该Run及其回收站记录将无法恢复。', onConfirm: () => { setRows(current => current.filter(item => item.id !== row.id)); toast.success('Run已彻底删除') } })}><Trash2 /></button></div>])} /><Pagination count={rows.length} /></section>
}

function ActivePage({ id }: { id: PageId }) {
  if (id === 'regionUsers' || id === 'userRoles' || id === 'serverRegions') return <TransferPage kind={id} />
  if (id === 'rolePermissions') return <RolePermissionsPage />
  if (id === 'groups') return <GroupsPage />
  if (id === 'servers') return <ServersPage />
  if (id === 'functions') return <FunctionsPage />
  if (id === 'menus') return <MenusPage />
  if (id === 'upgrades') return <UpgradesPage />
  if (id === 'monitoring') return <MonitoringPage />
  if (id === 'backup') return <BackupPage />
  if (id === 'master') return <MasterDataPage />
  if (id === 'wellRecycle') return <WellRecyclePage />
  return <RunRecyclePage />
}

export default function OperationsManagementPage() {
  const navigate = useNavigate()
  const [openTabs, setOpenTabs] = useState<PageId[]>(['servers'])
  const [activeTab, setActiveTab] = useState<PageId | null>('servers')
  const [adminOpen, setAdminOpen] = useState(true)
  const [masterOpen, setMasterOpen] = useState(true)
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
  const navButton = ({ id, icon: Icon }: { id: PageId, icon: typeof Users }, child = false) => <button className={`${activeTab === id ? 'active' : ''} ${child ? 'ops-nav-child' : ''}`} key={id} onClick={() => openPage(id)}><Icon />{pageLabels[id]}</button>
  return <div className="stats-page ops-page"><header className="stats-header"><button className="stats-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>运维管理</strong></button><HeaderUser /></header><div className="stats-shell"><aside className="stats-sidebar"><nav className="stats-nav operation-nav" aria-label="运维管理导航"><div className={`ops-nav-group ${adminPages.some(page => page.id === activeTab) ? 'active-parent' : ''}`}><button onClick={() => setAdminOpen(!adminOpen)}><UserRound />区域管理员{adminOpen ? <ChevronUp /> : <ChevronDown />}</button></div>{adminOpen && adminPages.map(page => navButton(page, true))}{systemPages.map(page => navButton(page))}<div className={`ops-nav-group ${masterPages.some(page => page.id === activeTab) ? 'active-parent' : ''}`}><button onClick={() => setMasterOpen(!masterOpen)}><BookOpen />主数据管理{masterOpen ? <ChevronUp /> : <ChevronDown />}</button></div>{masterOpen && masterPages.map(page => navButton(page, true))}</nav></aside><main className={`stats-main operation-main ${openTabs.length === 0 ? 'stats-main--empty' : ''}`}>{openTabs.length > 0 && <div className="stats-tabs" role="tablist" aria-label="已打开的运维管理页面">{openTabs.map(pageId => <div className={`stats-tab ${activeTab === pageId ? 'active' : ''}`} key={pageId}><button className="stats-tab-label" role="tab" aria-selected={activeTab === pageId} onClick={() => setActiveTab(pageId)}>{pageLabels[pageId]}</button><button className="stats-tab-close" aria-label={`关闭${pageLabels[pageId]}`} onClick={() => closePage(pageId)}><X /></button></div>)}</div>}{activeTab && <ActivePage id={activeTab} />}</main></div></div>
}
