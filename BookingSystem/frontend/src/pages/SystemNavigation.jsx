import React from 'react';
import { useNavigate } from 'react-router-dom';
import citBg from '../assets/cit-bg.jpeg';
import icon1 from '../assets/CITIL Logo.png';
import icon2 from '../assets/CITIL Logo.png';
import icon3 from '../assets/CITIL Logo.png';
import icon4 from '../assets/CITIL Logo.png';
import { toast } from 'react-hot-toast';

const SystemNavigation = () => {
  const navigate = useNavigate();

  const systems = [
    {
      title: 'Booking System',
      description: 'Reserve labs, auditoriums & resources.',
      icon: icon1,
      path: '/faculty/home',
    },
    {
      title: 'Electricity Monitoring',
      description: 'Track real-time power consumption.',
      icon: icon2,
      path: '/electricity-monitoring',
    },
    {
      title: 'Energy Efficiency',
      description: 'Control lighting, sensors & fans.',
      icon: icon3,
      path: '/energy-efficiency',
    },
    {
      title: 'Water Monitoring',
      description: 'Monitor water consumption live.',
      icon: icon4,
      path: '/water-monitoring',
    },
  ];

  const handleNavigate = (systemTitle, path) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;

  if (systemTitle === 'Booking System') {
    if (role === 'faculty') {
      navigate('/faculty/home');
    } else if (role === 'admin') {
      navigate('/admin/home');
    }
  } 
  else if (
    systemTitle === 'Electricity Monitoring' ||
    systemTitle === 'Energy Efficiency' ||
    systemTitle === 'Water Monitoring'
  ) {
    if (role === 'admin') {
      navigate(path);
    } else {
      toast('🚫 Access Denied: Admin Only', {
  icon: '🔒',
  style: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#0f172a',
    fontWeight: '600',
    padding: '14px 20px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  },
  duration: 3500,
});
    }
  }
};

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${citBg})` }}
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-10" />

      {/* Foreground content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-5xl font-extrabold text-indigo-800 mb-6 drop-shadow-lg text-center">
          Choose a System to Manage
        </h1>
        <p className="text-gray-700 text-lg mb-12 text-center max-w-2xl">
          Access, monitor and manage infrastructure systems across your campus in real-time.
        </p>

        <div className="flex flex-col gap-6 w-full max-w-4xl">
          {systems.map((system, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(system.title, system.path)}
              className="cursor-pointer group bg-white/40 backdrop-blur-lg border border-white/20 rounded-3xl p-5 flex items-center transition-all duration-300 shadow-lg hover:scale-[1.02] hover:bg-white/60"
              style={{ minHeight: '90px' }} // moderate height
            >
              <img
                src={system.icon}
                alt={system.title}
                className="w-20 h-20 rounded-xl shadow-lg mr-6"
              />
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-1">{system.title}</h2>
                <p className="text-gray-700 text-sm">{system.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemNavigation;
