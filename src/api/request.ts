import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'

const BASE_URL = 'http://localhost:3000/api'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
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
          // Bad Request - 不显示通用消息，让调用方处理
          break
        case 401:
          message.error('未授权，请重新登录')
          // 可以跳转到登录页
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
          // 其他错误由调用方处理，这里不显示通用消息
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

export default request

