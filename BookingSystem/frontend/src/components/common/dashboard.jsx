import React from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from './common/dashboardcard';
import icon1 from '../assets/time-icon1.png';
import icon2 from '../assets/time-icon2.png';
import icon3 from '../assets/time-icon3.png';

const Dashboard = () => {
  const cardData = [
  {
    title: 'Book a Lab',
    description: 'Reserve labs for classes or sessions.',
    icon: icon2,
  },
  {
    title: 'Check Allocation',
    description: 'View your upcoming reservations.',
    icon: icon1,
  },
  {
    title: 'View Schedule',
    description: 'Check current room or lab availability.',
    icon: icon3,
  }
];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      {cardData.map((card, index) => (
  <Link to={`/${card.title.toLowerCase().replace(/\s+/g, '-')}`} key={index}>
    <DashboardCard
      title={card.title}
      description={card.description}
      icon={card.icon}
    />
  </Link>
))}
    </div>
  );
};

export default Dashboard;
