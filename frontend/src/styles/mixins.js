/**
 * Style Mixins
 * 
 * Reusable style objects to reduce duplication in inline styles.
 * Import and spread these objects instead of repeating the same styles.
 */

import { SPACING, FONT_SIZE } from './tokens';

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
