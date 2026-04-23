import React, { useState, useEffect } from 'react';
import { apiService } from '../api';
import { format } from 'date-fns';
import { Plus, Download, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [resellers, setResellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    perfume_name: '',
    quantity: 1,
    total_price: 0,
    amount_paid: 0,
    reseller_id: '',
    product_id: '',
    total_cost: 0,
    discount: 0,
    custom_unit_cost: ''
  });
  const [saleType, setSaleType] = useState('direct');

  const calculateTotal = (type, prodId, qty, disc) => {
    const prod = products.find(p => p.id === parseInt(prodId));
    if (!prod) return 0;
    const basePrice = type === 'reseller' ? (prod.wholesale_price || 0) : prod.price;
    return Math.max(0, (basePrice * qty) - (parseFloat(disc) || 0));
  };

  const fetchSales = async () => {
    try {
      const res = await apiService.getSales();
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResellers = async () => {
    try {
      const res = await apiService.getResellers();
      setResellers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiService.getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchResellers();
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Strict validation for perfume name
      if (!payload.perfume_name || !payload.perfume_name.trim()) {
        alert("Perfume Name is strictly required.");
        return;
      }
      
      if (saleType === 'direct') {
        payload.reseller_id = null;
      } else {
        payload.reseller_id = parseInt(payload.reseller_id);
        if (isNaN(payload.reseller_id)) {
           alert("Please select a reseller");
           return;
        }
      }

      // Set total_cost based on selected product, quantity, and sale type
      const selectedProduct = products.find(p => p.id === parseInt(payload.product_id));
      if (selectedProduct) {
        payload.perfume_name = selectedProduct.name;
        
        // Custom unit cost override check
        if (payload.custom_unit_cost !== undefined && payload.custom_unit_cost !== null && payload.custom_unit_cost !== '') {
             payload.total_cost = parseFloat(payload.custom_unit_cost) * payload.quantity;
        } else {
            if (saleType === 'reseller') {
                payload.total_cost = (selectedProduct.wholesale_cost_price || 0) * payload.quantity;
            } else {
                payload.total_cost = (selectedProduct.cost_price || 0) * payload.quantity;
            }
        }
      }
      
      // Cleanup custom fields before sending to API if necessary (though Pydantic ignores extra by default, better to be clean)
      delete payload.custom_unit_cost;

      if (editId) {
        await apiService.updateSale(editId, payload);
      } else {
        await apiService.createSale(payload);
      }

      setShowForm(false);
      setEditId(null);
      setFormData({ customer_name: '', perfume_name: '', quantity: 1, total_price: 0, amount_paid: 0, reseller_id: '', product_id: '', total_cost: 0, discount: 0, custom_unit_cost: '' });
      setSaleType('direct');
      fetchSales();
    } catch (err) {
      console.error(err);
      alert("Error saving sale. Ensure Backend accepts perfume_name.");
    }
  };

  const handleEdit = (sale) => {
    setSaleType(sale.reseller_id ? 'reseller' : 'direct');
    setFormData({
      customer_name: sale.customer_name || '',
      perfume_name: sale.perfume_name || '',
      quantity: sale.quantity || 1,
      total_price: sale.total_price || 0,
      amount_paid: sale.amount_paid || 0,
      reseller_id: sale.reseller_id || '',
      product_id: sale.product_id || '',
      total_cost: sale.total_cost || 0,
      discount: sale.discount || 0,
      custom_unit_cost: ''
    });
    setEditId(sale.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this sale?")) {
      try {
        await apiService.deleteSale(id);
        fetchSales();
      } catch (err) {
        console.error(err);
        alert("Error deleting sale.");
      }
    }
  };

  const exportMonthlySales = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (monthlySales.length === 0) {
      alert("No sales to export for this month.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(monthlySales.map(s => ({
      ID: s.id,
      Date: format(new Date(s.date), 'MMM dd, yyyy HH:mm'),
      Customer: s.customer_name || 'N/A',
      'Perfume Name': s.perfume_name || 'Unknown',
      Quantity: s.quantity,
      'Discount (PKR)': s.discount || 0,
      'Total (PKR)': s.total_price,
      'Paid (PKR)': s.amount_paid,
      Status: s.amount_paid >= s.total_price ? 'Paid' : 'Debt',
      'Via Reseller': s.reseller_id ? `Reseller #${s.reseller_id}` : 'Direct'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Sales");
    XLSX.writeFile(workbook, `Monthly_Sales_${format(new Date(), 'MMM_yyyy')}.xls`);
  };

  return (
    <div className="animate-fade">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Sales Record</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log and view all your perfume sales.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={exportMonthlySales}>
            <Download size={18} /> Export Monthly (.xls)
          </button>
          <button className="btn btn-primary" onClick={() => {
            setEditId(null);
            setFormData({ customer_name: '', perfume_name: '', quantity: 1, total_price: 0, amount_paid: 0, reseller_id: '', product_id: '', total_cost: 0, discount: 0, custom_unit_cost: '' });
            setSaleType('direct');
            setShowForm(!showForm);
          }}>
            <Plus size={18} /> {showForm && !editId ? 'Cancel' : 'New Sale'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>{editId ? 'Edit Sale' : 'Add New Sale'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '1.5rem', flexDirection: 'row', gap: '1.5rem' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="radio" 
                  checked={saleType === 'direct'} 
                  onChange={() => {
                    setSaleType('direct');
                    if (formData.product_id) {
                      setFormData(prev => ({ ...prev, total_price: calculateTotal('direct', prev.product_id, prev.quantity, prev.discount) }));
                    }
                  }}
                /> Direct Customer
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="radio" 
                  checked={saleType === 'reseller'} 
                  onChange={() => {
                    setSaleType('reseller');
                    if (formData.product_id) {
                      setFormData(prev => ({ ...prev, total_price: calculateTotal('reseller', prev.product_id, prev.quantity, prev.discount) }));
                    }
                  }}
                /> Via Reseller
              </label>
            </div>

            <div className="grid-2">
              {saleType === 'reseller' && (
                <div className="form-group">
                  <label className="form-label">Select Reseller</label>
                  <select 
                    className="form-select"
                    required
                    value={formData.reseller_id}
                    onChange={e => setFormData({...formData, reseller_id: e.target.value})}
                  >
                    <option value="" disabled>-- Select Reseller --</option>
                    {resellers.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{saleType === 'reseller' ? 'End Customer (Optional)' : 'Customer Name'}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required={saleType === 'direct'}
                  placeholder={saleType === 'reseller' ? 'Leave blank if unknown' : ''}
                  value={formData.customer_name}
                  onChange={e => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Perfume</label>
                <select 
                  className="form-select"
                  required
                  value={formData.product_id}
                  onChange={e => {
                    const prodId = parseInt(e.target.value);
                    const prod = products.find(p => p.id === prodId);
                    setFormData({
                      ...formData, 
                      product_id: prodId,
                      perfume_name: prod ? prod.name : '',
                      total_price: calculateTotal(saleType, prodId, formData.quantity, formData.discount)
                    });
                  }}
                >
                  <option value="" disabled>-- Select Perfume --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={e => {
                    const qty = parseInt(e.target.value);
                    setFormData({
                      ...formData, 
                      quantity: qty,
                      total_price: calculateTotal(saleType, formData.product_id, qty, formData.discount)
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Discount (PKR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  step="0.01"
                  min="0"
                  value={formData.discount}
                  onChange={e => {
                    const disc = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      discount: disc,
                      total_price: calculateTotal(saleType, formData.product_id, formData.quantity, disc)
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Override Cost Price (Optional)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  step="0.01"
                  min="0"
                  placeholder="Auto-calculated if blank"
                  value={formData.custom_unit_cost !== undefined ? formData.custom_unit_cost : ''}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      custom_unit_cost: e.target.value
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Price (PKR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  step="0.01"
                  required
                  value={formData.total_price}
                  onChange={e => setFormData({...formData, total_price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Amount Paid (PKR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  step="0.01"
                  required
                  value={formData.amount_paid}
                  onChange={e => setFormData({...formData, amount_paid: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '1rem' }}>
              {editId ? 'Update Sale' : 'Save Sale'}
            </button>
          </form>
        </div>
      )}

      <div className="glass-panel table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer / Route</th>
              <th>Perfume</th>
              <th>Qty</th>
              <th>Discount</th>
              <th>Total (PKR)</th>
              <th>Paid (PKR)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => {
              const status = sale.amount_paid >= sale.total_price ? 'Paid' : 'Debt';
              return (
                <tr key={sale.id}>
                  <td>{format(new Date(sale.date), 'MMM dd, yyyy HH:mm')}</td>
                  <td>
                    {sale.customer_name || 'Unknown'}
                    {sale.reseller_id && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>Via Reseller #{sale.reseller_id}</div>
                    )}
                  </td>
                  <td>{sale.perfume_name || 'Unknown'}</td>
                  <td>{sale.quantity}</td>
                  <td>{sale.discount > 0 ? `PKR ${sale.discount.toFixed(2)}` : '-'}</td>
                  <td>PKR {sale.total_price.toFixed(2)}</td>
                  <td>PKR {sale.amount_paid.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => handleEdit(sale)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(sale.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  </td>
                </tr>
              )
            })}
            {sales.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No sales recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
