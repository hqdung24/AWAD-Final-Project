import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4 | 6 | 12;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    responsive?: boolean;
}

const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
};

const gapMap = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

export function Grid({
    children,
    cols = 1,
    gap = 'md',
    responsive = true,
    className,
    ...props
}: GridProps) {
    return (
        <div
            className={cn(
                'grid',
                responsive ? colsMap[cols] : `grid-cols-${cols}`,
                gapMap[gap],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
