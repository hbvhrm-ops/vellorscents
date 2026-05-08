import React, { useState, useEffect } from 'react';
import { apiService } from '../api';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

const Debts = ({ userRole, resellerId }) => {
  const [debts, setDebts] = useState([]);

  const fetchDebts = async () => {
    try {
      const res = await apiService.getDebts(userRole === 'reseller' ? resellerId : null);
      setDebts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handlePay = async (saleId, amountOwed) => {
    const amountStr = window.prompt(`Enter payment amount (Max: PKR ${amountOwed.toFixed(2)}):`, amountOwed.toFixed(2));
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await apiService.payDebt(saleId, amount);
      fetchDebts();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed");
    }
  };

  const totalOwed = debts.reduce((acc, curr) => acc + (curr.total_price - curr.amount_paid), 0);

  return (
    <div className="animate-fade">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Debt</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track unpaid invoices and register payments.</p>
        </div>
        <div className="glass-panel" style={{ padding: '0.75rem 1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>Total Outstanding:</span>
          <span className="text-danger" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            PKR {totalOwed.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Total (PKR)</th>
              <th>Paid (PKR)</th>
              <th>Remaining (PKR)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {debts.map(sale => {
              const owed = sale.total_price - sale.amount_paid;
              return (
                <tr key={sale.id}>
                  <td data-label="Date">{format(new Date(sale.date), 'MMM dd, yyyy')}</td>
                  <td data-label="Customer">{sale.customer_name}</td>
                  <td data-label="Total (PKR)">PKR {sale.total_price.toFixed(2)}</td>
                  <td className="text-success" data-label="Paid (PKR)">PKR {sale.amount_paid.toFixed(2)}</td>
                  <td className="text-danger" style={{ fontWeight: 'bold' }} data-label="Remaining (PKR)">PKR {owed.toFixed(2)}</td>
                  <td data-label="Action">
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={() => handlePay(sale.id, owed)}
                    >
                      <CheckCircle size={14} style={{ marginRight: '4px' }} /> Record Payment
                    </button>
                  </td>
                </tr>
              )
            })}
            {debts.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }} data-label="Empty">Hooray! No outstanding debts.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Debts;
