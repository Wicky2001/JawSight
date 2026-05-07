import { Model, DataTypes, Sequelize } from 'sequelize';

export class RefreshToken extends Model {
  declare id: number;
  declare doctor_id: number;
  declare token_hash: string;
  declare is_active: boolean;
  declare expires_at: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;

  static initModel(sequelize: Sequelize) {
    RefreshToken.init(
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
        token_hash: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'refresh_tokens',
        paranoid: true,
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    RefreshToken.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
  }
}
