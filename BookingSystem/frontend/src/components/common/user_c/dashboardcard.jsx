import './dashboardcard.css';

function DashboardCard({ title, description, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 dashboard-card hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer text-center">
      <img src={icon} alt={title} className="dashboard-icon" />
      <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-2">{title}</h2>
    </div>
  );
}

export default DashboardCard;
