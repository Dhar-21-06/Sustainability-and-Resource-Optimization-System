import './dashboardcard.css';
function DashboardCard({ title, description, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-center">
      <img src={icon} alt={title} className="dashboard-icon"/>
      <h2 className="text-xl font-semibold text-blue-800">{title}</h2>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}

export default DashboardCard;
