import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeMode } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, toggleTheme } = useThemeMode();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                'relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isDark ? 'bg-gray-700' : 'bg-gray-200',
                className
            )}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            role="switch"
            aria-checked={isDark}
        >
            {/* Toggle circle/thumb */}
            <span
                className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 shadow-md',
                    isDark
                        ? 'translate-x-8.5 bg-gray-900'
                        : 'translate-x-0.5 bg-white'
                )}
            >
                {/* Sun icon for light mode */}
                <Sun
                    className={cn(
                        'absolute size-4 transition-all duration-300',
                        isDark
                            ? 'rotate-90 scale-0 opacity-0'
                            : 'rotate-0 scale-100 opacity-100 text-yellow-500'
                    )}
                />

                {/* Moon icon for dark mode */}
                <Moon
                    className={cn(
                        'absolute size-4 transition-all duration-300',
                        isDark
                            ? 'rotate-0 scale-100 opacity-100 text-blue-400'
                            : '-rotate-90 scale-0 opacity-0'
                    )}
                />
            </span>
        </button>
    );
}
