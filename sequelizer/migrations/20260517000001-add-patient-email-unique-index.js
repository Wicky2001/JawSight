"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS patients_doctor_email_unique_idx
      ON "patients" ("doctor_id", LOWER("email"))
      WHERE "deletedAt" IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS patients_doctor_email_unique_idx;
    `);
  },
};
