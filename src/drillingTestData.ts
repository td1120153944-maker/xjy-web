export interface TestWell {
  id: string
  name: string
  year: number
  region: string
  status: '作业中' | '作业完成' | '准备作业'
  start: string
  end: string
  run: number
  footage: number
  cycle: number
  pureTime: number
  loss: number
  instrumentIds: string[]
  engineers: string
  bha: string
  depth: number
  designDepth: number
  change: string
  holeSize: string
  lastSurvey: string
  country: string
  block: string
  company: string
  oilfield: string
  wellType: string
  operator: string
  difficulty: string
  timezone: string
  category: string
  platform: string
  risk: string
  targetInc: string
  targetAzi: string
  startDepth: string
  isTest: string
  isXuanji: string
  createdAt: string
}

export interface TestInstrument {
  id: string
  name: string
  model: string
  firstYear: number
  isNew: boolean
  status: '试验中' | '待命' | '维保中'
  wellIds: string[]
  footage: number
  cycle: number
  faults: number
  performance: number
  maintenance: string
}

export interface TestReport {
  id: string
  title: string
  type: '仪器报告' | '项目报告'
  year: number
  well: string
  instrument: string
  date: string
  status: '已归档' | '审核中'
}

const commonWell = {
  country: '中国', company: '新疆油田分公司', wellType: '定向井', operator: '中海油服',
  difficulty: '中', timezone: '(UTC+08:00) 北京，重庆，香港特别行政区，乌鲁木齐',
  category: '生产井', risk: '二级', startDepth: '0', isTest: '是', isXuanji: '是',
}

export const testWells: TestWell[] = [
  { id: 'w1', name: '克拉玛依试验井KLMY-2026-01', year: 2026, region: '新疆', status: '作业中', start: '2026-09-18', end: '2026-11-15', run: 6, footage: 3286, cycle: 286.5, pureTime: 152.2, loss: 9.5, instrumentIds: ['ABC-01', 'IDMP-03', 'RSS-02'], engineers: '张磊、王工', bha: '6-3/4"ABC + IDMP + RSS', depth: 3672, designDepth: 4680, change: '2026-10-22 增加RSS旋转导向验证工况。', holeSize: '8.50 in', lastSurvey: '3650.20 m', block: '克拉玛依区块', oilfield: '克拉玛依油田', platform: 'ZJ70D-01', targetInc: '72.50', targetAzi: '122.00', createdAt: '2026-09-12 10:26:18', ...commonWell },
  { id: 'w2', name: '塔里木试验井TLM-2026-02', year: 2026, region: '新疆', status: '作业完成', start: '2026-06-10', end: '2026-08-02', run: 4, footage: 2140, cycle: 198.4, pureTime: 113.6, loss: 3, instrumentIds: ['IDMP-03', 'RSS-02', 'ARC-01'], engineers: '陈工、刘工', bha: '8-1/2"IDMP + RSS + ARC', depth: 3920, designDepth: 3920, change: '试验内容按原计划完成，无重大变更。', holeSize: '8.50 in', lastSurvey: '3920.00 m', block: '塔中区块', oilfield: '塔里木油田', platform: 'ZJ80D-06', targetInc: '68.00', targetAzi: '96.50', createdAt: '2026-06-02 14:08:36', ...commonWell },
  { id: 'w3', name: '准噶尔试验井ZGR-2025-03', year: 2025, region: '新疆', status: '作业完成', start: '2025-04-12', end: '2025-06-26', run: 5, footage: 2968, cycle: 264.8, pureTime: 141.5, loss: 6.2, instrumentIds: ['PWD-05', 'LWD-02'], engineers: '赵工、周工', bha: '6-3/4"PWD + LWD', depth: 4250, designDepth: 4250, change: '中途调整高温循环测试时长。', holeSize: '6.75 in', lastSurvey: '4250.00 m', block: '准东区块', oilfield: '准噶尔油田', platform: 'ZJ70D-12', targetInc: '76.20', targetAzi: '143.80', createdAt: '2025-04-05 09:32:40', ...commonWell },
  { id: 'w4', name: '吐哈试验井TH-2024-01', year: 2024, region: '新疆', status: '作业完成', start: '2024-03-08', end: '2024-05-19', run: 3, footage: 1826, cycle: 176.2, pureTime: 96.8, loss: 2.4, instrumentIds: ['ARC-01'], engineers: '孙工', bha: '8-1/2"ARC', depth: 3560, designDepth: 3560, change: '完成首批仪器可靠性验证。', holeSize: '8.50 in', lastSurvey: '3560.00 m', block: '鄯善区块', oilfield: '吐哈油田', platform: 'ZJ50D-03', targetInc: '62.30', targetAzi: '85.60', createdAt: '2024-03-01 16:18:22', ...commonWell },
  { id: 'w5', name: '新疆油田试验井XJY-2026-03', year: 2026, region: '新疆', status: '准备作业', start: '2026-11-20', end: '2027-01-08', run: 0, footage: 0, cycle: 0, pureTime: 0, loss: 0, instrumentIds: ['ABC-01', 'PWD-05'], engineers: '刘洋、赵工', bha: '6-3/4"ABC + PWD（待确认）', depth: 0, designDepth: 3980, change: '待完成入场验收后启动。', holeSize: '8.50 in', lastSurvey: '—', block: '玛湖区块', oilfield: '新疆油田', platform: 'ZJ70D-18', targetInc: '70.00', targetAzi: '110.00', createdAt: '2026-10-28 11:06:52', ...commonWell },
]

export const testInstruments: TestInstrument[] = [
  { id: 'ABC-01', name: 'ABC-01', model: 'ABC 6-3/4"', firstYear: 2026, isNew: true, status: '试验中', wellIds: ['w1', 'w5'], footage: 3286, cycle: 286.5, faults: 1, performance: 92, maintenance: '2026-10-12 完成新疆现场维保，更换密封组件。' },
  { id: 'IDMP-03', name: 'IDMP-03', model: 'IDMP 6-3/4"', firstYear: 2025, isNew: false, status: '试验中', wellIds: ['w1', 'w2'], footage: 5426, cycle: 484.9, faults: 0, performance: 96, maintenance: '2026-09-02 完成常规保养，状态正常。' },
  { id: 'RSS-02', name: 'RSS-02', model: 'RSS 8-1/2"', firstYear: 2026, isNew: true, status: '试验中', wellIds: ['w1', 'w2'], footage: 5426, cycle: 484.9, faults: 1, performance: 89, maintenance: '2026-10-25 排查通信间歇异常，已恢复。' },
  { id: 'PWD-05', name: 'PWD-05', model: 'PWD 6-3/4"', firstYear: 2025, isNew: false, status: '待命', wellIds: ['w3', 'w5'], footage: 2968, cycle: 264.8, faults: 1, performance: 90, maintenance: '2025-07-02 完成试验后检测。' },
  { id: 'LWD-02', name: 'LWD-02', model: 'LWD 6-3/4"', firstYear: 2025, isNew: false, status: '待命', wellIds: ['w3'], footage: 2968, cycle: 264.8, faults: 0, performance: 95, maintenance: '2025-07-02 完成试验后检测。' },
  { id: 'ARC-01', name: 'ARC-01', model: 'ARC 8-1/2"', firstYear: 2024, isNew: false, status: '维保中', wellIds: ['w2', 'w4'], footage: 3966, cycle: 374.6, faults: 2, performance: 84, maintenance: '2026-10-28 返厂检修，预计11月5日完成。' },
]

export const initialTestReports: TestReport[] = [
  { id: 'r1', title: 'ABC-01克拉玛依井实钻试验报告', type: '仪器报告', year: 2026, well: '克拉玛依试验井KLMY-2026-01', instrument: 'ABC-01', date: '2026-10-28', status: '审核中' },
  { id: 'r2', title: '塔里木井旋转导向联合试验报告', type: '项目报告', year: 2026, well: '塔里木试验井TLM-2026-02', instrument: 'IDMP-03、RSS-02', date: '2026-08-12', status: '已归档' },
  { id: 'r3', title: 'PWD-05准噶尔井可靠性验证报告', type: '仪器报告', year: 2025, well: '准噶尔试验井ZGR-2025-03', instrument: 'PWD-05', date: '2025-07-08', status: '已归档' },
  { id: 'r4', title: 'ARC-01吐哈井首批试验报告', type: '项目报告', year: 2024, well: '吐哈试验井TH-2024-01', instrument: 'ARC-01', date: '2024-05-30', status: '已归档' },
]

export const yearlySummary = [
  { year: '2024', wells: 1, runs: 3, footage: 1826, cycle: 176.2, pureTime: 96.8, instruments: 1, newInstruments: 1, reports: 1 },
  { year: '2025', wells: 1, runs: 5, footage: 2968, cycle: 264.8, pureTime: 141.5, instruments: 2, newInstruments: 2, reports: 1 },
  { year: '2026', wells: 3, runs: 10, footage: 5426, cycle: 484.9, pureTime: 265.8, instruments: 4, newInstruments: 2, reports: 2 },
]

export const testPersonnel: Record<string, number> = { w1: 18, w2: 14, w3: 12, w4: 9, w5: 8 }

export interface MaintenanceRecord {
  year: number
  instrument: string
  result: '已完成' | '进行中'
  description: string
}
export const maintenanceRecords: MaintenanceRecord[] = [
  { year: 2026, instrument: 'ABC-01', result: '已完成', description: '新疆现场维保后恢复正常' },
  { year: 2026, instrument: 'IDMP-03', result: '已完成', description: '常规保养完成，状态正常' },
  { year: 2026, instrument: 'RSS-02', result: '已完成', description: '通信异常已排除' },
  { year: 2026, instrument: 'ARC-01', result: '进行中', description: '返厂检修，待出厂复检' },
  { year: 2025, instrument: 'PWD-05', result: '已完成', description: '试验后检测合格' },
  { year: 2025, instrument: 'LWD-02', result: '已完成', description: '试验后检测合格' },
  { year: 2024, instrument: 'ARC-01', result: '已完成', description: '首批试验后保养完成' },
]

export interface TrialChange {
  year: number
  type: '试验调整' | '不可抗力'
  title: string
  result: string
  date: string
}
export const trialChanges: TrialChange[] = [
  { year: 2026, type: '试验调整', title: '增加RSS旋转导向验证工况', result: '已按变更后方案继续试验', date: '2026-10-22' },
  { year: 2026, type: '不可抗力', title: '新疆强风沙导致转场计划延期', result: '已完成安全评估并恢复转场', date: '2026-09-30' },
  { year: 2025, type: '试验调整', title: '调整高温循环测试时长', result: '变更后测试目标已完成', date: '2025-05-16' },
]

export interface GalleryItem {
  year: number
  image: string
  title: string
  description: string
  recordedAt: string
}
export const testGallery: GalleryItem[] = [
  { year: 2026, image: '/images/drilling-test/expert-1.jpg', title: '多屏联合作业支持', description: '现场专家与远程支持中心协同跟踪试验曲线和关键工况。', recordedAt: '2026-10-26 15:30:00' },
  { year: 2026, image: '/images/drilling-test/overseas.jpg', title: '自研工具海外首秀', description: '自研D&W工具完成海外实钻验证，团队合影记录关键里程碑。', recordedAt: '2026-09-28 10:00:00' },
  { year: 2025, image: '/images/drilling-test/expert-2.jpg', title: '远程支持中心值守', description: '支持中心持续监测试验数据，为现场提供实时决策支持。', recordedAt: '2025-06-18 16:20:00' },
  { year: 2024, image: '/images/drilling-test/expert-3.jpg', title: '专家团队协同研判', description: '多专业团队联合分析仪器数据与试验进展。', recordedAt: '2024-05-16 11:30:00' },
]
