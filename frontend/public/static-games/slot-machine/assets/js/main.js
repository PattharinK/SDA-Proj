// Slot Machine Game Logic
class SlotMachine {
    constructor() {
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3'),
            document.getElementById('reel4'),
            document.getElementById('reel5')
        ];

        this.symbols = ['🍎', '🍌', '🍒', '🍊', '💎', '⭐'];
        this.balance = localStorage.getItem('slotBalance') ? parseInt(localStorage.getItem('slotBalance')) : 1000;
        this.currentBet = 50;
        this.isSpinning = false;
        this.scoreSubmitted = false;
        this.bestScore = 0;
        this.spinButton = document.getElementById('spin-btn');
        this.resultDisplay = document.getElementById('result');
        this.balanceDisplay = document.getElementById('balance');
        this.currentBetDisplay = document.getElementById('current-bet');

        this.initializeGame();
    }

    initializeGame() {
        this.loadBestScore();
        this.updateBalance();
        this.setupEventListeners();
    }

    async loadBestScore() {
        // Wait for GameSDK to be available
        const waitForSDK = () => {
            if (!window.GameSDK?.loadBestScore) {
                setTimeout(waitForSDK, 50);
                return;
            }

            window.GameSDK.loadBestScore().then(score => {
                this.bestScore = score;
                // Show best score if greater than current balance
                if (this.bestScore > this.balance) {
                    const bestScoreEl = document.createElement('div');
                    bestScoreEl.className = 'best-score-display';
                    bestScoreEl.innerHTML = `<div style="text-align: center; margin-top: 10px; color: #ffd700; font-size: 14px;">🏆 Best Score: ${this.bestScore}</div>`;
                    document.querySelector('.header').appendChild(bestScoreEl);
                }
            });
        };
        waitForSDK();
    }

    setupEventListeners() {
        this.spinButton.addEventListener('click', () => this.spin());

        // Bet buttons
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentBet = parseInt(e.target.dataset.bet);
                this.currentBetDisplay.textContent = this.currentBet;
            });
        });
    }

    spin() {
        if (this.isSpinning) return;
        if (this.balance < this.currentBet) {
            this.resultDisplay.textContent = 'INSUFFICIENT FUNDS!';
            this.resultDisplay.className = 'result lose';
            return;
        }

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.balance -= this.currentBet;
        this.updateBalance();
        this.resultDisplay.textContent = 'SPINNING...';
        this.resultDisplay.className = 'result';

        const spinPromises = this.reels.map((reel, index) => {
            return this.spinReel(reel, 1000 + index * 200);
        });

        Promise.all(spinPromises).then(() => {
            this.checkWin();
            this.isSpinning = false;
            this.spinButton.disabled = false;
        });
    }

    spinReel(reel, duration) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const initialPosition = 0;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;

                if (progress < 1) {
                    const distance = progress * progress * 1000; // ease-out
                    reel.style.transform = `translateY(-${distance}px)`;
                    requestAnimationFrame(animate);
                } else {
                    const randomIndex = Math.floor(Math.random() * this.symbols.length);
                    const finalPosition = randomIndex * 200;
                    reel.style.transform = `translateY(-${finalPosition}px)`;
                    resolve(randomIndex);
                }
            };

            animate();
        });
    }

    getReelResult(reel) {
        // Get the symbol that's currently in the center of the reel
        const transform = reel.style.transform;
        const match = transform.match(/translateY\(-(\d+)px\)/);
        const offset = match ? parseInt(match[1]) : 0;
        const symbolIndex = Math.round(offset / 200) % this.symbols.length;
        return this.symbols[symbolIndex];
    }

    checkWin() {
        const results = this.reels.map(reel => this.getReelResult(reel));

        let winAmount = 0;
        let winMessage = '';

        // Check for 3-of-a-kind matches (positions 1, 2, 3)
        const symbol1 = results[0];
        const symbol2 = results[1];
        const symbol3 = results[2];

        if (symbol1 === symbol2 && symbol2 === symbol3) {
            // Check specific symbols for higher payouts
            if (symbol1 === '💎') {
                winAmount = this.currentBet * 100;
                winMessage = 'DIAMOND JACKPOT! 💎💎💎';
            } else if (symbol1 === '⭐') {
                winAmount = this.currentBet * 50;
                winMessage = 'STAR LUCKY! ⭐⭐⭐';
            } else if (symbol1 === '🍒') {
                winAmount = this.currentBet * 15;
                winMessage = 'CHERRY WIN! 🍒🍒🍒';
            } else if (symbol1 === '🍌') {
                winAmount = this.currentBet * 10;
                winMessage = 'BANANA WIN! 🍌🍌🍌';
            } else if (symbol1 === '🍎') {
                winAmount = this.currentBet * 5;
                winMessage = 'APPLE WIN! 🍎🍎🍎';
            } else {
                winAmount = this.currentBet * 2;
                winMessage = 'THREE IN A ROW!';
            }
        }

        if (winAmount > 0) {
            this.balance += winAmount;
            this.resultDisplay.textContent = `${winMessage} +${winAmount}!`;
            this.resultDisplay.className = 'result win';
        } else {
            this.resultDisplay.textContent = 'NO MATCH - TRY AGAIN';
            this.resultDisplay.className = 'result lose';
        }

        this.updateBalance();

        // Submit score to backend if this is the best score
        if (window.GameSDK && !this.scoreSubmitted && this.balance > this.bestScore) {
            this.scoreSubmitted = true;
            this.bestScore = this.balance;
            window.GameSDK.submitScore(this.balance);
        }
    }

    updateBalance() {
        this.balanceDisplay.textContent = this.balance;
        localStorage.setItem('slotBalance', this.balance);

        // Submit score on each balance update if it's better than previous best
        if (window.GameSDK && this.balance > this.bestScore) {
            this.bestScore = this.balance;
            window.GameSDK.submitScore(this.balance);
        }

        if (this.balance === 0) {
            this.spinButton.disabled = true;
            this.resultDisplay.textContent = 'GAME OVER - OUT OF CREDITS!';
            this.resultDisplay.className = 'result lose';
        } else if (this.balance < this.currentBet) {
            this.spinButton.disabled = true;
            this.resultDisplay.textContent = 'INSUFFICIENT BALANCE FOR THIS BET!';
            this.resultDisplay.className = 'result lose';
        } else {
            this.spinButton.disabled = false;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SlotMachine();
});
