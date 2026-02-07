/**
 * Design Tokens
 * 
 * Centralized design system values for consistent styling across the application.
 * Use these instead of hardcoded values in inline styles.
 */

// Spacing scale (ใช้แทนตัวเลข margin/padding)
export const SPACING = {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '2.5rem'    // 40px
};

// Typography scale (ใช้แทน fontSize hardcode)
export const FONT_SIZE = {
    xs: '10px',
    sm: '12px',
    md: '16px',
    lg: '18px',
    xl: '21px'
};

// Color palette (ใช้แทน color codes)
export const COLORS = {
    // Leaderboard ranks
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',

    // Light mode colors
    light: {
        text: '#212529',
        textLight: '#666',
        textLighter: '#999',
        background: '#fff',
        inputBg: '#fff',
        inputBorder: '#ccc'
    },

    // Dark mode colors
    dark: {
        text: '#e0e0e0',
        textLight: '#999',
        textLighter: '#666',
        background: '#1a1a1a',
        inputBg: '#333',
        inputBorder: '#666'
    },

    // Legacy colors (for backward compatibility)
    text: '#212529',
    textLight: '#666',
    textLighter: '#999',
    white: '#fff',
    black: '#000',
    gray: '#666'
};

// Container widths (ใช้แทน maxWidth hardcode)
export const CONTAINER = {
    form: '400px',
    content: '900px',
    game: '1200px'
};
