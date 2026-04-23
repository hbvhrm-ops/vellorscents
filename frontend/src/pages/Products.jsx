import React, { useState, useEffect } from 'react';
import { apiService } from '../api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cost_price: 0,
    wholesale_cost_price: 0,
    wholesale_price: 0,
    price: 0
  });

  const fetchProducts = async () => {
    try {
      const res = await apiService.getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        alert("Perfume Name is required.");
        return;
      }
      if (editId) {
        await apiService.updateProduct(editId, formData);
      } else {
        await apiService.createProduct(formData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ name: '', cost_price: 0, wholesale_cost_price: 0, wholesale_price: 0, price: 0 });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving perfume.");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      cost_price: product.cost_price || 0,
      wholesale_cost_price: product.wholesale_cost_price || 0,
      wholesale_price: product.wholesale_price || 0,
      price: product.price || 0
    });
    setEditId(product.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this perfume?")) {
      try {
        await apiService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert("Error deleting perfume.");
      }
    }
  };

  return (
    <div className="animate-fade">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Perfumes / Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your catalog, costs, and selling prices.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditId(null);
          setFormData({ name: '', cost_price: 0, wholesale_cost_price: 0, wholesale_price: 0, price: 0 });
          setShowForm(!showForm);
        }}>
          <Plus size={18} /> {showForm && !editId ? 'Cancel' : 'Add Perfume'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>{editId ? 'Edit Perfume' : 'Add New Perfume'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Perfume Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="e.g. Oudh Al Layl"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Regular Cost (PKR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  step="0.01"
                  required
                  value={formData.cost_price}
                  onChange={e => setFormData({...formData, cost_price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Wholesale Cost (PKR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  step="0.01"
                  required
                  value={formData.wholesale_cost_price}
                  onChange={e => setFormData({...formData, wholesale_cost_price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Wholesale Price (PKR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  step="0.01"
                  required
                  value={formData.wholesale_price}
                  onChange={e => setFormData({...formData, wholesale_price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (PKR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '1rem' }}>
              {editId ? 'Update Perfume' : 'Save Perfume'}
            </button>
          </form>
        </div>
      )}

      <div className="glass-panel table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Perfume Name</th>
              <th>Reg Cost / Price</th>
              <th>Wholesale Cost / Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td data-label="ID">{product.id}</td>
                <td data-label="Perfume Name">{product.name}</td>
                <td data-label="Reg Cost / Price">PKR {product.cost_price.toFixed(2)} / PKR {product.price.toFixed(2)}</td>
                <td data-label="Wholesale Cost / Price">PKR {(product.wholesale_cost_price || 0).toFixed(2)} / PKR {(product.wholesale_price || 0).toFixed(2)}</td>
                <td data-label="Actions">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => handleEdit(product)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(product.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }} data-label="Empty">No perfumes added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
