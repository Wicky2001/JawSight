import jwt from 'jsonwebtoken';

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';

export const createRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};
