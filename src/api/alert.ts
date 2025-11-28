import axios, { AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import type {
  Alert,
  AlertFormData,
  AlertQueryParams,
  AlertListResponse,
  ApiResponse,
} from '@/types/alert'

const BASE_URL = 'http://localhost:3000/api'

// 创建不包含认证的 axios 实例（用于公开接口）
const publicRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器
publicRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      // 根据接口规范，错误响应格式：{ statusCode, message, error }
      const errorMessage = data?.message || `请求失败: ${status}`
      
      switch (status) {
        case 400:
          // Bad Request - 显示具体错误信息
          if (Array.isArray(data?.message)) {
            message.error(data.message.join(', '))
          } else {
            message.error(errorMessage)
          }
          break
        case 401:
          message.error('未授权')
          break
        case 403:
          message.error('拒绝访问')
          break
        case 404:
          message.error('请求错误，未找到该资源')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(errorMessage)
          break
      }
      
      // 将错误信息附加到 error 对象上，方便调用方获取
      error.message = errorMessage
      error.statusCode = status
    } else {
      error.message = '网络错误，请检查网络连接'
      message.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

// 获取通用旅行安全通知列表（公开接口，无需认证）
export const getAlerts = (params?: AlertQueryParams): Promise<AlertListResponse> => {
  return publicRequest.get('/v1/alerts', { params })
}

// 创建通用旅行安全通知（公开接口，无需认证）
export const createAlert = (data: AlertFormData): Promise<ApiResponse<Alert>> => {
  return publicRequest.post('/v1/alerts', data)
}

