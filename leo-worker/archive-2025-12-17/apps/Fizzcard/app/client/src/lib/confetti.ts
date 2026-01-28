/**
 * Confetti Celebration Utilities
 *
 * Provides celebratory animations for reward claims and achievements
 */

import confetti from 'canvas-confetti';

/**
 * FizzCoin reward celebration
 * Gold and cyan confetti burst for earning rewards
 */
export function celebrateReward() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // FizzCoin colors: gold and cyan
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#00D9FF', '#B744FF'] // Gold, Cyan, Purple
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#00D9FF', '#B744FF']
    });
  }, 250);
}

/**
 * Claim success celebration
 * Focused burst from center for successful claim
 */
export function celebrateClaim() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#FFD700', '#00D9FF', '#B744FF']
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Achievement unlocked celebration
 * Stars and sparkles for badges/achievements
 */
export function celebrateAchievement() {
  const duration = 5000;
  const animationEnd = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FFA500', '#00D9FF'],
      zIndex: 9999
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FFA500', '#00D9FF'],
      zIndex: 9999
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Connection success celebration
 * Quick burst for new connections
 */
export function celebrateConnection() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#00D9FF', '#B744FF', '#FFFFFF'],
    zIndex: 9999
  });
}

/**
 * Small success celebration
 * Subtle animation for minor achievements
 */
export function celebrateSuccess() {
  confetti({
    particleCount: 50,
    angle: 90,
    spread: 45,
    origin: { y: 0.6 },
    colors: ['#00D9FF', '#B744FF'],
    zIndex: 9999
  });
}

/**
 * Emoji confetti
 * Shoot emoji particles (great for specific events)
 */
export function celebrateWithEmoji(emoji: string, count: number = 50) {
  const scalar = 2;
  const shapes = [confetti.shapeFromText({ text: emoji, scalar })];

  confetti({
    shapes,
    particleCount: count,
    spread: 100,
    origin: { y: 0.6 },
    scalar,
    zIndex: 9999
  });
}
