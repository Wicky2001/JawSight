'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('patient_images', [
      {
        patient_id: 1,
        doctor_id: 1,
        image_url: 's3://bucket-name/patient-images/john-doe-pre-surgery.jpg',
        iteration_code: 'ITER-001',
        direction: 'IN',
        view_position: 'FRONT',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        patient_id: 1,
        doctor_id: 1,
        image_url: 's3://bucket-name/patient-images/john-doe-post-surgery-pred.jpg',
        iteration_code: 'ITER-001',
        direction: 'OUT',
        view_position: 'LEFT',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('patient_images', null, {});
  }
};