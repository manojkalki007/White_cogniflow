import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import smallestAI from '../lib/smallestai';

const router = Router();

// GET /api/kb — list all knowledge bases from Smallest.ai
// Correct endpoint: /knowledgebase (singular, no hyphen)
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const response = await smallestAI.get('/knowledgebase');
    const kbs = response.data?.data?.knowledgeBases
      ?? response.data?.data
      ?? response.data
      ?? [];
    res.json({ success: true, data: kbs });
  })
);

// GET /api/kb/:id — get a specific knowledge base
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const response = await smallestAI.get(`/knowledgebase/${req.params.id}`);
    res.json({ success: true, data: response.data?.data ?? response.data });
  })
);

// POST /api/kb — create a new knowledge base
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const response = await smallestAI.post('/knowledgebase', req.body);
    res.status(201).json({ success: true, data: response.data?.data ?? response.data });
  })
);

// DELETE /api/kb/:id — delete a knowledge base
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const response = await smallestAI.delete(`/knowledgebase/${req.params.id}`);
    res.json({ success: true, data: response.data });
  })
);

export default router;
