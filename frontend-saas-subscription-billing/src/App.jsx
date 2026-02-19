import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import BillingHistory from './pages/BillingHistory';
import ProtectedRoute from './components/ProtectedRoute';
import PayoutSettings from './pages/PayoutSettings';
import AdminPayoutDashboard from './pages/AdminPayoutDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout/:planId" element={<Checkout />} />
          <Route path="/billing-history" element={<BillingHistory />} />git 
          <Route path="/payouts" element={<PayoutSettings />} />
          <Route path="/admin/payouts" element={<AdminPayoutDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
