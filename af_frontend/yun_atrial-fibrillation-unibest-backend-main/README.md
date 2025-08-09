# Node.js MVC 后端项目模板

## 项目简介
本项目基于 Node.js，采用 MVC 架构，支持 MongoDB/MySQL，集成统一错误处理、日志、API 文档、单元测试等。

## 目录结构
```
controllers/   # 控制器，处理业务逻辑
models/        # 数据模型，负责与数据库交互
views/         # 视图层（如需渲染模板，可选）
routes/        # 路由定义，负责请求分发
middlewares/   # 中间件（如鉴权、日志、错误处理等）
config/        # 配置文件，支持多环境
utils/         # 工具函数
tests/         # 单元测试
```

## 主要特性
- 遵循 MVC 架构，结构清晰
- 路由与控制器解耦，支持 RESTful API
- Model 层支持 MongoDB/MySQL
- 统一错误处理与日志系统
- 环境变量配置，支持多环境
- API 文档（Swagger）
- 单元测试（Jest）
- 代码规范（ESLint/Prettier）
- 热重载（nodemon）
- 安全性防护

## 安装与启动
```bash
npm install
npm run dev # 开发环境
npm start   # 生产环境
npm test    # 运行测试
```

## API 文档
访问 `/api-docs` 查看 Swagger UI。

## 其他
详细用法与示例请参考各目录下的 README 或注释。 