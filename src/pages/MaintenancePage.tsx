import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import MaintenanceDashboard from '../components/Maintenance/MaintenanceDashboard/MaintenanceDashboard';
import Sidebar from '../components/Sidebar/Sidebar';

const MaintenancePage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
          <MaintenanceDashboard />
      </div>
    </div>
  )
};

export default MaintenancePage;
