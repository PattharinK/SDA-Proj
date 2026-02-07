// Slot Machine Game Logic (Full Debug Version)
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
        this.balance = 1000;
        this.bestBalance = 0;
        this.currentBet = 50;
        this.isSpinning = false;
        this.userId = 'guest';
        this.spinButton = document.getElementById('spin-btn');
        this.resultDisplay = document.getElementById('result');
        this.balanceDisplay = document.getElementById('balance');
        this.currentBetDisplay = document.getElementById('current-bet');
        this.waitForSDK();
        console.log('%c🎰 SLOT MACHINE STARTING...', 'color: #FFD700; font-size: 16px; font-weight: bold');

    }

    waitForSDK() {
        console.log('[System] Waiting for SDK...');

        // 1. ถ้าพร้อมอยู่แล้ว
        if (window.GameSDK && window.GameSDK.isReady && window.GameSDK.isReady()) {
            console.log('[System] ✅ SDK was ready instantly.');
            this.initializeGame();
        } else {
            // 2. ถ้ายังไม่พร้อม ให้รอ
            let isStarted = false;

            // Listener: ถ้ารับ Event ว่าพร้อม
            window.addEventListener('GameSDK_Ready', () => {
                if (isStarted) return;
                isStarted = true;
                console.log('[System] ✅ SDK Ready Event received.');
                this.initializeGame();
            }, { once: true });

            // Timeout: ถ้ารอนานเกิน 2 วิ (เพิ่มเป็น 5 วิ เพื่อทดสอบ)
            setTimeout(() => {
                if (!isStarted) {
                    console.warn('[System] SDK Timeout! Force starting as Guest (No Network Calls).');
                    isStarted = true;
                    // ลองเช็คสถานะ SDK อีกทีตอน Timeout
                    console.log('Debug Timeout State:', {
                        HasSDK: !!window.GameSDK,
                        IsReady: window.GameSDK?.isReady?.()
                    });
                    this.initializeGame();
                }
            }, 5000); // <-- เปลี่ยนจาก 2000 เป็น 5000 เพื่อให้เวลาโหลดมากขึ้น
        }
    }
    getStorageKey() {
        const key = `slotBalance_${this.userId}`;
        console.log(`[Storage] Generated key: "${key}"`);
        return key;
    }

    populateReels() {
        // จำนวนชุดที่จะ copy เพิ่ม (เพื่อให้ยาวเกินระยะหมุน 7000px+)
        // 1 ชุดสูง 1200px (6 รูป * 200px)
        // ต้องการ 8000px+ ดังนั้นเอาสัก 10-20 ชุด
        const POOL_SIZE = 20;

        this.reels.forEach(reel => {
            // ล้าง HTML เก่าออกก่อน
            reel.innerHTML = '';

            // สร้าง HTML ใหม่โดยวนลูปใส่ symbol ให้เยอะๆ
            for (let i = 0; i < POOL_SIZE; i++) {
                this.symbols.forEach(symbol => {
                    const el = document.createElement('div');
                    el.classList.add('symbol');
                    el.textContent = symbol;
                    reel.appendChild(el);
                });
            }
        });
        console.log('[System] Reels populated with extended symbols.');
    }

    async initializeGame() {
        console.log('%c[Init] 🎯 Starting initialization...', 'color: #00BFFF; font-weight: bold');

        this.populateReels();
        this.reels.forEach(reel => {
            reel.style.transform = 'translateY(0px)';
        });

        // Check GameSDK
        if (!window.GameSDK) {
            console.error('%c[Init] ❌ GameSDK not found!', 'color: #FF0000; font-weight: bold');
            this.updateBalance();
            this.setupEventListeners();
            return;
        }

        console.log('[Init] ✅ GameSDK found');

        // Load best score
        try {
            console.log('[Init] 📥 Calling loadBestScore()...');
            this.bestBalance = await window.GameSDK.loadBestScore();
            console.log(`[Init] 📊 Best balance from API: ${this.bestBalance}`);

            // Get userId
            if (window.GameSDK.getUserId) {
                this.userId = window.GameSDK.getUserId();
                console.log(`[Init] 🆔 User ID from GameSDK: "${this.userId}"`);
            } else {
                console.warn('[Init] ⚠️ getUserId() not available in GameSDK!');
            }
        } catch (error) {
            console.error('[Init] ❌ Error:', error);
        }


        // Show all localStorage
        console.group('[Init] 📋 All localStorage keys:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('slotBalance')) {
                console.log(`  ${key} = ${localStorage.getItem(key)}`);
            }
        }
        console.groupEnd();

        // Load session balance
        const storageKey = this.getStorageKey();
        const sessionBalance = localStorage.getItem(storageKey);

        console.log(`[Init] 💾 localStorage key: "${storageKey}"`);
        console.log(`[Init] 💾 Session balance: ${sessionBalance}`);

        if (sessionBalance !== null) {
            // ถ้าเคยมีประวัติการเล่น (ต่อให้เป็น 0) ให้ใช้ค่าจาก storage นั้นเลย
            this.balance = parseInt(sessionBalance);
            console.log(`[Init] 💰 Returning Player: Using session balance = ${this.balance}`);
        } else {
            // ถ้าเป็นผู้เล่นใหม่ซิงๆ (ไม่มี storage) ให้เริ่มที่ 1000 
            // หรือถ้าเขาเคยมี Best Score สูงกว่า (เช่น ย้ายเครื่องมา) ก็อนุโลมให้ใช้ Best Score ได้
            this.balance = Math.max(1000, this.bestBalance);
            console.log(`[Init] 💰 New Player: Starting balance = ${this.balance}`);
        }

        console.log('%c[Init] ✅ Complete!', 'color: #00FF00; font-weight: bold');
        console.log(`[Init] Final - Balance: ${this.balance}, Best: ${this.bestBalance}, UserID: ${this.userId}`);

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
            // ... code check balance เดิม ...
            return;
        }

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.balance -= this.currentBet;
        this.updateBalance();
        this.resultDisplay.textContent = 'SPINNING...';
        this.resultDisplay.className = 'result';

        // --- เพิ่ม: Reset ตำแหน่ง Reel กลับมาที่ 0 ก่อนหมุน ---
        this.reels.forEach(reel => {
            reel.style.transition = 'none'; // ปิด animation ชั่วคราว
            reel.style.transform = 'translateY(0px)';
        });
        // -------------------------------------------------

        // ใช้ setTimeout เล็กน้อยเพื่อให้ DOM update ทันก่อนเริ่มหมุน
        setTimeout(() => {
            const spinPromises = this.reels.map((reel, index) => {
                return this.spinReel(reel, 2000 + index * 300);
            });

            Promise.all(spinPromises).then((results) => { // 1. รับค่า results เข้ามา
                this.checkWin(results);                   // 2. ส่ง results ไปให้ checkWin
                this.isSpinning = false;
                this.spinButton.disabled = false;
            });
        }, 50);
    }

    spinReel(reel, duration) {
        return new Promise(resolve => {
            const startTime = Date.now();

            // สุ่มว่าจะไปหยุดที่ Symbol ไหน (0-5)
            const finalSymbolIndex = Math.floor(Math.random() * this.symbols.length);

            // คำนวณระยะทาง: 
            // เราจะหมุนไปที่ "ชุดท้ายๆ" ของรายการที่เรา generate ไว้ (เช่นชุดที่ 15 จาก 20)
            // เพื่อให้แน่ใจว่ามีรูปภาพแสดงตลอดทาง
            const targetSet = 15; // หยุดที่ชุดที่ 15
            const totalDistance = (targetSet * this.symbols.length + finalSymbolIndex) * 200;

            // ตำแหน่งเริ่มต้น (อ่านจาก transform ปัจจุบัน)
            const currentTrans = reel.style.transform;
            const currentY = currentTrans ? parseFloat(currentTrans.match(/translateY\(-?(\d+(?:\.\d+)?)px\)/)[1]) : 0;

            // เนื่องจากเรา generate รูปใหม่ตลอด เราเริ่มหมุนจาก 0 ได้เลย (เพราะเรา Reset transform ตอน Init หรือหลังจบก็ได้)
            // แต่เพื่อให้ง่าย: เราจะ reset reel กลับไปที่ 0 ทุกครั้งที่กด Spin (ทำในฟังก์ชัน spin หลัก)

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                if (progress < 1) {
                    // Easing function (easeOutCubic)
                    const easeOut = 1 - Math.pow(1 - progress, 3);

                    const currentDistance = totalDistance * easeOut;
                    reel.style.transform = `translateY(-${currentDistance}px)`;
                    requestAnimationFrame(animate);
                } else {
                    // จบ Animation
                    reel.style.transform = `translateY(-${totalDistance}px)`;
                    resolve(this.symbols[finalSymbolIndex]);
                }
            };

            animate();
        });
    }

    getReelResult(reel) {
        const transform = reel.style.transform;
        const match = transform.match(/translateY\(-?(\d+(?:\.\d+)?)px\)/);

        if (!match) return this.symbols[0];

        const offset = parseFloat(match[1]);
        const symbolIndex = Math.round(offset / 200) % this.symbols.length;

        return this.symbols[symbolIndex];
    }

    checkWin(results) {
        // ไม่ต้องใช้ getReelResult แล้วเพราะรับค่ามาโดยตรง

        let winAmount = 0;
        let winMessage = '';

        const symbol1 = results[0];
        const symbol2 = results[1];
        const symbol3 = results[2];

        if (symbol1 === symbol2 && symbol2 === symbol3) {
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
            } else if (symbol1 === '🍊') {
                winAmount = this.currentBet * 3;
                winMessage = 'ORANGE WIN! 🍊🍊🍊';
            } else {
                winAmount = this.currentBet * 2;
                winMessage = 'THREE IN A ROW!';
            }
        }

        if (winAmount > 0) {
            this.balance += winAmount;
            this.resultDisplay.textContent = `${winMessage} +${winAmount}!`;
            this.resultDisplay.className = 'result win';
            console.log(`%c[Win] 🎉 +${winAmount} Balance: ${this.balance}`, 'color: #00FF00');
        } else {
            this.resultDisplay.textContent = 'NO MATCH - TRY AGAIN';
            this.resultDisplay.className = 'result lose';
        }

        this.updateBalance();
        this.saveProgress();
    }

    updateBalance() {
        this.balanceDisplay.textContent = this.balance;
        const storageKey = this.getStorageKey();
        localStorage.setItem(storageKey, this.balance);

        if (this.balance <= 0) {
            this.spinButton.disabled = true;
            this.resultDisplay.textContent = 'GAME OVER! [CLICK TO RESET]';
            this.resultDisplay.style.cursor = 'pointer';

            // คลิกที่ข้อความเพื่อ Reset เป็น 1000
            this.resultDisplay.onclick = () => {
                this.balance = 1000;
                this.resultDisplay.onclick = null;
                this.updateBalance();
            };
        } else if (this.balance < this.currentBet) {
            this.spinButton.disabled = true;
            this.resultDisplay.textContent = 'INSUFFICIENT BALANCE!';
        } else {
            this.spinButton.disabled = false;
            this.resultDisplay.onclick = null;
        }
    }

    saveProgress() {
        console.log(`[Save] Check: Balance=${this.balance}, Best=${this.bestBalance}`);

        if (window.GameSDK && this.balance > this.bestBalance) {
            console.log(`%c[Save] 🏆 NEW HIGH! Submitting ${this.balance}`, 'color: #FFD700');
            window.GameSDK.submitScore(this.balance);
            this.bestBalance = this.balance;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SlotMachine();
});