import { SPACING } from '../../styles/tokens';

/**
 * Error Message Component
 * 
 * Displays error messages with optional retry button.
 * Uses NES.css error container styling.
 * 
 * @param {string} message - Error message to display
 * @param {Function} onRetry - Optional retry callback function
 */
export default function ErrorMessage({ message, onRetry }) {
    return (
        <div
            className="nes-container is-rounded is-error"
            style={{ marginBottom: SPACING.md }}
        >
            <p>{message}</p>
            {onRetry && (
                <button
                    className="nes-btn is-primary"
                    onClick={onRetry}
                    style={{ marginTop: SPACING.sm }}
                >
                    Retry
                </button>
            )}
        </div>
    );
}
