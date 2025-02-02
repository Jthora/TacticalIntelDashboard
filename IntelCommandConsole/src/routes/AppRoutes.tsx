import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import FeedPage from '../pages/FeedPage';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/feed/:id" element={<FeedPage />} />
  </Routes>
);

export default AppRoutes;