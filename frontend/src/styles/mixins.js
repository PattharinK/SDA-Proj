/**
 * Style Mixins
 * 
 * Reusable style objects to reduce duplication in inline styles.
 * Import and spread these objects instead of repeating the same styles.
 */

import { SPACING, FONT_SIZE, COLORS } from './tokens';

// Layout mixins
export const centerContainer = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

export const fullPageCenter = {
    padding: SPACING.lg,
    minHeight: '100vh',
    ...centerContainer
};

// Form mixins
export const formField = {
    marginBottom: SPACING.md
};

export const inputStyle = {
    fontSize: FONT_SIZE.sm
};

/**
 * Theme-aware search input style
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {Object} Style object for search input
 */
export const getSearchInputStyle = (isDark) => ({
    ...inputStyle,
    backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
    color: isDark ? COLORS.dark.text : COLORS.light.text,
    borderColor: isDark ? COLORS.dark.inputBorder : COLORS.light.inputBorder,
    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
});

export const fullWidthButton = {
    width: '100%',
    marginBottom: SPACING.md
};

// Text mixins
export const textCenter = {
    textAlign: 'center'
};

export const smallText = {
    fontSize: FONT_SIZE.sm
};
