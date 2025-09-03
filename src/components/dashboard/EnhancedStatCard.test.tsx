import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { EnhancedStatCard } from './EnhancedStatCard';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('EnhancedStatCard', () => {
  it('handles undefined value gracefully', () => {
    const props = {
      title: 'Test Card',
      value: undefined as any, // Simulate undefined value
      icon: Users,
      color: '#3B82F6',
    };

    expect(() => {
      renderWithRouter(<EnhancedStatCard {...props} />);
    }).not.toThrow();

    // Should show 'N/A' when value is undefined
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles null value gracefully', () => {
    const props = {
      title: 'Test Card',
      value: null as any, // Simulate null value
      icon: Users,
      color: '#3B82F6',
    };

    expect(() => {
      renderWithRouter(<EnhancedStatCard {...props} />);
    }).not.toThrow();

    // Should show 'N/A' when value is null
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles valid number value correctly', () => {
    const props = {
      title: 'Test Card',
      value: 1234,
      icon: Users,
      color: '#3B82F6',
    };

    renderWithRouter(<EnhancedStatCard {...props} />);

    // Should show formatted number (with space separator, not comma)
    expect(screen.getByText('1 234')).toBeInTheDocument();
  });

  it('handles trend with undefined percentage gracefully', () => {
    const props = {
      title: 'Test Card',
      value: 100,
      icon: Users,
      color: '#3B82F6',
      trend: {
        direction: 'up' as const,
        percentage: undefined as any, // Simulate undefined percentage
      },
      variant: 'detailed' as const,
    };

    expect(() => {
      renderWithRouter(<EnhancedStatCard {...props} />);
    }).not.toThrow();

    // Should show 'N/A' when percentage is undefined
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles formatValue function with undefined value', () => {
    const mockFormatValue = vi.fn(() => 'Formatted');
    
    const props = {
      title: 'Test Card',
      value: undefined as any,
      icon: Users,
      color: '#3B82F6',
      formatValue: mockFormatValue,
    };

    renderWithRouter(<EnhancedStatCard {...props} />);

    // formatValue should not be called when value is undefined
    expect(mockFormatValue).not.toHaveBeenCalled();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});