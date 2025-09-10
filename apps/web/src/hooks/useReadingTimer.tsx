import { useState, useEffect, useCallback } from "react";

interface ReadingTimerData {
  startTime: number;
  totalTime: number;
  isActive: boolean;
}

interface UseReadingTimerResult {
  totalSeconds: number;
  formattedTime: string;
  isActive: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export function useReadingTimer(accountId: string | null): UseReadingTimerResult {
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const storageKey = `reading-timer-${accountId || 'anonymous-user'}`;

  // Load timer data from localStorage
  useEffect(() => {
    if (!accountId) return;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const timerData: ReadingTimerData = JSON.parse(savedData);
        setTotalSeconds(timerData.totalTime);
        setIsActive(timerData.isActive);
        
        if (timerData.isActive && timerData.startTime) {
          // Calculate elapsed time since last save
          const currentTime = Date.now();
          const elapsedSinceStart = Math.floor((currentTime - timerData.startTime) / 1000);
          setTotalSeconds(timerData.totalTime + elapsedSinceStart);
          setStartTime(timerData.startTime);
        }
      }
    } catch (error) {
      console.warn("Failed to load reading timer:", error);
    }
  }, [accountId, storageKey]);

  // Update timer every second when active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && startTime) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        setTotalSeconds(elapsedTime);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, startTime]);

  // Save timer data to localStorage
  const saveToStorage = useCallback((data: ReadingTimerData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save reading timer:", error);
    }
  }, [storageKey]);

  const startTimer = useCallback(() => {
    const currentTime = Date.now();
    setStartTime(currentTime);
    setIsActive(true);
    
    const timerData: ReadingTimerData = {
      startTime: currentTime,
      totalTime: 0,
      isActive: true
    };
    
    saveToStorage(timerData);
  }, [saveToStorage]);

  const stopTimer = useCallback(() => {
    if (startTime) {
      const currentTime = Date.now();
      const finalTime = Math.floor((currentTime - startTime) / 1000);
      
      setTotalSeconds(finalTime);
      setIsActive(false);
      setStartTime(null);
      
      const timerData: ReadingTimerData = {
        startTime: 0,
        totalTime: finalTime,
        isActive: false
      };
      
      saveToStorage(timerData);
    }
  }, [startTime, saveToStorage]);

  const resetTimer = useCallback(() => {
    setTotalSeconds(0);
    setIsActive(false);
    setStartTime(null);
    
    const timerData: ReadingTimerData = {
      startTime: 0,
      totalTime: 0,
      isActive: false
    };
    
    saveToStorage(timerData);
  }, [saveToStorage]);

  // Format time as MM:SS
  const formattedTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    totalSeconds,
    formattedTime: formattedTime(totalSeconds),
    isActive,
    startTimer,
    stopTimer,
    resetTimer
  };
}