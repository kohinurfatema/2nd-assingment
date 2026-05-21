import { Router } from 'express';
import { createIssue, getAllIssues } from './issues.controller';
import authenticate from '../../middleware/authenticate';

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/', getAllIssues);

export default router;
