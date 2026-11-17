import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../../hooks/useTheme';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Kunduzgi rejim' : 'Tungi rejim'}
      title={isDark ? 'Kunduzgi rejim' : 'Tungi rejim'}
      className="h-8 w-8 inline-flex items-center justify-center border border-[#C49A45]/35 bg-white dark:bg-[#112240] text-[#0A192F] dark:text-[#E8DCC4] hover:border-[#C49A45] hover:text-[#9E7823] dark:hover:text-[#C49A45] transition-colors duration-150 cursor-pointer shrink-0"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
