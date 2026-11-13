import { useState, type ReactNode } from 'react'
import { Download, FilePlus2, FileText, Filter, Search } from 'lucide-react'

const years = ['2023', '2024', '2025', '2026']
const wellNames = ['h_260928', 'test0916', 'fuyi_bohai_0903', 'fuyi_2.0_test_bohai', 'fuyi_1.0_test_bohai', 'fuyi_1.0_test_bohai', 'fuyi_test_0803', 'fuyi_test_0728', 'cai0721', 'cai0721', 'z260721_1', 'z260717_test', 'z260717_test', 'z260701']
const operationColumns = ['序号', '井名', 'RunID', '井眼尺寸(in)', '井别', '井型', '作业属地', '国家', '区域', '区块', '油田', '钻具功能', '平台', '钻井平台类型', 'LWD工程师', 'DD工程师']
const operationRows = wellNames.map((name, index) => [
  String(index + 1), name, index === 8 ? '300' : index === 4 || index === 11 ? '200' : '100',
  ['8.75', '5.875', '7', '7', '9.5', '6', '8.375'][index % 7],
  index % 3 === 0 ? '生产井' : index % 3 === 1 ? '领眼井' : '调整井',
  index % 2 === 0 ? '定向井' : '常规定向井', index % 4 === 0 ? '研究院' : '深圳作业公司',
  '中国', index % 2 === 0 ? '渤海' : '测试区域', '金县', '金县1-1',
  '马达,钻进', index % 2 === 0 ? '海洋石油906' : 'COSL7', '自升式钻井平台',
  index % 3 === 0 ? '符艺' : '', index % 4 === 0 ? 'zhuofy' : '',
])

const statsColumns = ['井次/次', '年份', 'RUN SUM', '井名', '井别', '井型', '作业属地', '区域', '作业平台/钻井船', '钻井平台类型', 'LWD工程师', 'DD工程师', '技术支持人员', '作业序号']
const statsRows = ['fuyi_test_0713', 'caitest', 'z260701', 'z260721_1', 'cai0721', 'fuyi_bohai_0903', 'fuyi_1.0_test_bohai', 'fuyi_test_0803', 'cai0721', 'fuyi_2.0_test_bohai', 'test0916', 'h_260928', 'fuyi_test_0728', 'z260717_test', 'z260717_test'].map((name, index) => [
  String(index + 1), '2026', String(index + 1), name, index % 3 === 0 ? '生产井' : index % 3 === 1 ? '领眼井' : '调整井',
  index % 2 === 0 ? '定向井' : '常规定向井', '深圳作业公司', index % 2 === 0 ? '渤海' : '测试区域',
  index % 2 === 0 ? '海洋石油906' : 'COSL7', '自升式钻井平台', index % 4 === 0 ? '何宇' : '', index % 5 === 0 ? 'zhuofy' : '', '', '1',
])

function downloadCsv(filename: string, columns: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`
  const content = [columns, ...rows].map(row => row.map(escape).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function FilterField({ label, children, wide = false }: { label: string, children: ReactNode, wide?: boolean }) {
  return <label className={`stats-filter-field ${wide ? 'stats-filter-field--wide' : ''}`}><span>{label}</span>{children}</label>
}

function YearSelect({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return <select value={value} onChange={event => onChange(event.target.value)}>{years.map(year => <option key={year}>{year}</option>)}</select>
}

function TextSelect({ value, options }: { value: string, options: string[] }) {
  return <select defaultValue={value}>{options.map(option => <option key={option}>{option}</option>)}</select>
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return <button className="stats-secondary-button" onClick={onClick}><Download />导出</button>
}

function DataTable({ columns, rows, actions = false, weekly = false }: { columns: string[], rows: string[][], actions?: boolean, weekly?: boolean }) {
  return (
    <div className={`stats-table-scroll ${weekly ? 'stats-table-scroll--weekly' : ''}`}>
      <table className="stats-data-table">
        <thead><tr>{columns.map(column => <th key={column}>{column}</th>)}{actions && <th>操作</th>}</tr></thead>
        <tbody>
          {rows.map((row, rowIndex) => <tr key={`${row[0]}-${row[1]}-${rowIndex}`}>
            {row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cellIndex === 0 && weekly ? <span className="stats-row-index">{cell}<i>›</i></span> : cell}</td>)}
            {actions && <td><div className="stats-row-actions"><button aria-label={`新增第 ${rowIndex + 1} 行记录`}><FilePlus2 /></button><button aria-label={`查看第 ${rowIndex + 1} 行记录`}><FileText /></button></div></td>}
          </tr>)}
          {rows.length === 0 && <tr><td className="stats-no-data" colSpan={columns.length + (actions ? 1 : 0)}>暂无符合筛选条件的数据</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({ runCount = 16 }: { runCount?: number }) {
  return <div className="stats-pagination"><span>井数量：<b>13</b><i />Run数量：<b>{runCount}</b></span><span>共 16 条 · 20条/页 · ‹ <strong>1</strong> › · 前往 1 页</span></div>
}

function CommonFilters({ extended = false }: { extended?: boolean }) {
  return (
    <>
      <div className="stats-filter-row">
        <FilterField label="年份"><TextSelect value="2026" options={years} /></FilterField>
        <FilterField label="国家"><TextSelect value="全部" options={['全部', '中国', '乌干达']} /></FilterField>
        <FilterField label="油田"><TextSelect value="全部" options={['全部', '金县1-1', '测试专用']} /></FilterField>
        <FilterField label="区域"><TextSelect value="全部" options={['全部', '渤海', '测试区域']} /></FilterField>
        <FilterField label="区块"><TextSelect value="全部" options={['全部', '金县', '测试区块']} /></FilterField>
        <FilterField label="作业类别"><TextSelect value="全部" options={['全部', '钻井', '完井']} /></FilterField>
      </div>
      <div className="stats-filter-row">
        <FilterField label="井别"><TextSelect value="全部" options={['全部', '生产井', '领眼井', '调整井']} /></FilterField>
        <FilterField label="井型"><TextSelect value="全部" options={['全部', '定向井', '常规定向井']} /></FilterField>
        <FilterField label="是否故障"><TextSelect value="全部" options={['全部', '是', '否']} /></FilterField>
        <FilterField label="测试井"><TextSelect value="否" options={['全部', '是', '否']} /></FilterField>
        <FilterField label="璇玑作业Run"><TextSelect value="全部" options={['全部', '100', '200', '300']} /></FilterField>
        <FilterField label="井名"><input placeholder="请输入井名" /></FilterField>
      </div>
      {extended && <div className="stats-filter-row">
        <FilterField label="仪器类别"><input placeholder="请输入仪器类别" /></FilterField>
        <FilterField label="仪器尺寸"><input placeholder="请输入仪器尺寸" /></FilterField>
        <FilterField label="序列号"><input placeholder="请输入序列号" /></FilterField>
      </div>}
    </>
  )
}

export function StatsDataPage() {
  const [startYear, setStartYear] = useState('2023')
  const [endYear, setEndYear] = useState('2026')
  const [range, setRange] = useState([2023, 2026])
  const [activeYear, setActiveYear] = useState('2026')
  const rows = statsRows.filter(row => Number(row[1]) >= range[0] && Number(row[1]) <= range[1] && row[1] === activeYear)

  return (
    <section className="stats-data-page">
      <div className="stats-filter-panel stats-filter-panel--compact">
        <div className="stats-filter-row">
          <FilterField label="开始年份"><YearSelect value={startYear} onChange={setStartYear} /></FilterField>
          <FilterField label="结束年份"><YearSelect value={endYear} onChange={setEndYear} /></FilterField>
          <button className="stats-primary-button" onClick={() => setRange([Number(startYear), Number(endYear)])}><Search />查询</button>
          <ExportButton onClick={() => downloadCsv('作业统计数据.csv', statsColumns, rows)} />
        </div>
      </div>
      <div className="stats-data-panel"><DataTable columns={statsColumns} rows={rows} /><div className="stats-year-tabs">{['2026', '2025'].map(year => <button className={activeYear === year ? 'active' : ''} key={year} onClick={() => setActiveYear(year)}>{year}</button>)}</div></div>
    </section>
  )
}

export function ToolJobInfoPage() {
  return (
    <section className="stats-data-page">
      <div className="stats-filter-panel"><CommonFilters extended /><div className="stats-filter-export"><ExportButton onClick={() => downloadCsv('工具作业信息.csv', operationColumns, operationRows)} /></div></div>
      <div className="stats-data-panel"><DataTable columns={operationColumns} rows={operationRows} /><Pagination /></div>
    </section>
  )
}

export function JobStatsPage() {
  return (
    <section className="stats-data-page">
      <div className="stats-filter-panel"><CommonFilters /><div className="stats-filter-export"><ExportButton onClick={() => downloadCsv('作业统计.csv', operationColumns, operationRows)} /></div></div>
      <div className="stats-data-panel"><DataTable columns={operationColumns} rows={operationRows} actions /><Pagination /></div>
    </section>
  )
}

const weeklyColumns = ['序号', '井名', '井眼尺寸(in)', '作业公司', '区域', '区块', '井次开始时间', '井次结束时间']
const weeklyRows = [['1', 'cai0721', '5.875', '缅甸作业公司', '渤海', '金县', '2026-07-21 00:00:00', '2026-07-30 00:00:00']]

export function WeeklyStatsPage() {
  return (
    <section className="stats-data-page">
      <div className="stats-filter-panel stats-filter-panel--compact">
        <div className="stats-filter-row">
          <FilterField label="时间段类型"><TextSelect value="周" options={['周', '月', '年']} /></FilterField>
          <FilterField label="时间段"><TextSelect value="2026年" options={['2025年', '2026年']} /></FilterField>
          <FilterField label=""><TextSelect value="2026年第31周（07.24-07.30）" options={['2026年第31周（07.24-07.30）', '2026年第30周（07.17-07.23）']} /></FilterField>
          <button className="stats-primary-button"><Search />周报速算</button>
          <button className="stats-secondary-button"><Filter />筛选</button>
        </div>
      </div>
      <div className="stats-data-panel stats-weekly-panel"><DataTable columns={weeklyColumns} rows={weeklyRows} weekly /></div>
    </section>
  )
}
