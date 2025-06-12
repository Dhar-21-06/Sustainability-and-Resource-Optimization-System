import React from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from './AdminDashboardCard';
import icon1 from '../../../assets/time-icon1.png';  // Update icons if needed
import icon2 from '../../../assets/time-icon2.png';
import icon3 from '../../../assets/time-icon3.png';

const AdminDashboard = () => {
  const cardData = [
    {
      title: 'Pending Requests',
      description: 'Approve or reject pending booking requests.',
      icon: icon1,
      link: '/admin/pending-requests'
    },
    {
      title: 'Check Allocation',
      description: 'View and manage lab slot allocations.',
      icon: icon2,
      link: '/admin/check-allocation'
    },
    {
      title: 'Upcoming Events',
      description: 'Check upcoming events and their details.',
      icon: icon3,
      link: '/admin/upcoming-events'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminNavbar />
      <AdminHeader />
      <main className="flex-grow p-6">
        <section className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Welcome to Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage lab bookings and events efficiently.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardData.map((card, index) => (
            <Link to={card.link} key={index}>
              <DashboardCard
                title={card.title}
                description={card.description}
                icon={card.icon}
              />
            </Link>
          ))}
        </section>
      </main>
      <AdminFooter />
    </div>
  );
};

export default AdminDashboard;
