"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "patients",
      [
        {
          id: 1,
          doctor_id: 1,
          name: "John Doe",
          age: 34,
          email: "john.doe@example.com",
          gender: "MALE",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          doctor_id: 1,
          name: "Jane Roe",
          age: 28,
          email: "jane.roe@example.com",
          gender: "FEMALE",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("patients", null, {});
  },
};
