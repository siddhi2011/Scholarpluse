import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function triggerConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  });
}

export function triggerMiniConfetti() {
  confetti({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.7 },
    scalar: 0.8,
  });
}

export default function ConfettiEffect({ trigger }) {
  useEffect(() => {
    if (trigger) triggerConfetti();
  }, [trigger]);
  return null;
}