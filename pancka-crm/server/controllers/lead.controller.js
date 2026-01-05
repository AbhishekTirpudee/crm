import { db } from "../db/index.js";
import { leads } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getLeads = async (req, res) => {
  try {
    const data = await db.select().from(leads);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const [data] = await db.insert(leads).values(req.body).returning();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const [data] = await db.update(leads)
      .set(req.body)
      .where(eq(leads.id, req.params.id))
      .returning();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    await db.delete(leads).where(eq(leads.id, req.params.id));
    res.json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
