function LocalStorageManager() {
  this.bestScore = 0;
  this.bestScoreLoaded = false;
  this.loadingPromise = null; //กันยิงซ้ำ
}

/**
 * โหลดคะแนนจาก server (โหลดครั้งเดียว)
 */

LocalStorageManager.prototype.loadBestScoreOnce = function () {
  if (this.bestScoreLoaded) return Promise.resolve(this.bestScore);

  // ถ้ากำลังรออยู่ ให้ใช้ promise เดิม
  if (this.loadingPromise) return this.loadingPromise;

  this.loadingPromise = new Promise(async (resolve) => {
    // delay รอ SDK init
    await new Promise(r => setTimeout(r, 500)); // 300–800ms กำลังดี

    if (!window.GameSDK?.loadBestScore) {
      this.bestScoreLoaded = true;
      return resolve(this.bestScore);
    }

    const score = await window.GameSDK.loadBestScore();

    this.bestScore = score;
    this.bestScoreLoaded = true; // lock ไม่ว่าค่าอะไร

    resolve(this.bestScore);
  });

  return this.loadingPromise;
};

/**
 * getter แบบ sync (ใช้ใน actuate)
 */
LocalStorageManager.prototype.getBestScore = function () {
  return this.bestScore;
};

/**
 * submit เฉพาะตอน score สูงกว่า
 */
LocalStorageManager.prototype.setBestScore = function (score) {
  if (score > this.bestScore) {
    this.bestScore = score;

  }
}

//  ปิด game state
LocalStorageManager.prototype.getGameState = function () {
  return null;
};
LocalStorageManager.prototype.setGameState = function () { };
LocalStorageManager.prototype.clearGameState = function () { };
