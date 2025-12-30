import { Moon, Sun, Cloud } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useThemeMode } from '@/providers/ThemeProvider';

export function ThemeSwitch() {
  const { theme, setTheme } = useThemeMode();

  const isDark = theme === 'dark';

  return (
    <div className="flex items-centers justify-between gap-4">
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4" />
        Theme
      </div>
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4" />
        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
        <Moon className="h-4 w-4" />
      </div>
    </div>
  );
}
