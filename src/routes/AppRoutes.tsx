import React from 'react';
import { Navigate,Route, Routes } from 'react-router-dom';

import GovernancePanel from '../components/governance/GovernancePanel';
import MarketplaceDashboard from '../components/marketplace/MarketplaceDashboard';
import SettingsError from '../components/settings/SettingsError';
import SettingsTabContent from '../components/settings/SettingsTabContent';
import ProfilePageSimple from '../components/web3/ProfilePageSimple';
import { featureFlags } from '../config/featureFlags';
import MainLayout from '../layouts/MainLayout';
import FeedPage from '../pages/FeedPage';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import SettingsPage from '../pages/SettingsPage';
import Web3TestPage from '../pages/Web3TestPage';

/**
 * AppRoutes defines the routing structure for the application.
 * Each settings navigation item is explicitly defined as a route.
 */
const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<MainLayout />}>
      {/* Home route */}
      <Route path="/" element={<HomePage />} />
      
      {/* Feed routes */}
      <Route path="/feed/:id" element={<FeedPage />} />
      
      {/* Web3 Intelligence Exchange Marketplace */}
      <Route path="/marketplace" element={<MarketplaceDashboard />} />
      
      {/* DAO Governance */}
      <Route path="/governance" element={<GovernancePanel />} />
      
      {/* Settings routes */}
      <Route path="/settings" element={<SettingsPage />}>
        {/* Redirect from /settings to /settings/general */}
        <Route index element={<Navigate to="/settings/general" replace />} />
        
        {/* Single dynamic route that handles all settings tabs */}
        <Route path=":tab" element={<SettingsTabContent />} />
        
        {/* Catch-all for invalid settings routes */}
        <Route path="*" element={
          <SettingsError 
            message="Invalid Settings Route"
            details="The requested settings section does not exist."
            code="No matching route found for the current URL."
          />
        } />
      </Route>
      
      {featureFlags.web3Login ? (
        <>
          <Route path="/profile" element={<ProfilePageSimple />} />
          <Route path="/web3-test" element={<Web3TestPage />} />
          <Route path="/web3login" element={<Navigate to="/profile" replace />} />
        </>
      ) : (
        <>
          <Route path="/profile" element={<Navigate to="/" replace />} />
          <Route path="/web3-test" element={<Navigate to="/" replace />} />
          <Route path="/web3login" element={<Navigate to="/" replace />} />
        </>
      )}
      
      {/* Fallback route for any unmatched routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;