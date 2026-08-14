// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LiveSession from './components/LiveSession';
import Payment from './components/Payment';
import PaymentSuccess from './components/PaymentSuccess';
import ExamView from './components/ExamView';
import Resources from './components/Resources';
import Library from './components/Library';
import Faculty from './components/Faculty';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';
import AdminPayments from './components/AdminPayments';
import AdminSettings from './components/AdminSettings';
import AdmissionForm from './components/AdmissionForm';
import Registration from './components/Registration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live-session" element={<LiveSession />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/exam" element={<ExamView  />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/library" element={<Library />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/apply" element={<AdmissionForm />} />
      </Routes>
    </Router>
  );
}

export default App;