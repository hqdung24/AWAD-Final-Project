import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/layout/Container';
import { Stack } from '@/components/layout/Stack';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
}

export function AuthLayout({
    children,
    title,
    subtitle,
    className
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <ThemeToggle />
            </div>

            <Container size="sm" className={cn('w-full', className)}>
                <Stack spacing="lg" align="center">
                    {/* Logo/Brand */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-12 md:size-16 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                            <span className="text-2xl md:text-3xl font-bold text-primary-foreground">
                                B
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                            BlauChat
                        </h2>
                    </div>

                    {/* Auth Card */}
                    <Card className="w-full max-w-md shadow-xl border-border/50">
                        {(title || subtitle) && (
                            <CardHeader className="text-center space-y-2 pb-4">
                                {title && (
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto">
                                        {subtitle}
                                    </p>
                                )}
                            </CardHeader>
                        )}
                        <CardContent className="p-6 md:p-8">
                            {children}
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </div>
    );
}
