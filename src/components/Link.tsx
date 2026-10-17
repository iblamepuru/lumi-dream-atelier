import React from 'react';
import { navigate } from '../router';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

/** An <a> that switches pages without a reload (new-tab clicks still work normally). */
export const Link: React.FC<LinkProps> = ({ to, onClick, children, ...rest }) => (
  <a
    href={to}
    onClick={(e) => {
      onClick?.(e);
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(to);
    }}
    {...rest}
  >
    {children}
  </a>
);
