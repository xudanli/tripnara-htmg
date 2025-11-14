// 模版状态枚举
export enum TemplateStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// 模版模式枚举
export enum TemplateMode {
  INSPIRATION = 'inspiration',
  PLANNER = 'planner',
  SEEKER = 'seeker',
}

// 时段类型
export type TimeSlotType = 'transport' | 'activity' | 'meal' | string

export interface TemplateLocation {
  name?: string
  address?: string
  countryCode?: string
  countryName?: string
  regionCode?: string
  regionName?: string
  city?: string
  latitude?: number
  longitude?: number
  [key: string]: any
}

// 时段信息
export interface TemplateTimeSlot {
  id?: string
  dayId?: string
  sequence: number
  startTime?: string
  durationMinutes?: number
  type?: TimeSlotType
  title?: string
  activityHighlights?: Record<string, any>
  scenicIntro?: string
  locationJson?: TemplateLocation
  detailsJson?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

// 天数信息
export interface TemplateDay {
  id?: string
  templateId?: string
  dayNumber: number
  title?: string
  summary?: string
  detailsJson?: Record<string, any>
  timeSlots?: TemplateTimeSlot[]
  createdAt?: string
  updatedAt?: string
}

// 行程模版
export interface Template {
  id: string
  status: TemplateStatus
  mode: TemplateMode
  modePrimary?: string
  modeTags?: string
  title: string
  coverImage?: string
  durationDays?: number
  summary?: string
  description?: string
  coreInsight?: string
  safetyNoticeDefault?: Record<string, any>
  journeyBackground?: any[]
  personaProfile?: Record<string, any>
  journeyDesign?: Record<string, any>
  tasksDefault?: any[]
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
  days?: TemplateDay[]
}

// 模版查询参数
export interface TemplateQueryParams {
  status?: TemplateStatus | 'all'
  mode?: TemplateMode | 'all'
  modePrimary?: string
  modeTags?: string | string[]
  keyword?: string
  page?: number
  limit?: number
}

// 模版列表响应
export interface TemplateListResponse {
  data: Template[]
  total: number
  page: number
  limit: number
}

// 创建/更新模版请求
export interface TemplateFormData {
  title: string
  coverImage?: string
  durationDays?: number
  summary?: string
  description?: string
  coreInsight?: string
  status?: TemplateStatus
  mode?: TemplateMode
  modePrimary?: string
  modeTags?: string
  safetyNoticeDefault?: Record<string, any>
  journeyBackground?: any[]
  personaProfile?: Record<string, any>
  journeyDesign?: Record<string, any>
  tasksDefault?: any[]
  days?: TemplateDay[]
}

// API 响应基础结构
export interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
}

