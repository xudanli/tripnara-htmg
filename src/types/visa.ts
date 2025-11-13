// 签证类型枚举
export enum VisaType {
  VISA_FREE = 'visa-free',
  VISA_ON_ARRIVAL = 'visa-on-arrival',
  E_VISA = 'e-visa',
  VISA_REQUIRED = 'visa-required',
  PERMANENT_RESIDENT_BENEFIT = 'permanent-resident-benefit',
}

// 申请人类型枚举
export enum ApplicantType {
  NATIONALITY = 'nationality',
  PERMANENT_RESIDENT = 'permanent_resident',
}

// 签证政策接口
export interface VisaPolicy {
  id: number
  destinationCountryCode: string
  destinationCountryName: string
  applicantType: ApplicantType
  applicantCountryCode: string
  applicantDescription: string
  visaType: VisaType
  description?: string
  durationDays?: number
  applicationUrl?: string
  isActive: boolean
  effectiveDate?: string
  expiryDate?: string | null
  updatedBy?: string
  createdAt: string
  lastUpdatedAt: string
}

// 签证政策查询参数
export interface VisaPolicyQueryParams {
  page?: number
  limit?: number
  destinationCountryCode?: string
  applicantType?: ApplicantType
  applicantCountryCode?: string
  visaType?: VisaType
  isActive?: boolean
}

// 签证政策列表响应
export interface VisaPolicyListResponse {
  data: VisaPolicy[]
  total: number
  page: number
  limit: number
}

// 创建/更新签证政策请求
export interface VisaPolicyFormData {
  destinationCountryCode: string
  destinationCountryName: string
  applicantType: ApplicantType
  applicantCountryCode: string
  applicantDescription: string
  visaType: VisaType
  description?: string
  durationDays?: number
  applicationUrl?: string
  isActive?: boolean
  effectiveDate?: string
  expiryDate?: string | null
  updatedBy?: string
}

// 政策变更历史
export interface PolicyHistory {
  id: number
  policyId: number
  action: 'created' | 'updated' | 'deleted'
  oldData: VisaPolicy | null
  newData: VisaPolicy | null
  changedBy: string
  changedAt: string
}

// API 响应基础结构
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

