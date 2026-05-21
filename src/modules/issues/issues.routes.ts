import { Router } from 'express';
import { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue } from './issues.controller';
import authenticate from '../../middleware/authenticate';
import authorize from '../../middleware/authorize';

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);
router.patch('/:id', authenticate, updateIssue);
router.delete('/:id', authenticate, authorize('maintainer'), deleteIssue);

export default router;
