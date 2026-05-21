import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ success: true, message: 'DevPulse API is running' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;
