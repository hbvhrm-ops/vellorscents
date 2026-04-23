import React, { useState, useEffect } from 'react';
import { apiService } from '../api';
import { UserPlus, X } from 'lucide-react';
import { format } from 'date-fns';

const Resellers = () => {
  const [resellers, setResellers] = useState([]);
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '' });
  
  const [selectedReseller, setSelectedReseller] = useState(null);

  const fetchResellers = async () => {
    try {
      const res = await apiService.getResellers();
      setResellers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await apiService.getSales();
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResellers();
    fetchSales();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createReseller(formData);
      setShowForm(false);
      setFormData({ name: '', contact: '' });
      fetchResellers();
    } catch (err) {
      console.error(err);
    }
  };

  const currentResellerSales = selectedReseller 
    ? sales.filter(s => s.reseller_id === selectedReseller.id)
    : [];

  return (
    <div className="animate-fade">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Resellers Network</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your extended sales force.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={18} /> Add Reseller
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>New Reseller</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact / Phone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '1rem' }}>Save Profile</button>
          </form>
        </div>
      )}

      {selectedReseller && (
        <div className="glass-panel animate-fade" style={{ marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3>Sales & Stock for: {selectedReseller.name}</h3>
            <button className="btn btn-outline" onClick={() => setSelectedReseller(null)} style={{ padding: '0.5rem' }}>
              <X size={16} />
            </button>
          </div>
          
          <table className="premium-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>End Customer</th>
                <th>Qty</th>
                <th>Total (PKR)</th>
                <th>Paid (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {currentResellerSales.map(sale => (
                <tr key={sale.id}>
                  <td data-label="Date">{format(new Date(sale.date), 'MMM dd, yyyy')}</td>
                  <td data-label="End Customer">{sale.customer_name || 'Stock Consignment'}</td>
                  <td data-label="Qty">{sale.quantity}</td>
                  <td data-label="Total (PKR)">PKR {sale.total_price.toFixed(2)}</td>
                  <td data-label="Paid (PKR)">PKR {sale.amount_paid.toFixed(2)}</td>
                </tr>
              ))}
              {currentResellerSales.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }} data-label="Empty">No sales or stock assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid-3">
        {resellers.map(reseller => (
          <div key={reseller.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>{reseller.name}</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contact: {reseller.contact || 'N/A'}</span>
            <div style={{ marginTop: '1rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ width: '100%' }}
                onClick={() => setSelectedReseller(reseller)}
              >
                View Assigned Stock / Sales
              </button>
            </div>
          </div>
        ))}
        {resellers.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No resellers added yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Resellers;
