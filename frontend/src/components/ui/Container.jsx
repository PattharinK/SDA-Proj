import { fullPageCenter } from '../../styles/mixins';
import { CONTAINER } from '../../styles/tokens';

/**
 * Container Component
 * 
 * Centered container for forms and content with NES.css styling.
 * 
 * @param {string} maxWidth - Maximum width of container (default: CONTAINER.form)
 * @param {boolean} centered - Whether to center vertically on page (default: false)
 * @param {React.ReactNode} children - Container content
 */
export default function Container({
    maxWidth = CONTAINER.form,
    centered = false,
    children
}) {
    return (
        <div style={centered ? fullPageCenter : undefined}>
            <div
                className="nes-container is-rounded"
                style={{ maxWidth, width: '100%' }}
            >
                {children}
            </div>
        </div>
    );
}
