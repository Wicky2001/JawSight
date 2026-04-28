'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('doctors', [
      {
        id: 1,
        email: 'dr.smith@example.com',
        password_hash: '$2b$10$xyz123hashedpasswordexample',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        email: 'dr.jones@example.com',
        password_hash: '$2b$10$abc987hashedpasswordexample',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('doctors', null, {});
  }
};