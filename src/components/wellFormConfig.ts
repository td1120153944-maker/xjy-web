import type { WellFormValues } from '../types'

export const wellSelectOptions: Partial<Record<keyof WellFormValues, string[]>> = {
  country: ['中国', '伊拉克', '印度尼西亚', '墨西哥'],
  region: ['渤海', '渝中', '川渝', '山西', '塘沽', '湛江', '海南'],
  block: ['金昌', '秦皇岛', 'BZ8-3', 'BZ19-6', '临兴', '泸县', '长宁'],
  oilfield: ['金昌1-1', '金昌1-2', '秦皇岛32-6', 'BZ8-3-1', 'BZ19-6-1', '临兴气田', '页岩气田'],
  company: ['深圳作业公司', '中海油服', '川庆钻探'],
  wellType: ['定向井', '水平井', '直井'],
  category: ['领眼井', '开发井', '评价井', '探井'],
  operator: ['SK', '张三', '李四', '王五'],
  difficulty: ['大位移井', '常规', '中等', '困难'],
  status: ['作业中', '作业完成', '待机'],
  rig: ['海洋石油906', 'ZJ50', 'ZJ70', 'ZJ90'],
  risk: ['一级', '二级', '三级', '低', '中', '高'],
  timezone: ['UTC+08:00', 'UTC+07:00', 'UTC-06:00'],
  testWell: ['是', '否'],
  xuanjiWell: ['是', '否'],
  gyroReportWell: ['常规井', '陀螺作业井'],
}

export const wellFieldLabels: Record<keyof WellFormValues, string> = {
  name: '井名',
  country: '国家',
  region: '区域',
  block: '区块',
  oilfield: '油田',
  company: '作业公司',
  wellType: '井型',
  category: '井别',
  operator: '作业者',
  ownership: '自营/合营',
  subcontractor: '分包商',
  difficulty: '难度类型',
  status: '井状态',
  rig: '钻机',
  startDepth: '起始井深',
  designDepth: '设计深度',
  targetInclination: '目标井斜',
  targetAzimuth: '目标方位',
  risk: '风险等级',
  timezone: '时区',
  testWell: '测试井',
  xuanjiWell: '璇玑作业井',
  gyroReportWell: '陀螺周报井',
  createdAt: '创建时间',
}

/** 详情面板 / 编辑弹窗的左列字段 */
export const detailLeftFields: (keyof WellFormValues)[] = ['name', 'region', 'oilfield', 'wellType', 'operator', 'status', 'startDepth', 'targetInclination', 'risk', 'testWell']

/** 详情面板 / 编辑弹窗的右列字段 */
export const detailRightFields: (keyof WellFormValues)[] = ['country', 'block', 'company', 'category', 'difficulty', 'rig', 'designDepth', 'targetAzimuth', 'timezone', 'xuanjiWell']

/** 仅陀螺作业模式相比常规井模式隐藏的两个字段 */
export const gyroHiddenFields: (keyof WellFormValues)[] = ['targetInclination', 'targetAzimuth']
