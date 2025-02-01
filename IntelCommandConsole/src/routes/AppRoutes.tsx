import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/" element={<HomePage />} />
  </Routes>
);

export default AppRoutes;