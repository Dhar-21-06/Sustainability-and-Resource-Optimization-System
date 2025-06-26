import React from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import AdminHeader from '../../components/common/admin_c/AdminHeader';
import AdminFooter from '../../components/common/admin_c/AdminFooter';
import AdminDashboardCard from '../../components/common/admin_c/AdminDashboardCard';
import { Link } from 'react-router-dom';
import icon1 from '../../assets/pending-icon.png';
import icon2 from '../../assets/check-icon.png';
import icon3 from '../../assets/event-icon.png';


const AdminHome = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminNavbar />
      <AdminHeader />
      <main className="flex-grow p-6">
        <section className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Welcome to the Smart Infrastructure System</h1>
          <p className="text-gray-600 mt-2">Optimize your college space with smart bookings.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <Link to="/admin/pending-requests">
    <AdminDashboardCard title="Pending Requests" description="Approve or reject booking requests" icon={icon1} />
  </Link>
  <Link to="/admin/check-allocation">
    <AdminDashboardCard title="Check Allocation" description="View bookings for each lab" icon={icon2} />
  </Link>
  <Link to="/admin/upcoming-events">
    <AdminDashboardCard title="Upcoming Events" description="View your upcoming slots live here" icon={icon3} />
  </Link>
</section>
      </main>
      <AdminFooter />
    </div>
  );
};
console.log("Home page loaded");

export default AdminHome;