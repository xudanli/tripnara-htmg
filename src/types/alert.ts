// 严重程度枚举
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 状态枚举
export enum AlertStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

// 旅行安全通知接口（响应数据）
export interface Alert {
  id: string
  title: string
  content: string
  destination: string
  countryCode?: string
  severity: AlertSeverity
  status: AlertStatus
  startDate: string
  endDate?: string
  metadata?: Record<string, any> | null
  createdAt: string
  updatedAt: string
}

// 创建旅行安全通知请求数据
export interface AlertFormData {
  title: string
  content: string
  destination: string
  countryCode?: string
  severity: AlertSeverity
  status?: AlertStatus
  startDate: string
  endDate?: string
  metadata?: Record<string, any>
}

// 查询参数
export interface AlertQueryParams {
  destination?: string
  countryCode?: string
  severity?: AlertSeverity
  status?: AlertStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// 列表响应
export interface AlertListResponse {
  data: Alert[]
  total: number
  page: number
  limit: number
}

// API 响应基础结构
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

