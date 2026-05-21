import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';
import { sendError } from '../utils/response';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.errors);
    return;
  }

  console.error(err);
  sendError(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error');
};

export default errorHandler;
