import jwt from 'jsonwebtoken';

const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const createRefreshToken = (id: string): string => {
  return jwt.sign({ id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' ,algorithm:'HS256'});
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return null;
  }
};
