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
        <div className="nes-field" style={{ marginBottom: 0, width: '100%' }}>
            <input
                type="text"
                className="nes-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={{
                    ...getSearchInputStyle(isDark),
                    fontSize: '1.1rem',
                    padding: '12px 16px',
                    height: '50px'
                }}
            />
        </div>
    );
}
