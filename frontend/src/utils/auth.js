/**
 * Authentication Utilities
 * 
 * Helper functions for authentication-related operations.
 */

/**
 * สร้าง Guest User และบันทึกลง localStorage
 * 
 * ใช้แทนการเขียนโค้ดซ้ำๆ ในหลายที่
 * 
 * @returns {Object} Guest user object { username: 'Guest', id: string }
 */
export const createGuestUser = () => {
    const guestId = `guest_${Date.now()}`;
    localStorage.setItem('guestId', guestId);

    return {
        username: 'Guest',
        id: guestId
    };
};
