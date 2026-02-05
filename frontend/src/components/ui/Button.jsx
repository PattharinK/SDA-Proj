import { fullWidthButton } from '../../styles/mixins';

/**
 * Button Component
 * 
 * Reusable button with consistent NES.css styling and loading state.
 * 
 * @param {string} variant - Button variant: 'primary', 'success', 'error', etc. (default: 'primary')
 * @param {boolean} loading - Whether button is in loading state (default: false)
 * @param {boolean} fullWidth - Whether button should be full width (default: false)
 * @param {React.ReactNode} children - Button content
 * @param {Object} props - Additional props passed to button element
 */
export default function Button({
    variant = 'primary',
    loading = false,
    fullWidth = false,
    children,
    ...props
}) {
    return (
        <button
            className={`nes-btn is-${variant}`}
            disabled={loading || props.disabled}
            style={fullWidth ? fullWidthButton : undefined}
            {...props}
        >
            {loading ? 'Loading...' : children}
        </button>
    );
}
