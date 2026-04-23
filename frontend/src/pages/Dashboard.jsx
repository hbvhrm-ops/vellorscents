import React, { useEffect, useState } from 'react';
import { apiService } from '../api';
import { TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalDebt: 0,
    totalSales: 0,
    resellerCount: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, resellersRes, debtsRes] = await Promise.all([
          apiService.getSales(),
          apiService.getResellers(),
          apiService.getDebts()
        ]);
        
        const sales = salesRes.data;
        const totalRevenue = sales.reduce((acc, curr) => acc + curr.total_price, 0);
        const totalProfit = sales.reduce((acc, curr) => acc + (curr.total_price - (curr.total_cost || 0)), 0);
        
        const debts = debtsRes.data;
        const totalDebt = debts.reduce((acc, curr) => acc + (curr.total_price - curr.amount_paid), 0);
        
        setStats({
          totalRevenue,
          totalProfit,
          totalDebt,
          totalSales: sales.length,
          resellerCount: resellersRes.data.length
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if(loading) return <div>Loading dashboard...</div>;

  return (
    <div className="animate-fade">
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Overview of your perfume business performance.</p>

      <div className="grid-5" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel stat-card">
          <div className="flex-between">
            <span className="stat-label">Total Revenue</span>
            <DollarSign className="text-success" size={24} />
          </div>
          <span className="stat-value text-success">PKR {stats.totalRevenue.toFixed(2)}</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="flex-between">
            <span className="stat-label">Total Profit</span>
            <TrendingUp className="text-success" size={24} />
          </div>
          <span className="stat-value text-success">PKR {stats.totalProfit.toFixed(2)}</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="flex-between">
            <span className="stat-label">Outstanding Debt</span>
            <AlertCircle className="text-danger" size={24} />
          </div>
          <span className="stat-value text-danger">PKR {stats.totalDebt.toFixed(2)}</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="flex-between">
            <span className="stat-label">Total Sales</span>
            <TrendingUp style={{ color: 'var(--primary-color)' }} size={24} />
          </div>
          <span className="stat-value">{stats.totalSales}</span>
        </div>

        <div className="glass-panel stat-card">
          <div className="flex-between">
            <span className="stat-label">Active Resellers</span>
            <Users style={{ color: 'var(--warning)' }} size={24} />
          </div>
          <span className="stat-value">{stats.resellerCount}</span>
        </div>
      </div>
      
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1rem' }}>Welcome to Vellor Perfumes.</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Use the sidebar to navigate through your centralized management system. 
          You can track your sales, immediately identify unpaid invoices in the Debt section, 
          and manage your network of resellers seamlessly.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
