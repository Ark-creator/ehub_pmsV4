import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';

interface ThemeToggleProps {
    currentTheme: 'light' | 'dark' | 'auto';
    onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
    isTransitioning?: boolean;
}

export function ThemeToggle({ currentTheme, onThemeChange, isTransitioning = false }: ThemeToggleProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => onThemeChange('light')}
                    className={currentTheme === 'light' ? 'bg-accent text-accent-foreground' : ''}
                >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onThemeChange('dark')}
                    className={currentTheme === 'dark' ? 'bg-accent text-accent-foreground' : ''}
                >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onThemeChange('auto')}
                    className={currentTheme === 'auto' ? 'bg-accent text-accent-foreground' : ''}
                >
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>Auto</span>
                    {isTransitioning && (
                        <span className="ml-auto text-xs text-muted-foreground">Transitioning</span>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
