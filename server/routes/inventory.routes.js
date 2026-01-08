import express from 'express';
import { getInventoryTransactions, createTransaction, getProductStock } from '../controllers/inventory.controller.js';

const router = express.Router();

// GET /api/inventory/transactions - Get all inventory transactions
router.get('/transactions', getInventoryTransactions);

// POST /api/inventory/transactions - Create new inventory transaction
router.post('/transactions', createTransaction);

// GET /api/inventory/stock/:productId - Get stock for a product with validation
router.get('/stock/:productId', getProductStock);

export default router;
