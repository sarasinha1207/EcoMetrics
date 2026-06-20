import React from 'react';

/**
 * Reusable layout card with semantic tag options and standard glassmorphic styling.
 * Supports ARIA landmarks when using tags like section or article.
 */
export function Card({
  children,
  className = '',
  tag: Tag = 'div',
  ariaLabel = undefined,
  ariaLabelledBy = undefined,
  ...props
}) {
  return (
    <Tag
      className={`glass-card ${className}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      {...props}
    >
      {children}
    </Tag>
  );
}
export default Card;
