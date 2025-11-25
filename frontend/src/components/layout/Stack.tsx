import React from 'react';
import { cn } from '@/lib/utils';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    direction?: 'row' | 'column';
    spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    wrap?: boolean;
}

const spacingMap = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
};

const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
};

const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
};

export function Stack({
    children,
    direction = 'column',
    spacing = 'md',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    className,
    ...props
}: StackProps) {
    return (
        <div
            className={cn(
                'flex',
                direction === 'row' ? 'flex-row' : 'flex-col',
                spacingMap[spacing],
                alignMap[align],
                justifyMap[justify],
                wrap && 'flex-wrap',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
