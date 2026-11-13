import type { RegionNode, Well, WellFormValues, WitsmlInstance } from './types'

export const supportStats = [
  { label: '累计井次(次)', value: '1,732' },
  { label: '累计进尺(m)', value: '1,477,455.32' },
  { label: '累计入井时间(h)', value: '131,733.50' },
  { label: '2025累计井次', value: '12' },
  { label: '2025累计进尺(m)', value: '123' },
  { label: '单趟最大循环时间(h)', value: '299.60' },
  { label: '单趟最大作业进尺(m)', value: '3,522' },
  { label: '最大井深(m)', value: '5,788' },
  { label: '最高循环温度(℃)', value: '146' },
]

const providers = ['SLB', 'SLB', 'CNOOC', 'CNOOC', 'SLB', 'BAKER', 'SLB', 'SLB', 'BAKER', 'BAKER']
const wellNames = ['泸203H76-4', '泸203H76-5', '泸203H77-1', '泸203H77-2', '泸203H78-1', '泸203H78-2', '泸203H79-1', '泸203H79-2', '泸203H80-1', '泸203H80-2']

export const initialWells: Well[] = providers.map((provider, index) => ({
  id: `well-${index + 1}`,
  name: wellNames[index],
  run: '100',
  region: '川渝',
  status: index >= 7 ? '作业完成' : '作业中',
  favorite: true,
  provider,
  startTime: '2025-03-12 0:00:00',
  holeSize: '12.25',
  bha: 'BCPM+ABC+DSM+DIMII+DWPR+RSS',
  md: '5100.00',
  inc: '71.00',
  azi: '121.00',
  currentDepth: 1200,
  designDepth: 3600,
  engineers: '张三、李四、王五',
}))

export const emptyWellForm: WellFormValues = {
  name: '', country: '', region: '', block: '', oilfield: '', company: '', wellType: '', category: '',
  operator: '', ownership: '', subcontractor: '', difficulty: '', status: '作业中', rig: '',
  startDepth: '', designDepth: '', targetInclination: '', targetAzimuth: '', risk: '', timezone: '',
  testWell: '否', xuanjiWell: '否', gyroReportWell: '', createdAt: '',
}

const cloudWell = (name: string, region: string, block: string, oilfield: string, extra: Partial<WellFormValues> = {}): WellFormValues => ({
  ...emptyWellForm,
  name,
  region,
  block,
  oilfield,
  country: '中国',
  company: '深圳作业公司',
  wellType: '定向井',
  category: '领眼井',
  operator: 'SK',
  difficulty: '大位移井',
  status: '作业完成',
  rig: '海洋石油906',
  startDepth: '0',
  designDepth: '2000',
  targetInclination: '0',
  targetAzimuth: '0',
  risk: '一级',
  timezone: 'UTC+08:00',
  testWell: '否',
  xuanjiWell: '是',
  gyroReportWell: '常规井',
  createdAt: '2026-07-21',
  ...extra,
})

export const wellHierarchy: RegionNode[] = [
  {
    name: '渤海',
    blocks: [
      {
        name: '金昌',
        oilfields: [
          {
            name: '金昌1-1',
            wells: [
              cloudWell('cai0721', '渤海', '金昌', '金昌1-1', { designDepth: '2000' }),
              cloudWell('caltest', '渤海', '金昌', '金昌1-1', { wellType: '水平井', designDepth: '3200' }),
              cloudWell('fuyi_1_0_test_bohai', '渤海', '金昌', '金昌1-1', { createdAt: '2026-09-02' }),
              cloudWell('fuyi_2_0_test_bohai', '渤海', '金昌', '金昌1-1'),
              cloudWell('fuyi_bohai_0713', '渤海', '金昌', '金昌1-1'),
              cloudWell('fuyi_bohai_0903', '渤海', '金昌', '金昌1-1'),
              cloudWell('h_260928', '渤海', '金昌', '金昌1-1'),
              cloudWell('yuqw测试', '渤海', '金昌', '金昌1-1'),
              cloudWell('z260721', '渤海', '金昌', '金昌1-1'),
              cloudWell('z260721_1', '渤海', '金昌', '金昌1-1'),
              cloudWell('z260722', '渤海', '金昌', '金昌1-1'),
            ],
          },
          {
            name: '金昌1-2',
            wells: [
              cloudWell('fuyi_bohai_1001', '渤海', '金昌', '金昌1-2'),
              cloudWell('fuyi_bohai_1002', '渤海', '金昌', '金昌1-2'),
            ],
          },
        ],
      },
      {
        name: '秦皇岛',
        oilfields: [
          {
            name: '秦皇岛32-6',
            wells: [
              cloudWell('qhd32_6_a1', '渤海', '秦皇岛', '秦皇岛32-6'),
              cloudWell('qhd32_6_a2', '渤海', '秦皇岛', '秦皇岛32-6'),
            ],
          },
        ],
      },
    ],
  },
  {
    name: '渝中',
    blocks: [
      {
        name: 'BZ8-3',
        oilfields: [
          {
            name: 'BZ8-3-1',
            wells: [
              cloudWell('YR260807', '渝中', 'BZ8-3', 'BZ8-3-1'),
              cloudWell('z260701', '渝中', 'BZ8-3', 'BZ8-3-1'),
              cloudWell('z260720', '渝中', 'BZ8-3', 'BZ8-3-1'),
            ],
          },
        ],
      },
      {
        name: 'BZ19-6',
        oilfields: [
          {
            name: 'BZ19-6-1',
            wells: [
              cloudWell('yr260819', '渝中', 'BZ19-6', 'BZ19-6-1'),
            ],
          },
        ],
      },
    ],
  },
]

export const initialInstances: WitsmlInstance[] = [
  { id: 'instance-1', name: 'XXXXXXXXXXXX实例', creator: '张三', createdAt: '2025-12-01 10:00:00', status: '传输中', well: 'CHANGQING01', run: '100' },
  { id: 'instance-2', name: 'XXXXXXXXXXXX实例2', creator: '李四', createdAt: '2025-12-01 10:00:00', status: '未传输', well: 'CHANGQING01', run: '100' },
  { id: 'instance-3', name: 'XXXXXXXXXXXX实例2', creator: '李四', createdAt: '2025-11-30 10:00:00', status: '已结束', well: 'CHANGQING01', run: '100' },
]

export const curves = ['GK', 'BitDepth', 'HoleDepth', 'GR', 'RT', 'RHOB', 'WO', 'AC']
