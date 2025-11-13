import request from './request'
import type {
  VisaPolicy,
  VisaPolicyQueryParams,
  VisaPolicyListResponse,
  VisaPolicyFormData,
  PolicyHistory,
  ApiResponse,
} from '@/types/visa'

// 获取签证政策列表
export const getVisaPolicies = (params?: VisaPolicyQueryParams): Promise<VisaPolicyListResponse> => {
  return request.get('/visa/admin/policies', { params })
}

// 创建签证政策
export const createVisaPolicy = (data: VisaPolicyFormData): Promise<ApiResponse<VisaPolicy>> => {
  return request.post('/visa/admin/policies', data)
}

// 更新签证政策
export const updateVisaPolicy = (
  id: number,
  data: Partial<VisaPolicyFormData>
): Promise<ApiResponse<VisaPolicy>> => {
  return request.patch(`/visa/admin/policies/${id}`, data)
}

// 删除签证政策
export const deleteVisaPolicy = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`/visa/admin/policies/${id}`)
}

// 获取政策变更历史
export const getPolicyHistory = (id: number): Promise<ApiResponse<PolicyHistory[]>> => {
  return request.get(`/visa/admin/policies/${id}/history`)
}

