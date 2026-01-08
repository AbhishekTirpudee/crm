import { db } from "../db/index.js";
import { products, inventoryTransactions } from "../db/schema.js";
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
    const { stock, ...rest } = req.body;
    const initialStock = Number(stock) || 0;

    // 1. Create Product
    const [newProduct] = await db.insert(products).values({
      ...rest,
      stock: initialStock
    }).returning();

    // 2. Log Initial Inventory Transaction
    if (initialStock > 0) {
      await db.insert(inventoryTransactions).values({
        productId: newProduct.id,
        quantity: initialStock,
        balanceBefore: 0,
        balanceAfter: initialStock,
        referenceType: 'adjustment', // or 'initial'
        notes: 'Initial stock creation',
        notes: 'Initial stock creation',
        createdBy: req.user?.id || null
      });
    }

    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { stock, ...rest } = req.body;
    const updates = { ...rest };

    // Check if stock is being updated directly
    if (stock !== undefined) {
      const newStock = Number(stock);
      const [currentProduct] = await db.select().from(products).where(eq(products.id, req.params.id));

      if (currentProduct && currentProduct.stock !== newStock) {
        const diff = newStock - currentProduct.stock;

        // Log Transaction
        await db.insert(inventoryTransactions).values({
          productId: req.params.id,
          quantity: diff,
          balanceBefore: currentProduct.stock,
          balanceAfter: newStock,
          referenceType: 'adjustment',
          notes: 'Manual update from Product page',
          createdBy: req.user?.id || null
        });

        updates.stock = newStock;
      }
    }

    const [data] = await db.update(products)
      .set({ ...updates, updatedAt: new Date() })
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
