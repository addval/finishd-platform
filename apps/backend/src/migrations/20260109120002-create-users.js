module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM type for user status
    await queryInterface.sequelize.query(`
      CREATE TYPE user_status_enum AS ENUM ('active', 'inactive');
    `)

    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      country_code: {
        type: Sequelize.STRING(5),
        allowNull: true,
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      email_verification_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      email_verification_code_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      phone_number_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      phone_number_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      phone_verification_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      phone_verification_code_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      confirmation_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      confirmation_code_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      password_reset_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      password_reset_code_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      onboarding_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      profile_picture_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })

    // Create indexes
    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "idx_users_email",
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users")
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS user_status_enum;")
  },
}
