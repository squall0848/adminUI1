/**
 * 平台管理模块
 *
 * 提供多平台路由前缀管理功能
 *
 * @module utils/platform
 * @author Art Design Pro Team
 */

/**
 * 平台类型
 */
export type PlatformType = 'admin' | 'merchant' | 'agent'

/**
 * 支持的平台列表
 */
export const PLATFORMS: PlatformType[] = ['admin', 'merchant', 'agent']

/**
 * 默认平台
 */
export const DEFAULT_PLATFORM: PlatformType = 'admin'

/**
 * 平台管理器
 */
class PlatformManager {
  private currentPlatform: PlatformType | null = null
  private readonly storageKey = 'current_platform'

  /**
   * 获取当前平台
   */
  getPlatform(): PlatformType | null {
    if (this.currentPlatform) {
      return this.currentPlatform
    }

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored && PLATFORMS.includes(stored as PlatformType)) {
        this.currentPlatform = stored as PlatformType
        return this.currentPlatform
      }
    } catch (error) {
      console.error('Failed to get platform from storage:', error)
    }

    return null
  }

  /**
   * 设置当前平台
   */
  setPlatform(platform: PlatformType): void {
    this.currentPlatform = platform
    try {
      localStorage.setItem(this.storageKey, platform)
    } catch (error) {
      console.error('Failed to save platform to storage:', error)
    }
  }

  /**
   * 解析路径，提取平台标识和真实路径
   */
  parsePath(path: string): { platform: PlatformType | null; realPath: string } {
    const trimmedPath = path.startsWith('/') ? path.slice(1) : path
    const parts = trimmedPath.split('/')

    if (parts.length > 0 && PLATFORMS.includes(parts[0] as PlatformType)) {
      return {
        platform: parts[0] as PlatformType,
        realPath: '/' + parts.slice(1).join('/') || '/'
      }
    }

    return {
      platform: null,
      realPath: path
    }
  }

  /**
   * 为路径添加平台前缀
   */
  addPlatformPrefix(path: string, platform: PlatformType): string {
    const { realPath } = this.parsePath(path)
    return realPath === '/' ? `/${platform}` : `/${platform}${realPath}`
  }
}

/**
 * 平台管理器实例
 */
export const platformManager = new PlatformManager()
