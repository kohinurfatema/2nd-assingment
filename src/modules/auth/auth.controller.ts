import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import pool from '../../config/database';
import AppError from '../../utils/AppError';
import { sendSuccess } from '../../utils/response';
import { SignupBody, LoginBody, UserRecord } from './auth.types';

export const signup = async (
  req: Request<object, object, SignupBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required.', StatusCodes.BAD_REQUEST);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format.', StatusCodes.BAD_REQUEST);
    }

    if (role && !['contributor', 'maintainer'].includes(role)) {
      throw new AppError('Role must be contributor or maintainer.', StatusCodes.BAD_REQUEST);
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new AppError('Email already in use.', StatusCodes.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role ?? 'contributor';

    const result = await pool.query<UserRecord>(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, assignedRole]
    );

    sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request<object, object, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required.', StatusCodes.BAD_REQUEST);
    }

    const result = await pool.query<UserRecord & { password: string }>(
      'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password.', StatusCodes.UNAUTHORIZED);
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new AppError('Invalid email or password.', StatusCodes.UNAUTHORIZED);
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, StatusCodes.OK, 'Login successful', {
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
};
