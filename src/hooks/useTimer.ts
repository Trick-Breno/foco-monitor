import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

interface TimerProps {
  isRunning: boolean;
  startTime: Timestamp | null | undefined;
  savedDuration: number;
}

export function useTimer({ isRunning, startTime, savedDuration }: TimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(savedDuration);

  useEffect(() => {
    if (!isRunning || !startTime) {
      setElapsedSeconds(savedDuration);
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const startMillis = startTime.toDate().getTime();
      const secondsPassed = Math.round((now - startMillis) / 1000);
      setElapsedSeconds(savedDuration + secondsPassed);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, startTime, savedDuration]);

  return elapsedSeconds;
}