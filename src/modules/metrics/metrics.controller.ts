import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import pool from '../../config/database';
import { sendSuccess } from '../../utils/response';

export const getMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalIssues, issuesByStatus, issuesByType, totalUsers, usersByRole] =
      await Promise.all([
        pool.query<{ count: string }>('SELECT COUNT(*) as count FROM issues'),
        pool.query<{ status: string; count: string }>(
          'SELECT status, COUNT(*) as count FROM issues GROUP BY status'
        ),
        pool.query<{ type: string; count: string }>(
          'SELECT type, COUNT(*) as count FROM issues GROUP BY type'
        ),
        pool.query<{ count: string }>('SELECT COUNT(*) as count FROM users'),
        pool.query<{ role: string; count: string }>(
          'SELECT role, COUNT(*) as count FROM users GROUP BY role'
        ),
      ]);

    const metrics = {
      issues: {
        total: parseInt(totalIssues.rows[0].count),
        by_status: issuesByStatus.rows.reduce<Record<string, number>>((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {}),
        by_type: issuesByType.rows.reduce<Record<string, number>>((acc, row) => {
          acc[row.type] = parseInt(row.count);
          return acc;
        }, {}),
      },
      users: {
        total: parseInt(totalUsers.rows[0].count),
        by_role: usersByRole.rows.reduce<Record<string, number>>((acc, row) => {
          acc[row.role] = parseInt(row.count);
          return acc;
        }, {}),
      },
    };

    sendSuccess(res, StatusCodes.OK, 'Metrics retrieved successfully', metrics);
  } catch (err) {
    next(err);
  }
};
