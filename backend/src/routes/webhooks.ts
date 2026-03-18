import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createHmac, timingSafeEqual } from 'crypto';
import prisma from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

const router = Router();

// ─── Signature verification ────────────────────────────────────────────────
function verifySignature(payload: string, signature: string | undefined): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[Webhook] WEBHOOK_SECRET not set — skipping verification');
    return true; // allow in dev without secret
  }
  if (!signature) return false;

  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Smallest.ai may send "sha256=<hash>" or just "<hash>"
  const incoming = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(incoming));
  } catch {
    return false;
  }
}

// ─── POST /api/webhooks/smallest ─────────────────────────────────────────────
// Receives call lifecycle events from Smallest.ai and updates the DB.
router.post(
  '/smallest',
  asyncHandler(async (req: Request, res: Response) => {
    // Raw body is available because we used express.json() with `verify` in index.ts
    const rawBody: string = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    const signature = req.headers['x-smallest-signature'] as string | undefined;

    if (!verifySignature(rawBody, signature)) {
      throw createError('Invalid webhook signature', 401);
    }

    const payload = req.body;
    console.log('[Webhook] Received event:', JSON.stringify(payload, null, 2));

    // Smallest.ai webhook payload shape (adapt if their schema changes):
    // {
    //   event: "call.ended" | "call.started" | "call.failed" | ...
    //   data: {
    //     call_id: string
    //     status: string
    //     duration: number        // seconds
    //     recording_url: string
    //     transcript: string
    //     disconnect_reason: string
    //     metrics: { [key]: value }
    //   }
    // }

    const event: string = payload.event ?? payload.type ?? 'unknown';
    const data = payload.data ?? payload;
    const smallestAiCallId: string | undefined = data.call_id ?? data.callId;

    if (!smallestAiCallId) {
      console.warn('[Webhook] No call_id in payload — ignoring');
      return res.status(200).json({ received: true });
    }

    // Find the associated CallLog
    const callLog = await prisma.callLog.findUnique({
      where: { smallestAiCallId },
    });

    if (!callLog) {
      // Could be a call initiated outside our system — log and ignore
      console.warn(`[Webhook] No CallLog found for call_id: ${smallestAiCallId}`);
      return res.status(200).json({ received: true });
    }

    // Map event → CallStatus
    const statusMap: Record<string, string> = {
      'call.started': 'IN_CALL',
      'call.ringing': 'RINGING',
      'call.ended': 'COMPLETED',
      'call.failed': 'FAILED',
      'call.no_answer': 'NO_ANSWER',
      'call.busy': 'BUSY',
    };

    const newStatus = statusMap[event] ?? callLog.status;

    // Build update payload
    const updateData: Parameters<typeof prisma.callLog.update>[0]['data'] = {
      status: newStatus as any,
      rawWebhookPayload: payload,
    };

    if (data.duration !== undefined) updateData.duration = Number(data.duration);
    if (data.recording_url) updateData.recordingUrl = data.recording_url;
    if (data.transcript) updateData.transcript = data.transcript;
    if (data.disconnect_reason) updateData.disconnectReason = data.disconnect_reason;
    if (data.metrics) updateData.postCallMetrics = data.metrics;

    if (event === 'call.started') updateData.startedAt = new Date();
    if (event === 'call.ended' || event === 'call.failed') {
      updateData.endedAt = new Date();
    }

    await prisma.callLog.update({
      where: { id: callLog.id },
      data: updateData,
    });

    // If call ended, update campaign counters
    if (event === 'call.ended' || event === 'call.failed') {
      const isSuccess = event === 'call.ended';
      await prisma.campaign.update({
        where: { id: callLog.campaignId },
        data: isSuccess
          ? { processedCount: { increment: 1 } }
          : { failedCount: { increment: 1 } },
      });

      // Check if all calls are done and update campaign status
      const campaign = await prisma.campaign.findUnique({
        where: { id: callLog.campaignId },
        select: { totalContacts: true, processedCount: true, failedCount: true },
      });

      if (campaign) {
        const done = (campaign.processedCount ?? 0) + (campaign.failedCount ?? 0);
        if (done >= campaign.totalContacts) {
          await prisma.campaign.update({
            where: { id: callLog.campaignId },
            data: { status: 'COMPLETED' },
          });
        }
      }
    }

    res.status(200).json({ received: true });
  })
);

export default router;
