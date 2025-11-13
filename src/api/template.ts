import request from './request'
import type {
  Template,
  TemplateQueryParams,
  TemplateListResponse,
  TemplateFormData,
  TemplateDay,
  TemplateTimeSlot,
  ApiResponse,
} from '@/types/template'

// 获取模版列表
export const getTemplates = (
  params?: TemplateQueryParams
): Promise<TemplateListResponse> => {
  return request.get('/v1/templates', { params })
}

// 获取模版详情
export const getTemplateById = (id: string): Promise<Template> => {
  return request.get(`/v1/templates/${id}`)
}

// 创建模版
export const createTemplate = (data: TemplateFormData): Promise<ApiResponse<Template>> => {
  return request.post('/v1/templates', data)
}

// 更新模版
export const updateTemplate = (
  id: string,
  data: Partial<TemplateFormData>
): Promise<ApiResponse<Template>> => {
  return request.patch(`/v1/templates/${id}`, data)
}

// 删除模版
export const deleteTemplate = (id: string): Promise<ApiResponse<void>> => {
  return request.delete(`/v1/templates/${id}`)
}

// 发布模版
export const publishTemplate = (id: string): Promise<ApiResponse<Template>> => {
  return request.post(`/v1/templates/${id}/publish`)
}

// 复制模版
export const cloneTemplate = (id: string): Promise<ApiResponse<Template>> => {
  return request.post(`/v1/templates/${id}/clone`)
}

// 获取模版天数列表
export const getTemplateDays = (templateId: string): Promise<TemplateDay[]> => {
  return request.get(`/v1/templates/${templateId}/days`)
}

// 创建模版天数
export const createTemplateDay = (
  templateId: string,
  data: Partial<TemplateDay>
): Promise<ApiResponse<TemplateDay>> => {
  return request.post(`/v1/templates/${templateId}/days`, data)
}

// 更新模版天数
export const updateTemplateDay = (
  templateId: string,
  dayId: string,
  data: Partial<TemplateDay>
): Promise<ApiResponse<TemplateDay>> => {
  return request.patch(`/v1/templates/${templateId}/days/${dayId}`, data)
}

// 删除模版天数
export const deleteTemplateDay = (
  templateId: string,
  dayId: string
): Promise<ApiResponse<void>> => {
  return request.delete(`/v1/templates/${templateId}/days/${dayId}`)
}

// 获取模版时段列表
export const getTemplateTimeSlots = (
  templateId: string,
  dayId: string
): Promise<TemplateTimeSlot[]> => {
  return request.get(`/v1/templates/${templateId}/days/${dayId}/slots`)
}

// 创建模版时段
export const createTemplateTimeSlot = (
  templateId: string,
  dayId: string,
  data: Partial<TemplateTimeSlot>
): Promise<ApiResponse<TemplateTimeSlot>> => {
  return request.post(`/v1/templates/${templateId}/days/${dayId}/slots`, data)
}

// 更新模版时段
export const updateTemplateTimeSlot = (
  templateId: string,
  dayId: string,
  slotId: string,
  data: Partial<TemplateTimeSlot>
): Promise<ApiResponse<TemplateTimeSlot>> => {
  return request.patch(`/v1/templates/${templateId}/days/${dayId}/slots/${slotId}`, data)
}

// 删除模版时段
export const deleteTemplateTimeSlot = (
  templateId: string,
  dayId: string,
  slotId: string
): Promise<ApiResponse<void>> => {
  return request.delete(`/v1/templates/${templateId}/days/${dayId}/slots/${slotId}`)
}

