import { useState, useEffect, useCallback } from "react";

interface ReadingStreakData {
  firstReadDate: string;
  currentStreak: number;
  lastCompletedDate: string;
}

interface UseReadingStreakResult {
  currentStreak: number;
  firstReadDate: string | null;
  updateStreak: () => void;
  resetStreak: () => void;
}

export function useReadingStreak(accountId: string | null): UseReadingStreakResult {
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [firstReadDate, setFirstReadDate] = useState<string | null>(null);

  const storageKey = `reading-streak-${accountId || 'anonymous-user'}`;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Load streak data from localStorage on component mount
  useEffect(() => {
    if (!accountId) return;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const streakData: ReadingStreakData = JSON.parse(savedData);
        setCurrentStreak(streakData.currentStreak || 0);
        setFirstReadDate(streakData.firstReadDate || null);
      }
    } catch (error) {
      console.warn("Failed to load reading streak data:", error);
    }
  }, [accountId, storageKey]);

  // Helper function to check if two dates are consecutive
  const isConsecutiveDay = useCallback((lastDate: string, currentDate: string): boolean => {
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    
    // Set both dates to midnight to avoid time zone issues
    last.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    
    const diffTime = current.getTime() - last.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  }, []);

  // Save streak data to localStorage
  const saveStreakData = useCallback((data: ReadingStreakData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save reading streak data:", error);
    }
  }, [storageKey]);

  // Update streak when user completes daily goal
  const updateStreak = useCallback(() => {
    if (!accountId) return;

    try {
      const savedData = localStorage.getItem(storageKey);
      let streakData: ReadingStreakData;

      if (savedData) {
        streakData = JSON.parse(savedData);
      } else {
        // First time user - initialize streak data
        streakData = {
          firstReadDate: today,
          currentStreak: 1,
          lastCompletedDate: today
        };
        
        setCurrentStreak(1);
        setFirstReadDate(today);
        saveStreakData(streakData);
        return;
      }

      // Don't update if already completed today, but ensure state is current
      if (streakData.lastCompletedDate === today) {
        setCurrentStreak(streakData.currentStreak);
        return;
      }

      // Check if today is consecutive to last completed date
      if (isConsecutiveDay(streakData.lastCompletedDate, today)) {
        // Consecutive day - increment streak
        streakData.currentStreak += 1;
      } else {
        // Gap detected - reset streak to 1
        streakData.currentStreak = 1;
      }

      // Update last completed date
      streakData.lastCompletedDate = today;

      // Update state and save to localStorage
      setCurrentStreak(streakData.currentStreak);
      saveStreakData(streakData);

    } catch (error) {
      console.warn("Failed to update reading streak:", error);
    }
  }, [accountId, today, storageKey, isConsecutiveDay, saveStreakData]);

  // Reset streak (useful for testing or manual reset)
  const resetStreak = useCallback(() => {
    if (!accountId) return;

    const resetData: ReadingStreakData = {
      firstReadDate: today,
      currentStreak: 0,
      lastCompletedDate: ""
    };

    setCurrentStreak(0);
    setFirstReadDate(today);
    saveStreakData(resetData);
  }, [accountId, today, saveStreakData]);

  return {
    currentStreak,
    firstReadDate,
    updateStreak,
    resetStreak
  };
}