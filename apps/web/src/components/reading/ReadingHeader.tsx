import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CloseIcon } from "./icons";
import { ReadingSettingsDialog } from "./ReadingSettingsDialog";
import {
  CategoriesSection,
  TimeSection,
  AuthorSection,
  Divider,
} from "./InfoSection";

interface ReadingHeaderProps {
  feedId: string;
  categoryCount: number;
  uploadDate: string;
  authorName?: string;
}

export function ReadingHeader({
  feedId,
  categoryCount,
  uploadDate,
  authorName,
}: ReadingHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState([8]);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const [readingReminders, setReadingReminders] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [personalizedRecommendations, setPersonalizedRecommendations] =
    useState(true);

  return (
    <div className="w-full flex max-w-[785px] items-center justify-between mb-4 sm:mb-6 lg:mb-8">
      {/* Close Button */}
      <Link
        to="/$feedId"
        params={{ feedId }}
        className="hover:opacity-70 transition-opacity touch-manipulation p-2 -m-2"
      >
        <CloseIcon />
      </Link>

      {/* Center Header Container */}
      <div className="reading-header-container">
        {/* Mobile Layout - Simplified */}
        <div className="flex sm:hidden items-center px-[8px] py-[6px] gap-[8px]">
          <CategoriesSection count={categoryCount} />
          <Divider />
          <TimeSection uploadDate={uploadDate} />
          <Divider />
          <AuthorSection authorName={authorName} />
        </div>
        
        {/* Desktop Layout - Full */}
        <div className="hidden sm:flex items-center px-[10px] py-[6px] gap-[10px]">
          <CategoriesSection count={categoryCount} />
          <Divider />
          <TimeSection uploadDate={uploadDate} />
          <Divider />
          <AuthorSection authorName={authorName} />
          <Divider />
          <ReadingSettingsDialog
            isOpen={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            readingSpeed={readingSpeed}
            onReadingSpeedChange={setReadingSpeed}
            autoAdvance={autoAdvance}
            onAutoAdvanceChange={setAutoAdvance}
            textToSpeech={textToSpeech}
            onTextToSpeechChange={setTextToSpeech}
            voiceSettings={voiceSettings}
            onVoiceSettingsChange={setVoiceSettings}
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
            showImages={showImages}
            onShowImagesChange={setShowImages}
            readingReminders={readingReminders}
            onReadingRemindersChange={setReadingReminders}
            weeklyDigest={weeklyDigest}
            onWeeklyDigestChange={setWeeklyDigest}
            analytics={analytics}
            onAnalyticsChange={setAnalytics}
            personalizedRecommendations={personalizedRecommendations}
            onPersonalizedRecommendationsChange={setPersonalizedRecommendations}
          />
        </div>
      </div>

      {/* Empty div for layout balance - hidden on mobile */}
      <div className="w-[37px] hidden sm:block"></div>
      {/* Mobile settings access */}
      <div className="sm:hidden">
        <ReadingSettingsDialog
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          readingSpeed={readingSpeed}
          onReadingSpeedChange={setReadingSpeed}
          autoAdvance={autoAdvance}
          onAutoAdvanceChange={setAutoAdvance}
          textToSpeech={textToSpeech}
          onTextToSpeechChange={setTextToSpeech}
          voiceSettings={voiceSettings}
          onVoiceSettingsChange={setVoiceSettings}
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
          showImages={showImages}
          onShowImagesChange={setShowImages}
          readingReminders={readingReminders}
          onReadingRemindersChange={setReadingReminders}
          weeklyDigest={weeklyDigest}
          onWeeklyDigestChange={setWeeklyDigest}
          analytics={analytics}
          onAnalyticsChange={setAnalytics}
          personalizedRecommendations={personalizedRecommendations}
          onPersonalizedRecommendationsChange={setPersonalizedRecommendations}
        />
      </div>
    </div>
  );
}
