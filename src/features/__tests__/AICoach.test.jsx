import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AICoach from '../AICoach';

describe('AICoach component', () => {
  it('shows empty state prompt when no currentCalc is provided', () => {
    render(<AICoach currentCalc={null} history={[]} />);
    expect(screen.getByText('Generate AI Insights Report')).toBeInTheDocument();
  });

  it('disables the generate button when no currentCalc is provided', () => {
    render(<AICoach currentCalc={null} history={[]} />);
    expect(screen.getByText('Generate AI Insights Report')).toBeDisabled();
  });

  it('enables the generate button when currentCalc is provided', () => {
    const mockCalc = { total: 4.7, breakdown: { transport: 1.2, housing: 1.5, food: 1.7, waste: 0.3 } };
    render(<AICoach currentCalc={mockCalc} history={[]} />);
    expect(screen.getByText('Generate AI Insights Report')).not.toBeDisabled();
  });

  it('renders the heading', () => {
    render(<AICoach currentCalc={null} history={[]} />);
    expect(screen.getByText('Personalized Carbon Coach')).toBeInTheDocument();
  });

  it('shows a validation message when no calc is present', () => {
    render(<AICoach currentCalc={null} history={[]} />);
    expect(
      screen.getByText('Please complete at least one carbon calculation to request advice.')
    ).toBeInTheDocument();
  });

  it('shows cached advice from sessionStorage on mount', () => {
    sessionStorage.setItem('eco_coach_advice', 'Cached advice text here.');
    render(<AICoach currentCalc={null} history={[]} />);
    expect(screen.getByText('AI Sustainability Assessment')).toBeInTheDocument();
    sessionStorage.removeItem('eco_coach_advice');
  });
});
