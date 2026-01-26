const { v4: uuidv4 } = require("uuid")

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "roles",
      [
        {
          id: uuidv4(),
          name: "admin",
          description: "Administrative access",
          created_at: Sequelize.literal("CURRENT_TIMESTAMP"),
          updated_at: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        {
          id: uuidv4(),
          name: "user",
          description: "Standard user access",
          created_at: Sequelize.literal("CURRENT_TIMESTAMP"),
          updated_at: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      ],
      {},
    )
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete(
      "roles",
      {
        name: ["admin", "user"],
      },
      {},
    )
  },
}
