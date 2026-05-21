import { Router } from 'express';
import { createIssue, getAllIssues, getSingleIssue } from './issues.controller';
import authenticate from '../../middleware/authenticate';

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);

export default router;
