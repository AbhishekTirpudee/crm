import { db } from '../db/index.js';
import { inventoryTransactions, products } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

// Get all inventory transactions with optional filters
export const getInventoryTransactions = async (req, res) => {
    try {
        const { productId, referenceType, limit = 50 } = req.query;

        let query = db.select().from(inventoryTransactions).orderBy(desc(inventoryTransactions.createdAt));

        if (productId) {
            query = query.where(eq(inventoryTransactions.productId, productId));
        }

        const transactions = await query.limit(parseInt(limit));
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching inventory transactions:', error);
        res.status(500).json({ error: 'Failed to fetch inventory transactions' });
    }
};

// Create inventory transaction (stock adjustment)
export const createTransaction = async (req, res) => {
    try {
        const { productId, quantity, referenceType, referenceId, notes } = req.body;
        const userId = req.user?.id;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }

        // Get current stock
        const product = await db.select().from(products).where(eq(products.id, productId));
        if (!product.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const currentStock = product[0].stock || 0;
        const newStock = currentStock + parseInt(quantity);

        if (newStock < 0) {
            return res.status(400).json({ error: 'Insufficient inventory' });
        }

        // Create transaction record
        const [transaction] = await db.insert(inventoryTransactions).values({
            productId,
            quantity: parseInt(quantity),
            balanceBefore: currentStock,
            balanceAfter: newStock,
            referenceType,
            referenceId,
            notes,
            createdBy: userId
        }).returning();

        // Update product stock
        await db.update(products).set({ stock: newStock }).where(eq(products.id, productId));

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating inventory transaction:', error);
        res.status(500).json({ error: 'Failed to create inventory transaction' });
    }
};

// Get current stock for a product with validation
export const getProductStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size, color, packingSize, requiredQuantity } = req.query;

        const product = await db.select().from(products).where(eq(products.id, productId));

        if (!product.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productData = product[0];
        const stock = productData.stock || 0;

        // Validate availability based on criteria
        let isAvailable = stock > 0;
        let validationMessages = [];

        if (requiredQuantity && stock < parseInt(requiredQuantity)) {
            isAvailable = false;
            validationMessages.push(`Insufficient quantity: ${stock} available, ${requiredQuantity} required`);
        }

        if (size) {
            const sizes = productData.sizes || [];
            if (!sizes.includes(size)) {
                isAvailable = false;
                validationMessages.push(`Size ${size} not available`);
            }
        }

        if (color) {
            const colors = productData.colors || [];
            if (!colors.includes(color)) {
                isAvailable = false;
                validationMessages.push(`Color ${color} not available`);
            }
        }

        if (packingSize && productData.packingSize !== packingSize) {
            isAvailable = false;
            validationMessages.push(`Packing size ${packingSize} not available`);
        }

        res.json({
            productId,
            name: productData.name,
            sku: productData.sku,
            currentStock: stock,
            isAvailable,
            validationMessages,
            sizes: productData.sizes,
            colors: productData.colors,
            packingSize: productData.packingSize
        });
    } catch (error) {
        console.error('Error fetching product stock:', error);
        res.status(500).json({ error: 'Failed to fetch product stock' });
    }
};

// Validate inventory before order/quotation creation - SRS Section 9.2
export const validateInventoryForItems = async (items) => {
    const validationResults = [];

    for (const item of items) {
        if (!item.productId) continue;

        const product = await db.select().from(products).where(eq(products.id, item.productId));

        if (!product.length) {
            validationResults.push({
                productId: item.productId,
                isValid: false,
                error: 'Product not found'
            });
            continue;
        }

        const productData = product[0];
        const stock = productData.stock || 0;
        let isValid = true;
        let errors = [];

        if (stock < item.quantity) {
            isValid = false;
            errors.push(`Insufficient stock: ${stock} available, ${item.quantity} required`);
        }

        if (item.size) {
            const sizes = productData.sizes || [];
            if (!sizes.includes(item.size)) {
                isValid = false;
                errors.push(`Size ${item.size} not available`);
            }
        }

        if (item.color) {
            const colors = productData.colors || [];
            if (!colors.includes(item.color)) {
                isValid = false;
                errors.push(`Color ${item.color} not available`);
            }
        }

        validationResults.push({
            productId: item.productId,
            name: productData.name,
            isValid,
            errors,
            availableStock: stock
        });
    }

    return validationResults;
};
