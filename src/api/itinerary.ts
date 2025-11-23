import request from './request'
import type {
  ItineraryTemplate,
  ItineraryListResponse,
  ItineraryQueryParams,
  ItineraryFormData,
  ApiResponse,
} from '@/types/itinerary'

// 获取行程模版列表
export const getItineraries = async (params?: ItineraryQueryParams) => {
  // 处理查询参数：过滤掉 'all' 值和空值
  const queryParams: any = {}
  if (params) {
    Object.keys(params).forEach((key) => {
      const value = params[key as keyof ItineraryQueryParams]
      // 如果是 'all' 或者空值，不传这个参数
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        queryParams[key] = value
      }
    })
    
    // 确保 limit 不超过最大值 100
    if (queryParams.limit && queryParams.limit > 100) {
      queryParams.limit = 100
    }
  }

  const response = await request.get<ItineraryListResponse>('/v1/itineraries', {
    params: queryParams,
  })

  // 确保返回正确的格式：{ data: [], total: number, page: number, limit: number }
  return response as ItineraryListResponse
}

// 根据 ID 获取行程模版详情
export const getItineraryById = async (id: string, language?: string) => {
  const params = language ? { language } : undefined
  const response = await request.get<ApiResponse<ItineraryTemplate> | ItineraryTemplate>(`/v1/itineraries/${id}`, { params })
  
  console.log('=== getItineraryById 调试 ===')
  console.log('原始响应:', response)
  console.log('响应类型:', typeof response)
  console.log('是否有 data 字段:', 'data' in (response || {}))
  
  // 处理可能的 ApiResponse 格式：{ success: true, data: {...} }
  let result: ItineraryTemplate
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    result = response.data as ItineraryTemplate
    console.log('提取的 data:', result)
  } else {
    result = response as ItineraryTemplate
    console.log('直接使用的响应:', result)
  }
  
  // 同时检查和修复 days 和 tasks 数据结构
  console.log('=== 数据结构检查和修复 ===')
  console.log('原始数据的顶层 keys:', result ? Object.keys(result) : 'result is null')
  
  // 检查 days 数据：如果 days 在顶层，移动到 itineraryData 中
  if (result && 'days' in result && Array.isArray((result as any).days)) {
    const topLevelDays = (result as any).days
    console.log('发现顶层 days，数量:', topLevelDays.length)
    if (topLevelDays.length > 0) {
      console.log('⚠️ 发现 days 在顶层，正在修复数据结构...')
      if (!result.itineraryData) {
        result.itineraryData = {} as any
      }
      result.itineraryData.days = topLevelDays
      // 删除顶层的 days，避免混淆
      delete (result as any).days
      console.log('✅ days 数据结构已修复，已移动到 itineraryData.days')
    }
  }
  
  // 检查 tasks 数据：tasks 应该在顶层，但可能在其他位置
  let tasksData: any[] | undefined = undefined
  
  // 1. 先检查顶层是否有 tasks
  if (result && 'tasks' in result) {
    const topLevelTasks = (result as any).tasks
    console.log('发现顶层 tasks，类型:', typeof topLevelTasks, '是否为数组:', Array.isArray(topLevelTasks))
    if (Array.isArray(topLevelTasks)) {
      tasksData = topLevelTasks
      console.log('✅ tasks 在顶层，数量:', tasksData.length)
    } else if (topLevelTasks) {
      console.warn('⚠️ 顶层 tasks 不是数组类型:', topLevelTasks)
    }
  }
  
  // 2. 如果顶层没有 tasks，检查 itineraryData 中是否有 tasks
  if (!tasksData && result?.itineraryData && 'tasks' in result.itineraryData) {
    const itineraryDataTasks = (result.itineraryData as any).tasks
    console.log('发现 itineraryData 中的 tasks，类型:', typeof itineraryDataTasks, '是否为数组:', Array.isArray(itineraryDataTasks))
    if (Array.isArray(itineraryDataTasks)) {
      tasksData = itineraryDataTasks
      console.log('⚠️ tasks 在 itineraryData 中，正在移动到顶层...')
      result.tasks = tasksData
      delete (result.itineraryData as any).tasks
      console.log('✅ tasks 已从 itineraryData 移动到顶层')
    }
  }
  
  // 3. 如果找到了 tasks 数据，确保它被正确设置
  if (tasksData) {
    result.tasks = tasksData
    console.log('✅ tasks 数据已设置到 result.tasks，数量:', tasksData.length)
  } else {
    console.warn('⚠️ 未找到 tasks 数据')
    // 确保 tasks 字段存在（即使为空数组）
    if (!result.tasks) {
      result.tasks = []
    }
  }
  
  console.log('=== 数据结构检查和修复结束 ===')
  
  // 验证最终结果
  console.log('最终结果 - id:', result?.id)
  console.log('最终结果 - days 数量:', result?.itineraryData?.days?.length || 0)
  console.log('最终结果 - tasks 数量:', result?.tasks?.length || 0)
  console.log('最终结果 - tasks 是否为数组:', Array.isArray(result?.tasks))
  
  if (result?.itineraryData?.days && result.itineraryData.days.length > 0) {
    console.log('✅ days 数据存在，第一个 day:', JSON.stringify(result.itineraryData.days[0], null, 2))
  } else {
    console.error('❌ 错误：返回的数据中没有 days 或 days 为空！')
    console.log('完整的 itineraryData:', JSON.stringify(result?.itineraryData, null, 2))
  }
  
  if (result?.tasks && result.tasks.length > 0) {
    console.log('✅ tasks 数据存在，数量:', result.tasks.length)
    console.log('第一个 task:', JSON.stringify(result.tasks[0], null, 2))
  } else {
    console.warn('⚠️ 警告：返回的数据中没有 tasks 或 tasks 为空！')
    console.log('result.tasks 的值:', result?.tasks)
    console.log('result.tasks 的类型:', typeof result?.tasks)
  }
  
  console.log('=== getItineraryById 调试结束 ===')
  
  return result
}

// 创建行程模版
export const createItinerary = async (data: ItineraryFormData) => {
  // 调试：记录发送的数据（完整格式）
  console.log('API 调用 - 发送的数据摘要:', {
    title: data.title,
    destination: data.destination,
    duration: data.duration,
    daysCount: data.days?.length || 0,
    daysDetail: data.days?.map(d => ({
      day: d.day,
      date: d.date,
      timeSlotsCount: d.timeSlots?.length || 0
    }))
  })
  
  // 调试：记录完整的 days 数据
  if (data.days && data.days.length > 0) {
    console.log('API 调用 - 完整的 days 数据:', JSON.stringify(data.days, null, 2))
  } else {
    console.warn('⚠️ API 调用 - days 数据为空或未定义！')
  }
  
  // 调试：记录完整请求体（用于验证）
  console.log('API 调用 - 完整请求体:', JSON.stringify(data, null, 2))
  
  const response = await request.post<ApiResponse<ItineraryTemplate>>('/v1/itineraries', data)
  
  // 调试：记录返回的数据
  console.log('API 调用 - 返回的响应:', response)
  
  // request 拦截器已经返回 response.data，这里如果还是 ApiResponse 格式，提取 data 字段
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    const result = response.data as ItineraryTemplate
    console.log('API 调用 - 提取的 data:', {
      id: result.id,
      daysCount: result.itineraryData?.days?.length || 0
    })
    return result
  }
  // 如果直接返回 ItineraryTemplate，直接返回
  const result = response as ItineraryTemplate
  console.log('API 调用 - 直接返回的数据:', {
    id: result.id,
    daysCount: result.itineraryData?.days?.length || 0
  })
  return result
}

// 更新行程模版
// 根据接口文档，所有字段都是可选的，只传入需要更新的字段即可
export const updateItinerary = async (id: string, data: Partial<ItineraryFormData>) => {
  console.log('=== updateItinerary API 调用 ===')
  console.log('更新 ID:', id)
  console.log('更新数据摘要:', {
    hasDays: !!data.days,
    daysCount: data.days?.length || 0,
    daysDetail: data.days?.map(d => ({
      day: d.day,
      date: d.date,
      timeSlotsCount: d.timeSlots?.length || 0,
    })),
  })
  
  if (data.days && data.days.length > 0) {
    console.log('完整的 days 数据:', JSON.stringify(data.days, null, 2))
  }
  
  console.log('完整请求体:', JSON.stringify(data, null, 2))
  
  const response = await request.put<ApiResponse<ItineraryTemplate>>(`/v1/itineraries/${id}`, data)
  
  console.log('API 返回的响应:', response)
  
  // 根据接口文档，响应格式为：{ success: true, data: {...}, message: "..." }
  // request 拦截器已经返回 response.data，这里如果是 ApiResponse 格式，提取 data 字段
  let result: ItineraryTemplate
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    result = response.data as ItineraryTemplate
    console.log('提取的 data:', {
      id: result.id,
      daysCount: result.itineraryData?.days?.length || 0,
    })
  } else {
    result = response as ItineraryTemplate
    console.log('直接使用的响应:', {
      id: result.id,
      daysCount: result.itineraryData?.days?.length || 0,
    })
  }
  
  if (result?.itineraryData?.days && result.itineraryData.days.length > 0) {
    console.log('✅ 返回的数据包含 days，数量:', result.itineraryData.days.length)
  } else {
    console.warn('⚠️ 警告：返回的数据中没有 days 或 days 为空！')
  }
  
  console.log('=== updateItinerary API 调用结束 ===')
  
  return result
}

// 删除行程模版
// 根据接口文档，响应格式为：{ success: true, message: "删除成功" }
export const deleteItinerary = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await request.delete<{ success: boolean; message: string }>(`/v1/itineraries/${id}`)
  
  // request 拦截器已经返回 response.data，这里直接返回
  return response as { success: boolean; message: string }
}

// 发布行程模版
// 根据接口文档，响应格式为：{ success: true, data: {...}, message: "发布成功" }
// 此接口会将行程模版的状态从 draft（草稿）更新为 published（已发布）
export const publishItinerary = async (id: string): Promise<ItineraryTemplate> => {
  const response = await request.post<ApiResponse<ItineraryTemplate>>(`/v1/itineraries/${id}/publish`)
  
  // request 拦截器已经返回 response.data，这里如果是 ApiResponse 格式，提取 data 字段
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    return response.data as ItineraryTemplate
  }
  // 如果直接返回 ItineraryTemplate，直接返回
  return response as ItineraryTemplate
}

// 复制行程模版
// 根据接口文档，响应格式为：{ success: true, data: {...}, message: "复制成功" }
// 复制的模版会生成新的ID，状态自动设置为 draft（草稿），标题会自动添加"（副本）"后缀
export const cloneItinerary = async (id: string): Promise<ItineraryTemplate> => {
  const response = await request.post<ApiResponse<ItineraryTemplate>>(`/v1/itineraries/${id}/clone`)
  
  // request 拦截器已经返回 response.data，这里如果是 ApiResponse 格式，提取 data 字段
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    return response.data as ItineraryTemplate
  }
  // 如果直接返回 ItineraryTemplate，直接返回
  return response as ItineraryTemplate
}

