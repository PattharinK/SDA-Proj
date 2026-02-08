const RECENT_GAMES_KEY = 'recentlyPlayedGames';
const MAX_RECENT_GAMES = 5;

/**
 * Get recently played games from localStorage
 * @returns {Array} Array of game objects sorted by most recent first
 */
export const getRecentGames = () => {
    try {
        const stored = localStorage.getItem(RECENT_GAMES_KEY);
        if (!stored) return [];

        const games = JSON.parse(stored);
        return Array.isArray(games) ? games : [];
    } catch (error) {
        console.error('Error reading recent games from localStorage:', error);
        return [];
    }
};

/**
 * Add a game to the recently played list
 * @param {Object} game - Game object {id, title, slug, thumbnail}
 */
export const addRecentGame = (game) => {
    try {
        if (!game || !game.id || !game.title || !game.slug) {
            console.warn('Invalid game object provided to addRecentGame');
            return;
        }

        const recentGames = getRecentGames();

        // Remove duplicate if exists
        const filtered = recentGames.filter(g => g.id !== game.id);

        // Add to beginning with timestamp
        const updatedGames = [
            {
                id: game.id,
                title: game.title,
                slug: game.slug,
                thumbnail: game.thumbnail || null,
                playedAt: new Date().toISOString()
            },
            ...filtered
        ].slice(0, MAX_RECENT_GAMES); // Keep only max items

        localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(updatedGames));
    } catch (error) {
        console.error('Error saving recent game to localStorage:', error);
    }
};

/**
 * Clear all recently played games
 */
export const clearRecentGames = () => {
    try {
        localStorage.removeItem(RECENT_GAMES_KEY);
    } catch (error) {
        console.error('Error clearing recent games from localStorage:', error);
    }
};
