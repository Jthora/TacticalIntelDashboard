import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';
import FeedPage from '../pages/FeedPage';
import MainLayout from '../layouts/MainLayout';
import { GeneralSettings } from '../components/settings/tabs/GeneralSettings';
import { CORSSettings } from '../components/settings/tabs/CORSSettings';
import { ProtocolSettings } from '../components/settings/tabs/ProtocolSettings';
import { VerificationSettings } from '../components/settings/tabs/VerificationSettings';
import { DisplaySettings } from '../components/settings/tabs/DisplaySettings';
import { AdvancedSettings } from '../components/settings/tabs/AdvancedSettings';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * AppRoutes defines the routing structure for the application.
 * It uses a nested structure with the MainLayout as the parent.
 * Settings tabs are implemented as nested routes under /settings.
 */
const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      
      {/* Feed routes */}
      <Route path="/feed/:id" element={<FeedPage />} />
      
      {/* Settings routes with nested tab routes */}
      <Route path="/settings" element={<SettingsPage />}>
        <Route index element={<Navigate to="/settings/general" replace />} />
        <Route path="general" element={<GeneralSettings />} />
        <Route path="cors" element={<CORSSettings />} />
        <Route path="protocols" element={<ProtocolSettings />} />
        <Route path="verification" element={<VerificationSettings />} />
        <Route path="display" element={<DisplaySettings />} />
        <Route path="advanced" element={<AdvancedSettings />} />
      </Route>
      
      {/* Profile route */}
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* Authentication routes - redirect to profile page */}
      <Route path="/web3login" element={<Navigate to="/profile" replace />} />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;