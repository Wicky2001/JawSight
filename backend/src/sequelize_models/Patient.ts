import { Model, DataTypes, Sequelize } from "sequelize";

export class Patient extends Model {
  declare id: number;
  declare doctor_id: number;
  declare name: string;
  declare age: number;
  declare email: string;
  declare gender: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;

  static initModel(sequelize: Sequelize) {
    Patient.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        doctor_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        age: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        gender: {
          type: DataTypes.ENUM("MALE", "FEMALE"),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
        },
      },
      {
        sequelize,
        tableName: "patients",
        paranoid: true,
        timestamps: true,
      },
    );
  }

  static associate(models: any) {
    Patient.belongsTo(models.Doctor, { foreignKey: "doctor_id", as: "doctor" });
    Patient.hasMany(models.InferenceHistory, {
      foreignKey: "patient_id",
      as: "inference_histories",
    });
  }
}
