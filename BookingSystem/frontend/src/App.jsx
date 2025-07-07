import { Routes, Route } from 'react-router-dom';
import Home from './pages/user/home';
import BookAudi from './pages/user/bookAudi';
import Book from './pages/user/book'; // Create simple components for each
import Bookings from './pages/user/bookings';
import Status from './pages/user/status';
import AdminHome from './pages/admin/home';
import PendingRequests from './pages/admin/pendingRequest';
import CheckAllocation from './pages/admin/checkAllocation';
import UpcomingEvents from './pages/admin/upcomingEvents';
import RoleSelection from './components/auth/RoleSelection';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import ForgotPassword from './components/auth/ForgotPassword';
import GoogleAuthPage from './components/auth/GoogleAuthPage';
import FacultyProfile from './pages/user/profile';
import AdminProfile from './pages/admin/profile';
import Notifications from './pages/user/notification';
import AdminNotification from './pages/admin/AdminNotification';
import SystemNavigation from './pages/SystemNavigation';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} /> 
      <Routes>
  <Route path="/" element={<RoleSelection />} />
  <Route path="/auth/login/:role" element={<GoogleAuthPage />} />
  <Route path="/login/:role" element={<LoginForm />} />
  <Route path="/signup/:role" element={<SignupForm />} />
  <Route path="/forgot-password/:role" element={<ForgotPassword />} />
  <Route path="*" element={<div><b>Page Not Found</b></div>} />
  <Route path="faculty/home" element={<Home />} />
  <Route path="/book-a-lab" element={<Book />} />
  <Route path="/user/bookings" element={<Bookings />} />
  <Route path="/upcoming-events" element={<Status />} />
  <Route path="/admin/home" element={<AdminHome />} />
  <Route path="/admin/pending-requests" element={<PendingRequests />} />
  <Route path="/admin/check-allocation" element={<CheckAllocation />} />
  <Route path="/admin/upcoming-events" element={<UpcomingEvents />} />
  <Route path="/faculty/profile" element={<FacultyProfile />} />
  <Route path="/admin/profile" element={<AdminProfile />} />
  <Route path="/faculty/notifications" element={<Notifications />} />
  <Route path="/admin/notifications" element={<AdminNotification />} />
  

</Routes>
    </>
  );
}

export default App;