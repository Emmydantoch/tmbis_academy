// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
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
import AdminUsers from './components/AdminUsers';
import AdminCourses from './components/AdminCourses';
import AdminReports from './components/AdminReports';
import AdminSettings from './components/AdminSettings';
import AdmissionForm from './components/AdmissionForm';
import Registration from './components/Registration';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ChangePassword from './components/ChangePassword';
import ProtectedLecturerRoute from './components/ProtectedLecturerRoute';
import LecturerCourses from './components/LecturerCourses';
import LecturerSchedule from './components/LecturerSchedule';
import LecturerGrades from './components/LecturerGrades';
import Journals from './components/Journals';
import StudyStudio from './components/StudyStudio';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/apply" element={<AdmissionForm />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/journals" element={<Journals />} />
        


        {/* Dashboard Routes — nested under DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="live-session" element={<LiveSession />} />
          <Route path="payment" element={<Payment />} />  
          <Route path="exams/:examId" element={<ExamView />} />
          <Route path="resources" element={<Resources />} />
          <Route path="library" element={<Library />} />
          <Route path="study-studio" element={<StudyStudio />} />
          <Route path="journals" element={<Journals />} />
          <Route path="grades" element={<LecturerGrades />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="contact" element={<Contact />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="my-courses" element={<ProtectedLecturerRoute><LecturerCourses /></ProtectedLecturerRoute>} />
          <Route path="schedule" element={<ProtectedLecturerRoute><LecturerSchedule /></ProtectedLecturerRoute>} />
          <Route path="grades" element={<ProtectedLecturerRoute><LecturerGrades /></ProtectedLecturerRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
        <Route path="/admin/courses" element={<ProtectedAdminRoute><AdminCourses /></ProtectedAdminRoute>} />
        <Route path="/admin/payments" element={<ProtectedAdminRoute><AdminPayments /></ProtectedAdminRoute>} />
        <Route path="/admin/reports" element={<ProtectedAdminRoute><AdminReports /></ProtectedAdminRoute>} />
        <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
        
      </Routes>
    </Router>
  );
}

export default App;