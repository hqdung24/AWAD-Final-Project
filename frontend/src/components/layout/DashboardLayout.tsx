import React from 'react';
import { Outlet } from 'react-router';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    sidebar?: React.ReactNode;
    header?: React.ReactNode;
    className?: string;
}

export function DashboardLayout({
    sidebar,
    header,
    className
}: DashboardLayoutProps) {
    return (
        <div className={cn('min-h-screen bg-background', className)}>
            {/* Header */}
            {header && (
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Container>
                        <div className="flex h-16 items-center">
                            {header}
                        </div>
                    </Container>
                </header>
            )}

            {/* Main Content */}
            <div className="flex">
                {/* Sidebar */}
                {sidebar && (
                    <aside className="hidden lg:block w-64 xl:w-72 border-r bg-muted/5 min-h-[calc(100vh-4rem)] sticky top-16">
                        {sidebar}
                    </aside>
                )}

                {/* Page Content */}
                <main className="flex-1 min-h-[calc(100vh-4rem)]">
                    <Container className="py-6 md:py-8 lg:py-10">
                        <Outlet />
                    </Container>
                </main>
            </div>
        </div>
    );
}
