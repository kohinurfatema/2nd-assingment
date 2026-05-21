import { Router } from 'express';
import { getMetrics } from './metrics.controller';
import authenticate from '../../middleware/authenticate';
import authorize from '../../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize('maintainer'), getMetrics);

export default router;
