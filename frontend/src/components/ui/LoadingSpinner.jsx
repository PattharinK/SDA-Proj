import { SPACING } from '../../styles/tokens';

/**
 * Loading Spinner Component
 * 
 * Displays a loading indicator with optional message.
 * Uses NES.css spinner icon for retro gaming aesthetic.
 * 
 * @param {string} message - Loading message to display (default: "Loading...")
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div style={{
            padding: SPACING.lg,
            textAlign: 'center'
        }}>
            <i className="nes-icon is-large spinner"></i>
            <p className="nes-text" style={{ marginTop: SPACING.sm }}>
                {message}
            </p>
        </div>
    );
}
