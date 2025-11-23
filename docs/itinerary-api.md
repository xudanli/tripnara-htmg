# 行程模版 API 接口文档

## 1. 新建行程模版

### 接口信息
- **URL**: `/api/v1/itineraries`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **说明**: 创建一个新的行程模版

### 请求参数示例

```json
{
  "title": "冰岛之旅",
  "destination": "冰岛",
  "duration": 5,
  "budget": "medium",
  "preferences": [],
  "travelStyle": "moderate",
  "recommendations": {
    "accommodation": "",
    "transportation": "",
    "food": "",
    "tips": "这个5天冰岛行程覆盖雷克雅未克、黄金圈、南岸黑沙滩和蓝湖温泉，体验北极光、地质奇观和当地美食。行程紧凑而合理，强调自然探险和文化沉浸，总成本约2000美元，包括交通、餐饮、景点和住宿。"
  },
  "days": [
    {
      "day": 1,
      "date": "2025-11-21",
      "timeSlots": [
        {
          "time": "08:00",
          "title": "翱翔冰岛之翼：抵达雷克雅未克",
          "activity": "翱翔冰岛之翼：抵达雷克雅未克",
          "type": "transport",
          "coordinates": {
            "lat": 64.1283,
            "lng": -21.8278
          },
          "notes": "从机场乘坐巴士或出租车前往市区，沿途欣赏冰岛独特的火山地貌和海岸线。建议提前预订交通，避免高峰时段拥堵。",
          "details": {
            "notes": "从机场乘坐巴士或出租车前往市区，沿途欣赏冰岛独特的火山地貌和海岸线。建议提前预订交通，避免高峰时段拥堵。",
            "description": "从机场乘坐巴士或出租车前往市区，沿途欣赏冰岛独特的火山地貌和海岸线。建议提前预订交通，避免高峰时段拥堵。",
            "name": {
              "chinese": "凯夫拉维克国际机场",
              "english": "Keflavíkurflugvöllur",
              "local": "Keflavíkurflugvöllur"
            },
            "address": {
              "chinese": "冰岛雷克雅未克凯夫拉维克国际机场，235号",
              "english": "Keflavíkurflugvöllur, 235 Keflavík, Iceland",
              "local": "Keflavíkurflugvöllur, 235 Keflavík, Iceland"
            },
            "transportation": "从雷克雅未克市中心可乘坐Flybus机场快线（Route 1）直达机场，车程约45分钟；或自驾沿41号公路行驶；无地铁服务；步行不可达",
            "openingHours": "24小时开放，全年无休",
            "pricing": {
              "detail": "机场本身免费进入；Flybus单程票价约3500冰岛克朗，儿童（0-11岁）半价，家庭套票（2成人+2儿童）优惠10%"
            },
            "rating": 4,
            "recommendations": {
              "visitTips": "最佳时间：航班抵达前后；注意事项：提前2小时到达办理登机，注意冬季天气可能影响航班；游览时长：建议预留1-2小时用于转机或接送",
              "bestTimeToVisit": "航班抵达或出发时间",
              "nearbyAttractions": "蓝湖温泉（距离约20分钟车程）、雷克雅未克市中心（距离约50公里）",
              "visitDuration": 60
            },
            "contact": {
              "info": "官网：www.kefairport.is，电话：+354 425 0600"
            },
            "accessibility": "提供轮椅通道、无障碍卫生间和优先登机服务",
            "category": "机场"
          },
          "cost": 50,
          "duration": 60
        }
      ]
    }
  ],
  "totalCost": 2000,
  "summary": "这个5天冰岛行程覆盖雷克雅未克、黄金圈、南岸黑沙滩和蓝湖温泉，体验北极光、地质奇观和当地美食。行程紧凑而合理，强调自然探险和文化沉浸，总成本约2000美元，包括交通、餐饮、景点和住宿。",
  "status": "draft",
  "language": "zh-CN",
  "tasks": [
    {
      "title": "确认护照有效期及前往 冰岛 是否需要签证/入境许可。",
      "completed": false,
      "category": "preparation",
      "destination": "冰岛",
      "links": [
        {
          "label": "IATA 入境政策查询",
          "url": "https://www.iatatravelcentre.com/"
        }
      ]
    }
  ]
}
```

### 字段说明

#### 基础字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `title` | string | 是 | 行程模版标题，最大长度255字符 |
| `destination` | string | 否 | 目的地国家/地区 |
| `duration` | number | 否 | 行程天数 |
| `budget` | string | 否 | 预算等级：`low`(低)、`medium`(中)、`high`(高) |
| `preferences` | array | 否 | 偏好列表，字符串数组 |
| `travelStyle` | string | 否 | 旅行风格：`relaxed`(轻松)、`moderate`(适中)、`active`(活跃)、`adventurous`(冒险) |
| `totalCost` | number | 否 | 总费用（美元） |
| `summary` | string | 否 | 行程摘要 |
| `status` | string | 否 | 状态：`draft`(草稿)、`published`(已发布)、`archived`(已归档)，默认 `draft` |
| `language` | string | 否 | 语言代码：`zh-CN`(简体中文)、`en-US`(英文)，默认 `zh-CN` |

#### recommendations 推荐信息（可选）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `accommodation` | string | 住宿推荐 |
| `transportation` | string | 交通推荐 |
| `food` | string | 美食推荐 |
| `tips` | string | 行程建议和提示 |

#### days 天数数组

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `day` | number | 是 | 天数序号（从1开始） |
| `date` | string | 否 | 日期（格式：YYYY-MM-DD） |
| `timeSlots` | array | 是 | 时间段数组 |

#### timeSlots 时间段数组

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `time` | string | 是 | 时间（格式：HH:mm，如 "08:00"） |
| `title` | string | 是 | 活动标题 |
| `activity` | string | 是 | 活动描述 |
| `type` | string | 是 | 类型：`transport`(交通)、`attraction`(景点)、`meal`(用餐)、`hotel`(住宿)、`shopping`(购物)、`activity`(活动) |
| `coordinates` | object | 否 | 坐标信息 |
| `notes` | string | 否 | 备注说明 |
| `cost` | number | 否 | 费用（美元） |
| `duration` | number | 否 | 持续时间（分钟） |

##### coordinates 坐标信息

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `lat` | number | 纬度 |
| `lng` | number | 经度 |

##### details 活动详情（可选）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `notes` | string | 备注 |
| `description` | string | 详细描述 |
| `name` | object | 名称信息（含 chinese、english、local） |
| `address` | object | 地址信息（含 chinese、english、local） |
| `transportation` | string | 交通信息 |
| `openingHours` | string | 开放时间 |
| `pricing` | object | 定价详情 |
| `rating` | number | 评分（0-5） |
| `recommendations` | object | 推荐信息 |
| `contact` | object | 联系方式 |
| `accessibility` | string | 无障碍设施信息 |
| `category` | string | 类别 |

#### tasks 任务数组（可选）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `title` | string | 是 | 任务标题 |
| `completed` | boolean | 否 | 是否完成，默认 `false` |
| `category` | string | 否 | 任务类别（如：preparation） |
| `destination` | string | 否 | 目的地 |
| `links` | array | 否 | 相关链接数组，格式：`[{label: string, url: string}]` |

### 响应示例

#### 成功响应 (200)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "draft",
    "language": "zh-CN",
    "itineraryData": {
      "title": "冰岛之旅",
      "destination": "冰岛",
      "duration": 5,
      "budget": "medium",
      "preferences": [],
      "travelStyle": "moderate",
      "recommendations": {
        "tips": "这个5天冰岛行程覆盖雷克雅未克、黄金圈、南岸黑沙滩和蓝湖温泉..."
      },
      "days": [
        {
          "id": "day-001",
          "day": 1,
          "date": "2025-11-21",
          "timeSlots": [
            {
              "id": "slot-001",
              "time": "08:00",
              "title": "翱翔冰岛之翼：抵达雷克雅未克",
              "activity": "翱翔冰岛之翼：抵达雷克雅未克",
              "type": "transport",
              "coordinates": {
                "lat": 64.1283,
                "lng": -21.8278
              },
              "notes": "从机场乘坐巴士或出租车前往市区...",
              "cost": 50,
              "duration": 60
            }
          ]
        }
      ],
      "totalCost": 2000,
      "summary": "这个5天冰岛行程覆盖雷克雅未克..."
    },
    "tasks": [
      {
        "id": "task-001",
        "title": "确认护照有效期及前往 冰岛 是否需要签证/入境许可。",
        "completed": false,
        "category": "preparation",
        "destination": "冰岛"
      }
    ],
    "createdBy": "admin",
    "updatedBy": "admin",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "message": "创建成功"
}
```

#### 错误响应 (400)

```json
{
  "success": false,
  "message": "标题不能为空"
}
```

### 注意事项

1. **必填字段**: 只有 `title` 字段是必填的，其他字段都是可选的
2. **数据格式**: 
   - 时间格式：`HH:mm`（如 "08:00"）
   - 日期格式：`YYYY-MM-DD`（如 "2025-11-21"）
   - 坐标：经纬度使用数字类型
3. **嵌套结构**: `days` 和 `timeSlots` 都是数组，可以为空
4. **状态管理**: 默认状态为 `draft`（草稿），创建后可以修改为 `published`（已发布）

---

## 2. 获取行程模版列表

### 接口信息
- **URL**: `/api/v1/itineraries`
- **Method**: `GET`
- **说明**: 获取行程模版列表，支持多种筛选条件

### 查询参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `limit` | number | 否 | 每页数量，默认 10 |
| `status` | string | 否 | 状态：`draft`、`published`、`archived`，传 `all` 表示全部 |
| `keyword` | string | 否 | 关键字搜索（标题或摘要） |
| `language` | string | 否 | 语言代码：`zh-CN`、`en-US` |
| `destination` | string | 否 | 目的地 |
| `budget` | string | 否 | 预算：`low`、`medium`、`high`，传 `all` 表示全部 |
| `travelStyle` | string | 否 | 旅行风格：`relaxed`、`moderate`、`active`、`adventurous`，传 `all` 表示全部 |

### 请求示例

```
GET /api/v1/itineraries?page=1&limit=10&status=all&keyword=冰岛&language=zh-CN
```

### 响应示例

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "draft",
      "language": "zh-CN",
      "itineraryData": {
        "title": "冰岛之旅",
        "destination": "冰岛",
        "duration": 5,
        "budget": "medium",
        "totalCost": 2000,
        "summary": "这个5天冰岛行程..."
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

## 3. 根据ID获取行程模版详情

### 接口信息
- **URL**: `/api/v1/itineraries/{id}`
- **Method**: `GET`
- **说明**: 根据ID获取完整的行程模版详情

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | string | 是 | 行程模版ID |

### 请求示例

```
GET /api/v1/itineraries/123e4567-e89b-12d3-a456-426614174000
```

### 响应示例

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "draft",
  "language": "zh-CN",
  "itineraryData": {
    "title": "冰岛之旅",
    "destination": "冰岛",
    "duration": 5,
    "budget": "medium",
    "preferences": [],
    "travelStyle": "moderate",
    "recommendations": {
      "tips": "这个5天冰岛行程覆盖雷克雅未克..."
    },
    "days": [
      {
        "id": "day-001",
        "day": 1,
        "date": "2025-11-21",
        "timeSlots": [...]
      }
    ],
    "totalCost": 2000,
    "summary": "这个5天冰岛行程..."
  },
  "tasks": [...],
  "createdBy": "admin",
  "updatedBy": "admin",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

## 4. 更新行程模版

### 接口信息
- **URL**: `/api/v1/itineraries/{id}`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **说明**: 更新已有的行程模版

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | string | 是 | 行程模版ID |

### 请求参数

请求体格式与创建接口相同，所有字段都是可选的，只传入需要更新的字段即可。

### 请求示例

```json
{
  "title": "更新后的冰岛之旅",
  "duration": 7,
  "totalCost": 2500
}
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "draft",
    "language": "zh-CN",
    "itineraryData": {
      "title": "更新后的冰岛之旅",
      "duration": 7,
      "totalCost": 2500,
      ...
    },
    "updatedAt": "2025-01-15T11:30:00Z"
  },
  "message": "更新成功"
}
```

---

## 5. 删除行程模版

### 接口信息
- **URL**: `/api/v1/itineraries/{id}`
- **Method**: `DELETE`
- **说明**: 删除指定的行程模版

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | string | 是 | 行程模版ID |

### 请求示例

```
DELETE /api/v1/itineraries/123e4567-e89b-12d3-a456-426614174000
```

### 响应示例

```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 6. 发布行程模版

### 接口信息
- **URL**: `/api/v1/itineraries/{id}/publish`
- **Method**: `POST`
- **说明**: 将草稿状态的行程模版发布为已发布状态

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | string | 是 | 行程模版ID |

### 请求示例

```
POST /api/v1/itineraries/123e4567-e89b-12d3-a456-426614174000/publish
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "published",
    ...
    "updatedAt": "2025-01-15T12:00:00Z"
  },
  "message": "发布成功"
}
```

---

## 7. 复制行程模版

### 接口信息
- **URL**: `/api/v1/itineraries/{id}/clone`
- **Method**: `POST`
- **说明**: 复制指定的行程模版，创建一个新的草稿模版

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | string | 是 | 行程模版ID |

### 请求示例

```
POST /api/v1/itineraries/123e4567-e89b-12d3-a456-426614174000/clone
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "987e6543-e21b-43d2-b654-321876543210",
    "status": "draft",
    "itineraryData": {
      "title": "冰岛之旅（副本）",
      ...
    },
    "createdAt": "2025-01-15T12:30:00Z",
    "updatedAt": "2025-01-15T12:30:00Z"
  },
  "message": "复制成功"
}
```

### 注意事项

- 复制的模版会生成新的ID
- 标题会自动添加"（副本）"后缀（如果原标题不包含该后缀）
- 状态自动设置为 `draft`（草稿）
- 创建时间和更新时间会重置为当前时间

---

## 通用说明

### 状态码说明

- `200`: 请求成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

### 错误响应格式

```json
{
  "success": false,
  "message": "错误信息描述"
}
```

### 日期时间格式

- 日期格式：`YYYY-MM-DD`（如 "2025-11-21"）
- 时间格式：`HH:mm`（如 "08:00"）
- ISO 8601 格式：`YYYY-MM-DDTHH:mm:ssZ`（如 "2025-01-15T10:30:00Z"）

