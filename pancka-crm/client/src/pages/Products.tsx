import React, { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { Product } from '../types';
import '../styles/CRUDPages.css';

export const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: 0,
    sizes: [],
    colors: [],
    description: '',
  });

  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.price) {
      alert('Please fill in required fields');
      return;
    }

    const productData: Product = {
      ...(formData as Product),
      sizes: sizesInput.split(',').map((s) => s.trim()).filter(s => s),
      colors: colorsInput.split(',').map((c) => c.trim()).filter(c => c),
    };

    if (editingId) {
      updateProduct(editingId, productData);
      setEditingId(null);
    } else {
      addProduct(productData);
    }

    setFormData({
      name: '',
      sku: '',
      price: 0,
      sizes: [],
      colors: [],
      description: '',
    });
    setSizesInput('');
    setColorsInput('');
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setSizesInput(product.sizes.join(', '));
    setColorsInput(product.colors.join(', '));
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      sku: '',
      price: 0,
      sizes: [],
      colors: [],
      description: '',
    });
    setSizesInput('');
    setColorsInput('');
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sku">SKU *</label>
                <input
                  id="sku"
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Enter SKU"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sizes">Sizes (comma-separated)</label>
                <input
                  id="sizes"
                  type="text"
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  placeholder="XS, S, M, L, XL, XXL"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="colors">Colors (comma-separated)</label>
                <input
                  id="colors"
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="Red, Blue, Black, White"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={3}
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-save">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        {products.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Sizes</th>
                <th>Colors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.sizes.join(', ')}</td>
                  <td>{product.colors.join(', ')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No products yet. Add your first product!</p>
          </div>
        )}
      </div>
    </div>
  );
};
