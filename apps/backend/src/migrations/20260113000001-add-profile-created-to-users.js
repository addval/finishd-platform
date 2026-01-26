module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "profile_created", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn("users", "profile_created")
  },
}
