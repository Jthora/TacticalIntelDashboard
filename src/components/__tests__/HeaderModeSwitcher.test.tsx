import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';

import Header from '../Header';
import { MissionMode } from '../../constants/MissionMode';

const mockSetMode = jest.fn();

jest.mock('../../assets/images/WingCommanderLogo-288x162.gif', () => 'mock-logo.gif');
jest.mock('../navigation/NavigationButtons', () => () => <div data-testid="nav-buttons" />);
jest.mock('../web3/Web3Button', () => () => <button data-testid="web3-button">Web3</button>);
jest.mock('../../contexts/SearchContext', () => ({
  useSearch: () => ({ performSearch: jest.fn(), isSearching: false })
}));
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));
jest.mock('../../contexts/MissionModeContext', () => {
  const actualConstants = jest.requireActual('../../constants/MissionMode');
  return {
    useMissionMode: () => ({
      mode: actualConstants.MissionMode.MILTECH,
      profile: actualConstants.missionModeProfiles[actualConstants.MissionMode.MILTECH],
      setMode: mockSetMode,
      availableModes: Object.values(actualConstants.missionModeProfiles)
    })
  };
});

describe('Header mission mode switcher', () => {
  beforeEach(() => {
    mockSetMode.mockClear();
  });

  it('opens mission mode popover with both mode options', () => {
    render(<Header />);

    const toggleButton = screen.getByRole('button', { name: /switch mission mode/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('button', { name: /miltech command/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /spaceforce command/i })).toBeInTheDocument();
  });

  it('invokes setMode when a different mission mode is selected', () => {
    render(<Header />);

    const toggleButton = screen.getByRole('button', { name: /switch mission mode/i });
    fireEvent.click(toggleButton);

    const spaceForceButton = screen.getByRole('button', { name: /spaceforce command/i });
    fireEvent.click(spaceForceButton);

    expect(mockSetMode).toHaveBeenCalledWith(MissionMode.SPACEFORCE, { reason: 'header-mode-switch' });
  });
});
