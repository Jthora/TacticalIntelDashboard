import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePageSimple from '../components/web3/ProfilePageSimple';
import Web3TestPage from '../pages/Web3TestPage';
import FeedPage from '../pages/FeedPage';
import MainLayout from '../layouts/MainLayout';
import NotFoundPage from '../pages/NotFoundPage';
import SettingsError from '../components/settings/SettingsError';
import SettingsTabContent from '../components/settings/SettingsTabContent';

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
      
      {/* Profile route - MVP Web3 Login */}
      <Route path="/profile" element={<ProfilePageSimple />} />
      
      {/* Web3 Integration Test Page */}
      <Route path="/web3-test" element={<Web3TestPage />} />
      
      {/* Redirect legacy routes */}
      <Route path="/web3login" element={<Navigate to="/profile" replace />} />
      
      {/* Fallback route for any unmatched routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;