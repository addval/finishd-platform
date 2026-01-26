/**
 * Role Model
 * Defines user roles for role-based access control (RBAC)
 */

import { DataTypes, Model, type Sequelize, UUIDV4 } from "sequelize"
import type { Role as RoleAttributes } from "../types/index"

class Role extends Model implements RoleAttributes {
  declare id: string
  declare name: string
  declare description: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

export const initRole = (sequelize: Sequelize): void => {
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "roles",
      modelName: "Role",
      timestamps: true,
      underscored: true,
      paranoid: false, // Role table doesn't have soft deletes
    },
  )
}

export default Role
