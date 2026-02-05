import React from 'react';
import { SPACING } from '../styles/tokens';
import { textCenter } from '../styles/mixins';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details to console for debugging
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: SPACING.lg,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="nes-container is-rounded is-error" style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: SPACING.md }}>Something went wrong!</h2>
                        <p style={{ marginBottom: SPACING.md, fontSize: '14px' }}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            className="nes-btn is-primary"
                            onClick={this.handleReload}
                            style={{ width: '100%', ...textCenter }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
