import { Model, DataTypes, Sequelize } from 'sequelize';

export class AuditLog extends Model {
  declare id: number;
  declare doctor_id: number;
  declare entity_id: number;
  declare action: string;
  declare description: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;

  static initModel(sequelize: Sequelize) {
    AuditLog.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        doctor_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        entity_id: {
          type: DataTypes.BIGINT,
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'audit_logs',
        paranoid: true,
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    AuditLog.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
  }
}
