/**
 * Device Utility Functions
 * Handles device identification and information extraction
 */

import crypto from "node:crypto"
import type { Request } from "express"
import type { UserDevice } from "../types/index.js"
import logger from "./logger.js"

// Device info interface
export interface DeviceInfo {
  deviceId: string
  userAgent: string
  ip: string
  deviceType: string
  browser: string
  os: string
  location?: string
}

/**
 * Generate a unique device ID
 * @returns Unique device ID
 */
export const generateDeviceId = (): string => {
  return crypto.randomUUID()
}

/**
 * Generate device ID from user agent and IP
 * This creates a consistent ID for the same device
 * @param userAgent - User agent string
 * @param ip - IP address
 * @returns Device ID hash
 */
export const hashDeviceId = (userAgent: string, ip: string): string => {
  const data = `${userAgent}-${ip}`
  return crypto.createHash("sha256").update(data).digest("hex")
}

/**
 * Extract device information from request
 * @param req - Express request object
 * @returns Device information
 */
export const extractDeviceInfo = (req: Request): DeviceInfo => {
  const userAgent = req.headers["user-agent"] || "Unknown"
  const ip = getClientIp(req)

  return {
    deviceId: generateDeviceId(),
    userAgent,
    ip,
    deviceType: getDeviceType(userAgent),
    browser: getBrowser(userAgent),
    os: getOS(userAgent),
  }
}

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 * @param req - Express request object
 * @returns Client IP address
 */
export const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"]
  const realIp = req.headers["x-real-ip"]

  if (typeof forwarded === "string") {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    const ips = forwarded.split(",").map(ip => ip.trim())
    return ips[0]
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0]
  }

  if (realIp) {
    return realIp as string
  }

  return req.socket.remoteAddress || "Unknown"
}

/**
 * Detect device type from user agent
 * @param userAgent - User agent string
 * @returns Device type (mobile, tablet, desktop)
 */
export const getDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase()

  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return "mobile"
  }

  if (/tablet|ipad|kindle|silk|playbook/i.test(ua)) {
    return "tablet"
  }

  return "desktop"
}

/**
 * Detect browser from user agent
 * @param userAgent - User agent string
 * @returns Browser name
 */
export const getBrowser = (userAgent: string): string => {
  const ua = userAgent.toLowerCase()

  if (/chrome/i.test(ua) && !/edge|opr|edg/i.test(ua)) {
    return "Chrome"
  }

  if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    return "Safari"
  }

  if (/firefox/i.test(ua)) {
    return "Firefox"
  }

  if (/edge|edg/i.test(ua)) {
    return "Edge"
  }

  if (/opr|opera/i.test(ua)) {
    return "Opera"
  }

  if (/msie|trident/i.test(ua)) {
    return "Internet Explorer"
  }

  return "Unknown"
}

/**
 * Detect operating system from user agent
 * @param userAgent - User agent string
 * @returns Operating system name
 */
export const getOS = (userAgent: string): string => {
  const ua = userAgent.toLowerCase()

  if (/windows/i.test(ua)) {
    return "Windows"
  }

  if (/macintosh|mac os x/i.test(ua)) {
    return "macOS"
  }

  if (/linux/i.test(ua) && !/android/i.test(ua)) {
    return "Linux"
  }

  if (/android/i.test(ua)) {
    return "Android"
  }

  if (/iphone|ipad|ipod/i.test(ua)) {
    return "iOS"
  }

  return "Unknown"
}

/**
 * Format device info for display
 * @param deviceInfo - Device information object
 * @returns Formatted device string
 */
export const formatDeviceInfo = (deviceInfo: DeviceInfo): string => {
  const { browser, os, deviceType } = deviceInfo
  return `${browser} on ${os} (${deviceType})`
}

/**
 * Check if device is trusted (previously used by user)
 * @param userId - User ID
 * @param deviceId - Device ID
 * @returns True if device is trusted, false otherwise
 */
export const isDeviceTrusted = async (userId: string, deviceId: string): Promise<boolean> => {
  try {
    const { UserDevice } = await import("../models/index.js")

    const device = await UserDevice.findOne({
      where: {
        userId,
        deviceId,
      },
    })

    return !!device
  } catch (error) {
    logger.error("Error checking if device is trusted:", error)
    return false
  }
}

/**
 * Get all devices for a user
 * @param userId - User ID
 * @returns Array of user devices
 */
export const getUserDevices = async (userId: string): Promise<UserDevice[]> => {
  try {
    const { UserDevice } = await import("../models/index.js")

    const devices = await UserDevice.findAll({
      where: {
        userId,
      },
      order: [["lastLoginAt", "DESC"]],
    })

    return devices
  } catch (error) {
    logger.error("Error getting user devices:", error)
    throw error
  }
}
