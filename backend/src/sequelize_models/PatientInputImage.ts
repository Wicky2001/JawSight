import { Model, DataTypes, Sequelize } from 'sequelize';

export class PatientInputImage extends Model {
  declare id: number;
  declare patient_id: number;
  declare doctor_id: number;
  declare bucket_key: string;
  declare iteration_code: string;
  declare direction: 'IN' | 'OUT';
  declare view_position: 'FRONT' | 'LEFT' | 'RIGHT';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;

  static initModel(sequelize: Sequelize) {
    PatientInputImage.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        patient_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        doctor_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        bucket_key: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        iteration_code: {
          type: DataTypes.STRING(100),
        },
        direction: {
          type: DataTypes.ENUM('in', 'out'),
        },
        view_position: {
          type: DataTypes.ENUM('front', 'left', 'right'),
        },
      },
      {
        sequelize,
        tableName: 'patients_input_images',
        paranoid: true,
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    PatientInputImage.belongsTo(models.Patient, { foreignKey: 'patient_id', as: 'patient' });
    PatientInputImage.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
  }
}
