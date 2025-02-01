import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';

const Routes: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={HomePage} />
      <Route path="/settings" component={SettingsPage} />
    </Switch>
  </Router>
);

export default Routes;