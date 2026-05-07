import { Model, DataTypes, Sequelize } from 'sequelize';

export class PatientImage extends Model {
  declare id: number;
  declare patient_id: number;
  declare doctor_id: number;
  declare image_url: string;
  declare iteration_code: string;
  declare direction: 'IN' | 'OUT';
  declare view_position: 'FRONT' | 'LEFT' | 'RIGHT';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;

  static initModel(sequelize: Sequelize) {
    PatientImage.init(
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
        image_url: {
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
        tableName: 'patient_images',
        paranoid: true,
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    PatientImage.belongsTo(models.Patient, { foreignKey: 'patient_id', as: 'patient' });
    PatientImage.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
  }
}
