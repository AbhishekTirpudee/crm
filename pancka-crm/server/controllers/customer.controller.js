import { db } from "../db/index.js";
import { customers } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getCustomers = async (req, res) => {
  try {
    const data = await db.select().from(customers);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const [data] = await db.insert(customers).values(req.body).returning();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const [data] = await db.update(customers)
      .set(req.body)
      .where(eq(customers.id, req.params.id))
      .returning();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    await db.delete(customers).where(eq(customers.id, req.params.id));
    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
