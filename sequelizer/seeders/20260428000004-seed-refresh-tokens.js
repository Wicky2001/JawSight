'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Optionally insert initial refresh tokens for testing, 
    // or leave empty if tests will generate their own
    await queryInterface.bulkInsert('refresh_tokens', [
      {
        doctor_id: 1,
        token_hash: 'initial-dummy-refresh-token-hash-1234',
        is_active: true,
        expires_at: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('refresh_tokens', null, {});
  }
};