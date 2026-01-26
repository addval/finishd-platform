/**
 * UserPermission Model
 * One-to-one relationship with users storing granular permission flags and preferences
 */

import { DataTypes, Model, type Sequelize, UUIDV4 } from "sequelize"
import type { UserPermission as UserPermissionAttributes } from "../types/index"

class UserPermission extends Model implements UserPermissionAttributes {
  declare id: string
  declare userId: string
  declare calendarEnabled: boolean
  declare notificationsEnabled: boolean
  declare contactsEnabled: boolean
  declare locationEnabled: boolean
  declare marketingEmailsEnabled: boolean
  declare ritualRemindersEnabled: boolean
  declare communityUpdatesEnabled: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

export const initUserPermission = (sequelize: Sequelize): void => {
  UserPermission.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      calendarEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "calendar_enabled",
      },
      notificationsEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "notifications_enabled",
      },
      contactsEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "contacts_enabled",
      },
      locationEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "location_enabled",
      },
      marketingEmailsEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "marketing_emails_enabled",
      },
      ritualRemindersEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "ritual_reminders_enabled",
      },
      communityUpdatesEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "community_updates_enabled",
      },
    },
    {
      sequelize,
      tableName: "user_permissions",
      modelName: "UserPermission",
      timestamps: true,
      underscored: true,
      paranoid: false, // UserPermission table doesn't have soft deletes
    },
  )
}

export default UserPermission
