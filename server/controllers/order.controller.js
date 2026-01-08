import { db } from "../db/index.js";
import { orders, leads, products, inventoryTransactions } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getOrders = async (req, res) => {
  try {
    const data = await db.select().from(orders).where(eq(orders.isActive, true));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { leadId, items, ...orderData } = req.body;

    // Validate lead exists - SRS: Orders must be created only from Leads
    if (leadId) {
      const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
      if (!lead) {
        return res.status(400).json({ message: "Lead not found. Orders must be created from Leads." });
      }
    } else {
      return res.status(400).json({ message: "Lead ID is required. Orders must be created from Leads." });
    }

    // TODO: Add inventory validation per SRS Section 9.2
    // Validate inventory availability before creating order

    const [data] = await db.insert(orders).values({
      ...orderData,
      leadId,
      inventoryReserved: false
    }).returning();

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const [data] = await db.update(orders)
      .set(req.body)
      .where(eq(orders.id, req.params.id))
      .returning();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Soft delete order - restores inventory if reserved
export const deleteOrder = async (req, res) => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // TODO: If inventory was reserved, restore it per SRS Section 10

    const [data] = await db.update(orders)
      .set({ isActive: false, status: 'cancelled' })
      .where(eq(orders.id, req.params.id))
      .returning();

    res.json({ message: "Order cancelled", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark order as dispatched - deducts inventory
export const dispatchOrder = async (req, res) => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // TODO: Deduct inventory at dispatch per SRS Section 10

    const [data] = await db.update(orders)
      .set({
        status: 'shipped',
        dispatchedAt: new Date()
      })
      .where(eq(orders.id, req.params.id))
      .returning();

    res.json({ message: "Order dispatched", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
