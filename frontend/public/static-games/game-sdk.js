(function () {
    console.log("SDK VERSION: DEBUG-PAYLOAD");

    // ... ตัวแปรเดิม ...
    const API_BASE = window.location.origin;
    let GAME_ID = null;
    let AUTH_TOKEN = null;
    let IS_GUEST = false;
    let USER_ID = null;
    let IS_READY = false;

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to parse JWT", e);
            return null;
        }
    }

    window.addEventListener("message", (event) => {
        if (event.data?.type === "INIT_GAME") {
            // 🔒 Security: Only accept messages from parent window
            if (event.source !== window.parent) {
                console.warn('[SDK] Rejected INIT_GAME: not from parent window');
                return;
            }

            // 🔒 Protection: Prevent re-initialization with different game ID
            if (IS_READY && GAME_ID !== null && GAME_ID !== event.data.gameId) {
                console.warn(
                    `[SDK] ⚠️ Rejected re-initialization attempt!\n` +
                    `Current Game ID: ${GAME_ID}\n` +
                    `Attempted Game ID: ${event.data.gameId}\n` +
                    `This prevents cross-game contamination.`
                );
                return;
            }

            // Allow re-initialization with SAME game ID (e.g., page refresh)
            if (IS_READY && GAME_ID === event.data.gameId) {
                console.log(`[SDK] ℹ️ Re-initialization with same game ID ${GAME_ID} (allowed)`);
            }

            GAME_ID = event.data.gameId;
            AUTH_TOKEN = event.data.token;
            IS_GUEST = event.data.isGuest || false;

            if (AUTH_TOKEN) {
                const decoded = parseJwt(AUTH_TOKEN);
                if (decoded && decoded.sub) {
                    USER_ID = decoded.sub; // 'sub' ใน JWT คือ User ID
                }
            }

            if (!USER_ID) {
                USER_ID = event.data.userId || event.data.user_id || event.data.username;
            }
            IS_READY = true;

            // console.log(`SDK Init: Guest=${IS_GUEST}, CapturedID=${USER_ID}`);

            window.dispatchEvent(new CustomEvent('GameSDK_Ready', {
                detail: {
                    userId: USER_ID,
                    isGuest: IS_GUEST
                }
            }));

        }
    });

    window.GameSDK = {

        isReady() {
            return IS_READY;
        },

        submitScore(score) {
            // ... โค้ดเดิม ...
            if (IS_GUEST || !GAME_ID || !AUTH_TOKEN) return;

            fetch(`${API_BASE}/api/scores/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AUTH_TOKEN}`,
                },
                body: JSON.stringify({
                    game_id: GAME_ID,
                    score,
                }),
            }).catch(() => {
                // Silently fail score submission in production
            });
        },

        async loadBestScore() {
            // ... โค้ดเดิม ...
            if (IS_GUEST) return 0;
            // เพิ่มการรอเล็กน้อยถ้าเรียกเร็วไป (เผื่อไว้) แต่ logic หลักจะแก้ที่ฝั่งเกม
            if (!GAME_ID || !AUTH_TOKEN) return 0;

            try {
                const res = await fetch(
                    `${API_BASE}/api/scores/me/${GAME_ID}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${AUTH_TOKEN}`,
                        },
                    }
                );
                if (!res.ok) return 0;
                const data = await res.json();
                return data.best_score ?? 0;
            } catch {
                return 0;
            }
        },

        getUserId() {
            if (USER_ID) return USER_ID;
            return 'guest';
        }
    };
})();
