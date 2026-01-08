import express from 'express';
import { getAuditLogs, getAuditSummary } from '../controllers/audit.controller.js';

const router = express.Router();

// GET /api/audit/logs - Get audit logs (Super Admin only)
router.get('/logs', getAuditLogs);

// GET /api/audit/summary - Get audit summary for dashboard
router.get('/summary', getAuditSummary);

export default router;
