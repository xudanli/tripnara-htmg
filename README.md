# TripNara 旅行规划后台管理系统

基于 Vue3 + Ant Design Vue 的多模块后台管理系统，用于管理旅行规划相关的各种功能模块。


## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 下一代前端构建工具
- **Ant Design Vue** - 企业级 UI 组件库
- **Vue Router** - 官方路由管理器
- **Axios** - HTTP 客户端

## 功能模块

### 已实现模块

- ✅ **仪表盘** - 系统概览和模块导航
- ✅ **签证管理** - 签证政策管理
  - 签证政策列表（支持分页和筛选）
  - 创建签证政策
  - 编辑签证政策
  - 删除签证政策（软删除）
  - 查看政策变更历史

### 计划模块

- 📋 **行程模板** - 管理旅行行程模板（API 已提供）
- 🔄 更多模块待开发...

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── api/              # API 服务层
│   ├── request.ts   # Axios 配置
│   └── visa.ts      # 签证相关 API
├── components/       # 公共组件
├── layouts/         # 布局组件
│   └── MainLayout.vue
├── router/          # 路由配置
│   └── index.ts
├── types/           # TypeScript 类型定义
│   └── visa.ts
├── utils/           # 工具函数
│   └── auth.ts      # 认证工具
├── views/           # 页面组件
│   ├── Login.vue
│   ├── Dashboard.vue
│   └── visa/        # 签证管理模块
│       ├── PolicyList.vue
│       ├── PolicyFormModal.vue
│       └── HistoryModal.vue
├── App.vue          # 根组件
├── main.ts          # 入口文件
└── style.css        # 全局样式
```

## API 配置

默认 API 基础地址：`http://localhost:3000/api`

可在 `src/api/request.ts` 中修改 `BASE_URL`。

## 登录信息

- 用户名：`admin`
- 密码：`admin`

## 签证管理模块

### 签证类型

- `visa-free` - 免签
- `visa-on-arrival` - 落地签
- `e-visa` - 电子签
- `visa-required` - 需要提前办理签证
- `permanent-resident-benefit` - 永久居民优惠

### 申请人类型

- `nationality` - 国籍
- `permanent_resident` - 永久居民

## 开发说明

### 添加新模块

1. 在 `src/views/` 下创建模块目录和页面组件
2. 在 `src/api/` 下创建模块的 API 服务文件
3. 在 `src/types/` 下创建模块的类型定义
4. 在 `src/router/index.ts` 中添加路由配置
5. 在 `src/layouts/MainLayout.vue` 中添加菜单项

### API 调用

使用 `src/api/` 目录下的服务函数：

```typescript
import { getVisaPolicies } from '@/api/visa'

const response = await getVisaPolicies({ page: 1, limit: 20 })
```

### 路由配置

路由采用嵌套结构，所有业务模块都在主布局下：

```typescript
{
  path: '/',
  component: () => import('@/layouts/MainLayout.vue'),
  children: [
    {
      path: '/dashboard',
      component: () => import('@/views/Dashboard.vue'),
    },
    {
      path: '/visa',
      component: () => import('@/views/visa/PolicyList.vue'),
    },
    // 添加新模块...
  ],
}
```

## 许可证

MIT
