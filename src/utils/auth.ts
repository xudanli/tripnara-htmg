// 简单的认证工具
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin'

export interface LoginCredentials {
  username: string
  password: string
}

export const login = (credentials: LoginCredentials): Promise<boolean> => {
  return new Promise((resolve) => {
    // 模拟登录验证
    if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('username', credentials.username)
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token')
}

export const getUsername = (): string | null => {
  return localStorage.getItem('username')
}

