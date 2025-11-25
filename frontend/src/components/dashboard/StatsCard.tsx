import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon,
    trend,
    className,
}: StatsCardProps) {
    return (
        <Card className={cn('hover:shadow-md transition-shadow', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="text-2xl md:text-3xl font-bold text-foreground">
                        {value}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                    {trend && (
                        <div
                            className={cn(
                                'text-xs font-medium flex items-center gap-1',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-muted-foreground">from last month</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
