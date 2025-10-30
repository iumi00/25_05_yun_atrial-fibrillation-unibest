# API整合计划

## 1. 现有API结构分析

### 1.1 目录结构
- `src/api/` - 核心API定义
  - login.ts
  - login.typings.ts
  - upload.ts
  - user.ts
- `src/service/myService/` - 业务服务API
  - measurement.ts
  - popularization.ts
  - questionnaire.ts
  - sys.ts
  - user.ts
- `src/service/app/` - 应用服务API
  - displayEnumLabel.ts
  - index.ts
  - pet.ts
  - pet.vuequery.ts
  - store.ts
  - store.vuequery.ts
  - types.ts
  - user.ts
  - user.vuequery.ts

### 1.2 HTTP客户端工具
- `@/utils/myRequest.ts` - 基于axios的HTTP客户端
- `@/utils/http.ts` - 基于uni.request的HTTP客户端

### 1.3 基础URL配置
- `src/service/index.ts` 中的 `getBaseUrl()` 函数
- 环境变量 `VITE_API_URL`

## 2. 整合策略

### 2.1 目录结构规划
- 保留 `src/api/` 作为主API目录
- 创建 `src/api/types/` 存放类型定义
- 创建 `src/api/services/` 存放业务服务

### 2.2 HTTP客户端选择
- 选择 `@/utils/http.ts` 作为统一HTTP客户端
- 保留 `@/utils/myRequest.ts` 作为备份

### 2.3 基础URL配置
- 采用 `src/service/index.ts` 中的 `getBaseUrl()` 函数逻辑
- 在 `src/api/config.ts` 中重新实现

## 3. 整合任务列表

### 3.1 准备阶段任务
- [x] 分析现有API结构
- [x] 规划整合策略
- [x] 创建API类型定义文件 (src/api/types/index.ts)
- [x] 创建API配置文件 (src/api/config.ts)
- [x] 设置版本控制备份 (api_backup/目录已创建)

### 3.2 迁移阶段任务
- [x] 迁移用户认证相关API (src/api/modules/auth.ts)
- [x] 迁移用户信息相关API (src/api/modules/user.ts)
- [x] 迁移文件上传API (src/api/modules/upload.ts)
- [x] 迁移问卷相关API (src/api/modules/questionnaire.ts)
- [x] 迁移测量相关API (src/api/modules/measurement.ts)
- [x] 迁移系统相关API (src/api/modules/sys.ts)
- [x] 迁移健康教育相关API (src/api/modules/popularization.ts)

### 3.3 验证阶段任务
- [x] 代码结构验证
- [x] TypeScript类型检查
- [ ] 功能测试
- [ ] 日志检查
- [ ] 性能验证

### 3.4 清理阶段任务
- [ ] 标记待删除文件
- [ ] 清理冗余代码
- [ ] 更新引用路径