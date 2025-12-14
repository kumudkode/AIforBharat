import React from 'react';
import { cn } from '../../lib/utils';

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({ 
  children, 
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  ...props 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  const mobileClass = gridCols[columns.mobile || 1];
  const tabletClass = columns.tablet ? `md:${gridCols[columns.tablet]}` : '';
  const desktopClass = columns.desktop ? `lg:${gridCols[columns.desktop]}` : '';

  return (
    <div
      className={cn(
        'grid',
        mobileClass,
        tabletClass,
        desktopClass,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}