<!-- 用户菜单 -->
<template>
  <ElPopover
    ref="userMenuPopover"
    placement="bottom-end"
    :width="240"
    :hide-after="0"
    :offset="10"
    trigger="hover"
    :show-arrow="false"
    popper-class="user-menu-popover"
    popper-style="padding: 5px 16px;"
  >
    <template #reference>
      <img
        class="size-8.5 mr-5 c-p rounded-full max-sm:w-6.5 max-sm:h-6.5 max-sm:mr-[16px]"
        src="@imgs/user/avatar.webp"
        alt="avatar"
      />
    </template>
    <template #default>
      <div class="pt-3">
        <div class="flex-c pb-1 px-0">
          <img
            class="w-10 h-10 mr-3 ml-0 overflow-hidden rounded-full float-left"
            src="@imgs/user/avatar.webp"
          />
          <div class="w-[calc(100%-60px)] h-full">
            <span class="block text-sm font-medium text-g-800 truncate">{{
              userInfo.userName
            }}</span>
            <span class="block mt-0.5 text-xs text-g-500 truncate">{{ userInfo.email }}</span>
          </div>
        </div>
        <ul class="py-4 mt-3 border-t border-g-300/80">
          <li class="btn-item" @click="goPage('/system/user-center')">
            <ArtSvgIcon icon="ri:user-3-line" />
            <span>{{ $t('topBar.user.userCenter') }}</span>
          </li>
          <li class="btn-item" @click="toDocs()">
            <ArtSvgIcon icon="ri:book-2-line" />
            <span>{{ $t('topBar.user.docs') }}</span>
          </li>
          <li class="btn-item" @click="toGithub()">
            <ArtSvgIcon icon="ri:github-line" />
            <span>{{ $t('topBar.user.github') }}</span>
          </li>
          <li class="btn-item" @click="lockScreen()">
            <ArtSvgIcon icon="ri:lock-line" />
            <span>{{ $t('topBar.user.lockScreen') }}</span>
          </li>
          <div class="w-full h-px my-2 bg-g-300/80"></div>
          <div class="log-out c-p mb-2" @click="openModifyPasswordDialog">
            {{ $t('topBar.user.modifyPassword') }}
          </div>
          <div class="log-out c-p" @click="loginOut">
            {{ $t('topBar.user.logout') }}
          </div>
        </ul>
      </div>
    </template>
  </ElPopover>

  <!-- 修改密码弹窗 -->
  <ElDialog
    v-model="modifyPasswordDialogVisible"
    :title="$t('common.modifyPassword.title')"
    width="500px"
    align-center
    @closed="handleDialogClosed"
  >
    <ElForm
      ref="modifyPasswordFormRef"
      :model="modifyPasswordForm"
      :rules="modifyPasswordRules"
      label-width="100px"
    >
      <ElFormItem :label="$t('common.modifyPassword.oldPassword')" prop="old_password">
        <ElInput
          v-model="modifyPasswordForm.old_password"
          type="password"
          :placeholder="$t('common.modifyPassword.oldPasswordPlaceholder')"
          show-password
        />
      </ElFormItem>
      <ElFormItem :label="$t('common.modifyPassword.newPassword')" prop="new_password">
        <ElInput
          v-model="modifyPasswordForm.new_password"
          type="password"
          :placeholder="$t('common.modifyPassword.newPasswordPlaceholder')"
          show-password
        />
      </ElFormItem>
      <ElFormItem :label="$t('common.modifyPassword.confirmPassword')" prop="confirm_password">
        <ElInput
          v-model="modifyPasswordForm.confirm_password"
          type="password"
          :placeholder="$t('common.modifyPassword.confirmPasswordPlaceholder')"
          show-password
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="modifyPasswordDialogVisible = false">
          {{ $t('common.cancel') }}
        </ElButton>
        <ElButton type="primary" :loading="modifyPasswordSubmitting" @click="handleModifyPassword">
          {{ $t('common.modifyPassword.submit') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { ElMessageBox, ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { WEB_LINKS } from '@/utils/constants'
  import { mittBus } from '@/utils/sys'
  import { fetchModifyPassword } from '@/api/auth'

  defineOptions({ name: 'ArtUserMenu' })

  const router = useRouter()
  const { t } = useI18n()
  const userStore = useUserStore()

  const { getUserInfo: userInfo } = storeToRefs(userStore)
  const userMenuPopover = ref()

  // 修改密码相关
  const modifyPasswordDialogVisible = ref(false)
  const modifyPasswordSubmitting = ref(false)
  const modifyPasswordFormRef = ref<FormInstance>()
  const modifyPasswordForm = reactive({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // 修改密码表单验证规则
  const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error(t('common.modifyPassword.confirmPasswordRequired')))
    } else if (value !== modifyPasswordForm.new_password) {
      callback(new Error(t('common.modifyPassword.passwordMismatch')))
    } else {
      callback()
    }
  }

  const modifyPasswordRules: FormRules = {
    old_password: [
      { required: true, message: t('common.modifyPassword.oldPasswordRequired'), trigger: 'blur' }
    ],
    new_password: [
      { required: true, message: t('common.modifyPassword.newPasswordRequired'), trigger: 'blur' },
      {
        min: 6,
        message: t('common.modifyPassword.passwordLength'),
        trigger: 'blur'
      }
    ],
    confirm_password: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
  }

  /**
   * 页面跳转
   * @param {string} path - 目标路径
   */
  const goPage = (path: string): void => {
    router.push(path)
  }

  /**
   * 打开文档页面
   */
  const toDocs = (): void => {
    window.open(WEB_LINKS.DOCS)
  }

  /**
   * 打开 GitHub 页面
   */
  const toGithub = (): void => {
    window.open(WEB_LINKS.GITHUB)
  }

  /**
   * 打开锁屏功能
   */
  const lockScreen = (): void => {
    mittBus.emit('openLockScreen')
  }

  /**
   * 用户登出确认
   */
  const loginOut = (): void => {
    closeUserMenu()
    setTimeout(() => {
      ElMessageBox.confirm(t('common.logOutTips'), t('common.tips'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        customClass: 'login-out-dialog'
      }).then(() => {
        userStore.logOut()
      })
    }, 200)
  }

  /**
   * 关闭用户菜单弹出层
   */
  const closeUserMenu = (): void => {
    setTimeout(() => {
      userMenuPopover.value.hide()
    }, 100)
  }

  /**
   * 打开修改密码弹窗
   */
  const openModifyPasswordDialog = (): void => {
    closeUserMenu()
    setTimeout(() => {
      modifyPasswordDialogVisible.value = true
    }, 200)
  }

  /**
   * 处理修改密码弹窗关闭
   */
  const handleDialogClosed = (): void => {
    // 重置表单
    modifyPasswordForm.old_password = ''
    modifyPasswordForm.new_password = ''
    modifyPasswordForm.confirm_password = ''
    modifyPasswordFormRef.value?.clearValidate()
  }

  /**
   * 处理修改密码提交
   */
  const handleModifyPassword = async (): Promise<void> => {
    if (!modifyPasswordFormRef.value) return

    await modifyPasswordFormRef.value.validate(async (valid) => {
      if (valid) {
        modifyPasswordSubmitting.value = true
        try {
          await fetchModifyPassword({
            old_password: modifyPasswordForm.old_password,
            new_password: modifyPasswordForm.new_password
          })
          ElMessage.success(t('common.modifyPassword.success'))
          modifyPasswordDialogVisible.value = false
          // 延迟执行退出登录，让用户看到成功提示
          setTimeout(() => {
            userStore.logOut()
          }, 1000)
        } catch (error) {
          // 错误信息由 http 拦截器统一处理
          console.error('修改密码失败:', error)
        } finally {
          modifyPasswordSubmitting.value = false
        }
      }
    })
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  @layer components {
    .btn-item {
      @apply flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0;

      span {
        @apply text-sm;
      }

      .art-svg-icon {
        @apply mr-2 text-base;
      }

      &:hover {
        background-color: var(--art-gray-200);
      }
    }
  }

  .log-out {
    @apply py-1.5
    mt-5
    text-xs
    text-center
    border
    border-g-400
    rounded-md
    transition-all
    duration-200
    hover:shadow-xl;
  }
</style>
