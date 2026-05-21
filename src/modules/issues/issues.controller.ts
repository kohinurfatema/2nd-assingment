import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import pool from '../../config/database';
import AppError from '../../utils/AppError';
import { sendSuccess } from '../../utils/response';
import {
  CreateIssueBody,
  IssueRecord,
  IssueWithReporter,
  ReporterInfo,
  GetIssuesQuery,
} from './issues.types';

export const createIssue = async (
  req: Request<object, object, CreateIssueBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user!.id;

    if (!title || !description || !type) {
      throw new AppError('Title, description, and type are required.', StatusCodes.BAD_REQUEST);
    }

    if (title.length > 150) {
      throw new AppError('Title must not exceed 150 characters.', StatusCodes.BAD_REQUEST);
    }

    if (description.length < 20) {
      throw new AppError('Description must be at least 20 characters.', StatusCodes.BAD_REQUEST);
    }

    if (!['bug', 'feature_request'].includes(type)) {
      throw new AppError('Type must be bug or feature_request.', StatusCodes.BAD_REQUEST);
    }

    const result = await pool.query<IssueRecord>(
      `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
      [title, description, type, reporterId]
    );

    sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const getAllIssues = async (
  req: Request<object, object, object, GetIssuesQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sort = 'newest', type, status } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(type);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';

    const issuesResult = await pool.query<IssueRecord>(
      `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
       FROM issues ${whereClause} ${orderClause}`,
      params
    );

    const issues = issuesResult.rows;

    if (issues.length === 0) {
      sendSuccess(res, StatusCodes.OK, 'Issues retrieved successfully', []);
      return;
    }

    // Batch fetch reporters — one query instead of N queries
    const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
    const reportersResult = await pool.query<ReporterInfo>(
      `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
      [reporterIds]
    );

    const reporterMap = new Map(reportersResult.rows.map((r) => [r.id, r]));

    const issuesWithReporter: IssueWithReporter[] = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporterMap.get(issue.reporter_id) ?? {
        id: issue.reporter_id,
        name: 'Unknown',
        role: 'contributor',
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    }));

    sendSuccess(res, StatusCodes.OK, 'Issues retrieved successfully', issuesWithReporter);
  } catch (err) {
    next(err);
  }
};

export const getSingleIssue = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const issueResult = await pool.query<IssueRecord>(
      `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
       FROM issues WHERE id = $1`,
      [id]
    );

    if (issueResult.rows.length === 0) {
      throw new AppError('Issue not found.', StatusCodes.NOT_FOUND);
    }

    const issue = issueResult.rows[0];

    const reporterResult = await pool.query<ReporterInfo>(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id]
    );

    const reporter = reporterResult.rows[0] ?? {
      id: issue.reporter_id,
      name: 'Unknown',
      role: 'contributor',
    };

    const issueWithReporter: IssueWithReporter = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };

    sendSuccess(res, StatusCodes.OK, 'Issue retrieved successfully', issueWithReporter);
  } catch (err) {
    next(err);
  }
};
