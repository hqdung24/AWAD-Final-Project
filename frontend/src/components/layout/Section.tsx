import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    variant?: 'default' | 'muted' | 'accent';
    spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variantClasses = {
    default: 'bg-background text-foreground',
    muted: 'bg-muted text-muted-foreground',
    accent: 'bg-accent/5 text-foreground',
};

const spacingClasses = {
    none: '',
    sm: 'py-6 md:py-8',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-32',
};

export function Section({
    children,
    variant = 'default',
    spacing = 'md',
    className,
    ...props
}: SectionProps) {
    return (
        <section
            className={cn(
                variantClasses[variant],
                spacingClasses[spacing],
                className
            )}
            {...props}
        >
            {children}
        </section>
    );
}
