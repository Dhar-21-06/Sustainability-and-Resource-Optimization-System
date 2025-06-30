import React from 'react';
import Navbar from '../../components/common/user_c/navbar';
import Header from '../../components/common/user_c/header';
import Footer from '../../components/common/user_c/footer';
import DashboardCard from '../../components/common/user_c/dashboardcard';
import icon1 from '../../assets/book-icon.png';
import icon2 from '../../assets/bookings-icon.png';
import icon3 from '../../assets/event-icon.png';
import { Link } from 'react-router-dom';
import citbifLogo from '../../assets/CITBIF logo.png';

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

        <div className="flex justify-center mb-4">
  <img src={citbifLogo} alt="CITBIF Logo" className="h-12" />
</div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <Link to="/book-a-lab">
    <DashboardCard title="Book a Lab" description="5 Available" icon={icon1} />
  </Link>
  <Link to="/user/bookings">
    <DashboardCard title="My Bookings" description="2 Booked" icon={icon2} />
  </Link>
  <Link to="/upcoming-events">
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