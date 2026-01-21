(function () {
    const API_BASE = "http://localhost:8000";

    function getToken() {
        return localStorage.getItem("token");
    }

    window.GameSDK = {
        submitScore(gameId, score) {
            const token = getToken();
            if (!token) return;

            fetch(`${API_BASE}/api/scores/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    game_id: gameId,
                    score: score,
                }),
            }).catch(console.error);
        },

        // load best score
        async loadBestScore(gameId) {
            const token = getToken();
            if (!token) {
                console.warn("GameSDK: no token, return 0");
                return 0;
            }

            try {
                const res = await fetch(
                    `${API_BASE}/api/scores/me/${gameId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );
                if (!res.ok) return 0;
                const data = await res.json();
                return data.best_score ?? 0;
            } catch (err) {
                console.error("loadBestScore failed", err);
                return 0;
            }
        },
    };
})();
