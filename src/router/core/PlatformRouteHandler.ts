/**
 * 平台路由处理器模块
 *
 * 提供多平台场景下的路由处理功能
 *
 * ## 主要功能
 *
 * - 为路由添加平台前缀参数
 * - 解析带平台前缀的路径
 * - 处理路由重定向时的平台保持
 *
 * @module router/core/PlatformRouteHandler
 * @author Art Design Pro Team
 */

import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { platformManager, PLATFORMS, DEFAULT_PLATFORM, type PlatformType } from '@/utils/platform'

/**
 * 平台路由处理器
 */
export class PlatformRouteHandler {
  private static instance: PlatformRouteHandler

  private constructor() {}

  static getInstance(): PlatformRouteHandler {
    if (!PlatformRouteHandler.instance) {
      PlatformRouteHandler.instance = new PlatformRouteHandler()
    }
    return PlatformRouteHandler.instance
  }

  /**
   * 从路由位置中解析平台标识
   * @param to 目标路由
   * @returns 平台标识和真实路径
   */
  parseRoute(to: RouteLocationNormalized): { platform: PlatformType | null; realPath: string } {
    const fullPath = to.fullPath
    return platformManager.parsePath(fullPath)
  }

  /**
   * 处理路由前的平台解析
   * 从目标路由中解析平台标识并设置
   * @param to 目标路由
   * @returns 是否需要重定向（如果当前路径不包含平台前缀）
   */
  handleBeforeRoute(to: RouteLocationNormalized): { needRedirect: boolean; redirectPath?: string } {
    const { platform, realPath } = this.parseRoute(to)

    // 如果路径中包含平台标识
    if (platform) {
      platformManager.setPlatform(platform)
      return { needRedirect: false }
    }

    // 如果路径中没有平台标识，检查是否已有存储的平台
    const storedPlatform = platformManager.getPlatform()
    
    if (storedPlatform) {
      // 已有存储的平台，添加前缀重定向
      const redirectPath = platformManager.addPlatformPrefix(to.fullPath, storedPlatform)
      return { needRedirect: true, redirectPath }
    }

    // 没有存储的平台，使用默认平台
    platformManager.setPlatform(DEFAULT_PLATFORM)
    const redirectPath = platformManager.addPlatformPrefix(to.fullPath, DEFAULT_PLATFORM)
    return { needRedirect: true, redirectPath }
  }

  /**
   * 获取不带平台前缀的真实路径
   * 用于路由匹配
   */
  getRealPath(to: RouteLocationNormalized): string {
    const { realPath } = this.parseRoute(to)
    return realPath
  }

  /**
   * 转换路由位置，添加平台前缀
   * @param location 原始路由位置
   * @returns 带平台前缀的路由位置
   */
  transformRouteLocation(location: RouteLocationRaw): RouteLocationRaw {
    const platform = platformManager.getPlatform()
    
    if (!platform) {
      return location
    }

    if (typeof location === 'string') {
      return platformManager.addPlatformPrefix(location, platform)
    }

    if ('path' in location && location.path) {
      return {
        ...location,
        path: platformManager.addPlatformPrefix(location.path, platform)
      }
    }

    return location
  }

  /**
   * 检查路径是否为根路径（平台根路径）
   */
  isRootPath(path: string): boolean {
    const { realPath } = platformManager.parsePath(path)
    return realPath === '/' || realPath === ''
  }

  /**
   * 获取平台根路径
   */
  getPlatformRootPath(platform?: PlatformType): string {
    const targetPlatform = platform || platformManager.getPlatform() || DEFAULT_PLATFORM
    return `/${targetPlatform}`
  }

  /**
   * 获取带平台前缀的登录路径
   */
  getLoginPath(platform?: PlatformType): string {
    const targetPlatform = platform || platformManager.getPlatform() || DEFAULT_PLATFORM
    return `/${targetPlatform}/auth/login`
  }

  /**
   * 生成平台选择路径列表
   */
  getPlatformSelectionPaths(): { platform: PlatformType; path: string; label: string }[] {
    const labels: Record<PlatformType, string> = {
      admin: '管理端',
      merchant: '商户端',
      agent: '代理端'
    }

    return PLATFORMS.map((platform) => ({
      platform,
      path: `/${platform}/auth/login`,
      label: labels[platform]
    }))
  }
}

// 导出单例
export const platformRouteHandler = PlatformRouteHandler.getInstance()

