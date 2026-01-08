import { db } from '../db/index.js';
import { auditLogs } from '../db/schema.js';
import { desc, eq, and, gte, lte } from 'drizzle-orm';

// Get audit logs (Super Admin only) - SRS Section 29
export const getAuditLogs = async (req, res) => {
    try {
        // Check if user is Super Admin
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ error: 'Access denied. Super Admin only.' });
        }

        const {
            action,
            performedBy,
            affectedEntity,
            startDate,
            endDate,
            limit = 100
        } = req.query;

        let query = db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));

        // Apply filters
        const conditions = [];

        if (action) {
            conditions.push(eq(auditLogs.action, action));
        }

        if (performedBy) {
            conditions.push(eq(auditLogs.performedBy, performedBy));
        }

        if (affectedEntity) {
            conditions.push(eq(auditLogs.affectedEntity, affectedEntity));
        }

        if (startDate) {
            conditions.push(gte(auditLogs.timestamp, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(lte(auditLogs.timestamp, new Date(endDate)));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        const logs = await query.limit(parseInt(limit));
        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

// Helper function to create audit log entries
export const logAction = async ({
    action,
    performedBy,
    affectedEntity,
    affectedEntityId,
    oldValue,
    newValue,
    ipAddress
}) => {
    try {
        await db.insert(auditLogs).values({
            action,
            performedBy,
            affectedEntity,
            affectedEntityId,
            oldValue,
            newValue,
            ipAddress
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't throw - audit logging shouldn't break main operations
    }
};

// Get audit actions summary (for dashboard)
export const getAuditSummary = async (req, res) => {
    try {
        if (req.user?.role !== 'super_admin') {
            return res.status(403).json({ error: 'Access denied. Super Admin only.' });
        }

        const logs = await db.select().from(auditLogs)
            .orderBy(desc(auditLogs.timestamp))
            .limit(10);

        res.json({
            recentLogs: logs,
            totalCount: logs.length
        });
    } catch (error) {
        console.error('Error fetching audit summary:', error);
        res.status(500).json({ error: 'Failed to fetch audit summary' });
    }
};
