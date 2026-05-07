import { Sequelize } from 'sequelize';
import { Doctor } from './Doctor.js';
import { Patient } from './Patient.js';
import { PatientImage } from './PatientImage.js';
import { RefreshToken } from './RefreshToken.js';
import { AuditLog } from './AuditLog.js';



const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT as any,
  port: Number(process.env.DB_PORT),
  logging: false, 
});

const models = {
  Doctor,
  Patient,
  PatientImage,
  RefreshToken,
  AuditLog,
};

// Initialize models
Object.values(models).forEach((model) => {
  if ('initModel' in model) {
    (model as any).initModel(sequelize);
  }
});

// Set associations
Object.values(models).forEach((model) => {
  if ('associate' in model) {
    (model as any).associate(models);
  }
});

export { sequelize, models };
export default models;
