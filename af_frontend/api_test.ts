// API测试文件 - 用于验证API模块的导入和基本结构

// 测试导入所有API
import * as api from './src/api'
console.log('✅ API模块导入成功:', Object.keys(api).length > 0)

// 测试导入特定模块
import { login, getUserInfo } from './src/api/modules/auth'
console.log('✅ 认证API导入成功:', typeof login === 'function' && typeof getUserInfo === 'function')

import { updateProfile } from './src/api/modules/user'
console.log('✅ 用户API导入成功:', typeof updateProfile === 'function')

import { uploadFile } from './src/api/modules/upload'
console.log('✅ 上传API导入成功:', typeof uploadFile === 'function')

import { getQuestionnaireList } from './src/api/modules/questionnaire'
console.log('✅ 问卷API导入成功:', typeof getQuestionnaireList === 'function')

import { startMeasurement } from './src/api/modules/measurement'
console.log('✅ 测量API导入成功:', typeof startMeasurement === 'function')

import { getSysAnnouncement } from './src/api/modules/sys'
console.log('✅ 系统API导入成功:', typeof getSysAnnouncement === 'function')

import { getPopularizationArticle } from './src/api/modules/popularization'
console.log('✅ 健康教育API导入成功:', typeof getPopularizationArticle === 'function')

// 测试类型导入
import { IResData, UserInfo } from './src/api/types'
console.log('✅ 类型定义导入成功')

console.log('🎉 API整合验证完成!')