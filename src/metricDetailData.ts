import { testPersonnel } from './drillingTestData'
import type { MaintenanceRecord, TestInstrument, TestWell, TrialChange } from './drillingTestData'

export type MetricDetailKind = 'personnel' | 'instruments' | 'faults' | 'maintenance' | 'changes' | 'wells' | 'runs' | 'footage' | 'cycle' | 'loss'
export interface MetricDetail {
  title: string
  columns: string[]
  rows: (string | number)[][]
}

const dayMs = 86400000
const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00`)
  value.setDate(value.getDate() + days)
  return formatDate(value)
}
const durationDays = (start: string, end?: string | null) => {
  if (!start || start === '—') return 0
  const finish = end ? new Date(`${end}T00:00:00`).getTime() : Date.now()
  return Math.max(0, Math.ceil((finish - new Date(`${start}T00:00:00`).getTime()) / dayMs) + 1)
}
const wellEnd = (well: TestWell) => well.status === '作业完成' ? well.end : well.status === '准备作业' ? '待定（准备作业）' : '待定（试验进行中）'
const wellDuration = (well: TestWell) => well.status === '准备作业' ? 0 : durationDays(well.start, well.status === '作业完成' ? well.end : null)
const platformPeriod = (well: TestWell) => ({
  start: `${well.start} 08:00`,
  end: well.status === '作业完成' ? `${well.end} 18:00` : well.status === '准备作业' ? '待上平台' : '仍在平台',
  duration: wellDuration(well),
})
const instrumentSize = (instrument: TestInstrument) => instrument.model.match(/[\d-]+\/[\d]+"/)?.[0] || '6-3/4"'
const instrumentCategory = (instrument: TestInstrument) => instrument.id.split('-')[0]
const distribute = (total: number, count: number, digits: number) => {
  const share = Number((total / count).toFixed(digits))
  return Array.from({ length: count }, (_, index) => index === count - 1 ? Number((total - share * (count - 1)).toFixed(digits)) : share)
}
export const runDetails = (well: TestWell) => {
  const footage = distribute(well.footage, well.run, 0)
  const cycle = distribute(well.cycle, well.run, 1)
  const loss = distribute(well.loss, well.run, 1)
  return Array.from({ length: well.run }, (_, index) => {
    const start = addDays(well.start, index * 7)
    const completed = well.status === '作业完成' || index < well.run - 1
    const end = completed ? addDays(start, 6) : null
    return {
      well: well.name,
      run: `Run ${index + 1}`,
      start,
      end: end || '待定（试验进行中）',
      duration: durationDays(start, end),
      footage: footage[index],
      cycle: cycle[index],
      loss: loss[index],
    }
  })
}

const personnelNames = [
  '张磊', '王工', '陈工', '刘工', '赵工', '周工', '孙工', '刘洋', '符艺', '王一',
  '李强', '周涛', '吴昊', '郑凯', '何军', '郭林', '马超', '高峰', '宋扬', '唐杰',
  '许明', '韩松', '冯远', '蒋峰', '沈洋', '曹阳', '谢宁', '罗成', '梁涛', '杜伟',
  '叶林', '程鹏', '苏浩', '魏然', '吕斌', '丁磊', '任飞', '姚远', '卢涛', '钟华',
]

export function buildMetricDetails(
  wells: TestWell[],
  instruments: TestInstrument[],
  maintenance: MaintenanceRecord[],
  changes: TrialChange[],
): Record<MetricDetailKind, MetricDetail> {
  const runs = wells.flatMap(runDetails)
  const sourceWell = (instrument: TestInstrument) => wells.find(well => well.instrumentIds.includes(instrument.id)) || wells[0]
  const personnelRows = wells.flatMap((well, wellIndex) => {
    const period = platformPeriod(well)
    return Array.from({ length: testPersonnel[well.id] || 0 }, (_, index) => {
      const name = personnelNames[(wellIndex * 9 + index) % personnelNames.length]
      return [name, period.start, period.end, `${period.duration} 天`]
    })
  })
  const instrumentRows = instruments.map((instrument, index) => {
    const well = sourceWell(instrument)
    const period = well ? platformPeriod(well) : { start: '—', end: '—', duration: 0 }
    return [instrumentCategory(instrument), instrumentSize(instrument), instrument.name, `V${index % 3 + 1}.2.0`, `HW-${String.fromCharCode(65 + index % 3)}`, period.start, period.end, `${period.duration} 天`]
  })
  const faultRows = instruments.flatMap((instrument, instrumentIndex) => {
    const well = sourceWell(instrument)
    return Array.from({ length: instrument.faults }, (_, faultIndex) => {
      const index = instrumentIndex + faultIndex
      const date = well ? addDays(`${well.year}-01-20`, index * 31) : '—'
      return [`${date} ${String(8 + index % 10).padStart(2, '0')}:30`, instrument.name, instrumentSize(instrument), instrumentCategory(instrument), index % 2 === 0 ? '是' : '否', `${(0.5 + index % 4 * 1.5).toFixed(1)} h`]
    })
  })
  const maintenanceRows = maintenance.map((item, index) => {
    const instrument = instruments.find(value => value.id === item.instrument)
    const startDay = addDays(`${item.year}-01-15`, index * 24)
    return [item.instrument, instrument ? instrumentSize(instrument) : '—', instrument ? instrumentCategory(instrument) : item.instrument.split('-')[0], `${startDay} 08:00`, item.result === '已完成' ? `${startDay} 16:00` : '—', item.result === '已完成' ? '8.0 h' : '进行中', item.result]
  })
  const wellRows = wells.map(well => [well.name, well.start, wellEnd(well), `${wellDuration(well)} 天`])
  const runRows = runs.map(run => [run.well, run.run, run.start, run.end, `${run.duration} 天`])
  return {
    personnel: { title: '总人次', columns: ['人名', '上平台时间', '下平台时间', '在平台时长'], rows: personnelRows },
    instruments: { title: '参试仪器数量', columns: ['仪器类别', '仪器尺寸', '仪器名称', '仪器版本号', '硬件版本号', '上平台时间', '下平台时间', '在平台时长'], rows: instrumentRows },
    faults: { title: '故障情况', columns: ['故障发生时间', '故障仪器名称', '故障仪器尺寸', '故障仪器类别', '是否起钻', 'NPT时间'], rows: faultRows },
    maintenance: { title: '仪器新疆维保情况', columns: ['仪器名称', '仪器尺寸', '仪器类别', '维保开始时间', '维保结束时间', '维保持续时长', '维保状态'], rows: maintenanceRows },
    changes: { title: '试验变更情况', columns: ['试验变更日期', '变更描述'], rows: changes.map(item => [item.date, `${item.title}。${item.result}`]) },
    wells: { title: '钻井数量', columns: ['井名', '开始时间', '结束时间', '持续时长'], rows: wellRows },
    runs: { title: '总Run数', columns: ['井名', 'Run名', '开始时间', '结束时间', '持续时长'], rows: runRows },
    footage: { title: '总进尺', columns: ['井名', 'Run名', '进尺(m)'], rows: runs.map(run => [run.well, run.run, run.footage]) },
    cycle: { title: '总循环时间', columns: ['井名', 'Run名', '循环时间(h)'], rows: runs.map(run => [run.well, run.run, run.cycle]) },
    loss: { title: '损失时间', columns: ['井名', 'Run名', '损失时间(h)'], rows: runs.map(run => [run.well, run.run, run.loss]) },
  }
}
