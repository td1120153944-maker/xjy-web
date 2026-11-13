import { ChartNoAxesColumn, Gauge, RefreshCw } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

const records = [
  { label: '最大循环时间', value: '100', unit: 'h' },
  { label: '最大入井时间', value: '600', unit: 'h' },
  { label: '最大纯钻时间', value: '100', unit: 'h' },
  { label: '最大进尺', value: '1,000', unit: 'm' },
  { label: '最大井深', value: '1,100', unit: 'm' },
  { label: '最大泥浆比重', value: '2', unit: 'g/cm³' },
  { label: '最高循环温度', value: '100', unit: '℃', hot: true },
]
const monthly = [{ month: 7, count: 5 }, { month: 9, count: 7 }, { month: 10, count: 3 }]
const instrumentRows = [['Welleader', '4', '144', '2199'], ['HSVP', '0', '0', '0'], ['DSM', '1', '10', '100'], ['IDMP', '2', '105', '1000'], ['ACPR', '4', '46', '320'], ['DWPR', '0', '0', '0']]
const domesticRows = [['Welleader', '2', '2'], ['HSVP', '0', '0'], ['DSM', '1', '0'], ['IDMP', '1', '1'], ['ACPR', '4', '0'], ['DWPR', '0', '0']]
const regionRows = [['Welleader', '0', '2', '0', '0', '0', '0'], ['HSVP', '0', '0', '0', '0', '0', '0'], ['DSM', '0', '1', '0', '0', '0', '0'], ['IDMP', '0', '0', '0', '0', '0', '0'], ['ACPR', '0', '4', '0', '0', '0', '0'], ['DWPR', '0', '0', '0', '0', '0', '0']]

function SectionTitle({ children }: { children: string }) {
  return <h2 className="stats-section-title"><span>◆</span>{children}</h2>
}

function TimeCard({ label, value, icon: Icon }: { label: string, value: string, icon: typeof RefreshCw }) {
  return <article className="stats-overview-card stats-time-card"><div><span>{label}</span><strong>{value}<small>(h)</small></strong><Icon /></div><div><span>26年－{label}</span><strong>{value}<small>(h)</small></strong><Icon /></div></article>
}

function StatsTable({ title, columns, rows }: { title: string, columns: string[], rows: string[][] }) {
  return <section className="stats-panel stats-table-panel"><SectionTitle>{title}</SectionTitle><div className="stats-table-wrap"><table className="stats-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}</tr>)}</tbody></table></div></section>
}

export default function StatsOverviewPage() {
  return (
    <>
      <div className="stats-dashboard">
        <div className="stats-primary">
          <section className="stats-panel stats-overview-panel">
            <SectionTitle>作业概览</SectionTitle>
            <div className="stats-overview-grid">
              <article className="stats-overview-card stats-basic-card"><span>总井次</span><strong>15<small>(次)</small></strong></article>
              <article className="stats-overview-card stats-basic-card"><span>总进尺</span><strong>2,319<small>(m)</small></strong></article>
              <TimeCard label="累计循环时间" value="162" icon={RefreshCw} />
              <TimeCard label="累计纯钻时间" value="155" icon={Gauge} />
              <TimeCard label="累计入井时间" value="1,936.73" icon={ChartNoAxesColumn} />
              <article className="stats-overview-card stats-basic-card"><span>26年<br />总井次</span><strong>15<small>(次)</small></strong></article>
              <article className="stats-overview-card stats-basic-card"><span>26年<br />总进尺</span><strong>2,319<small>(m)</small></strong></article>
            </div>
          </section>
          <section className="stats-panel">
            <SectionTitle>作业记录(单趟)</SectionTitle>
            <div className="stats-record-grid">{records.map(record => <article className={`stats-record-card ${record.hot ? 'stats-record-card--hot' : ''}`} key={record.label}><span>{record.label}</span><strong>{record.value}<small>({record.unit})</small></strong></article>)}</div>
          </section>
          <div className="stats-companies">
            <section className="stats-panel"><SectionTitle>国内公司井次(26年)</SectionTitle><div className="stats-company-grid">{[['深圳作业公司', '7'], ['贝克休斯', '3'], ['研究院', '1']].map(([name, value]) => <article className="stats-company-card" key={name}><span>{name}</span><strong>{value}</strong></article>)}</div></section>
            <section className="stats-panel"><SectionTitle>海外项目组井次(26年)</SectionTitle><div className="stats-company-grid stats-company-grid--overseas"><article className="stats-company-card"><span>缅甸作业公司</span><strong>4</strong></article></div></section>
          </div>
        </div>
        <aside className="stats-secondary">
          <section className="stats-panel stats-success-panel"><SectionTitle>璇玑作业成功率</SectionTitle><div className="stats-success-grid"><article><span>作业<br />成功率</span><strong>0.01<small>(%)</small></strong></article><article><span>一次入井<br />成功率</span><strong>0.02<small>(%)</small></strong></article></div></section>
          <section className="stats-panel stats-monthly-panel">
            <SectionTitle>分月统计</SectionTitle><span className="stats-chart-unit stats-chart-unit--top">单位(井次)</span>
            <div className="stats-monthly-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly} margin={{ top: 24, right: 16, bottom: 22, left: 0 }}><CartesianGrid vertical={false} stroke="#e3e8e7" /><XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#9ca9a9' }} tick={{ fill: '#263b3c', fontSize: 13 }} /><YAxis domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} tickLine={false} axisLine={false} width={28} tick={{ fill: '#263b3c', fontSize: 13 }} /><Tooltip cursor={{ fill: 'rgba(35, 179, 126, .06)' }} formatter={(value) => [`${value} 井次`, '数量']} labelFormatter={label => `${label} 月`} /><Bar dataKey="count" fill="#24b47e" maxBarSize={18} radius={[2, 2, 0, 0]}><LabelList dataKey="count" position="top" fill="#263b3c" fontSize={13} /></Bar></BarChart></ResponsiveContainer></div>
            <span className="stats-chart-unit stats-chart-unit--bottom">单位(月)</span>
          </section>
        </aside>
      </div>
      <div className="stats-tables">
        <StatsTable title="单仪器作业统计(次)-26年" columns={['仪器', '井次(次)', '循环时间(h)', '进尺(m)']} rows={instrumentRows} />
        <StatsTable title="单仪器国内外统计(次)-26年" columns={['仪器', '国内', '国外']} rows={domesticRows} />
        <StatsTable title="单仪器区域作业统计(次)-26年" columns={['仪器', '塘沽', '深圳', '湛江', '海南', '上海', '陆地']} rows={regionRows} />
      </div>
    </>
  )
}
