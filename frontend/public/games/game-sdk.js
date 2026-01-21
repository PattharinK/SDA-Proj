(function () {
    const API_BASE = "http://localhost:8000";

    let GAME_ID = null;
    let AUTH_TOKEN = null;

    window.addEventListener("message", (event) => {
        if (event.data?.type === "INIT_GAME") {
            GAME_ID = event.data.gameId;
            AUTH_TOKEN = event.data.token;

            console.log("Game initialized", GAME_ID);
        }
    });

    window.GameSDK = {
        submitScore(score) {
            if (!GAME_ID || !AUTH_TOKEN) return;

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
