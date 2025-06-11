import React from 'react';
import Navbar from '../../components/common/navbar.jsx';
import Header from '../../components/common/header.jsx';
import Footer from '../../components/common/footer.jsx';
import DashboardCard from '../../components/common/dashboardcard.jsx';

import icon1 from '../../assets/time-icon1.png';
import icon2 from '../../assets/time-icon2.png';
import icon3 from '../../assets/time-icon3.png';

import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <Header />
      <main className="flex-grow p-6">
        <section className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Welcome to the Smart Infrastructure System</h1>
          <p className="text-gray-600 mt-2">Optimize your college space with smart bookings.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <Link to="/book-a-lab">
    <DashboardCard title="Book a Lab" description="5 Available" icon={icon1} />
  </Link>
  <Link to="/check-allocation">
    <DashboardCard title="My Bookings" description="2 Booked" icon={icon2} />
  </Link>
  <Link to="/view-schedule">
    <DashboardCard title="View Upcoming Events" description="Today: 3 Events" icon={icon3} />
  </Link>
</section>
      </main>
      <Footer />
    </div>
    
  );
};
console.log("Home page loaded");

export default Home;