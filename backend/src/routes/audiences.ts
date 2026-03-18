import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import prisma from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) cb(null, true);
    else cb(new Error('Only CSV files are allowed'));
  },
});

// GET /api/audiences?organizationId=...
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { organizationId, page = '1', limit = '50', search } = req.query as Record<string, string>;
    if (!organizationId) throw createError('organizationId is required', 400);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = { organizationId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.contact.count({ where }),
    ]);

    res.json({ success: true, data: contacts, total, page: parseInt(page) });
  })
);

// POST /api/audiences/import — bulk CSV import
router.post(
  '/import',
  upload.single('contacts'),
  asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.body;
    if (!organizationId) throw createError('organizationId is required', 400);
    if (!req.file) throw createError('CSV file is required', 400);

    const csvText = req.file.buffer.toString('utf-8');
    let rows: Record<string, string>[];
    try {
      rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
    } catch {
      throw createError('Invalid CSV file', 400);
    }

    const phoneKey = Object.keys(rows[0] ?? {}).find((k) =>
      ['phoneNumber', 'phone_number', 'phone', 'Phone', 'PhoneNumber'].includes(k)
    );
    if (!phoneKey) throw createError('CSV must contain a "phoneNumber" column', 400);

    let created = 0;
    for (const row of rows) {
      const phone = row[phoneKey]?.trim();
      if (!phone) continue;
      const { [phoneKey]: _p, ...rest } = row;
      const existing = await prisma.contact.findFirst({ where: { organizationId, phoneNumber: phone } });
      if (!existing) {
        await prisma.contact.create({
          data: {
            organizationId,
            phoneNumber: phone,
            name: row['Name'] ?? row['name'] ?? undefined,
            email: row['Email'] ?? row['email'] ?? undefined,
            metadata: Object.keys(rest).length ? rest : undefined,
          },
        });
        created++;
      }
    }

    res.json({ success: true, data: { total: rows.length, created } });
  })
);

// DELETE /api/audiences/:id
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
