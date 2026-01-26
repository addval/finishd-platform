/**
 * User Model
 * Central table storing user account information, authentication data, and profile details
 */

import { DataTypes, Model, type Sequelize, UUIDV4 } from "sequelize"
import type { User as UserAttributes } from "../types/index"

class User extends Model implements UserAttributes {
  declare id: string
  declare roleId: string
  declare email: string
  declare passwordHash: string
  declare name: string | null
  declare username: string | null
  declare city: string | null
  declare phoneNumber: string | null
  declare countryCode: string | null
  declare timezone: string | null
  declare emailVerified: boolean
  declare emailVerifiedAt: Date | null
  declare emailVerificationCode: string | null
  declare emailVerificationCodeExpiresAt: Date | null
  declare phoneNumberVerified: boolean
  declare phoneNumberVerifiedAt: Date | null
  declare phoneVerificationCode: string | null
  declare phoneVerificationCodeExpiresAt: Date | null
  declare confirmationCode: string | null
  declare confirmationCodeExpiresAt: Date | null
  declare passwordResetCode: string | null
  declare passwordResetCodeExpiresAt: Date | null
  declare onboardingCompleted: boolean
  declare profileCreated: boolean
  declare profilePictureUrl: string | null
  declare bio: string | null
  declare status: "active" | "inactive"
  declare deleted: boolean
  declare deletedAt: Date | null
  declare lastLoginAt: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  // Associations
  declare role?: UserAttributes["role"]
  declare userPermission?: UserAttributes["userPermission"]
  declare userDevices?: UserAttributes["userDevices"]
}

export const initUser = (sequelize: Sequelize): void => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "role_id",
        references: {
          model: "roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Must be a valid email address",
          },
          notEmpty: {
            msg: "Email is required",
          },
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
        validate: {
          notEmpty: {
            msg: "Password hash is required",
          },
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: {
            args: [2, 100],
            msg: "Name must be between 2 and 100 characters",
          },
        },
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        validate: {
          is: {
            args: /^[a-zA-Z0-9_]{3,50}$/,
            msg: "Username must be 3-50 characters, alphanumeric and underscores only",
          },
        },
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: {
            args: [2, 100],
            msg: "City must be between 2 and 100 characters",
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "phone_number",
        unique: true,
        validate: {
          is: {
            args: /^\+?[1-9]\d{1,14}$/,
            msg: "Phone number must be in E.164 format (e.g., +1234567890)",
          },
        },
      },
      countryCode: {
        type: DataTypes.STRING(5),
        allowNull: true,
        field: "country_code",
        validate: {
          is: {
            args: /^\+\d{1,4}$/,
            msg: "Country code must be in format +XX or +XXX",
          },
        },
      },
      timezone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          is: {
            args: /^(Africa|America|Asia|Atlantic|Australia|Europe|Indian|Pacific)\/[A-Za-z0-9_]+$/,
            msg: "Timezone must be a valid IANA timezone (e.g., America/New_York)",
          },
        },
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "email_verified",
      },
      emailVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "email_verified_at",
      },
      emailVerificationCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "email_verification_code",
      },
      emailVerificationCodeExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "email_verification_code_expires_at",
      },
      phoneNumberVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "phone_number_verified",
      },
      phoneNumberVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "phone_number_verified_at",
      },
      phoneVerificationCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "phone_verification_code",
      },
      phoneVerificationCodeExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "phone_verification_code_expires_at",
      },
      confirmationCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "confirmation_code",
      },
      confirmationCodeExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "confirmation_code_expires_at",
      },
      passwordResetCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "password_reset_code",
      },
      passwordResetCodeExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "password_reset_code_expires_at",
      },
      onboardingCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "onboarding_completed",
      },
      profileCreated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "profile_created",
      },
      profilePictureUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "profile_picture_url",
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login_at",
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
      timestamps: true,
      underscored: true,
      paranoid: false, // We handle soft deletes manually with 'deleted' flag
      defaultScope: {
        where: {
          deleted: false,
        },
      },
      scopes: {
        withDeleted: {
          where: {},
        },
        active: {
          where: {
            status: "active",
          },
        },
        verified: {
          where: {
            emailVerified: true,
          },
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["email"],
          name: "idx_users_email",
        },
      ],
    },
  )
}

export default User
