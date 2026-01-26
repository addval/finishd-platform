/**
 * Models Index
 * Exports all Sequelize models and sets up associations
 */

import database from "../config/database.js"
import Role, { initRole } from "./Role.js"
import User, { initUser } from "./User.js"
import UserDevice, { initUserDevice } from "./UserDevice.js"
import UserPermission, { initUserPermission } from "./UserPermission.js"

// Get sequelize instance from the database module
// Use either the named export or default export depending on what's available
const sequelize = (database as any).sequelize || database

// Export all models
export { Role, User, UserPermission, UserDevice }

/**
 * Setup model associations
 * This function should be called after all models are imported
 */
export const setupAssociations = (): void => {
  // Role associations
  Role.hasMany(User, {
    foreignKey: "roleId",
    as: "users",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  User.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
  })

  // UserPermission associations
  User.hasOne(UserPermission, {
    foreignKey: "userId",
    as: "userPermission",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  UserPermission.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  })

  // UserDevice associations
  User.hasMany(UserDevice, {
    foreignKey: "userId",
    as: "userDevices",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  UserDevice.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  })
}

/**
 * Initialize all models with database
 * This function initializes all Sequelize models and sets up associations
 * Should be called AFTER database connection is established
 */
export const initializeModels = (): void => {
  try {
    // Initialize all models
    initRole(sequelize)
    initUser(sequelize)
    initUserDevice(sequelize)
    initUserPermission(sequelize)

    // Setup associations after all models are initialized
    setupAssociations()

    console.log("All models initialized successfully")
  } catch (error) {
    console.error("Error initializing models:", error)
    throw error
  }
}
