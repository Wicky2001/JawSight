import { Model, DataTypes, Sequelize } from 'sequelize';

export class Doctor extends Model {
  declare id: number;
  declare google_id: string;
  declare email: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;

  static initModel(sequelize: Sequelize) {
    Doctor.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        google_id: {
          type: DataTypes.STRING(255),
        },
        email: {
          type: DataTypes.STRING(255),
        },
      },
      {
        sequelize,
        tableName: 'doctors',
        paranoid: true, // Enables soft deletion
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    Doctor.hasMany(models.Patient, { foreignKey: 'doctor_id', as: 'patients' });
    Doctor.hasMany(models.PatientInputImage, { foreignKey: 'doctor_id', as: 'patient_input_images' });
    Doctor.hasMany(models.PatientOutputImage, { foreignKey: 'doctor_id', as: 'patient_output_images' });
    Doctor.hasMany(models.RefreshToken, { foreignKey: 'doctor_id', as: 'refresh_tokens' });
    Doctor.hasMany(models.AuditLog, { foreignKey: 'doctor_id', as: 'audit_logs' });
  }
}
