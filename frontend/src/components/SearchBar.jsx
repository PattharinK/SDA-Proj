import { SPACING, FONT_SIZE } from '../styles/tokens';
import { inputStyle } from '../styles/mixins';

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
    return (
        <div className="nes-field" style={{ marginBottom: SPACING.md }}>
            <input
                type="text"
                className="nes-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={inputStyle}
            />
        </div>
    );
}
