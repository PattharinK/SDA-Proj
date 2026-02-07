import { SPACING } from '../styles/tokens';
import { getSearchInputStyle } from '../styles/mixins';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Search Bar Component
 * 
 * Reusable search input for filtering content.
 * 
 * @param {string} value - Current search value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 */
export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
    const { isDark } = useTheme();

    return (
        <div className="nes-field" style={{ marginBottom: SPACING.md }}>
            <input
                type="text"
                className="nes-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={getSearchInputStyle(isDark)}
            />
        </div>
    );
}
