/**
 * FloatingLabel Component
 * Animated floating label for VelocityInput
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { velocityLabelVariants } from '../variants';

interface FloatingLabelProps {
  label?: string;
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  currentState?: 'default' | 'error' | 'success' | 'warning';
  isFloating?: boolean;
  focused?: boolean;
  htmlFor?: string;
}

export const FloatingLabel: React.FC<FloatingLabelProps> = ({
  label,
  variant,
  size,
  currentState,
  isFloating,
  focused,
  htmlFor,
}) => {
  if (!label) return null;

  return (
    <label
      className={cn(
        velocityLabelVariants({
          variant: variant as any,
          size,
          state: currentState,
          floating: isFloating
        }),
        variant?.includes('neon') && focused && 'drop-shadow-[0_0_4px_currentColor]'
      )}
      htmlFor={htmlFor}
    >
      {label}
    </label>
  );
};