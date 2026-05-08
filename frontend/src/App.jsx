import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Debts from './pages/Debts';
import Resellers from './pages/Resellers';
import Products from './pages/Products';
import Login from './pages/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [resellerId, setResellerId] = useState(null);

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    const rId = sessionStorage.getItem('resellerId');
    if (role) {
      setIsLoggedIn(true);
      setUserRole(role);
      if (rId && rId !== 'null') {
        setResellerId(parseInt(rId));
      }
    }
  }, []);

  const handleLogin = (role, rId) => {
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('resellerId', rId);
    setUserRole(role);
    setResellerId(rId ? parseInt(rId) : null);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('resellerId');
    setIsLoggedIn(false);
    setUserRole(null);
    setResellerId(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar onLogout={handleLogout} userRole={userRole} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard userRole={userRole} resellerId={resellerId} />} />
            <Route path="/sales" element={<Sales userRole={userRole} resellerId={resellerId} />} />
            <Route path="/debts" element={<Debts userRole={userRole} resellerId={resellerId} />} />
            {userRole === 'admin' && <Route path="/resellers" element={<Resellers />} />}
            <Route path="/products" element={<Products userRole={userRole} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
