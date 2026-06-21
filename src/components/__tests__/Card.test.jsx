import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from '../Card';

describe('Card component', () => {
  it('renders children correctly', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies additional className alongside glass-card', () => {
    const { container } = render(<Card className="soft-card">Content</Card>);
    const el = container.firstChild;
    expect(el).toHaveClass('glass-card');
    expect(el).toHaveClass('soft-card');
  });

  it('renders as a div by default', () => {
    const { container } = render(<Card>Default tag</Card>);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('renders as a semantic tag when tag prop is supplied', () => {
    const { container } = render(<Card tag="article">Article card</Card>);
    expect(container.firstChild.tagName).toBe('ARTICLE');
  });

  it('applies aria-label when provided', () => {
    render(<Card ariaLabel="My section">Content</Card>);
    expect(screen.getByRole('generic', { name: 'My section' })).toBeInTheDocument();
  });

  it('spreads additional props onto the root element', () => {
    const { container } = render(<Card data-testid="my-card">Content</Card>);
    expect(container.firstChild).toHaveAttribute('data-testid', 'my-card');
  });
});
