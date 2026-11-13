export interface Well {
  id: string
  name: string
  run: string
  region: string
  status: '作业中' | '作业完成' | '待机'
  favorite: boolean
  provider: string
  startTime: string
  holeSize: string
  bha: string
  md: string
  inc: string
  azi: string
  currentDepth: number
  designDepth: number
  engineers: string
}

export interface WitsmlInstance {
  id: string
  name: string
  creator: string
  createdAt: string
  status: '传输中' | '未传输' | '已结束'
  well: string
  run: string
}

export interface WellFormValues {
  name: string
  country: string
  region: string
  block: string
  oilfield: string
  company: string
  wellType: string
  category: string
  operator: string
  ownership: string
  subcontractor: string
  difficulty: string
  status: Well['status']
  rig: string
  startDepth: string
  designDepth: string
  targetInclination: string
  targetAzimuth: string
  risk: string
  timezone: string
  testWell: string
  xuanjiWell: string
  gyroReportWell: string
  createdAt: string
}

/** 云端井井树层级：区域 → 区块 → 油田 → 井 */
export interface OilfieldNode {
  name: string
  wells: WellFormValues[]
}

export interface BlockNode {
  name: string
  oilfields: OilfieldNode[]
}

export interface RegionNode {
  name: string
  blocks: BlockNode[]
}
