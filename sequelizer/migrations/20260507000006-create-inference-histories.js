'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inference_histories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      iteration_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      input_bucket_keys: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      output_bucket_keys: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM("FAILED", "PROCESSING", "COMPLETED"),
        allowNull: false,
        defaultValue: "PROCESSING"
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
      }
    });

    await queryInterface.addIndex('inference_histories', ['iteration_code']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inference_histories');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_inference_histories_status";');
  }
};
