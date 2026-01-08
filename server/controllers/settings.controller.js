import { db } from "../db/index.js";
import { systemSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getSettings = async (req, res) => {
    try {
        const settings = await db.select().from(systemSettings);
        // Convert array to object for easier frontend consumption
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { key, value } = req.body;

        // Check if setting exists
        const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key));

        let result;
        if (existing.length > 0) {
            [result] = await db.update(systemSettings)
                .set({ value, updatedAt: new Date() })
                .where(eq(systemSettings.key, key))
                .returning();
        } else {
            [result] = await db.insert(systemSettings)
                .values({ key, value })
                .returning();
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
