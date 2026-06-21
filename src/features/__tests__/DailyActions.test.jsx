import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyActions from '../DailyActions';

const MOCK_ACTIONS = [
  { id: 'bus',       text: 'Take the bus',        co2Saved: 1.2, xpGained: 30, completed: false },
  { id: 'walk',      text: 'Walk 2 km',           co2Saved: 0.4, xpGained: 20, completed: false },
  { id: 'leftovers', text: 'Finish leftovers',    co2Saved: 0.8, xpGained: 20, completed: false },
  { id: 'compost',   text: 'Compost food waste',  co2Saved: 0.3, xpGained: 15, completed: false },
  { id: 'wash',      text: 'Cold water wash',     co2Saved: 0.3, xpGained: 15, completed: false },
];

describe('DailyActions component', () => {
  it('renders all 5 daily action items', () => {
    render(
      <DailyActions
        dailyActions={MOCK_ACTIONS}
        onToggleAction={vi.fn()}
        level={1}
        points={50}
        streakDays={0}
        isAuthenticated={false}
        onAuthenticate={vi.fn()}
        unlockedBadges={new Set()}
      />
    );
    expect(screen.getByText('Take the bus')).toBeInTheDocument();
    expect(screen.getByText('Walk 2 km')).toBeInTheDocument();
    expect(screen.getByText('Cold water wash')).toBeInTheDocument();
  });

  it('calls onToggleAction with correct id when Complete button is clicked', () => {
    const mockToggle = vi.fn();
    render(
      <DailyActions
        dailyActions={MOCK_ACTIONS}
        onToggleAction={mockToggle}
        level={1}
        points={50}
        streakDays={0}
        isAuthenticated={false}
        onAuthenticate={vi.fn()}
        unlockedBadges={new Set()}
      />
    );
    const buttons = screen.getAllByRole('button', { name: /Complete action/i });
    fireEvent.click(buttons[0]);
    expect(mockToggle).toHaveBeenCalledWith('bus');
  });

  it('shows Completed text on a completed action', () => {
    const completedActions = MOCK_ACTIONS.map((a, i) =>
      i === 0 ? { ...a, completed: true } : a
    );
    render(
      <DailyActions
        dailyActions={completedActions}
        onToggleAction={vi.fn()}
        level={1}
        points={50}
        streakDays={0}
        isAuthenticated={false}
        onAuthenticate={vi.fn()}
        unlockedBadges={new Set()}
      />
    );
    // Completed button has aria-label: "Mark Take the bus as incomplete"
    expect(screen.getByRole('button', { name: /Mark Take the bus as incomplete/i })).toBeInTheDocument();
  });

  it('displays correct streak count', () => {
    render(
      <DailyActions
        dailyActions={MOCK_ACTIONS}
        onToggleAction={vi.fn()}
        level={3}
        points={250}
        streakDays={12}
        isAuthenticated={false}
        onAuthenticate={vi.fn()}
        unlockedBadges={new Set()}
      />
    );
    expect(screen.getByText('12 Days')).toBeInTheDocument();
  });

  it('shows correct XP and level in Eco Rank card', () => {
    render(
      <DailyActions
        dailyActions={MOCK_ACTIONS}
        onToggleAction={vi.fn()}
        level={2}
        points={150}
        streakDays={0}
        isAuthenticated={false}
        onAuthenticate={vi.fn()}
        unlockedBadges={new Set()}
      />
    );
    expect(screen.getByText('LEVEL 2')).toBeInTheDocument();
    expect(screen.getByText('150 XP total')).toBeInTheDocument();
  });
});
