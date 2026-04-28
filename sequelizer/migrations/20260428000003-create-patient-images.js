'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patient_images', {
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
        onDelete: 'CASCADE'
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      iteration_code: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      direction: {
        type: Sequelize.ENUM('IN', 'OUT'),
        allowNull: false
      },
      view_position: {
        type: Sequelize.ENUM('FRONT', 'LEFT', 'RIGHT'),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('patient_images');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_patient_images_direction";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_patient_images_view_position";');
  }
};