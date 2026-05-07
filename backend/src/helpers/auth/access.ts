import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret';

export const createAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};
