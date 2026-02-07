(function () {
    console.log("SDK VERSION: PROD-2026-02-07");

    const API_BASE = window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : window.location.origin;
    let GAME_ID = null;
    let AUTH_TOKEN = null;
    let IS_GUEST = false;

    window.addEventListener("message", (event) => {
        if (event.data?.type === "INIT_GAME") {
            GAME_ID = event.data.gameId;
            AUTH_TOKEN = event.data.token;
            IS_GUEST = event.data.isGuest || false;

            console.log("Game initialized", GAME_ID, IS_GUEST ? "(Guest)" : "(User)");
        }
    });

    window.GameSDK = {
        submitScore(score) {
            // Guest users don't submit scores
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
            }).catch(console.error);
        },

        async loadBestScore() {
            // Guest users return 0
            if (IS_GUEST) return 0;

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
    };
})();
