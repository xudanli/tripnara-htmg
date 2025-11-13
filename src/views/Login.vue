<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">TripNara 旅行规划</h1>
      <p class="login-subtitle">后台管理系统</p>
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleLogin"
        class="login-form"
        layout="vertical"
      >
        <a-form-item name="username" label="用户名">
          <a-input v-model:value="formState.username" size="large" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item name="password" label="密码">
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="请输入密码"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            登录
          </a-button>
        </a-form-item>
      </a-form>
      <div class="login-hint">
        <p>默认账号：admin</p>
        <p>默认密码：admin</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { login } from '@/utils/auth'

const router = useRouter()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  loading.value = true
  try {
    const success = await login({
      username: formState.username,
      password: formState.password,
    })
    if (success) {
      message.success('登录成功')
      router.push('/')
    } else {
      message.error('用户名或密码错误')
    }
  } catch (error) {
    message.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.login-subtitle {
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
  color: #666;
}

.login-form {
  margin-bottom: 20px;
}

.login-hint {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 20px;
}

.login-hint p {
  margin: 4px 0;
}
</style>

