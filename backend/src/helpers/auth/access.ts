import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;

export const createAccessToken = (id: string): string => {
  return jwt.sign({ id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m',algorithm:'HS256'}); 
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET,{algorithms:['HS256']});
  } catch (error) {
    return null;
  }
};
