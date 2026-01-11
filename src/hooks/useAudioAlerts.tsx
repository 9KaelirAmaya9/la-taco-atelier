import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAudioAlertsOptions {
  enabled?: boolean;
  volume?: number;
}

export function useAudioAlerts(options: UseAudioAlertsOptions = {}) {
  const { enabled = true, volume = 0.7 } = options;
  const [audioEnabled, setAudioEnabled] = useState(enabled);
  const [audioVolume, setAudioVolume] = useState(volume);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasInteractedRef = useRef(false);

  // Initialize audio context on user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    hasInteractedRef.current = true;
  }, []);

  // Track user interaction to enable audio
  useEffect(() => {
    const handleInteraction = () => {
      initAudioContext();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudioContext]);

  const playNewOrderAlert = useCallback(() => {
    if (!audioEnabled || !hasInteractedRef.current) return;

    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      // Resume context if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a pleasant notification sound
      const oscillator1 = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      
      // Pleasant ascending chime
      oscillator1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      
      oscillator2.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
      oscillator2.frequency.setValueAtTime(523.25, ctx.currentTime + 0.1); // C5
      oscillator2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5

      gainNode.gain.setValueAtTime(audioVolume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator1.start(ctx.currentTime);
      oscillator2.start(ctx.currentTime);
      oscillator1.stop(ctx.currentTime + 0.5);
      oscillator2.stop(ctx.currentTime + 0.5);

      // Also try to use browser notification sound as backup
      if ('Notification' in window && Notification.permission === 'granted') {
        // Browser notification can provide additional alert
      }
    } catch (err) {
      console.error('Failed to play audio alert:', err);
    }
  }, [audioEnabled, audioVolume]);

  const playStatusChangeAlert = useCallback(() => {
    if (!audioEnabled || !hasInteractedRef.current) return;

    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);

      gainNode.gain.setValueAtTime(audioVolume * 0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (err) {
      console.error('Failed to play status change alert:', err);
    }
  }, [audioEnabled, audioVolume]);

  const playUrgentAlert = useCallback(() => {
    if (!audioEnabled || !hasInteractedRef.current) return;

    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // More urgent sound pattern
      for (let i = 0; i < 3; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime + i * 0.15);

        gainNode.gain.setValueAtTime(audioVolume * 0.15, ctx.currentTime + i * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.1);

        oscillator.start(ctx.currentTime + i * 0.15);
        oscillator.stop(ctx.currentTime + i * 0.15 + 0.1);
      }
    } catch (err) {
      console.error('Failed to play urgent alert:', err);
    }
  }, [audioEnabled, audioVolume]);

  return {
    audioEnabled,
    setAudioEnabled,
    audioVolume,
    setAudioVolume,
    playNewOrderAlert,
    playStatusChangeAlert,
    playUrgentAlert,
    initAudioContext,
  };
}
