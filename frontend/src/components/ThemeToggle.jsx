import { useTheme } from '../contexts/ThemeContext';

/**
 * Theme Toggle Button
 * 
 * Toggles between dark and light themes.
 * Shows sun icon for dark mode, moon icon for light mode.
 */
export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            className="nes-btn is-primary"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
                padding: '1rem 1rem',
                fontSize: '1.5rem',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
}
