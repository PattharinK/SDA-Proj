import { Link } from 'react-router-dom';
import { fullWidthButton } from '../../styles/mixins';

/**
 * Button Component
 * 
 * Reusable button with consistent NES.css styling and loading state.
 * Supports both button and Link (for navigation).
 * 
 * @param {string} variant - Button variant: 'primary', 'success', 'error', 'default' (default: 'primary')
 * @param {boolean} loading - Whether button is in loading state (default: false)
 * @param {boolean} fullWidth - Whether button should be full width (default: false)
 * @param {string} to - If provided, renders as Link instead of button
 * @param {React.ReactNode} children - Button content
 * @param {Object} props - Additional props passed to button/Link element
 */
export default function Button({
    variant = 'primary',
    loading = false,
    fullWidth = false,
    to,
    children,
    ...props
}) {
    const className = `nes-btn${variant !== 'default' ? ` is-${variant}` : ''}`;
    const style = fullWidth ? fullWidthButton : undefined;

    // If 'to' prop is provided, render as Link
    if (to) {
        return (
            <Link
                to={to}
                className={className}
                style={style}
                {...props}
            >
                {children}
            </Link>
        );
    }

    // Otherwise, render as button
    return (
        <button
            className={className}
            disabled={loading || props.disabled}
            style={style}
            {...props}
        >
            {loading ? 'Loading...' : children}
        </button>
    );
}
