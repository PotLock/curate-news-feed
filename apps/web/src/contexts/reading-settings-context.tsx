import React, { createContext, useContext, useState, useEffect } from "react";

interface ReadingSettingsType {
  // Settings version for migration
  version?: number;
  
  // Visual Settings
  showImages: boolean;

  // Reading Experience
  readingSpeed: number; // seconds per article
  autoAdvance: boolean;
  dailyGoal: number; // daily reading goal
  notificationFrequency: string; // daily, weekly, monthly, never

  // Audio Settings
  textToSpeech: boolean;
  selectedVoice: string;
  speechRate: number;
  speechPitch: number;

  // Privacy & Analytics
  analytics: boolean;
  personalizedRecommendations: boolean;
}

interface ReadingSettingsContextType extends ReadingSettingsType {
  updateSettings: (settings: Partial<ReadingSettingsType>) => void;
  resetSettings: () => void;
}

const CURRENT_VERSION = 3; // Increment this to force settings update

const defaultSettings: ReadingSettingsType = {
  // Settings version
  version: CURRENT_VERSION,
  
  // Visual Settings
  showImages: false,

  // Reading Experience
  readingSpeed: 8,
  autoAdvance: false,
  dailyGoal: 3,
  notificationFrequency: "daily",

  // Audio Settings
  textToSpeech: false,
  selectedVoice: "",
  speechRate: 1.0,
  speechPitch: 1.0,

  // Privacy & Analytics
  analytics: true,
  personalizedRecommendations: true,
};

const STORAGE_KEY = "reading-settings";

const ReadingSettingsContext = createContext<
  ReadingSettingsContextType | undefined
>(undefined);

export function ReadingSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<ReadingSettingsType>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        
        // Check if stored settings are from an older version
        if (!parsedSettings.version || parsedSettings.version < CURRENT_VERSION) {
          // Apply new defaults for showImages when upgrading
          const updatedSettings = {
            ...defaultSettings,
            ...parsedSettings,
            version: CURRENT_VERSION,
            showImages: false, // Force showImages to false for existing users
          };
          setSettings(updatedSettings);
        } else {
          setSettings({ ...defaultSettings, ...parsedSettings });
        }
      }
    } catch (error) {
      console.warn("Failed to load reading settings from localStorage:", error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save reading settings to localStorage:", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ReadingSettingsType>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <ReadingSettingsContext.Provider
      value={{
        ...settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </ReadingSettingsContext.Provider>
  );
}

export function useReadingSettings() {
  const context = useContext(ReadingSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useReadingSettings must be used within a ReadingSettingsProvider",
    );
  }
  return context;
}
