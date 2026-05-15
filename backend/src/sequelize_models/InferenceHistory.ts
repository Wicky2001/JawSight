import { Model, DataTypes, Sequelize } from 'sequelize';
import { Doctor } from './Doctor.js';
import { Patient } from './Patient.js';

export class InferenceHistory extends Model {
  public id!: number;
  public patient_id!: number;
  public doctor_id!: number;
  public iteration_code!: string;
  public input_bucket_keys!: { left?: string; right?: string; front?: string; front_csv?: string } | null;
  public output_bucket_keys!: { left?: string; right?: string; front?: string } | null;
  public status!: "FAILED" | "PROCESSING" | "COMPLETED";

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    InferenceHistory.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        patient_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'patients',
            key: 'id',
          },
        },
        doctor_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'doctors',
            key: 'id',
          },
        },
        iteration_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        input_bucket_keys: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        output_bucket_keys: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("FAILED", "PROCESSING", "COMPLETED"),
          allowNull: false,
          defaultValue: "PROCESSING"
        },
      },
      {
        sequelize,
        modelName: 'InferenceHistory',
        tableName: 'inference_histories',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models: any) {
    InferenceHistory.belongsTo(models.Patient, { foreignKey: 'patient_id', as: 'patient' });
    InferenceHistory.belongsTo(models.Doctor, { foreignKey: 'doctor_id' });
  }
}
