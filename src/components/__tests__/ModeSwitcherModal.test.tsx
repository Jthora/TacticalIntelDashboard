import { fireEvent, render, screen } from '@testing-library/react';

import ModeSwitcherModal from '../ModeSwitcherModal';
import { MissionMode, missionModeProfiles } from '../../constants/MissionMode';
import { useMissionMode } from '../../contexts/MissionModeContext';

jest.mock('../../contexts/MissionModeContext');
const mockUseMissionMode = useMissionMode as jest.MockedFunction<typeof useMissionMode>;

describe('ModeSwitcherModal', () => {
  const setup = (overrideMode: MissionMode = MissionMode.MILTECH) => {
    const setMode = jest.fn();
    const onClose = jest.fn();
    mockUseMissionMode.mockReturnValue({
      mode: overrideMode,
      setMode,
      profile: missionModeProfiles[overrideMode],
      availableModes: Object.values(missionModeProfiles)
    });

    render(<ModeSwitcherModal open onClose={onClose} />);
    return { setMode, onClose };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders both mission profiles and disables activate when current mode is selected', () => {
    setup(MissionMode.MILTECH);

  expect(screen.getByRole('button', { name: /MilTech Command/i, pressed: true })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /SpaceForce Command/i, pressed: false })).toBeInTheDocument();
    const activateButton = screen.getByRole('button', { name: /Activate ⚔️ MilTech Command/i });
    expect(activateButton).toBeDisabled();
  });

  test('activates a newly selected mode and persists preference by default', () => {
    const { setMode, onClose } = setup(MissionMode.MILTECH);

  fireEvent.click(screen.getByRole('button', { name: /SpaceForce Command/i }));
    const activateButton = screen.getByRole('button', { name: /Activate 🚀 SpaceForce Command/i });
    fireEvent.click(activateButton);

    expect(setMode).toHaveBeenCalledWith(MissionMode.SPACEFORCE, {
      persist: true,
      reason: 'mode-switcher-modal'
    });
    expect(onClose).toHaveBeenCalled();
  });

  test('honors persist toggle state before activating', () => {
    const { setMode } = setup(MissionMode.SPACEFORCE);

  fireEvent.click(screen.getByRole('button', { name: /MilTech Command/i }));
    const persistToggle = screen.getByLabelText('Set as my default mission mode');
    fireEvent.click(persistToggle); // uncheck => persist false
    const activateButton = screen.getByRole('button', { name: /Activate ⚔️ MilTech Command/i });
    fireEvent.click(activateButton);

    expect(setMode).toHaveBeenCalledWith(MissionMode.MILTECH, {
      persist: false,
      reason: 'mode-switcher-modal'
    });
  });
});
