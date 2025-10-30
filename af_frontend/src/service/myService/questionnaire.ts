// af_frontend/src/service/myService/questionnaire.ts
import { $http } from '@/service'
import type { ApiResponse, QuestionItem } from '@/types/api'

// 获取后端基础URL
const getBaseUrl = () => {
  // 检查环境变量
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // 默认后端地址
  return 'http://localhost:8000'
}

const baseUrl = getBaseUrl()
export function _api_getQuestionnaireList(data: { type: string }, headers = {}): Promise<ApiResponse<QuestionItem[]>> {
  return $http.get(`/api/questionnaire/question`, { params:data, headers:{
    'Content-Type': 'application/json',
      ...headers
  } })
}

export function _api_commitData(data: {
  userId: string;
  questionnaireType: string;
  score: number;
  answers: Record<number, any>;
  submitTime: string,
  status: string
}, headers:{}): Promise<ApiResponse<{ answerId: number }>> {
  return $http.post(`/api/questionnaire/commit`, data, { headers })
}

export function _api_delAnswer(id: string, headers): Promise<ApiResponse> {
  return $http.delete(`/api/questionnaire/answer/${id}`, { headers })
}

export function _api_getMyQuestionnaireHistory(data: {
  userId: string;
  type?: string;
}, headers:{}): Promise<ApiResponse<any[]>> {
  return $http.get(`/api/questionnaire/history`,{params:data,
    headers:{
      'Content-Type': 'application/json',
      ...headers
    }
  })
}

export function _api_getMyQuestionnaireDetail(id: string, headers:{}): Promise<ApiResponse<any>> {
  return $http.get(`/api/questionnaire/detail/${id}`, {
    headers:{
      'Content-Type': 'application/json',
      ...headers
    }
  })
}