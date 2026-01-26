/**
 * UserDevice Model
 * Store user devices and their associated JWT tokens for multi-device authentication
 */

import { DataTypes, Model, Op, type Sequelize, UUIDV4 } from "sequelize"
import type { UserDevice as UserDeviceAttributes } from "../types/index"

class UserDevice extends Model implements UserDeviceAttributes {
  declare id: string
  declare userId: string
  declare token: string
  declare refreshToken: string
  declare tokenExpiresAt: Date
  declare refreshTokenExpiresAt: Date
  declare deviceType: "mobile" | "desktop" | "tablet" | "unknown" | null
  declare deviceName: string | null
  declare userAgent: string | null
  declare ipAddress: string | null
  declare isActive: boolean
  declare lastUsedAt: Date
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

export const initUserDevice = (sequelize: Sequelize): void => {
  UserDevice.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "JWT access token (hashed)",
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "refresh_token",
        comment: "Refresh token (hashed)",
      },
      tokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "token_expires_at",
      },
      refreshTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "refresh_token_expires_at",
      },
      deviceType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "device_type",
        validate: {
          isIn: {
            args: [["mobile", "desktop", "tablet", "unknown"]],
            msg: "Device type must be one of: mobile, desktop, tablet, unknown",
          },
        },
      },
      deviceName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "device_name",
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "user_agent",
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: "ip_address",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "last_used_at",
      },
    },
    {
      sequelize,
      tableName: "user_devices",
      modelName: "UserDevice",
      timestamps: true,
      underscored: true,
      paranoid: false, // UserDevice table doesn't have soft deletes
      defaultScope: {
        where: {
          isActive: true,
        },
      },
      scopes: {
        withInactive: {
          where: {},
        },
        active: {
          where: {
            isActive: true,
          },
        },
        expired: {
          where: {
            tokenExpiresAt: {
              [Op.lt]: new Date(),
            },
          },
        },
      },
    },
  )
}

export default UserDevice
