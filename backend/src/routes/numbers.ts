import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import smallestAI from '../lib/smallestai';

const router = Router();

// GET /api/numbers — list phone numbers from Smallest.ai
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const response = await smallestAI.get('/phone-numbers');
    res.json({ success: true, data: response.data });
  })
);

export default router;
