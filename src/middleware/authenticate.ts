import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';

export interface JwtPayload {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization'];

  if (!token) {
    return next(new AppError('Access denied. No token provided.', StatusCodes.UNAUTHORIZED));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError('Invalid or expired token.', StatusCodes.UNAUTHORIZED));
  }
};

export default authenticate;
