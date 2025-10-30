# API使用指南

## 目录结构

```
src/api/
├── config.ts           # API配置和请求方法
├── index.ts            # 统一API导出入口
├── modules/            # API功能模块
│   ├── auth.ts         # 用户认证相关API
│   ├── user.ts         # 用户信息相关API
│   ├── upload.ts       # 文件上传相关API
│   ├── questionnaire.ts # 问卷相关API
│   ├── measurement.ts  # 测量相关API
│   ├── sys.ts          # 系统相关API
│   └── popularization.ts # 健康教育相关API
└── types/              # 类型定义
    └── index.ts        # 基础类型定义
```

## 如何使用

### 1. 导入API

```javascript
// 导入单个API模块
import { login, getUserInfo } from '@/api/modules/auth'

// 导入所有API
import * as api from '@/api'
```

### 2. 调用API示例

```javascript
// 用户登录示例
import { login } from '@/api/modules/auth'
import { useUserStore } from '@/store'

const handleLogin = async () => {
  try {
    const result = await login({
      username: 'admin',
      password: '123456',
      code: '1234',
      uuid: '123456'
    })
    
    // 处理登录结果
    if (result.code === 200) {
      const userStore = useUserStore()
      userStore.setUserInfo(result.data)
      uni.showToast({ title: '登录成功' })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}
```

### 3. 文件上传示例

```javascript
// 文件上传示例
import { uploadFile } from '@/api/modules/upload'

const handleUpload = async (filePath) => {
  try {
    const result = await uploadFile(filePath)
    console.log('上传成功:', result.url)
    // 使用上传后的文件URL
  } catch (error) {
    console.error('上传失败:', error)
    uni.showToast({ title: '上传失败', icon: 'none' })
  }
}
```

### 4. 问卷相关示例

```javascript
// 获取问卷示例
import { getQuestionnaireList, commitQuestionnaire } from '@/api/modules/questionnaire'

// 获取问卷
const fetchQuestionnaire = async () => {
  const result = await getQuestionnaireList({ type: 'AF' })
  if (result.code === 200) {
    console.log('问卷题目:', result.data)
  }
}

// 提交问卷
const submitQuestionnaire = async () => {
  const submitData = {
    userId: '123',
    questionnaireType: 'AF',
    score: 85,
    answers: { 1: 'A', 2: 'B' },
    submitTime: new Date().toISOString(),
    status: 'completed'
  }
  
  const result = await commitQuestionnaire(submitData)
  if (result.code === 200) {
    console.log('提交成功:', result.data)
  }
}
```

## API配置说明

### 基础URL配置

API基础URL通过环境变量 `VITE_API_URL` 配置，位于 `env/.env.development` 文件中：

```
VITE_API_URL=http://localhost:8000
```

### 统一响应格式

所有API返回统一的响应格式：

```typescript
interface IResData<T = any> {
  code: number;     // 状态码，200表示成功
  msg: string;      // 响应消息
  data: T;          // 响应数据
}
```

## 错误处理

API调用时会自动处理常见错误，包括：
- 网络错误：提示"网络错误，换个网络试试"
- 401错误：表示未授权，会清除用户信息并重定向到登录页
- 其他错误：根据后端返回的错误信息显示提示

## 调试日志

所有API调用都包含详细的调试日志，方便开发调试：
- 请求URL和参数
- 使用的Token信息
- 响应数据

## 注意事项

1. 所有需要认证的API会自动从 `userStore` 获取Token
2. 上传文件时需要手动处理文件选择和路径获取
3. 调用API时请使用try-catch进行错误处理
4. 如需修改API路径或添加新API，请遵循现有的代码结构和命名规范