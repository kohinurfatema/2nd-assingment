import { Router } from 'express';
import { createIssue, getAllIssues, getSingleIssue, updateIssue } from './issues.controller';
import authenticate from '../../middleware/authenticate';

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);
router.patch('/:id', authenticate, updateIssue);

export default router;
