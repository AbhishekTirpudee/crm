import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getProducts = async (req, res) => {
  try {
    const data = await db.select().from(products);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const [data] = await db.insert(products).values(req.body).returning();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const [data] = await db.update(products)
      .set(req.body)
      .where(eq(products.id, req.params.id))
      .returning();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await db.delete(products).where(eq(products.id, req.params.id));
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
