import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from '../components/Header';

/**
 * MainLayout provides the persistent structure for all pages in the application.
 * It includes the header and main content area.
 * All routes are rendered within this layout using the Outlet component.
 */
const MainLayout: React.FC = () => {
  return (
    <div className="tactical-dashboard">
      <div className="tactical-header-main">
        <Header />
      </div>
      <div className="tactical-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
