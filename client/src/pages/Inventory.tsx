import React, { useState, useEffect } from 'react';
import { useCRM } from '../contexts/CRMContext';
import API from '../services/api';
import { InventoryTransaction, Product } from '../types';
import '../styles/Modal.css';

export const Inventory: React.FC = () => {
    const { products, refreshData } = useCRM();
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
    const [loading, setLoading] = useState(false);

    // Adjustment Modal State
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
    const [adjustmentNotes, setAdjustmentNotes] = useState('');
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await API.get('/inventory');
            setTransactions(res.data);
        } catch (error) {
            console.error("Failed to fetch inventory transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustStock = (product: Product) => {
        setSelectedProduct(product);
        setAdjustmentQty(0);
        setAdjustmentNotes('');
        setAdjustmentType('add');
        setShowAdjustModal(true);
    };

    const submitAdjustment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || adjustmentQty <= 0) return;

        try {
            const quantityChange = adjustmentType === 'add' ? adjustmentQty : -adjustmentQty;

            await API.post('/inventory', {
                productId: selectedProduct.id,
                quantity: quantityChange,
                referenceType: 'adjustment',
                notes: adjustmentNotes || 'Manual adjustment'
            });

            alert("Stock adjusted successfully");
            setShowAdjustModal(false);
            refreshData();
            fetchTransactions();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to adjust stock");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, ':'); // Replace / with : as requested
    };

    return (
        <div className="crud-page">
            <div className="flex-between mb-4">
                <h2>Inventory Management</h2>
                <div className="flex gap-2">
                    <button
                        className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('stock')}
                    >
                        📦 Current Stock
                    </button>
                    <button
                        className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        📜 History
                    </button>
                </div>
            </div>

            {/* Current Stock View */}
            {activeTab === 'stock' && (
                <div className="card">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product Name</th>
                                    <th>Current Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => {
                                    const isLowStock = product.stock < 10;
                                    return (
                                        <tr key={product.id}>
                                            <td style={{ fontFamily: 'monospace' }}>{product.sku}</td>
                                            <td>{product.name}</td>
                                            <td style={{ fontWeight: 'bold', color: isLowStock ? 'var(--danger)' : 'var(--success)' }}>
                                                {product.stock}
                                            </td>
                                            <td>
                                                {isLowStock ? (
                                                    <span className="badge badge-danger">Low Stock</span>
                                                ) : (
                                                    <span className="badge badge-success">In Stock</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleAdjustStock(product)}
                                                >
                                                    Adjust
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* History View */}
            {activeTab === 'history' && (
                <div className="card">
                    {loading ? (
                        <p>Loading history...</p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date (DD:MM:YYYY)</th>
                                        <th>Product</th>
                                        <th>Type</th>
                                        <th>Change</th>
                                        <th>Balance</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => {
                                        const product = products.find(p => p.id === tx.productId);
                                        return (
                                            <tr key={tx.id}>
                                                <td>{formatDate(tx.createdAt)}</td>
                                                <td>{product?.name || 'Unknown Product'}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{tx.referenceType}</td>
                                                <td style={{ color: tx.quantity > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                                                    {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                                                </td>
                                                <td>{tx.balanceAfter}</td>
                                                <td className="text-muted">{tx.notes}</td>
                                            </tr>
                                        );
                                    })}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center p-4">No transactions found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Adjustment Modal */}
            {showAdjustModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Adjust Stock: {selectedProduct.name}</h2>
                            <button className="btn-close" onClick={() => setShowAdjustModal(false)}>×</button>
                        </div>
                        <form onSubmit={submitAdjustment}>
                            <div className="form-group">
                                <label>Action</label>
                                <div className="flex gap-4">
                                    <label className="flex gap-1" style={{ alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            checked={adjustmentType === 'add'}
                                            onChange={() => setAdjustmentType('add')}
                                        /> Add Stock
                                    </label>
                                    <label className="flex gap-1" style={{ alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            checked={adjustmentType === 'remove'}
                                            onChange={() => setAdjustmentType('remove')}
                                        /> Remove Stock
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min="1"
                                    value={adjustmentQty}
                                    onChange={e => setAdjustmentQty(parseInt(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Reason for adjustment..."
                                    value={adjustmentNotes}
                                    onChange={e => setAdjustmentNotes(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Confirm Adjustment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
