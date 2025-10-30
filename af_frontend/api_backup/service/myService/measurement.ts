import { $http } from '@/service'
import type { ApiResponse } from '@/types/api'

export interface MeasurementData {
  timestamp: string
  x: number
  y: number
  z: number
}

export interface StartMeasurementRequest {
  userId: string
  measurementType?: string
  durationSeconds?: number
}

export interface UploadDataRequest {
  measurementId: number
  data: MeasurementData[]
}

export interface EndMeasurementRequest {
  measurementId: number
}

// 开始测量
export function _api_startMeasurement(data: StartMeasurementRequest, headers = {}): Promise<ApiResponse<any>> {
  return $http.post('/api/measurement/start', data, { headers })
}

// 上传测量数据
export function _api_uploadMeasurementData(data: UploadDataRequest, headers = {}): Promise<ApiResponse<any>> {
  return $http.post('/api/measurement/upload', data, { headers })
}

// 结束测量
export function _api_endMeasurement(data: EndMeasurementRequest, headers = {}): Promise<ApiResponse<any>> {
  return $http.post('/api/measurement/end', data, { headers })
}

// 获取测量历史
export function _api_getMeasurementHistory(params: { userId: string; page?: number; limit?: number }, headers = {}): Promise<ApiResponse<any>> {
  return $http.get('/api/measurement/history', { params, headers })
}

// 获取测量详情
export function _api_getMeasurementDetail(measurementId: number, headers = {}): Promise<ApiResponse<any>> {
  return $http.get(`/api/measurement/detail/${measurementId}`, { headers })
}

// 删除测量记录
export function _api_deleteMeasurement(measurementId: number, headers = {}): Promise<ApiResponse<any>> {
  return $http.delete(`/api/measurement/${measurementId}`, { headers })
}