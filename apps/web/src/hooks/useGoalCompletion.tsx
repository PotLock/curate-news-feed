import { useState, useEffect, useCallback } from "react";

interface UseGoalCompletionResult {
  hasCompletedGoalToday: boolean;
  shouldShowModal: boolean;
  checkGoalCompletion: (articlesReadToday: number, dailyGoal: number, onStreakUpdate?: () => void) => void;
  markModalShown: () => void;
  resetDailyProgress: () => void;
}

export function useGoalCompletion(accountId: string | null): UseGoalCompletionResult {
  const [hasCompletedGoalToday, setHasCompletedGoalToday] = useState<boolean>(false);
  const [shouldShowModal, setShouldShowModal] = useState<boolean>(false);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const goalCompletedKey = `goal-completed-${today}`;
  const modalShownKey = `goal-modal-shown-${today}`;

  // Check if goal was already completed today on component mount
  useEffect(() => {
    try {
      const goalCompleted = localStorage.getItem(goalCompletedKey) === 'true';
      const modalShown = localStorage.getItem(modalShownKey) === 'true';
      
      setHasCompletedGoalToday(goalCompleted);
      
      // Don't show modal if it was already shown today
      setShouldShowModal(goalCompleted && !modalShown);
    } catch (error) {
      console.warn("Failed to load goal completion status:", error);
    }
  }, [goalCompletedKey, modalShownKey]);

  // Reset daily progress at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const currentDate = new Date().toISOString().split('T')[0];
      if (currentDate !== today) {
        // It's a new day, reset everything
        setHasCompletedGoalToday(false);
        setShouldShowModal(false);
      }
    };

    // Check every minute for date change
    const interval = setInterval(checkMidnight, 60000);
    
    return () => clearInterval(interval);
  }, [today]);

  const checkGoalCompletion = useCallback((articlesReadToday: number, dailyGoal: number, onStreakUpdate?: () => void) => {
    if (!accountId) return;
    
    // Only check if goal hasn't been completed today
    if (!hasCompletedGoalToday && articlesReadToday >= dailyGoal) {
      try {
        // Mark goal as completed for today
        localStorage.setItem(goalCompletedKey, 'true');
        setHasCompletedGoalToday(true);
        
        // Update reading streak
        if (onStreakUpdate) {
          onStreakUpdate();
        }
        
        // Check if modal was already shown today
        const modalAlreadyShown = localStorage.getItem(modalShownKey) === 'true';
        if (!modalAlreadyShown) {
          setShouldShowModal(true);
        }
      } catch (error) {
        console.warn("Failed to save goal completion status:", error);
      }
    }
  }, [accountId, hasCompletedGoalToday, goalCompletedKey, modalShownKey]);

  const markModalShown = useCallback(() => {
    try {
      localStorage.setItem(modalShownKey, 'true');
      setShouldShowModal(false);
    } catch (error) {
      console.warn("Failed to mark modal as shown:", error);
    }
  }, [modalShownKey]);

  const resetDailyProgress = useCallback(() => {
    try {
      localStorage.removeItem(goalCompletedKey);
      localStorage.removeItem(modalShownKey);
      setHasCompletedGoalToday(false);
      setShouldShowModal(false);
    } catch (error) {
      console.warn("Failed to reset daily progress:", error);
    }
  }, [goalCompletedKey, modalShownKey]);

  return {
    hasCompletedGoalToday,
    shouldShowModal,
    checkGoalCompletion,
    markModalShown,
    resetDailyProgress
  };
}