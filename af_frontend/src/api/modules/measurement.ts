// 测量相关API
import { apiRequest } from '../config'
import { IResData } from '@/typings'

/**
 * 测量数据点
 */
export interface MeasurementData {
  timestamp: string
  x: number
  y: number
  z: number
}

/**
 * 开始测量请求参数
 */
export interface StartMeasurementRequest {
  userId: string
  measurementType?: string
  durationSeconds?: number
}

/**
 * 上传数据请求参数
 */
export interface UploadDataRequest {
  measurementId: number
  data: MeasurementData[]
}

/**
 * 结束测量请求参数
 */
export interface EndMeasurementRequest {
  measurementId: number
}

/**
 * 测量历史查询参数
 */
export interface MeasurementHistoryParams {
  userId: string
  page?: number
  limit?: number
}

/**
 * 开始测量
 * @param data 开始测量参数
 * @returns 测量会话信息
 */
export const startMeasurement = (data: StartMeasurementRequest, headers = {}) => {
  console.log('🎯 开始测量，用户ID:', data.userId)
  return apiRequest.post<IResData<any>>('/api/measurement/start', data, undefined, headers)
}

/**
 * 上传测量数据
 * @param data 测量数据
 * @returns 上传结果
 */
export const uploadMeasurementData = (data: UploadDataRequest, headers = {}) => {
  console.log('📊 上传测量数据，ID:', data.measurementId, '数据点数:', data.data.length)
  return apiRequest.post<IResData<any>>('/api/measurement/upload', data, undefined, headers)
}

/**
 * 结束测量
 * @param data 结束测量参数
 * @returns 测量结果
 */
export const endMeasurement = (data: EndMeasurementRequest, headers = {}) => {
  console.log('🏁 结束测量，ID:', data.measurementId)
  return apiRequest.post<IResData<any>>('/api/measurement/end', data, undefined, headers)
}

/**
 * 获取测量历史
 * @param params 查询参数
 * @returns 测量历史列表
 */
export const getMeasurementHistory = (params: MeasurementHistoryParams, headers = {}) => {
  console.log('📋 获取测量历史，用户ID:', params.userId)
  return apiRequest.get<IResData<any>>('/api/measurement/history', params, headers)
}

/**
 * 获取测量详情
 * @param measurementId 测量ID
 * @returns 测量详情
 */
export const getMeasurementDetail = (measurementId: number, headers = {}) => {
  console.log('🔍 获取测量详情，ID:', measurementId)
  return apiRequest.get<IResData<any>>(`/api/measurement/detail/${measurementId}`, undefined, headers)
}

/**
 * 删除测量记录
 * @param measurementId 测量ID
 * @returns 删除结果
 */
export const deleteMeasurement = (measurementId: number, headers = {}) => {
  console.log('🗑️ 删除测量记录，ID:', measurementId)
  return apiRequest.delete<IResData<any>>(`/api/measurement/${measurementId}`, undefined, headers)
}