import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css'

import sunImg from "./pixel-sun.png";
import moonImg from "./pixel-moon.png";

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            className={`nes-btn ${isDark ? 'is-primary' : 'is-dark'}`}
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {/* Render the CSS-based pixel art */}
            <img src={isDark ? sunImg : moonImg} alt='ThemeIcon' className='pixel-icon' />
        </button>
    );
}
