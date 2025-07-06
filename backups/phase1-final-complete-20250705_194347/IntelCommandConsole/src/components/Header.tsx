import React from 'react';
import WingCommanderLogo from '../assets/images/WingCommanderLogo-288x162.gif';

const Header: React.FC = () => {
  return (
    <header className="header">
      <img src={WingCommanderLogo} alt="Wing Commander Logo" className="logo" />
      <h1 className="title">Tactical Intel Dashboard</h1>
    </header>
  );
};

export default Header;