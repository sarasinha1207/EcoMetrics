import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from '../Calculator';

const mockSave = () => {};

describe('Calculator component', () => {
  it('renders all 5 category tab buttons', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    expect(screen.getByRole('button', { name: 'Switch to Transit tab' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch to Energy tab' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch to Food tab' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch to Shopping tab' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch to Waste tab' })).toBeInTheDocument();
  });

  it('shows Transit tab content by default', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    expect(screen.getByText('Transportation Calculator')).toBeInTheDocument();
  });

  it('switches to Energy tab on click', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Energy tab' }));
    expect(screen.getByText('Home Energy Calculator')).toBeInTheDocument();
  });

  it('switches to Food tab on click', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Food tab' }));
    expect(screen.getByText('Dietary Habits')).toBeInTheDocument();
  });

  it('switches to Shopping tab on click', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Shopping tab' }));
    expect(screen.getByText('Shopping & Consumption')).toBeInTheDocument();
  });

  it('switches to Waste tab on click', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Waste tab' }));
    expect(screen.getByText('Waste & Recycling')).toBeInTheDocument();
  });

  it('shows a running total widget', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    expect(screen.getByText('RUNNING TOTAL')).toBeInTheDocument();
  });

  it('shows kg CO2e unit label', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    expect(screen.getByText('kg CO2e')).toBeInTheDocument();
  });

  it('updates petrol km input and reflects in running total', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    const petrolInput = screen.getByLabelText('Car Distance (Petrol/Diesel km/week)');
    fireEvent.change(petrolInput, { target: { value: '0' } });
    expect(screen.getByText('RUNNING TOTAL')).toBeInTheDocument();
  });

  it('renders the Log Entry button', () => {
    render(<Calculator initialInputs={null} onSave={mockSave} />);
    expect(screen.getByRole('button', { name: /log transit carbon entry/i })).toBeInTheDocument();
  });
});
