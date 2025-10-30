// 问卷相关API
import { apiRequest } from '../config'
import { IResData } from '../types'

/**
 * 问卷题目项
 */
export interface QuestionItem {
  id: number
  title: string
  content: string
  type: string
  options?: string[]
  required: boolean
  score?: number
}

/**
 * 问卷类型
 */
export interface QuestionnaireType {
  id: string
  name: string
}

/**
 * 问卷提交数据
 */
export interface QuestionnaireSubmitData {
  userId: string
  questionnaireType: string
  score: number
  answers: Record<number, any>
  submitTime: string
  status: string
}

/**
 * 问卷历史记录查询参数
 */
export interface QuestionnaireHistoryParams {
  userId: string
  type?: string
}

/**
 * 获取问卷列表
 * @param data 查询参数，包含问卷类型
 * @returns 问卷题目列表
 */
export const getQuestionnaireList = (data: { type: string }, headers = {}) => {
  console.log('📋 获取问卷列表，类型:', data.type)
  return apiRequest.get<IResData<QuestionItem[]>>('/api/questionnaire/question', data, {
    'Content-Type': 'application/json',
    ...headers
  })
}

/**
 * 提交问卷答案
 * @param data 问卷答案数据
 * @returns 提交结果
 */
export const commitQuestionnaire = (data: QuestionnaireSubmitData, headers = {}) => {
  console.log('✅ 提交问卷答案，用户ID:', data.userId)
  return apiRequest.post<IResData<{ answerId: number }>>('/api/questionnaire/commit', data, undefined, headers)
}

/**
 * 删除问卷答案
 * @param id 答案ID
 * @returns 删除结果
 */
export const deleteAnswer = (id: string, headers = {}) => {
  console.log('🗑️ 删除问卷答案，ID:', id)
  return apiRequest.delete<IResData<void>>(`/api/questionnaire/answer/${id}`, undefined, headers)
}

/**
 * 获取问卷历史记录
 * @param data 查询参数
 * @returns 历史记录列表
 */
export const getQuestionnaireHistory = (data: QuestionnaireHistoryParams, headers = {}) => {
  console.log('📊 获取问卷历史记录，用户ID:', data.userId)
  return apiRequest.get<IResData<any[]>>('/api/questionnaire/history', data, {
    'Content-Type': 'application/json',
    ...headers
  })
}

/**
 * 获取问卷详情
 * @param id 问卷详情ID
 * @returns 问卷详情数据
 */
export const getQuestionnaireDetail = (id: string, headers = {}) => {
  console.log('🔍 获取问卷详情，ID:', id)
  return apiRequest.get<IResData<any>>(`/api/questionnaire/detail/${id}`, undefined, {
    'Content-Type': 'application/json',
    ...headers
  })
}

/**
 * 获取问卷类型列表
 * @returns 问卷类型列表
 */
export const getQuestionnaireTypes = (headers = {}) => {
  console.log('📋 获取问卷类型列表')
  return apiRequest.get<IResData<QuestionnaireType[]>>('/api/questionnaire/types', undefined, {
    'Content-Type': 'application/json',
    ...headers
  })
}