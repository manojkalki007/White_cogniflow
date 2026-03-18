import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import smallestAI from '../lib/smallestai';

const router = Router();

// GET /api/agents — list all agents from Smallest.ai
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const response = await smallestAI.get('/agent');
    // Smallest.ai returns { status, data: { agents, totalCount, ... } }
    const agents = response.data?.data?.agents ?? response.data?.data ?? [];
    res.json({ success: true, data: agents });
  })
);

// GET /api/agents/:id — get a single agent
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const response = await smallestAI.get(`/agent/${req.params.id}`);
    res.json({ success: true, data: response.data?.data ?? response.data });
  })
);

export default router;
