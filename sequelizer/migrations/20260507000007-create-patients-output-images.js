'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patients_output_images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      patient_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      doctor_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      bucket_key: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      iteration_code: {
        type: Sequelize.STRING(100)
      },
      direction: {
        type: Sequelize.ENUM('in', 'out')
      },
      view_position: {
        type: Sequelize.ENUM('front', 'left', 'right')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patients_output_images');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_patients_output_images_direction";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_patients_output_images_view_position";');
  }
};
