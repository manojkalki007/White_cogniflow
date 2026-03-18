import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/analytics?organizationId=...
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.query as Record<string, string>;

    const where = organizationId
      ? { campaign: { organizationId } }
      : {};

    const [totalCalls, statusCounts, durationAgg, campaignStats] = await Promise.all([
      // Total calls
      prisma.callLog.count({ where }),

      // Group by status
      prisma.callLog.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),

      // Avg duration for completed calls
      prisma.callLog.aggregate({
        where: { ...where, status: 'COMPLETED', duration: { not: null } },
        _avg: { duration: true },
        _sum: { duration: true },
      }),

      // Campaign count
      prisma.campaign.count({
        where: organizationId ? { organizationId } : {},
      }),
    ]);

    const completed = statusCounts.find((s) => s.status === 'COMPLETED')?._count.status ?? 0;
    const failed = statusCounts.find((s) => s.status === 'FAILED')?._count.status ?? 0;
    const noAnswer = statusCounts.find((s) => s.status === 'NO_ANSWER')?._count.status ?? 0;
    const busy = statusCounts.find((s) => s.status === 'BUSY')?._count.status ?? 0;
    const inProgress = statusCounts.find((s) => s.status === 'IN_CALL')?._count.status ?? 0;

    const connectionRate = totalCalls > 0 ? Math.round((completed / totalCalls) * 100) : 0;
    const avgDuration = Math.round(durationAgg._avg.duration ?? 0);

    res.json({
      success: true,
      data: {
        totalCalls,
        completed,
        failed,
        noAnswer,
        busy,
        inProgress,
        connectionRate,
        avgDurationSeconds: avgDuration,
        totalCampaigns: campaignStats,
        statusBreakdown: statusCounts.map((s) => ({
          status: s.status,
          count: s._count.status,
          pct: totalCalls > 0 ? Math.round((s._count.status / totalCalls) * 100) : 0,
        })),
      },
    });
  })
);

export default router;
